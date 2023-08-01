import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

import { FollowTokenDto } from './dto/follow.dto';
import { UserService } from '../user/user.service';
import { CommentTokenDto } from './dto/comment.dto';
import { CreateTokenDto } from './dto/create-token.dto';
import { FindOneParams } from './dto/find-one-params.dto';
import { CommentService } from '../comment/comment.service';
import { Token, TokenDocument } from './schemas/token.schema';
import { SuccessResponse } from '../utils/dtos/success-response';
import { EtherscanService } from 'src/etherscan/etherscan.service';
import { Transaction } from 'src/utils/types';
import { NetworkType } from 'src/utils/enums/network.enum';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<TokenDocument>,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly etherscanService: EtherscanService,
  ) {}

  async create(token: CreateTokenDto): Promise<Token> {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return this.tokenModel.findOneAndUpdate(token, token, options);
  }

  async getOrCreate(address: string, network: string) {
    let foundToken = await this.tokenModel.findOne({ address, network });
    if (!foundToken) {
      foundToken = await this.tokenModel.create({ address, network });
    }
    return foundToken;
  }

  async follow(followTokenDto: FollowTokenDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(followTokenDto.address);
    const foundToken = await this.getOrCreate(followTokenDto.tokenAddress, followTokenDto.network);
    if (!foundToken.followers.includes(foundUser.id)) {
      await foundToken.updateOne({
        $push: { followers: foundUser.id },
      });
      await foundUser.updateOne({
        $push: { followingTokens: foundToken.id },
      });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already follow this token');
    }
  }

  async cancelFollow(followTokenDto: FollowTokenDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(followTokenDto.address);
    const foundToken = await this.getOrCreate(followTokenDto.tokenAddress, followTokenDto.network);
    if (foundToken.followers.includes(foundUser.id)) {
      await foundToken.updateOne({ $pull: { followers: foundUser.id } });
      await foundUser.updateOne({ $pull: { followingTokens: foundToken.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException("You don't follow this token yet.");
    }
  }

  async like(likeDto: FollowTokenDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(likeDto.address);
    const foundToken = await this.getOrCreate(likeDto.tokenAddress, likeDto.network);
    if (foundToken.dislikes.includes(foundUser.id)) {
      throw new BadRequestException('You already dislike this token');
    }
    if (!foundToken.likes.includes(foundUser.id)) {
      await foundToken.updateOne({ $push: { likes: foundUser.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already like this token');
    }
  }

  async dislike(dislikeDto: FollowTokenDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(dislikeDto.address);
    const foundToken = await this.getOrCreate(dislikeDto.tokenAddress, dislikeDto.network);

    if (foundToken.likes.includes(foundUser.id)) {
      throw new BadRequestException('You already like this token');
    }
    if (!foundToken.dislikes.includes(foundUser.id)) {
      await foundToken.updateOne({ $push: { dislikes: foundUser.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already dislike this token');
    }
  }

  async get(dto: FindOneParams) {
    const foundToken = await this.tokenModel.findOne(dto);
    if (!foundToken) {
      throw new BadRequestException('Token not found!');
    }
    return foundToken;
  }

  async getAll() {
    return await this.tokenModel.find({});
  }

  async getFollowers(dto: FindOneParams) {
    const foundToken = await this.tokenModel.findOne(dto);
    if (!foundToken) {
      throw new BadRequestException('Token not found!');
    }
    return this.userService.getByIds(foundToken.followers);
  }

  async comment(commentTokenDto: CommentTokenDto) {
    const user = await this.userService.getByAddress(commentTokenDto.address);
    const foundToken = await this.getOrCreate(commentTokenDto.tokenAddress, commentTokenDto.tokenNetwork);
    try {
      const newComment = await this.commentService.postComment({
        userId: user.id,
        content: commentTokenDto.content,
      });
      await foundToken.updateOne({
        $push: { comments: newComment.id },
      });
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }

    return new SuccessResponse(true);
  }

  async getComments(query: FindOneParams) {
    const foundToken = await this.tokenModel
      .findOne(query)
      .populate({ path: 'comments', populate: { path: 'author', select: ['address'] } });

    if (!foundToken) {
      throw new BadRequestException('Token not found!');
    }
    return foundToken.comments;
  }

  async initializeTransactions(address: string, network: string, transactions: [Transaction]) {
    try {
      const foundToken = await this.tokenModel.findOne({ address, network });
      if (!foundToken) {
        throw new BadRequestException('Wallet not found!');
      }
      await foundToken.updateOne({
        $set: { transactions: transactions },
      });
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }
    return new SuccessResponse(true);
  }

  async updateTransactions(address: string, network: string, transactions: [Transaction]) {
    try {
      const foundToken = await this.tokenModel.findOne({ address, network });
      if (!foundToken) {
        throw new BadRequestException('Wallet not found!');
      }
      if (transactions.length > 0) {
        await foundToken.updateOne({
          $push: { transactions: { $each: transactions } },
        });
      }
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }
    return new SuccessResponse(true);
  }

  async setTransactionDetail(txhash: string, address: string, network: string) {
    try {
      const transactionDetails = await this.etherscanService.getTransactionDetail(txhash, address, network);
      const foundToken = await this.tokenModel.findOne({ address, network });
      if (!foundToken) {
        throw new BadRequestException('Wallet not found!');
      }
      await this.tokenModel.updateOne(
        { address: address, network: network, 'transactions.txhash': txhash },
        { $set: { 'transactions.$.details': transactionDetails } },
      );
      return new SuccessResponse(true);
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }
  }

  async findTransactions({ address, network }: FindOneParams) {
    const foundToken = await this.tokenModel.findOne({ address, network });
    if (!foundToken) {
      throw new BadRequestException('Wallet not found!');
    }
    return foundToken.transactions;
  }
}
