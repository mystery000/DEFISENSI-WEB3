import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
class TokenDetails {
  @ApiProperty({ description: 'Token symbol' })
  @Prop({ type: String, default: '' })
  symbol: string;

  @ApiProperty({ description: 'Token address' })
  @Prop({ type: String, default: '' })
  address: string;

  @ApiProperty({ description: 'Token amount' })
  @Prop({ type: Number, default: 0 })
  amount: number;

  @ApiProperty({ description: 'Token decimal' })
  @Prop({ type: Number, default: 0 })
  decimal: number;

  @ApiProperty({ description: 'Token price' })
  @Prop({ type: Number, default: 0 })
  price: number;
}

@Schema()
class TransactionDetails {
  @ApiProperty({ description: 'Sender address' })
  @Prop({ type: String, default: '' })
  from: string;

  @ApiProperty({ description: 'Recipient address' })
  @Prop({ type: String, default: '' })
  to: string;

  @ApiProperty({ description: 'Transaction created time' })
  @Prop({ type: Number, default: 0 })
  created: number;

  @ApiProperty({ description: 'Transaction type' })
  @Prop({ type: String, default: 'Send' })
  type: string;

  @ApiProperty({ description: 'First token details' })
  @Prop({ type: TokenDetails })
  token0: TokenDetails;

  @ApiProperty({ description: 'Second token details (optional)' })
  @Prop({ type: TokenDetails })
  token1?: TokenDetails;
}

@Schema()
export class Transaction {
  @ApiProperty({ description: 'Transaction Hash' })
  @Prop({ type: String, default: '' })
  txhash: string;

  @ApiProperty({ description: 'The block number of the transaction' })
  @Prop({ type: Number, default: 0 })
  blockNumber: number;

  @ApiProperty({ description: 'Transaction details' })
  @Prop({ type: TransactionDetails })
  details: TransactionDetails;
}

export type TransactionDocument = Transaction & Document;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
