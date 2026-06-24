import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
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
    const configured = this.youtube.isConfigured();
    return { url: this.youtube.getAuthUrl(channelId), configured };
  }

  @Post('youtube/demo-connect/:channelId')
  @UseGuards(JwtAuthGuard)
  youtubeDemoConnect(@Param('channelId') channelId: string) {
    return this.youtube.demoConnect(channelId);
  }

  @Get('youtube/callback')
  youtubeCallback(@Query('code') code: string, @Query('state') channelId: string) {
    return this.youtube.handleCallback(code, channelId);
  }

  @Get('tiktok/auth/:channelId')
  @UseGuards(JwtAuthGuard)
  tiktokAuth(@Param('channelId') channelId: string) {
    const configured = this.tiktok.isConfigured();
    return { url: this.tiktok.getAuthUrl(channelId), configured };
  }

  @Post('tiktok/demo-connect/:channelId')
  @UseGuards(JwtAuthGuard)
  tiktokDemoConnect(@Param('channelId') channelId: string) {
    return this.tiktok.demoConnect(channelId);
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
