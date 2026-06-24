import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../ai/gemini.service';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
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

    const insights = await this.gemini.generateFeedbackInsights(
      recentFeedback.map((f) => ({ rating: f.rating, comment: f.comment || undefined })),
    );

    await this.prisma.aiFeedback.update({
      where: { id: feedback.id },
      data: { suggestions: insights as Prisma.InputJsonValue },
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
