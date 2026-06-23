import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../ai/openai.service';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private openai: OpenAiService,
  ) {}

  async create(userId: string, dto: CreateFeedbackDto) {
    const feedback = await this.prisma.aiFeedback.create({
      data: {
        userId,
        contentItemId: dto.contentItemId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    const recentFeedback = await this.prisma.aiFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const insights = await this.openai.generateFeedbackInsights(
      recentFeedback.map((f) => ({ rating: f.rating, comment: f.comment || undefined })),
    );

    await this.prisma.aiFeedback.update({
      where: { id: feedback.id },
      data: { suggestions: insights },
    });

    return { feedback, insights };
  }

  async getForUser(userId: string) {
    return this.prisma.aiFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { contentItem: { select: { id: true, title: true } } },
    });
  }
}
