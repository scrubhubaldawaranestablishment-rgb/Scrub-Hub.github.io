import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('channels/:channelId')
  getDashboard(
    @Param('channelId') channelId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.analyticsService.getChannelDashboard(channelId, req.user.id);
  }

  @Post('channels/:channelId/sync')
  sync(
    @Param('channelId') channelId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.analyticsService.syncAnalytics(channelId, req.user.id);
  }
}
