import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Comment } from '../../comment/schema/comment.schema';
import { TokenTransaction, NFTTransaction } from 'src/utils/types';

export type WalletDocument = Wallet & Document;
type Transaction = TokenTransaction | NFTTransaction;

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
  followings: string[];

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
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
