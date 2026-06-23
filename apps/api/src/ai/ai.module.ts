import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { OpenAiService } from './openai.service';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [ChannelsModule],
  controllers: [AiController],
  providers: [AiService, OpenAiService],
  exports: [AiService, OpenAiService],
})
export class AiModule {}
