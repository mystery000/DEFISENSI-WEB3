import { Document, Types } from 'mongoose';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { NFTTransaction } from 'src/utils/types';

export type NftDocument = Nft & Document;

@Schema({ timestamps: true, versionKey: false })
export class Nft {
  @ApiProperty({
    description: 'The address of the nft',
  })
  @Prop({ required: true, trim: true, unique: true })
  address: string;

  @ApiProperty({ description: 'The network of the nft' })
  @Prop({ required: true, trim: true, lowercase: true })
  network: string;

  @ApiProperty({ description: 'The followers of this nft' })
  @Prop({ type: [String], default: [] })
  followers: string[];

  @ApiProperty({ type: String, isArray: true, description: 'The followings of this nft' })
  @Prop({ type: [String], default: [] })
  followings: string[];

  @ApiProperty({ description: 'The likes of this nft' })
  @Prop({ type: [String], default: [] })
  likes: string[];

  @ApiProperty({ description: 'The dislikes of this nft' })
  @Prop({ type: [String], default: [] })
  dislikes: string[];

  @ApiProperty()
  @Prop({
    type: [Types.ObjectId],
    ref: 'Comment',
    default: [],
  })
  comments: any[];

  @ApiProperty({ description: 'List of NFT transactions' })
  @Prop({
    type: Array<NFTTransaction>,
    default: [],
  })
  transactions: NFTTransaction[];
}

export const NftSchema = SchemaFactory.createForClass(Nft);
