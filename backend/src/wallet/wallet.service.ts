import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, forwardRef, Inject } from '@nestjs/common';

import { FollowWalletDto } from './dto/follow.dto';
import { UserService } from '../user/user.service';
import { CommentWalletDto } from './dto/comment.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CommentService } from '../comment/comment.service';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { SuccessResponse } from '../utils/dtos/success-response';
import { EtherscanService } from 'src/etherscan/etherscan.service';
import { Transaction } from 'src/utils/types';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    @Inject(forwardRef(() => EtherscanService))
    private readonly etherscanService: EtherscanService,
  ) {}

  async create(wallet: CreateWalletDto): Promise<Wallet> {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return this.walletModel.findOneAndUpdate({ address: wallet.address }, { address: wallet.address }, options);
  }

  async getOrCreate(address: string) {
    let foundWallet = await this.walletModel.findOne({ address });
    if (!foundWallet) {
      foundWallet = await this.walletModel.create({ address });
    }
    return foundWallet;
  }

  async follow(followWalletDto: FollowWalletDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(followWalletDto.address);
    const foundWallet = await this.getOrCreate(followWalletDto.walletAddress);

    if (!foundWallet.followers.includes(foundUser.id)) {
      await foundWallet.updateOne({ $push: { followers: foundUser.id } });
      await foundUser.updateOne({ $push: { followingWallets: foundWallet.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already follow this wallet');
    }
  }

  async cancelfollow(followWalletDto: FollowWalletDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(followWalletDto.address);
    const foundWallet = await this.getOrCreate(followWalletDto.walletAddress);
    if (foundWallet.followers.includes(foundUser.id)) {
      await foundWallet.updateOne({ $pull: { followers: foundUser.id } });
      await foundUser.updateOne({ $pull: { followsWallets: foundWallet.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException("You don't follow this wallet yet.");
    }
  }

  async like(likeDto: FollowWalletDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(likeDto.address);
    const foundWallet = await this.getOrCreate(likeDto.walletAddress);

    if (foundWallet.dislikes.includes(foundUser.id)) {
      throw new BadRequestException('You already dislike this wallet');
    }

    if (!foundWallet.likes.includes(foundUser.id)) {
      await foundWallet.updateOne({ $push: { likes: foundUser.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already like this wallet');
    }
  }

  async dislike(dislikeDto: FollowWalletDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(dislikeDto.address);
    const foundWallet = await this.getOrCreate(dislikeDto.walletAddress);

    if (foundWallet.likes.includes(foundUser.id)) {
      throw new BadRequestException('You already like this wallet');
    }

    if (!foundWallet.dislikes.includes(foundUser.id)) {
      await foundWallet.updateOne({ $push: { dislikes: foundUser.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already dislike this wallet');
    }
  }

  async get(address: string) {
    const foundWallet = await this.walletModel.findOne({ address });
    if (!foundWallet) {
      throw new BadRequestException('Wallet not found!');
    }
    return foundWallet;
  }

  async getAll() {
    return await this.walletModel.find({});
  }

  async getFollowers(address: string) {
    const foundWallet = await this.walletModel.findOne({ address });

    if (!foundWallet) {
      throw new BadRequestException('Wallet not found!');
    }

    return this.userService.getByIds(foundWallet.followers);
  }

  async comment(commentWalletDto: CommentWalletDto) {
    const user = await this.userService.getByAddress(commentWalletDto.address);
    const foundWallet = await this.getOrCreate(commentWalletDto.walletAddress);
    try {
      const newComment = await this.commentService.postComment({
        userId: user.id,
        content: commentWalletDto.content,
      });
      await foundWallet.updateOne({
        $push: { comments: newComment.id },
      });
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }

    return new SuccessResponse(true);
  }

  async getComments(address: string) {
    const foundWallet = await this.walletModel
      .findOne({ address })
      .populate({ path: 'comments', populate: { path: 'author', select: ['address'] } });

    if (!foundWallet) {
      throw new BadRequestException('Wallet not found!');
    }
    return foundWallet.comments;
  }

  async initializeTransactions(address: string, transactions: [Transaction]) {
    try {
      const foundWallet = await this.walletModel.findOne({ address });
      if (!foundWallet) {
        throw new BadRequestException('Wallet not found!');
      }
      await foundWallet.updateOne({
        $set: { transactions: transactions },
      });
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }
    return new SuccessResponse(true);
  }

  async updateTransactions(address: string, transactions: [Transaction]) {
    try {
      const foundWallet = await this.walletModel.findOne({ address });
      if (!foundWallet) {
        throw new BadRequestException('Wallet not found!');
      }
      if (transactions.length > 0) {
        await foundWallet.updateOne({
          $push: { transactions: { $each: transactions } },
        });
      }
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }
    return new SuccessResponse(true);
  }

  async findTransactions(address: string) {
    const foundWallet = await this.walletModel.aggregate([
      { $match: { address: address } },
      {
        $unwind: '$transactions',
      },
      {
        $match: { 'transactions.details': { $ne: null } },
      },
      {
        $sort: { 'transactions.blockNumber': -1 },
      },
      {
        $limit: 4,
      },
      {
        $group: {
          _id: '$_id',
          likes: { $first: '$likes' },
          dislikes: { $first: '$dislikes' },
          comments: { $first: '$comments' },
          transactions: { $push: '$transactions' },
        },
      },
    ]);

    if (!foundWallet || foundWallet.length === 0) {
      throw new BadRequestException('Transactions not found!');
    }

    return foundWallet[0];
  }

  async setTransactionDetail(txhash: string, address: string) {
    try {
      const transactionDetails = await this.etherscanService.getTransactionDetail(txhash, address);
      const foundWallet = await this.walletModel.findOne({ address });
      if (!foundWallet) {
        throw new BadRequestException('Wallet not found!');
      }
      await this.walletModel.updateOne(
        { address: address, 'transactions.txhash': txhash },
        { $set: { 'transactions.$.details': transactionDetails } },
      );
      return new SuccessResponse(true);
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }
  }
}
