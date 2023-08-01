import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentDocument = Comment & Document;

@Schema()
export class Comment {
  @ApiProperty({ description: 'The author of this comment' })
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  author: any;

  @ApiProperty({ description: 'The content' })
  @Prop()
  content: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
