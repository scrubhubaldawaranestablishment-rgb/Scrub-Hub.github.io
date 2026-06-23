import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PostStatus, ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { YoutubeService } from '../integrations/youtube.service';
import { TiktokService } from '../integrations/tiktok.service';

export const PUBLISH_QUEUE = 'publish-queue';

export interface PublishJobData {
  scheduledPostId: string;
}

@Processor(PUBLISH_QUEUE)
export class PublishProcessor extends WorkerHost {
  private readonly logger = new Logger(PublishProcessor.name);

  constructor(
    private prisma: PrismaService,
    private youtube: YoutubeService,
    private tiktok: TiktokService,
  ) {
    super();
  }

  async process(job: Job<PublishJobData>) {
    const { scheduledPostId } = job.data;
    this.logger.log(`Processing publish job: ${scheduledPostId}`);

    const post = await this.prisma.scheduledPost.findUnique({
      where: { id: scheduledPostId },
      include: {
        contentItem: { include: { generatedAssets: true } },
        channel: { include: { platformConnections: true } },
      },
    });

    if (!post) {
      throw new Error(`Scheduled post not found: ${scheduledPostId}`);
    }

    await this.prisma.scheduledPost.update({
      where: { id: scheduledPostId },
      data: { status: PostStatus.PROCESSING },
    });

    try {
      const description = post.contentItem.generatedAssets.find(
        (a) => a.type === 'DESCRIPTION',
      );
      const descContent = description ? JSON.parse(description.content) : {};

      let externalPostId: string;

      if (post.platform === 'YOUTUBE') {
        const result = await this.youtube.publishShort(
          post.channelId,
          post.contentItem.title,
          descContent.youtube || post.contentItem.title,
        );
        externalPostId = result.videoId;
      } else {
        const result = await this.tiktok.publishVideo(
          post.channelId,
          post.contentItem.title,
          descContent.tiktok || post.contentItem.title,
        );
        externalPostId = result.publishId;
      }

      await this.prisma.scheduledPost.update({
        where: { id: scheduledPostId },
        data: {
          status: PostStatus.PUBLISHED,
          externalPostId,
          publishedAt: new Date(),
        },
      });

      await this.prisma.contentItem.update({
        where: { id: post.contentItemId },
        data: { status: ContentStatus.PUBLISHED },
      });

      await this.prisma.jobLog.create({
        data: {
          jobId: job.id || scheduledPostId,
          queue: PUBLISH_QUEUE,
          name: 'publish',
          status: 'completed',
          payload: job.data as object,
          result: { externalPostId },
        },
      });

      return { success: true, externalPostId };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      await this.prisma.scheduledPost.update({
        where: { id: scheduledPostId },
        data: { status: PostStatus.FAILED, errorMessage: message },
      });

      await this.prisma.jobLog.create({
        data: {
          jobId: job.id || scheduledPostId,
          queue: PUBLISH_QUEUE,
          name: 'publish',
          status: 'failed',
          payload: job.data as object,
          error: message,
        },
      });

      throw error;
    }
  }
}
