import { v4 as uuid } from "uuid";
import type { ScriptSection, VideoIdea } from "./types";

const HOOKS = [
  "What if everything you knew about {topic} was wrong?",
  "Most people fail at {topic} because they miss this one thing.",
  "I spent 6 months studying {topic} so you don't have to.",
  "The {topic} secret that 99% of creators ignore.",
  "Stop doing {topic} the hard way — here's the shortcut.",
];

const SECTION_TITLES = ["Hook", "Introduction", "Main Point 1", "Main Point 2", "Main Point 3", "Call to Action"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function scoreIdea(title: string): number {
  let score = 50;
  if (title.length > 30 && title.length < 70) score += 15;
  if (/\d+/.test(title)) score += 10;
  if (/how|why|secret|truth|mistake/i.test(title)) score += 12;
  if (/best|top|worst|never|always/i.test(title)) score += 8;
  return Math.min(98, score + Math.floor(Math.random() * 15));
}

export function generateVideoIdeas(niche: string, count = 5): VideoIdea[] {
  const topics = [
    `${niche} mistakes beginners always make`,
    `The truth about ${niche} nobody talks about`,
    `5 ${niche} habits that changed everything`,
    `Why most ${niche} channels fail in year one`,
    `How I grew my ${niche} channel to 100K subs`,
    `${niche} trends you need to know in 2026`,
    `The ${niche} strategy that actually works`,
    `What top ${niche} creators do differently`,
  ];

  return Array.from({ length: count }, (_, i) => {
    const topic = topics[i % topics.length];
    const title = topic.charAt(0).toUpperCase() + topic.slice(1);
    return {
      id: uuid(),
      title,
      hook: pick(HOOKS).replace("{topic}", niche.toLowerCase()),
      score: scoreIdea(title),
      niche,
      createdAt: new Date().toISOString(),
    };
  });
}

export function generateScript(title: string, niche: string): ScriptSection[] {
  return SECTION_TITLES.map((sectionTitle) => ({
    id: uuid(),
    title: sectionTitle,
    content: generateSectionContent(sectionTitle, title, niche),
  }));
}

function generateSectionContent(section: string, title: string, niche: string): string {
  switch (section) {
    case "Hook":
      return `[VISUAL: Bold text on screen]\n\n"${pick(HOOKS).replace("{topic}", niche)}"\n\n[PAUSE 2 seconds]\n\nToday we're diving into: ${title}`;
    case "Introduction":
      return `Welcome back. If you're into ${niche}, you're in the right place.\n\nIn this video, I'll break down everything you need to know about ${title.toLowerCase()}.\n\nBy the end, you'll have a clear action plan. Let's get into it.`;
    case "Main Point 1":
      return `[B-ROLL: Relevant footage]\n\nFirst — the foundation most people skip.\n\nWhen it comes to ${niche}, the biggest mistake is rushing without a strategy. Here's what actually works:\n\n1. Research what's already performing in your niche\n2. Find the gap — what isn't being covered well\n3. Create content that fills that gap with unique value`;
    case "Main Point 2":
      return `[B-ROLL: Data/charts]\n\nNow here's where it gets interesting.\n\nThe data shows that channels focusing on ${niche} see 3x better retention when they use pattern interrupts every 30-45 seconds.\n\nTry this: ask a question, show a surprising stat, or preview what's coming next.`;
    case "Main Point 3":
      return `[B-ROLL: Examples]\n\nThe third key — consistency beats perfection.\n\nTop ${niche} channels post 2-3 times per week. They iterate based on analytics, not gut feeling.\n\nTrack your CTR, average view duration, and outlier scores. Double down on what works.`;
    case "Call to Action":
      return `That's everything for today.\n\nIf this helped, hit subscribe — I post new ${niche} content every week.\n\nDrop a comment with your biggest challenge and I'll cover it in a future video.\n\nSee you in the next one.`;
    default:
      return `Content for ${section} about ${title}.`;
  }
}

export function generateBrandingAssets(channelName: string, niche: string, style: string): { profileDescription: string; bannerDescription: string; colorPalette: string[] } {
  const palettes: Record<string, string[]> = {
    bold: ["#6366F1", "#8B5CF6", "#1E1B4B", "#FFFFFF"],
    minimal: ["#0F172A", "#64748B", "#F8FAFC", "#3B82F6"],
    vibrant: ["#EC4899", "#F59E0B", "#10B981", "#1F2937"],
    dark: ["#111827", "#374151", "#EF4444", "#F9FAFB"],
  };

  return {
    profileDescription: `Circular profile picture for "${channelName}" — a ${style} design featuring a stylized ${niche.toLowerCase()} icon with gradient background using brand colors. Clean, professional, recognizable at small sizes.`,
    bannerDescription: `YouTube channel banner (2560x1440) for "${channelName}" — ${style} layout with channel name prominently displayed, subtle ${niche.toLowerCase()} themed graphics, and a tagline about ${niche} content. Safe zone centered for all devices.`,
    colorPalette: palettes[style] || palettes.bold,
  };
}

export function generateCoachResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("niche") || lower.includes("topic")) {
    return "Great question about niches! For faceless channels, look for topics with high search volume but moderate competition. Finance, history, motivation, and true crime consistently perform well. Use the Niche Finder to spot channels with high outlier scores — that means there's demand but room for new creators. Aim for a niche you can produce 100+ videos in without running out of ideas.";
  }
  if (lower.includes("thumbnail") || lower.includes("ctr")) {
    return "Thumbnails are 50% of your success. Here's what works for faceless channels:\n\n1. High contrast colors (yellow text on dark backgrounds crushes it)\n2. Max 3-4 words — big and bold\n3. Faces/emotions increase CTR by 30%+\n4. Use the Thumbnail Studio to A/B test variations\n\nPro tip: study thumbnails from videos with 3x+ outlier scores in your niche and adapt the layout.";
  }
  if (lower.includes("script") || lower.includes("retention")) {
    return "Retention is king. Structure every script like this:\n\n• Hook (0-30s): Pattern interrupt + promise\n• Setup (30s-2min): Why this matters NOW\n• Body: 3 clear points with B-roll cues every 30-45s\n• CTA: One clear action\n\nUse the Script Writer to generate section-by-section, then edit for your voice. Aim for 8-12 minute videos — that's the sweet spot for ad revenue.";
  }
  if (lower.includes("monetize") || lower.includes("money") || lower.includes("revenue")) {
    return "Monetization timeline for faceless channels:\n\n• 0-1K subs: Focus on content quality and consistency\n• 1K-10K: Enable ads ($2-8 RPM depending on niche)\n• 10K-50K: Add affiliate links ($500-2K/mo potential)\n• 50K+: Sponsorships ($20-50 per 1K views)\n\nFinance and tech niches have the highest RPM. Check the Monetize tool for a full breakdown of revenue streams.";
  }
  if (lower.includes("upload") || lower.includes("schedule") || lower.includes("frequency")) {
    return "Posting frequency matters more than most creators think. For faceless channels:\n\n• Start: 2 videos/week minimum\n• Growth phase: 3 videos/week\n• Use the Production Board to batch-create content\n\nBest upload times: Tuesday-Thursday, 2-4 PM EST. But consistency beats timing — pick a schedule and stick to it for 90 days.";
  }

  return "That's a solid question! For faceless YouTube growth, focus on three pillars: find a profitable niche (Niche Finder), create click-worthy thumbnails (Thumbnail Studio), and write retention-optimized scripts (Script Writer). Use the Production Board to stay organized. What specific area would you like to dive deeper into — niches, content, thumbnails, or monetization?";
}

export function analyzeChannel(url: string): {
  name: string;
  handle: string;
  subscribers: string;
  videos: number;
  totalViews: string;
  monthlyViews: string;
  estimatedRevenue: string;
  rpm: string;
  monetized: boolean;
  avgOutlier: number;
} {
  const handle = url.includes("@") ? url.split("@")[1]?.split("/")[0] || "channel" : "channel";
  const names = ["Bro Pump", "Tech Insights", "History Vault", "Money Matters", "Dark Tales"];
  const name = names[handle.length % names.length];

  return {
    name,
    handle: `@${handle}`,
    subscribers: `${(50 + handle.length * 17).toLocaleString()}K`,
    videos: 20 + handle.length * 3,
    totalViews: `${(1.2 + handle.length * 0.3).toFixed(1)}M`,
    monthlyViews: `${(200 + handle.length * 15).toLocaleString()}K`,
    estimatedRevenue: `$${(800 + handle.length * 120).toLocaleString()}/mo`,
    rpm: `$${(4 + (handle.length % 8)).toFixed(2)}`,
    monetized: handle.length % 3 !== 0,
    avgOutlier: 1.5 + (handle.length % 5) * 0.6,
  };
}
