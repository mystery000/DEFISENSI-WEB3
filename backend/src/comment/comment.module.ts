import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Comment, CommentSchema } from './schema/comment.schema';
import { CommentService } from './comment.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }])],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
