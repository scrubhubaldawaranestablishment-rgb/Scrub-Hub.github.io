import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PostStatus, ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelsService } from '../channels/channels.service';
import { SchedulePostDto } from './dto/schedule.dto';
import { PUBLISH_QUEUE, PublishJobData } from './publish.processor';

@Injectable()
export class SchedulingService {
  constructor(
    private prisma: PrismaService,
    private channelsService: ChannelsService,
    @InjectQueue(PUBLISH_QUEUE) private publishQueue: Queue<PublishJobData>,
  ) {}

  async schedule(channelId: string, userId: string, dto: SchedulePostDto) {
    await this.channelsService.findOne(channelId, userId);

    const contentItem = await this.prisma.contentItem.findUnique({
      where: { id: dto.contentItemId },
    });

    if (!contentItem || contentItem.channelId !== channelId) {
      throw new NotFoundException('Content item not found');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    const delay = Math.max(0, scheduledAt.getTime() - Date.now());

    const post = await this.prisma.scheduledPost.create({
      data: {
        channelId,
        contentItemId: dto.contentItemId,
        platform: dto.platform,
        scheduledAt,
        status: PostStatus.PENDING,
      },
    });

    await this.prisma.contentItem.update({
      where: { id: dto.contentItemId },
      data: { status: ContentStatus.SCHEDULED, scheduledFor: scheduledAt },
    });

    await this.publishQueue.add(
      'publish',
      { scheduledPostId: post.id },
      {
        delay,
        jobId: post.id,
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    return post;
  }

  async getSchedule(channelId: string, userId: string) {
    await this.channelsService.findOne(channelId, userId);
    return this.prisma.scheduledPost.findMany({
      where: { channelId },
      include: {
        contentItem: { select: { id: true, title: true, status: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async cancel(postId: string, userId: string) {
    const post = await this.prisma.scheduledPost.findUnique({
      where: { id: postId },
      include: { channel: true },
    });

    if (!post) throw new NotFoundException('Scheduled post not found');
    if (post.channel.userId !== userId) throw new ForbiddenException();

    const job = await this.publishQueue.getJob(postId);
    if (job) await job.remove();

    return this.prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: PostStatus.CANCELLED },
    });
  }
}
