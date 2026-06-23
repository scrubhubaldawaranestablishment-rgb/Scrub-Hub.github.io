import { IsString, IsOptional, IsArray, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Platform } from '@prisma/client';

export class CreateChannelDto {
  @IsString()
  name!: string;

  @IsString()
  niche!: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  postingFrequency?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms?: Platform[];
}

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  postingFrequency?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms?: Platform[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  wizardStep?: number;

  @IsOptional()
  wizardComplete?: boolean;
}

export class WizardStepDto {
  @IsInt()
  @Min(0)
  @Max(5)
  step!: number;

  @IsOptional()
  data?: Record<string, unknown>;
}
