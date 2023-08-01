import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Nft } from '../../nft/schemas/nft.schema';
import { Token } from '../../token/schemas/token.schema';
import { Wallet } from '../../wallet/schemas/wallet.schema';
import { Notification } from '../../notification/schemas/notification.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @ApiProperty({ description: 'The wallet address of the user' })
  @Prop({ required: true, trim: true, unique: true })
  address: string;

  @ApiProperty({ description: 'The tg_id of user' })
  @Prop()
  tg_id: string;

  @ApiProperty({ description: 'The email of the user' })
  @Prop({ lowercase: true })
  email: string;

  @ApiProperty({ description: 'The following wallets of the user' })
  @Prop({
    type: [Types.ObjectId],
    ref: 'Wallet',
    default: [],
  })
  followingWallets: Wallet[];

  @ApiProperty({ description: 'The following tokens of the user' })
  @Prop({
    type: [Types.ObjectId],
    ref: 'Token',
    default: [],
  })
  followingTokens: Token[];

  @ApiProperty({ description: 'The following nfts of the user' })
  @Prop({
    type: [Types.ObjectId],
    ref: 'Nft',
    default: [],
  })
  followingNfts: Nft[];

  @ApiProperty({ description: 'The followers of this user' })
  @Prop({ type: [String], default: [] })
  followers: string[];

  @ApiProperty({ description: 'The following users of this user' })
  @Prop({ type: [String], default: [] })
  followings: string[];

  @ApiProperty({ description: 'The notifications of this user' })
  @Prop({
    type: [Types.ObjectId],
    ref: 'Notification',
    default: [],
  })
  notifications: Notification[];
}

export const UserSchema = SchemaFactory.createForClass(User);
