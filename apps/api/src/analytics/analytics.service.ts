import { Injectable } from '@nestjs/common';
import { Platform } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelsService } from '../channels/channels.service';
import { YoutubeService } from '../integrations/youtube.service';
import { TiktokService } from '../integrations/tiktok.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private channelsService: ChannelsService,
    private youtube: YoutubeService,
    private tiktok: TiktokService,
  ) {}

  async getChannelDashboard(channelId: string, userId: string) {
    await this.channelsService.findOne(channelId, userId);

    const [contentStats, scheduleStats, snapshots, recentContent] = await Promise.all([
      this.prisma.contentItem.groupBy({
        by: ['status'],
        where: { channelId },
        _count: true,
      }),
      this.prisma.scheduledPost.groupBy({
        by: ['status'],
        where: { channelId },
        _count: true,
      }),
      this.prisma.analyticsSnapshot.findMany({
        where: { channelId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      this.prisma.contentItem.findMany({
        where: { channelId, status: 'PUBLISHED' },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: { analyticsEvents: true },
      }),
    ]);

    const youtubeAnalytics = await this.youtube.getChannelAnalytics(channelId);
    const tiktokAnalytics = await this.tiktok.getAnalytics(channelId);

    return {
      contentStats: Object.fromEntries(contentStats.map((s) => [s.status, s._count])),
      scheduleStats: Object.fromEntries(scheduleStats.map((s) => [s.status, s._count])),
      platforms: { youtube: youtubeAnalytics, tiktok: tiktokAnalytics },
      snapshots,
      recentContent,
    };
  }

  async syncAnalytics(channelId: string, userId: string) {
    await this.channelsService.findOne(channelId, userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const platforms: Platform[] = ['YOUTUBE', 'TIKTOK'];

    for (const platform of platforms) {
      const raw =
        platform === 'YOUTUBE'
          ? await this.youtube.getChannelAnalytics(channelId)
          : await this.tiktok.getAnalytics(channelId);
      const data = raw as unknown as Record<string, number | undefined>;

      await this.prisma.analyticsSnapshot.upsert({
        where: {
          channelId_platform_date: { channelId, platform, date: today },
        },
        create: {
          channelId,
          platform,
          date: today,
          views: data.views || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          subscribers: (data.subscribers ?? data.followers) || 0,
          metadata: raw,
        },
        update: {
          views: data.views || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          subscribers: (data.subscribers ?? data.followers) || 0,
          metadata: raw,
        },
      });
    }

    return { success: true, syncedAt: new Date().toISOString() };
  }
}
