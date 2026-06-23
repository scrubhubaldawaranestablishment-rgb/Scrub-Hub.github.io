import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      userCount,
      channelCount,
      contentCount,
      scheduledCount,
      publishedCount,
      recentJobs,
      contentByStatus,
      upcomingPosts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.channel.count(),
      this.prisma.contentItem.count(),
      this.prisma.scheduledPost.count({ where: { status: 'PENDING' } }),
      this.prisma.scheduledPost.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.jobLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.contentItem.groupBy({ by: ['status'], _count: true }),
      this.prisma.scheduledPost.findMany({
        where: { status: 'PENDING' },
        orderBy: { scheduledAt: 'asc' },
        take: 20,
        include: {
          contentItem: { select: { title: true } },
          channel: { select: { name: true } },
        },
      }),
    ]);

    return {
      stats: {
        users: userCount,
        channels: channelCount,
        content: contentCount,
        scheduled: scheduledCount,
        published: publishedCount,
      },
      contentByStatus: Object.fromEntries(contentByStatus.map((s) => [s.status, s._count])),
      upcomingPosts,
      recentJobs,
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { channels: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllContent() {
    return this.prisma.contentItem.findMany({
      include: {
        channel: { select: { name: true, niche: true } },
        generatedAssets: { select: { type: true, version: true } },
        scheduledPosts: { select: { platform: true, status: true, scheduledAt: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }
}
