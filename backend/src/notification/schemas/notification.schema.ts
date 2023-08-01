import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { NetworkType } from '../../utils/enums/network.enum';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, versionKey: false })
export class Notification {
  @ApiProperty({ description: 'The type of alert : Wallet, Token, NFT' })
  @Prop({ type: String })
  type: string;

  @ApiProperty({ description: 'The status of this notification' })
  @Prop({ type: Boolean })
  status: boolean;

  @ApiProperty({ description: 'Notification Name' })
  @Prop({ type: String })
  name: string;

  @ApiProperty({ description: 'Notification description' })
  @Prop({ type: String })
  description: string;

  @ApiProperty({ description: 'Whose alerts do you want to see' })
  @Prop({ type: [String] })
  subscribeTo: string[];

  @ApiProperty({ description: 'Receiving from?' })
  @Prop({ type: [String] })
  receivingFrom: string[];

  @ApiProperty({ description: 'Sending to' })
  @Prop({ type: [String] })
  sendingTo: string;

  @ApiProperty()
  @Prop({ type: Number })
  minUsd: number;

  @ApiProperty()
  @Prop({ type: Number })
  maxUsd: number;

  @ApiProperty()
  @Prop({ type: [String] })
  tokens: string;

  @ApiProperty()
  @Prop({ type: Number })
  minTokenValue: number;

  @ApiProperty()
  @Prop({ type: Number })
  maxTokenValue: number;

  @ApiProperty()
  @Prop({ type: String })
  changePercent: string;

  @ApiProperty()
  @Prop({ type: String })
  changePercentDir: string;

  @ApiProperty({ type: [{ dir: String, value: Number }], isArray: true })
  @Prop({ type: [{ dir: String, value: Number }], default: [] })
  tokenFilter: Array<{ dir: String; value: Number }>;

  @ApiProperty({ type: [{ dir: String, value: Number }], isArray: true })
  @Prop({ type: [{ dir: String, value: Number }], default: [] })
  nftDailyFloor: Array<{ dir: String; value: Number }>;

  @ApiProperty({ type: [{ dir: String, value: Number }], isArray: true })
  @Prop({ type: [{ dir: String, value: Number }], default: [] })
  nftDailyVolume: Array<{ dir: String; value: Number }>;

  @ApiProperty({ type: [{ dir: String, value: Number }], isArray: true })
  @Prop({ type: [{ dir: String, value: Number }], default: [] })
  nftDailySales: Array<{ dir: String; value: Number }>;

  @ApiProperty({ type: String, isArray: true, enum: NetworkType })
  @Prop({
    type: [String],
    enum: NetworkType,
  })
  network: NetworkType[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
