import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Comment } from '../../comment/schema/comment.schema';
import { ApiBalance, Balance, Transaction } from 'src/utils/types';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true, versionKey: false })
export class Wallet {
  @ApiProperty({
    description: 'The address of the wallet',
  })
  @Prop({ required: true, trim: true, unique: true })
  address: string;

  @Prop({ type: [String], default: [] })
  followers: string[];

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ type: [String], default: [] })
  dislikes: string[];

  @Prop({
    type: [Types.ObjectId],
    ref: Comment.name,
    default: [],
  })
  comments: any[];

  @Prop({
    type: Array<Transaction>,
    default: [],
  })
  transactions: Transaction[];

  @Prop({
    type: ApiBalance,
    default: { ethereum: [], polygon: [], binance: [] },
  })
  balance: Balance;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
