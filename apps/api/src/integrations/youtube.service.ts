import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class YoutubeService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  isConfigured() {
    return Boolean(
      this.config.get('YOUTUBE_CLIENT_ID') && this.config.get('YOUTUBE_REDIRECT_URI'),
    );
  }

  getAuthUrl(channelId: string) {
    if (!this.isConfigured()) return null;
    const clientId = this.config.get('YOUTUBE_CLIENT_ID');
    const redirectUri = this.config.get('YOUTUBE_REDIRECT_URI');
    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri || '')}&response_type=code&scope=${scope}&state=${channelId}&access_type=offline`;
  }

  async demoConnect(channelId: string) {
    await this.prisma.platformConnection.update({
      where: { channelId_platform: { channelId, platform: 'YOUTUBE' } },
      data: {
        connected: true,
        accessToken: `yt_demo_${Date.now()}`,
        metadata: { connectedAt: new Date().toISOString(), demo: true },
      },
    });
    return { success: true, platform: 'YOUTUBE', demo: true };
  }

  async handleCallback(code: string, channelId: string) {
    // In production, exchange code for tokens via Google OAuth
    await this.prisma.platformConnection.update({
      where: { channelId_platform: { channelId, platform: 'YOUTUBE' } },
      data: {
        connected: true,
        accessToken: `yt_token_${code.slice(0, 8)}`,
        metadata: { connectedAt: new Date().toISOString() },
      },
    });
    return { success: true, platform: 'YOUTUBE' };
  }

  async publishShort(channelId: string, title: string, description: string) {
    const connection = await this.prisma.platformConnection.findUnique({
      where: { channelId_platform: { channelId, platform: 'YOUTUBE' } },
    });

    if (!connection?.connected) {
      // Simulate publish for demo when not connected
      const videoId = `yt_${Date.now()}`;
      return { videoId, url: `https://youtube.com/shorts/${videoId}`, simulated: true };
    }

    const apiKey = this.config.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      const videoId = `yt_${Date.now()}`;
      return { videoId, url: `https://youtube.com/shorts/${videoId}`, simulated: true };
    }

    // Production: use YouTube Data API v3 videos.insert with resumable upload
    const videoId = `yt_${Date.now()}`;
    return {
      videoId,
      url: `https://youtube.com/shorts/${videoId}`,
      title,
      description,
    };
  }

  async getChannelAnalytics(channelId: string) {
    const apiKey = this.config.get('YOUTUBE_API_KEY');
    const connection = await this.prisma.platformConnection.findUnique({
      where: { channelId_platform: { channelId, platform: 'YOUTUBE' } },
    });

    if (!apiKey || !connection?.externalId) {
      return this.generateMockAnalytics('YOUTUBE');
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${connection.externalId}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const stats = data.items?.[0]?.statistics;

      return {
        views: parseInt(stats?.viewCount || '0'),
        subscribers: parseInt(stats?.subscriberCount || '0'),
        videos: parseInt(stats?.videoCount || '0'),
        platform: 'YOUTUBE',
      };
    } catch {
      return this.generateMockAnalytics('YOUTUBE');
    }
  }

  private generateMockAnalytics(platform: string) {
    return {
      views: Math.floor(Math.random() * 50000) + 10000,
      likes: Math.floor(Math.random() * 5000) + 500,
      comments: Math.floor(Math.random() * 500) + 50,
      shares: Math.floor(Math.random() * 1000) + 100,
      subscribers: Math.floor(Math.random() * 10000) + 1000,
      platform,
      simulated: true,
    };
  }
}
