import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { TiktokService } from './tiktok.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private youtube: YoutubeService,
    private tiktok: TiktokService,
  ) {}

  @Get('youtube/auth/:channelId')
  @UseGuards(JwtAuthGuard)
  youtubeAuth(@Param('channelId') channelId: string) {
    return { url: this.youtube.getAuthUrl(channelId) };
  }

  @Get('youtube/callback')
  youtubeCallback(@Query('code') code: string, @Query('state') channelId: string) {
    return this.youtube.handleCallback(code, channelId);
  }

  @Get('tiktok/auth/:channelId')
  @UseGuards(JwtAuthGuard)
  tiktokAuth(@Param('channelId') channelId: string) {
    return { url: this.tiktok.getAuthUrl(channelId) };
  }

  @Get('tiktok/callback')
  tiktokCallback(@Query('code') code: string, @Query('state') channelId: string) {
    return this.tiktok.handleCallback(code, channelId);
  }

  @Get('channels/:channelId/status')
  @UseGuards(JwtAuthGuard)
  async platformStatus(@Param('channelId') channelId: string) {
    return {
      youtube: await this.youtube.getChannelAnalytics(channelId),
      tiktok: await this.tiktok.getAnalytics(channelId),
    };
  }
}
