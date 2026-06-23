import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelsService } from '../channels/channels.service';
import { CreateContentItemDto, UpdateContentItemDto } from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private channelsService: ChannelsService,
  ) {}

  async findByChannel(channelId: string, userId: string) {
    await this.channelsService.findOne(channelId, userId);
    return this.prisma.contentItem.findMany({
      where: { channelId },
      include: {
        generatedAssets: { orderBy: { createdAt: 'desc' } },
        scheduledPosts: true,
      },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id },
      include: {
        channel: true,
        generatedAssets: { orderBy: { createdAt: 'desc' } },
        scheduledPosts: true,
        analyticsEvents: true,
      },
    });

    if (!item) throw new NotFoundException('Content not found');
    if (item.channel.userId !== userId) throw new ForbiddenException();

    return item;
  }

  async create(channelId: string, userId: string, dto: CreateContentItemDto) {
    await this.channelsService.findOne(channelId, userId);
    return this.prisma.contentItem.create({
      data: {
        channelId,
        title: dto.title,
        topic: dto.topic,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        platforms: dto.platforms || ['YOUTUBE', 'TIKTOK'],
      },
      include: { generatedAssets: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateContentItemDto) {
    await this.findOne(id, userId);
    return this.prisma.contentItem.update({
      where: { id },
      data: {
        ...dto,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
      },
      include: { generatedAssets: true, scheduledPosts: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.contentItem.delete({ where: { id } });
    return { success: true };
  }
}
