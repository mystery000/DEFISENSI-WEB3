import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsString, ValidateNested, maxLength } from 'class-validator';

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
  description: string;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  subscribeTo: string[];

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  receivingFrom: string[];

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  sendingTo: string;

  @ApiProperty()
  @IsNumber()
  minUsd: number;

  @ApiProperty()
  @IsNumber()
  maxUsd: number;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  tokens: string[];

  @ApiProperty()
  @IsNumber()
  minTokenValue: number;

  @ApiProperty()
  @IsNumber()
  maxTokenValue: number;

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
  description: string;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  subscribeTo: string[];

  @ApiProperty()
  @IsNumber()
  minUsd: number;

  @ApiProperty()
  @IsNumber()
  maxUsd: number;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  tokens: string[];

  @ApiProperty()
  @IsString()
  changePercent: string;

  @ApiProperty()
  @IsString()
  changePercentDir: string;

  @ApiProperty({ type: () => FilterDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  tokenFilter: Array<FilterDto>;

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
  description: string;

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  subscribeTo: string[];

  @ApiProperty({ type: () => FilterDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  nftDailyFloor: Array<FilterDto>;

  @ApiProperty({ type: () => FilterDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  nftDailyVolume: Array<FilterDto>;

  @ApiProperty({ type: () => FilterDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  nftDailySales: Array<FilterDto>;

  @ApiProperty({ type: String, isArray: true, enum: NetworkType })
  @IsArray()
  @IsEnum(NetworkType, { each: true })
  network: string[];
}
