import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NFTTransaction } from 'src/utils/types';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true, versionKey: false })
export class Token {
  @ApiProperty({
    description: 'The address of the token',
  })
  @Prop({ required: true, trim: true, unique: true })
  address: string;

  @ApiProperty({ description: 'The network of the token' })
  @Prop({ required: true, trim: true, lowercase: true })
  network: string;

  @ApiProperty({ type: String, isArray: true })
  @Prop({ type: [String], default: [] })
  followers: string[];

  @ApiProperty({ type: String, isArray: true })
  @Prop({ type: [String], default: [] })
  followings: string[];

  @ApiProperty({ type: String, isArray: true })
  @Prop({ type: [String], default: [] })
  likes: string[];

  @ApiProperty({ type: String, isArray: true })
  @Prop({ type: [String], default: [] })
  dislikes: string[];

  @ApiProperty()
  @Prop({
    type: [Types.ObjectId],
    ref: 'Comment',
    default: [],
  })
  comments: any[];

  @Prop({
    type: Array<NFTTransaction>,
    default: [],
  })
  transactions: Array<NFTTransaction>;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
