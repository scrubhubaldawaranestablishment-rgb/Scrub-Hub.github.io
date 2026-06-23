import { IsString, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { ContentStatus, Platform } from '@prisma/client';

export class CreateContentItemDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms?: Platform[];
}

export class UpdateContentItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms?: Platform[];
}
