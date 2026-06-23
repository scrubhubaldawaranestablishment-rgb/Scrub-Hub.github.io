import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { TiktokService } from './tiktok.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  controllers: [IntegrationsController],
  providers: [YoutubeService, TiktokService],
  exports: [YoutubeService, TiktokService],
})
export class IntegrationsModule {}
