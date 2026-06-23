export type YouTubeUrlType = "video" | "channel" | "unknown";

export interface ParsedYouTubeUrl {
  type: YouTubeUrlType;
  videoId?: string;
  channelId?: string;
  handle?: string;
  raw: string;
}

export function parseYouTubeUrl(input: string): ParsedYouTubeUrl {
  const raw = input.trim();
  if (!raw) return { type: "unknown", raw };

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return { type: "unknown", raw };
  }

  const host = url.hostname.replace("www.", "");

  if (host === "youtu.be") {
    const videoId = url.pathname.slice(1).split("/")[0];
    if (videoId) return { type: "video", videoId, raw };
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const videoId = url.searchParams.get("v");
    if (videoId) return { type: "video", videoId, raw };

    const channelMatch = url.pathname.match(/^\/channel\/([^/]+)/);
    if (channelMatch) return { type: "channel", channelId: channelMatch[1], raw };

    const handleMatch = url.pathname.match(/^\/@([^/]+)/);
    if (handleMatch) return { type: "channel", handle: handleMatch[1], raw };

    const cMatch = url.pathname.match(/^\/c\/([^/]+)/);
    if (cMatch) return { type: "channel", handle: cMatch[1], raw };

    const userMatch = url.pathname.match(/^\/user\/([^/]+)/);
    if (userMatch) return { type: "channel", handle: userMatch[1], raw };
  }

  return { type: "unknown", raw };
}

export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatDuration(iso?: string): string {
  if (!iso) return "0:00";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function estimateRpm(subscribers: number): number {
  if (subscribers > 1_000_000) return 6 + Math.random() * 4;
  if (subscribers > 100_000) return 4 + Math.random() * 6;
  if (subscribers > 10_000) return 2 + Math.random() * 5;
  return 1 + Math.random() * 3;
}
