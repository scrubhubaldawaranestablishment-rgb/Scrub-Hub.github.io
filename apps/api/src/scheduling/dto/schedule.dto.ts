import { IsString, IsEnum, IsDateString } from 'class-validator';
import { Platform } from '@prisma/client';

export class SchedulePostDto {
  @IsString()
  contentItemId!: string;

  @IsEnum(Platform)
  platform!: Platform;

  @IsDateString()
  scheduledAt!: string;
}
