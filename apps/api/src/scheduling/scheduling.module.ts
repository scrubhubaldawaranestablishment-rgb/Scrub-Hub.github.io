import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { PublishProcessor, PUBLISH_QUEUE } from './publish.processor';
import { ChannelsModule } from '../channels/channels.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: PUBLISH_QUEUE }),
    ChannelsModule,
    IntegrationsModule,
  ],
  controllers: [SchedulingController],
  providers: [SchedulingService, PublishProcessor],
  exports: [SchedulingService],
})
export class SchedulingModule {}
