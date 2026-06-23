import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto, UpdateChannelDto, WizardStepDto } from './dto/channel.dto';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.channel.findMany({
      where: { userId },
      include: {
        platformConnections: true,
        _count: { select: { contentItems: true, scheduledPosts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
      include: {
        platformConnections: true,
        contentCalendars: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!channel) throw new NotFoundException('Channel not found');
    if (channel.userId !== userId) throw new ForbiddenException();

    return channel;
  }

  async create(userId: string, dto: CreateChannelDto) {
    return this.prisma.channel.create({
      data: {
        userId,
        name: dto.name,
        niche: dto.niche,
        targetAudience: dto.targetAudience || 'United States',
        tone: dto.tone || 'engaging',
        postingFrequency: dto.postingFrequency || 'daily',
        platforms: dto.platforms || ['YOUTUBE', 'TIKTOK'],
        platformConnections: {
          create: (dto.platforms || ['YOUTUBE', 'TIKTOK']).map((platform) => ({
            platform,
            connected: false,
          })),
        },
      },
      include: { platformConnections: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateChannelDto) {
    await this.findOne(id, userId);
    return this.prisma.channel.update({
      where: { id },
      data: dto,
      include: { platformConnections: true },
    });
  }

  async updateWizardStep(id: string, userId: string, dto: WizardStepDto) {
    await this.findOne(id, userId);
    const wizardComplete = dto.step >= 5;

    return this.prisma.channel.update({
      where: { id },
      data: {
        wizardStep: dto.step,
        wizardComplete,
        ...(dto.data || {}),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.channel.delete({ where: { id } });
    return { success: true };
  }
}
