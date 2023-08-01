import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiTransaction, Transaction } from 'src/utils/types';

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

  @ApiProperty({ type: [ApiTransaction], isArray: true })
  @Prop({
    type: Array<Transaction>,
    default: [],
  })
  transactions: Array<Transaction>;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
