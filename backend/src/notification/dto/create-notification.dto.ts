import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested, maxLength } from 'class-validator';

import { NetworkType } from '../../utils/enums/network.enum';

export class FilterDto {
  @ApiProperty()
  @IsString()
  dir: string;

  @ApiProperty()
  @IsNumber()
  value: number;
}

export class CreateWalletNotificationDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subscribeTo?: string[];

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  receivingFrom?: string[];

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sendingTo?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minUsd?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxUsd?: number;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tokens?: string[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minTokenValue?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxTokenValue?: number;

  @ApiProperty({ type: String, isArray: true, enum: NetworkType })
  @IsArray()
  @IsEnum(NetworkType, { each: true })
  network: string[];
}

export class CreateTokenNotificationDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subscribeTo?: string[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minUsd?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxUsd?: number;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tokens?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  changePercent?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  changePercentDir?: string;

  @ApiProperty({ type: () => FilterDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  @IsOptional()
  tokenFilter?: Array<FilterDto>;

  @ApiProperty({ type: String, isArray: true, enum: NetworkType })
  @IsArray()
  @IsEnum(NetworkType, { each: true })
  network: string[];
}

export class CreateNftNotificationDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subscribeTo?: string[];

  @ApiProperty({ type: () => FilterDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  @IsOptional()
  nftDailyFloor?: Array<FilterDto>;

  @ApiProperty({ type: () => FilterDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  @IsOptional()
  nftDailyVolume?: Array<FilterDto>;

  @ApiProperty({ type: () => FilterDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  @IsOptional()
  nftDailySales?: Array<FilterDto>;

  @ApiProperty({ type: String, isArray: true, enum: NetworkType })
  @IsArray()
  @IsEnum(NetworkType, { each: true })
  network: string[];
}
