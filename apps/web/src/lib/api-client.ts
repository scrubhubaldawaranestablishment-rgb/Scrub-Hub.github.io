// Use same-origin /api proxy (see next.config.ts rewrites) so login works
// when the app is opened via port-forward or preview URLs, not only localhost.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface Channel {
  id: string;
  name: string;
  niche: string;
  targetAudience: string;
  tone: string;
  postingFrequency: string;
  platforms: string[];
  wizardStep: number;
  wizardComplete: boolean;
  platformConnections?: PlatformConnection[];
  _count?: { contentItems: number; scheduledPosts: number };
}

export interface PlatformConnection {
  id: string;
  platform: string;
  connected: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  topic: string | null;
  status: string;
  scheduledFor: string | null;
  platforms: string[];
  generatedAssets?: GeneratedAsset[];
  scheduledPosts?: ScheduledPost[];
  metadata?: Record<string, unknown>;
}

export interface GeneratedAsset {
  id: string;
  type: string;
  content: string;
  version: number;
  createdAt: string;
}

export interface ScheduledPost {
  id: string;
  platform: string;
  scheduledAt: string;
  status: string;
  contentItem?: { id: string; title: string; status: string };
}

export interface TrendResearch {
  id: string;
  summary: string;
  trends: Array<{ topic: string; virality: number; reason: string; hashtags: string[] }>;
  recommendations: string[];
  createdAt: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("cp_token", token);
      else localStorage.removeItem("cp_token");
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("cp_token");
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `API error: ${res.status}`);
    }

    return res.json();
  }

  // Auth
  register(email: string, password: string, name?: string) {
    return this.request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  login(email: string, password: string) {
    return this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  me() {
    return this.request<{ user: User }>("/auth/me", { method: "POST" });
  }

  // Channels
  getChannels() {
    return this.request<Channel[]>("/channels");
  }

  getChannel(id: string) {
    return this.request<Channel>(`/channels/${id}`);
  }

  createChannel(data: Partial<Channel>) {
    return this.request<Channel>("/channels", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateChannel(id: string, data: Partial<Channel>) {
    return this.request<Channel>(`/channels/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  updateWizardStep(id: string, step: number, data?: Record<string, unknown>) {
    return this.request(`/channels/${id}/wizard`, {
      method: "POST",
      body: JSON.stringify({ step, data }),
    });
  }

  // AI
  researchTrends(channelId: string, query?: string) {
    return this.request<TrendResearch>(`/ai/channels/${channelId}/trends`, {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  getTrends(channelId: string) {
    return this.request<TrendResearch[]>(`/ai/channels/${channelId}/trends`);
  }

  generateCalendar(channelId: string, days = 30) {
    return this.request(`/ai/channels/${channelId}/calendar`, {
      method: "POST",
      body: JSON.stringify({ days }),
    });
  }

  generateAsset(contentItemId: string, type: string, hook?: string) {
    return this.request(`/ai/content/${contentItemId}/generate`, {
      method: "POST",
      body: JSON.stringify({ type, hook }),
    });
  }

  generateAllAssets(contentItemId: string) {
    return this.request(`/ai/content/${contentItemId}/generate-all`, {
      method: "POST",
    });
  }

  // Content
  getContent(channelId: string) {
    return this.request<ContentItem[]>(`/content/channels/${channelId}`);
  }

  getContentItem(id: string) {
    return this.request<ContentItem>(`/content/${id}`);
  }

  createContent(channelId: string, data: { title: string; topic?: string }) {
    return this.request<ContentItem>(`/content/channels/${channelId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Scheduling
  getSchedule(channelId: string) {
    return this.request<ScheduledPost[]>(`/scheduling/channels/${channelId}`);
  }

  schedulePost(channelId: string, data: { contentItemId: string; platform: string; scheduledAt: string }) {
    return this.request(`/scheduling/channels/${channelId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Analytics
  getAnalytics(channelId: string) {
    return this.request<Record<string, unknown>>(`/analytics/channels/${channelId}`);
  }

  syncAnalytics(channelId: string) {
    return this.request<{ success: boolean }>(`/analytics/channels/${channelId}/sync`, { method: "POST" });
  }

  // Integrations
  getIntegrationAuth(platform: string, channelId: string) {
    return this.request<{ url: string | null; configured: boolean }>(
      `/integrations/${platform}/auth/${channelId}`,
    );
  }

  demoConnectIntegration(platform: string, channelId: string) {
    return this.request<{ success: boolean; platform: string; demo: boolean }>(
      `/integrations/${platform}/demo-connect/${channelId}`,
      { method: "POST" },
    );
  }

  // Feedback
  submitFeedback(data: { rating: number; comment?: string; contentItemId?: string }) {
    return this.request("/feedback", { method: "POST", body: JSON.stringify(data) });
  }

  // Admin
  getAdminOverview() {
    return this.request<Record<string, unknown>>("/admin/overview");
  }

  getAdminUsers() {
    return this.request<Array<Record<string, unknown>>>("/admin/users");
  }

  getAdminContent() {
    return this.request<Array<Record<string, unknown>>>("/admin/content");
  }
}

export const api = new ApiClient();
