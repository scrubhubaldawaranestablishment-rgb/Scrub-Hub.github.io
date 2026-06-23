"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { BoardColumn, ChatMessage, SavedChannel, Script, ThumbnailProject, VideoIdea, VideoProject } from "./types";

interface AppState {
  videoIdeas: VideoIdea[];
  scripts: Script[];
  savedChannels: SavedChannel[];
  coachMessages: ChatMessage[];
  thumbnailProjects: ThumbnailProject[];
  videoProjects: VideoProject[];
  boardColumns: BoardColumn[];

  addVideoIdeas: (ideas: VideoIdea[]) => void;
  addScript: (script: Script) => void;
  saveChannel: (channel: SavedChannel) => void;
  removeChannel: (id: string) => void;
  addCoachMessage: (message: ChatMessage) => void;
  addThumbnailProject: (project: ThumbnailProject) => void;
  updateThumbnailProject: (id: string, project: Partial<ThumbnailProject>) => void;
  addVideoProject: (project: VideoProject) => void;
  updateBoardColumns: (columns: BoardColumn[]) => void;
}

const defaultBoard: BoardColumn[] = [
  { id: "brainstorm", title: "💡 Brainstorm", cards: [{ id: uuid(), title: "Video idea: Top 10 mysteries", description: "Research trending topics" }] },
  { id: "scripting", title: "✍️ Scripting", cards: [] },
  { id: "thumbnail", title: "🖼️ Thumbnail", cards: [] },
  { id: "editing", title: "🎬 Editing", cards: [] },
  { id: "review", title: "👀 Review", cards: [] },
  { id: "uploaded", title: "✅ Uploaded", cards: [] },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      videoIdeas: [],
      scripts: [],
      savedChannels: [],
      coachMessages: [],
      thumbnailProjects: [],
      videoProjects: [],
      boardColumns: defaultBoard,

      addVideoIdeas: (ideas) => set((s) => ({ videoIdeas: [...ideas, ...s.videoIdeas] })),
      addScript: (script) => set((s) => ({ scripts: [script, ...s.scripts] })),
      saveChannel: (channel) => set((s) => ({ savedChannels: [channel, ...s.savedChannels.filter((c) => c.id !== channel.id)] })),
      removeChannel: (id) => set((s) => ({ savedChannels: s.savedChannels.filter((c) => c.id !== id) })),
      addCoachMessage: (message) => set((s) => ({ coachMessages: [...s.coachMessages, message] })),
      addThumbnailProject: (project) => set((s) => ({ thumbnailProjects: [project, ...s.thumbnailProjects] })),
      updateThumbnailProject: (id, project) =>
        set((s) => ({
          thumbnailProjects: s.thumbnailProjects.map((p) => (p.id === id ? { ...p, ...project } : p)),
        })),
      addVideoProject: (project) => set((s) => ({ videoProjects: [project, ...s.videoProjects] })),
      updateBoardColumns: (columns) => set({ boardColumns: columns }),
    }),
    { name: "videdge-personal" }
  )
);
