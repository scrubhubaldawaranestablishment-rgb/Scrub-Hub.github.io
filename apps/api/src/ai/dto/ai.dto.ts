import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { AssetType } from '@prisma/client';

export class TrendResearchDto {
  @IsOptional()
  @IsString()
  query?: string;
}

export class GenerateCalendarDto {
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(90)
  days?: number;
}

export class GenerateAssetDto {
  @IsEnum(AssetType)
  type!: AssetType;

  @IsOptional()
  @IsString()
  hook?: string;
}
