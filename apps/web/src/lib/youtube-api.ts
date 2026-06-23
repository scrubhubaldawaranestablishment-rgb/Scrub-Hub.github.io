import { formatCount, formatDuration, timeAgo, estimateRpm, type ParsedYouTubeUrl } from "./youtube-parser";

export interface YouTubeVideoResult {
  id: string;
  title: string;
  views: number;
  viewsFormatted: string;
  publishedAt: string;
  age: string;
  duration: string;
  thumbnail: string;
  outlier: number;
  tags?: string[];
}

export interface YouTubeAnalysisResult {
  name: string;
  handle: string;
  channelId: string;
  description: string;
  thumbnail: string;
  subscribers: number;
  subscribersFormatted: string;
  videos: number;
  totalViews: number;
  totalViewsFormatted: string;
  monthlyViews: string;
  estimatedRevenue: string;
  rpm: string;
  monetized: boolean;
  avgOutlier: number;
  videoList: YouTubeVideoResult[];
  sourceVideo?: { id: string; title: string };
  dataSource: "youtube-api" | "oembed-fallback";
}

interface YouTubeApiChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    thumbnails: { high?: { url: string }; default?: { url: string } };
  };
  statistics: {
    subscriberCount?: string;
    viewCount?: string;
    videoCount?: string;
    hiddenSubscriberCount?: boolean;
  };
}

interface YouTubeApiVideo {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string } };
    tags?: string[];
  };
  statistics: { viewCount?: string };
  contentDetails?: { duration?: string };
}

async function ytFetch<T>(path: string, apiKey: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}${sep}key=${apiKey}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `YouTube API error: ${res.status}`);
  }
  return res.json();
}

async function resolveChannelId(parsed: ParsedYouTubeUrl, apiKey: string): Promise<string | null> {
  if (parsed.channelId) return parsed.channelId;

  if (parsed.handle) {
    const data = await ytFetch<{ items?: YouTubeApiChannel[] }>(
      `channels?part=id&forHandle=${encodeURIComponent(parsed.handle)}`,
      apiKey
    );
    if (data.items?.[0]?.id) return data.items[0].id;

    const search = await ytFetch<{ items?: { snippet: { channelId: string } }[] }>(
      `search?part=snippet&type=channel&q=${encodeURIComponent(parsed.handle)}&maxResults=1`,
      apiKey
    );
    return search.items?.[0]?.snippet?.channelId || null;
  }

  if (parsed.videoId) {
    const data = await ytFetch<{ items?: YouTubeApiVideo[] }>(
      `videos?part=snippet&id=${parsed.videoId}`,
      apiKey
    );
    return data.items?.[0]?.snippet?.channelId || null;
  }

  return null;
}

async function getChannel(channelId: string, apiKey: string): Promise<YouTubeApiChannel | null> {
  const data = await ytFetch<{ items?: YouTubeApiChannel[] }>(
    `channels?part=snippet,statistics&id=${channelId}`,
    apiKey
  );
  return data.items?.[0] || null;
}

async function getChannelVideos(channelId: string, apiKey: string): Promise<YouTubeApiVideo[]> {
  const search = await ytFetch<{ items?: { id: { videoId: string } }[] }>(
    `search?part=id&channelId=${channelId}&type=video&order=date&maxResults=12`,
    apiKey
  );

  const ids = search.items?.map((i) => i.id.videoId).filter(Boolean) || [];
  if (ids.length === 0) return [];

  const data = await ytFetch<{ items?: YouTubeApiVideo[] }>(
    `videos?part=snippet,statistics,contentDetails&id=${ids.join(",")}`,
    apiKey
  );
  return data.items || [];
}

async function getVideo(videoId: string, apiKey: string): Promise<YouTubeApiVideo | null> {
  const data = await ytFetch<{ items?: YouTubeApiVideo[] }>(
    `videos?part=snippet,statistics,contentDetails&id=${videoId}`,
    apiKey
  );
  return data.items?.[0] || null;
}

function buildAnalysis(
  channel: YouTubeApiChannel,
  videos: YouTubeApiVideo[],
  sourceVideo?: { id: string; title: string }
): YouTubeAnalysisResult {
  const subs = parseInt(channel.statistics.subscriberCount || "0", 10);
  const totalViews = parseInt(channel.statistics.viewCount || "0", 10);
  const videoCount = parseInt(channel.statistics.videoCount || "0", 10);
  const avgViews = videoCount > 0 ? totalViews / videoCount : 0;
  const rpm = estimateRpm(subs);
  const monthlyViewsEst = Math.round(totalViews / Math.max(videoCount, 1) / 30 * 30);

  const videoList: YouTubeVideoResult[] = videos.map((v) => {
    const views = parseInt(v.statistics.viewCount || "0", 10);
    const outlier = avgViews > 0 ? Math.round((views / avgViews) * 10) / 10 : 1;
    return {
      id: v.id,
      title: v.snippet.title,
      views,
      viewsFormatted: formatCount(views),
      publishedAt: v.snippet.publishedAt,
      age: timeAgo(v.snippet.publishedAt),
      duration: formatDuration(v.contentDetails?.duration),
      thumbnail: v.snippet.thumbnails.medium?.url || "",
      outlier,
      tags: v.snippet.tags,
    };
  });

  const avgOutlier =
    videoList.length > 0
      ? Math.round((videoList.reduce((s, v) => s + v.outlier, 0) / videoList.length) * 10) / 10
      : 1;

  const handle = channel.snippet.customUrl
    ? channel.snippet.customUrl.startsWith("@")
      ? channel.snippet.customUrl
      : `@${channel.snippet.customUrl}`
    : `@${channel.snippet.title.replace(/\s/g, "")}`;

  return {
    name: channel.snippet.title,
    handle,
    channelId: channel.id,
    description: channel.snippet.description?.slice(0, 200) || "",
    thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url || "",
    subscribers: subs,
    subscribersFormatted: channel.statistics.hiddenSubscriberCount ? "Hidden" : formatCount(subs),
    videos: videoCount,
    totalViews,
    totalViewsFormatted: formatCount(totalViews),
    monthlyViews: formatCount(monthlyViewsEst),
    estimatedRevenue: `$${Math.round((monthlyViewsEst / 1000) * rpm).toLocaleString()}/mo`,
    rpm: `$${rpm.toFixed(2)}`,
    monetized: subs >= 1000 && totalViews >= 4000,
    avgOutlier,
    videoList,
    sourceVideo,
    dataSource: "youtube-api",
  };
}

async function oembedFallback(videoUrl: string): Promise<YouTubeAnalysisResult> {
  const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`);
  if (!res.ok) throw new Error("Could not fetch video metadata. Add a YouTube API key in Settings for full analysis.");
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const authorUrl: string = data.author_url || "";
  const handleMatch = authorUrl.match(/@([^/?]+)/);
  const handle = handleMatch ? `@${handleMatch[1]}` : "@channel";

  return {
    name: data.author_name || "Unknown Channel",
    handle,
    channelId: "",
    description: data.title || "",
    thumbnail: data.thumbnail_url || "",
    subscribers: 0,
    subscribersFormatted: "N/A",
    videos: 0,
    totalViews: 0,
    totalViewsFormatted: "N/A",
    monthlyViews: "N/A",
    estimatedRevenue: "N/A",
    rpm: "N/A",
    monetized: false,
    avgOutlier: 1,
    videoList: [
      {
        id: videoUrl.match(/[?&]v=([^&]+)/)?.[1] || "unknown",
        title: data.title || "Video",
        views: 0,
        viewsFormatted: "N/A",
        publishedAt: new Date().toISOString(),
        age: "unknown",
        duration: "0:00",
        thumbnail: data.thumbnail_url || "",
        outlier: 1,
      },
    ],
    sourceVideo: { id: videoUrl.match(/[?&]v=([^&]+)/)?.[1] || "", title: data.title },
    dataSource: "oembed-fallback",
  };
}

export async function analyzeYouTubeUrl(
  parsed: ParsedYouTubeUrl,
  apiKey?: string
): Promise<YouTubeAnalysisResult> {
  if (parsed.type === "unknown") {
    throw new Error("Invalid YouTube URL. Paste a video link (youtube.com/watch?v=...) or channel link (youtube.com/@handle).");
  }

  if (!apiKey) {
    if (parsed.type === "video" || parsed.videoId) {
      return oembedFallback(parsed.raw);
    }
    throw new Error(
      "Channel analysis requires a YouTube API key. Go to Settings and add your free key from Google Cloud Console."
    );
  }

  let sourceVideo: { id: string; title: string } | undefined;

  if (parsed.videoId) {
    const video = await getVideo(parsed.videoId, apiKey);
    if (video) {
      sourceVideo = { id: video.id, title: video.snippet.title };
    }
  }

  const channelId = await resolveChannelId(parsed, apiKey);
  if (!channelId) throw new Error("Could not find channel for this URL.");

  const channel = await getChannel(channelId, apiKey);
  if (!channel) throw new Error("Channel not found.");

  const videos = await getChannelVideos(channelId, apiKey);
  return buildAnalysis(channel, videos, sourceVideo);
}
