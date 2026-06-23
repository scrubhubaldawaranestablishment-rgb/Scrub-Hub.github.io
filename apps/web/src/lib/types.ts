export type ToolId =
  | "extension"
  | "niche-finder"
  | "branding"
  | "video-ideas"
  | "thumbnail-studio"
  | "script-writer"
  | "voiceover"
  | "video-editor"
  | "production-board"
  | "monetize"
  | "ai-coach";

export interface NicheChannel {
  id: string;
  name: string;
  niche: string;
  subscribers: string;
  videos: number;
  avgViews: string;
  monetized: boolean;
  outlierScore: number;
  description: string;
}

export interface VideoIdea {
  id: string;
  title: string;
  hook: string;
  score: number;
  niche: string;
  createdAt: string;
}

export interface ScriptSection {
  id: string;
  title: string;
  content: string;
}

export interface Script {
  id: string;
  title: string;
  niche: string;
  sections: ScriptSection[];
  createdAt: string;
}

export interface BoardCard {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  assignee?: string;
}

export interface BoardColumn {
  id: string;
  title: string;
  cards: BoardCard[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ThumbnailProject {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: ThumbnailElement[];
  createdAt: string;
}

export interface ThumbnailElement {
  id: string;
  type: "text" | "rect" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color?: string;
  fontSize?: number;
  imageUrl?: string;
}

export interface VideoScene {
  id: string;
  title: string;
  narration: string;
  duration: number;
  style: "animated" | "real-life";
}

export interface VideoProject {
  id: string;
  title: string;
  scenes: VideoScene[];
  createdAt: string;
}

export interface SavedChannel {
  id: string;
  name: string;
  handle: string;
  subscribers: string;
  savedAt: string;
}
