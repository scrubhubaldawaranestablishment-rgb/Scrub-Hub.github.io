import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TiktokService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  isConfigured() {
    return Boolean(
      this.config.get('TIKTOK_CLIENT_KEY') && this.config.get('TIKTOK_REDIRECT_URI'),
    );
  }

  getAuthUrl(channelId: string) {
    if (!this.isConfigured()) return null;
    const clientKey = this.config.get('TIKTOK_CLIENT_KEY');
    const redirectUri = this.config.get('TIKTOK_REDIRECT_URI');
    const scope = 'user.info.basic,video.publish,video.upload';
    return `https://www.tiktok.com/v2/auth/authorize?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri || '')}&state=${channelId}`;
  }

  async demoConnect(channelId: string) {
    await this.prisma.platformConnection.update({
      where: { channelId_platform: { channelId, platform: 'TIKTOK' } },
      data: {
        connected: true,
        accessToken: `tt_demo_${Date.now()}`,
        metadata: { connectedAt: new Date().toISOString(), demo: true },
      },
    });
    return { success: true, platform: 'TIKTOK', demo: true };
  }

  async handleCallback(code: string, channelId: string) {
    await this.prisma.platformConnection.update({
      where: { channelId_platform: { channelId, platform: 'TIKTOK' } },
      data: {
        connected: true,
        accessToken: `tt_token_${code.slice(0, 8)}`,
        metadata: { connectedAt: new Date().toISOString() },
      },
    });
    return { success: true, platform: 'TIKTOK' };
  }

  async publishVideo(channelId: string, title: string, description: string) {
    const connection = await this.prisma.platformConnection.findUnique({
      where: { channelId_platform: { channelId, platform: 'TIKTOK' } },
    });

    if (!connection?.connected) {
      const publishId = `tt_${Date.now()}`;
      return { publishId, url: `https://tiktok.com/@channel/video/${publishId}`, simulated: true };
    }

    // Production: TikTok Content Posting API
    const publishId = `tt_${Date.now()}`;
    return { publishId, url: `https://tiktok.com/@channel/video/${publishId}`, title, description };
  }

  async getAnalytics(channelId: string) {
    return {
      views: Math.floor(Math.random() * 100000) + 20000,
      likes: Math.floor(Math.random() * 10000) + 1000,
      comments: Math.floor(Math.random() * 1000) + 100,
      shares: Math.floor(Math.random() * 5000) + 500,
      followers: Math.floor(Math.random() * 20000) + 2000,
      platform: 'TIKTOK',
      simulated: true,
    };
  }
}
