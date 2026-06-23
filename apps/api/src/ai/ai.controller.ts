import { Controller, Post, Get, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { TrendResearchDto, GenerateCalendarDto, GenerateAssetDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private aiService: AiService,
    private prisma: PrismaService,
  ) {}

  @Post('channels/:channelId/trends')
  researchTrends(
    @Param('channelId') channelId: string,
    @Body() dto: TrendResearchDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.aiService.researchTrends(channelId, req.user.id, dto.query);
  }

  @Get('channels/:channelId/trends')
  getTrends(@Param('channelId') channelId: string) {
    return this.prisma.trendResearch.findMany({
      where: { channelId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  @Post('channels/:channelId/calendar')
  generateCalendar(
    @Param('channelId') channelId: string,
    @Body() dto: GenerateCalendarDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.aiService.generateCalendar(channelId, req.user.id, dto.days || 30);
  }

  @Post('content/:contentItemId/generate')
  generateAsset(
    @Param('contentItemId') contentItemId: string,
    @Body() dto: GenerateAssetDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.aiService.generateForContent(contentItemId, req.user.id, dto.type, {
      hook: dto.hook,
    });
  }

  @Post('content/:contentItemId/generate-all')
  generateAll(
    @Param('contentItemId') contentItemId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.aiService.generateFullPipeline(contentItemId, req.user.id);
  }
}
