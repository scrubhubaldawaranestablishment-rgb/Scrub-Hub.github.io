import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ChannelsModule } from '../channels/channels.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [ChannelsModule, IntegrationsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
