import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './schema/comment.schema';

@Injectable()
export class CommentService {
  constructor(@InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>) {}

  async postComment(comment: CreateCommentDto) {
    try {
      let newComment = new this.commentModel(comment);
      newComment.author = comment.userId;
      newComment = await newComment.save();
      return newComment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteComment(commentId: string, address: string) {
    try {
      const deletedComment = await this.commentModel.findOneAndDelete({
        _id: commentId,
        author: address,
      });
      return deletedComment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteCommentsByIds(commentIds: any[]) {
    try {
      await this.commentModel.deleteMany().where('_id').in(commentIds).exec();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
