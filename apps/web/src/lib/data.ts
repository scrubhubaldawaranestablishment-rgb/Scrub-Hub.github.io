import type { NicheChannel } from "./types";

export const TOOLS = [
  { id: "extension", emoji: "🧩", label: "Chrome Extension", href: "/dashboard/extension" },
  { id: "niche-finder", emoji: "🔍", label: "Niche Finder", href: "/dashboard/niche-finder" },
  { id: "branding", emoji: "🎨", label: "Branding", href: "/dashboard/branding" },
  { id: "video-ideas", emoji: "💡", label: "Video Ideas", href: "/dashboard/video-ideas" },
  { id: "thumbnail-studio", emoji: "🖼️", label: "Thumbnail Studio", href: "/dashboard/thumbnail-studio" },
  { id: "script-writer", emoji: "✍️", label: "AI Script Writer", href: "/dashboard/script-writer" },
  { id: "voiceover", emoji: "🎙️", label: "AI Voiceover", href: "/dashboard/voiceover" },
  { id: "video-editor", emoji: "🎬", label: "AI Video Editor", href: "/dashboard/video-editor" },
  { id: "production-board", emoji: "📋", label: "Production Board", href: "/dashboard/production-board" },
  { id: "monetize", emoji: "💰", label: "Monetize", href: "/dashboard/monetize" },
  { id: "ai-coach", emoji: "🎓", label: "AI Coach", href: "/dashboard/ai-coach" },
] as const;

export const NICHE_CHANNELS: NicheChannel[] = [
  { id: "1", name: "Bro Pump", niche: "Fitness", subscribers: "223K", videos: 25, avgViews: "88K", monetized: true, outlierScore: 3.2, description: "Quick, science-based fitness tips that actually work." },
  { id: "2", name: "History Unveiled", niche: "History", subscribers: "412K", videos: 89, avgViews: "156K", monetized: true, outlierScore: 2.8, description: "Untold stories from history with cinematic narration." },
  { id: "3", name: "Money Mindset", niche: "Finance", subscribers: "890K", videos: 142, avgViews: "245K", monetized: true, outlierScore: 4.1, description: "Personal finance and wealth building for beginners." },
  { id: "4", name: "Dark Mysteries", niche: "True Crime", subscribers: "567K", videos: 67, avgViews: "198K", monetized: true, outlierScore: 3.5, description: "Unsolved mysteries and cold cases explained." },
  { id: "5", name: "Tech Simplified", niche: "Technology", subscribers: "1.2M", videos: 203, avgViews: "312K", monetized: true, outlierScore: 2.9, description: "Complex tech explained in simple terms." },
  { id: "6", name: "Daily Motivation", niche: "Motivation", subscribers: "345K", videos: 156, avgViews: "78K", monetized: true, outlierScore: 2.1, description: "Inspirational quotes and success stories." },
  { id: "7", name: "Space Explorers", niche: "Science", subscribers: "678K", videos: 45, avgViews: "189K", monetized: true, outlierScore: 3.8, description: "Space discoveries and cosmic phenomena." },
  { id: "8", name: "Cooking Shortcuts", niche: "Food", subscribers: "234K", videos: 112, avgViews: "92K", monetized: true, outlierScore: 2.4, description: "Quick recipes and kitchen hacks." },
  { id: "9", name: "Psychology Facts", niche: "Psychology", subscribers: "456K", videos: 78, avgViews: "134K", monetized: true, outlierScore: 3.1, description: "Mind-blowing psychology facts and experiments." },
  { id: "10", name: "Ancient Civilizations", niche: "History", subscribers: "789K", videos: 56, avgViews: "167K", monetized: true, outlierScore: 3.6, description: "Lost civilizations and archaeological discoveries." },
  { id: "11", name: "AI Future", niche: "Technology", subscribers: "523K", videos: 34, avgViews: "201K", monetized: true, outlierScore: 4.2, description: "AI news and future predictions." },
  { id: "12", name: "Horror Stories", niche: "Horror", subscribers: "298K", videos: 41, avgViews: "145K", monetized: true, outlierScore: 3.3, description: "Creepy true stories and urban legends." },
];

export const SAMPLE_VIDEOS = [
  { title: "How To Build a Real V-Taper (The 3 Parts Most Guys Miss)", views: "77K", age: "2 days ago", duration: "8:11", outlier: 2.1 },
  { title: "5 Boring Habits That Quietly Kill Your Testosterone", views: "117K", age: "9 days ago", duration: "9:05", outlier: 3.4 },
  { title: "The 5 Exercises That Fix Skinny Fat Fast", views: "19K", age: "2 weeks ago", duration: "9:27", outlier: 0.8 },
  { title: "15 Min Full Body Routine (No Equipment Needed)", views: "54K", age: "3 weeks ago", duration: "15:02", outlier: 1.5 },
  { title: "Why Your Chest Won't Grow (The Real Fix)", views: "203K", age: "1 month ago", duration: "7:44", outlier: 4.8 },
  { title: "The One Rule That Built My Physique", views: "88K", age: "1 month ago", duration: "6:18", outlier: 2.3 },
];

export const MONETIZE_STRATEGIES = [
  { title: "YouTube Ad Revenue", description: "Enable monetization once you hit 1,000 subscribers and 4,000 watch hours. Faceless channels in finance and tech often see $8-15 RPM.", potential: "High" },
  { title: "Affiliate Marketing", description: "Promote relevant products in your niche. Finance channels can earn $500-5,000/month from affiliate links.", potential: "High" },
  { title: "Digital Products", description: "Sell templates, guides, or courses related to your niche. One-time creation, recurring sales.", potential: "Medium" },
  { title: "Sponsorships", description: "Brand deals become available around 50K+ subscribers. Typical rates: $20-50 per 1,000 views.", potential: "High" },
  { title: "Channel Memberships", description: "Offer exclusive content to paying members. Works well for educational and entertainment niches.", potential: "Medium" },
  { title: "Merchandise", description: "Print-on-demand merch with your channel branding. Low risk, passive income potential.", potential: "Low" },
];

export const TESTIMONIALS = [
  { tool: "✍️ Script Writer", quote: "Honestly the script writer just gets my voice. It studied the channels I watch and now my hooks actually keep people around.", author: "Alex R.", niche: "Finance · 120K subs" },
  { tool: "🖼️ Thumbnail Studio", quote: "I was dropping $30 a thumbnail on Fiverr. Now I just type what I want and it makes it.", author: "Maria L.", niche: "Motivation · 50K subs" },
  { tool: "🎬 AI Video Editor", quote: "I drop in my script and it does the rest, even the voiceover. My editing costs basically went to zero.", author: "David T.", niche: "Tech · 310K subs" },
  { tool: "📋 Board + 💡 Ideas", quote: "I check the idea scores before I commit to anything now, and the board keeps everything organized.", author: "Sarah M.", niche: "True Crime · 85K subs" },
  { tool: "🔍 Niche Finder + 🧩 Extension", quote: "Niche finder is how I find channels worth modeling, and the chrome extension shows me outlier scores right on YouTube.", author: "James K.", niche: "History · 200K subs" },
  { tool: "🎨 Branding + 💰 Monetize", quote: "Set up my whole channel look in about 10 minutes with the branding tool.", author: "Chris W.", niche: "Storytelling · 75K subs" },
];
