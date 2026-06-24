import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AssetType, ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelsService } from '../channels/channels.service';
import { GeminiService } from './gemini.service';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private channelsService: ChannelsService,
    private gemini: GeminiService,
  ) {}

  private async getChannelContext(channelId: string, userId: string) {
    const channel = await this.channelsService.findOne(channelId, userId);
    return {
      name: channel.name,
      niche: channel.niche,
      targetAudience: channel.targetAudience,
      tone: channel.tone,
    };
  }

  async researchTrends(channelId: string, userId: string, query?: string) {
    const ctx = await this.getChannelContext(channelId, userId);
    const result = await this.gemini.researchTrends(ctx, query);

    return this.prisma.trendResearch.create({
      data: {
        channelId,
        query: query || null,
        trends: result.trends as unknown as Prisma.InputJsonValue,
        summary: result.summary,
        recommendations: result.recommendations as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async generateCalendar(channelId: string, userId: string, days = 30) {
    const ctx = await this.getChannelContext(channelId, userId);
    const result = await this.gemini.generateCalendar(ctx, days);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const calendar = await this.prisma.contentCalendar.create({
      data: {
        channelId,
        name: `${days}-Day Content Calendar`,
        startDate,
        endDate,
        days,
        entries: result.entries as Prisma.InputJsonValue,
      },
    });

    const contentItems = await Promise.all(
      result.entries.map((entry: { title: string; topic: string; day: number; angle?: string; bestTime?: string }, index: number) => {
        const scheduledFor = new Date(startDate);
        scheduledFor.setDate(scheduledFor.getDate() + index);

        return this.prisma.contentItem.create({
          data: {
            channelId,
            calendarId: calendar.id,
            title: entry.title,
            topic: entry.topic,
            scheduledFor,
            status: ContentStatus.DRAFT,
            metadata: { angle: entry.angle, bestTime: entry.bestTime, day: entry.day },
          },
        });
      }),
    );

    return { calendar, contentItems };
  }

  async generateForContent(
    contentItemId: string,
    userId: string,
    type: AssetType,
    options?: { hook?: string },
  ) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: { channel: true, generatedAssets: true },
    });

    if (!item) throw new NotFoundException('Content item not found');
    if (item.channel.userId !== userId) throw new ForbiddenException();

    const ctx = {
      name: item.channel.name,
      niche: item.channel.niche,
      targetAudience: item.channel.targetAudience,
      tone: item.channel.tone,
    };

    await this.prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: ContentStatus.GENERATING },
    });

    let result: unknown;
    let content = '';

    switch (type) {
      case AssetType.HOOK:
        result = await this.gemini.generateHook(ctx, item.topic || item.title);
        content = JSON.stringify(result);
        break;
      case AssetType.SCRIPT: {
        const hookAsset = item.generatedAssets.find((a) => a.type === AssetType.HOOK);
        const hookData = hookAsset ? JSON.parse(hookAsset.content) : null;
        const hook = options?.hook || hookData?.hooks?.[0]?.text || item.title;
        result = await this.gemini.generateScript(ctx, item.topic || item.title, hook);
        content = JSON.stringify(result);
        break;
      }
      case AssetType.CTA:
        result = await this.gemini.generateCta(ctx, item.topic || item.title);
        content = JSON.stringify(result);
        break;
      case AssetType.DESCRIPTION:
        result = await this.gemini.generateDescription(ctx, item.title, item.topic || item.title);
        content = JSON.stringify(result);
        break;
      case AssetType.THUMBNAIL_PROMPT:
        result = await this.gemini.generateThumbnailPrompt(ctx, item.title);
        content = JSON.stringify(result);
        break;
      case AssetType.VIDEO_PROMPT: {
        const scriptAsset = item.generatedAssets.find((a) => a.type === AssetType.SCRIPT);
        const scriptData = scriptAsset ? JSON.parse(scriptAsset.content) : null;
        const script = scriptData?.fullScript || item.title;
        result = await this.gemini.generateVideoPrompt(ctx, script);
        content = JSON.stringify(result);
        break;
      }
      default:
        throw new NotFoundException('Unsupported asset type');
    }

    const existingCount = item.generatedAssets.filter((a) => a.type === type).length;
    const asset = await this.prisma.generatedAsset.create({
      data: {
        contentItemId,
        type,
        content,
        version: existingCount + 1,
        metadata: { generatedAt: new Date().toISOString() },
      },
    });

    const allTypes = [
      AssetType.HOOK,
      AssetType.SCRIPT,
      AssetType.CTA,
      AssetType.DESCRIPTION,
      AssetType.THUMBNAIL_PROMPT,
      AssetType.VIDEO_PROMPT,
    ];
    const updatedAssets = await this.prisma.generatedAsset.findMany({
      where: { contentItemId },
    });
    const hasAll = allTypes.every((t) => updatedAssets.some((a) => a.type === t));

    await this.prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: hasAll ? ContentStatus.READY : ContentStatus.DRAFT },
    });

    return { asset, result };
  }

  async generateFullPipeline(contentItemId: string, userId: string) {
    const types = [
      AssetType.HOOK,
      AssetType.SCRIPT,
      AssetType.CTA,
      AssetType.DESCRIPTION,
      AssetType.THUMBNAIL_PROMPT,
      AssetType.VIDEO_PROMPT,
    ];

    const results = [];
    for (const type of types) {
      const result = await this.generateForContent(contentItemId, userId, type);
      results.push(result);
    }

    return results;
  }
}
