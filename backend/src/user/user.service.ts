import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

import { logger } from '../utils/logger';
import { Nft } from '../nft/schemas/nft.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Token } from '../token/schemas/token.schema';
import { Wallet } from '../wallet/schemas/wallet.schema';
import { User, UserDocument } from './schemas/user.schema';
import { SuccessResponse } from '../utils/dtos/success-response';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(user: CreateUserDto): Promise<User> {
    const alreadyExists = await this.userModel.exists({ address: user.address }).lean();
    if (alreadyExists) {
      logger.error(`User already exists #${user.address}`);
      throw new ConflictException(`User already exists`);
    }

    return this.userModel.create(user);
  }

  async update(address: string, userUpdates: UpdateUserDto): Promise<User> {
    let user = await this.userModel.findOne({ address });
    if (!user) {
      logger.error(`User not found #${address}`);
      throw new BadRequestException(`User not found!`);
    }
    user.email = userUpdates.email;
    user.tg_id = userUpdates.tg_id;
    await user.save();
    return user;
  }

  async getFollowingWallets(address: string): Promise<Wallet[]> {
    const user = await this.userModel.findOne({ address }).populate('followingWallets', ['address', 'followers']);
    if (!user) {
      logger.error(`User not found #${address}`);
      throw new BadRequestException(`User not found!`);
    }
    return user.followingWallets;
  }

  async getFollowingWalletsTransactions(address: string, limit: number) {
    const result = await this.userModel.aggregate([
      { $match: { address } },
      {
        $lookup: {
          from: 'wallets', // this should be the actual name of your Wallet collection
          localField: 'followingWallets',
          foreignField: '_id',
          as: 'followingWalletsData',
        },
      },
      { $unwind: '$followingWalletsData' },
      { $unwind: '$followingWalletsData.transactions' },
      { $match: { 'followingWalletsData.transactions.details': { $ne: null } } },
      { $sort: { 'followingWalletsData.transactions.blockNumber': -1 } },
      { $limit: Number(limit) },
      {
        $group: {
          _id: '$followingWalletsData._id',
          address: { $first: '$followingWalletsData.address' },
          comments: { $first: '$followingWalletsData.comments' },
          likes: { $first: '$followingWalletsData.likes' },
          dislikes: { $first: '$followingWalletsData.dislikes' },
          transactions: { $push: '$followingWalletsData.transactions' },
        },
      },
    ]);

    if (!result || result.length === 0) {
      throw new BadRequestException('Transactions not found!');
    }
    return result;
  }

  async getFollowingTokens(address: string): Promise<Token[]> {
    const user = await this.userModel
      .findOne({ address })
      .populate('followingTokens', ['address', 'network', 'followers']);
    if (!user) {
      logger.error(`User not found #${address}`);
      throw new BadRequestException(`User not found!`);
    }
    return user.followingTokens;
  }

  async getFollowingTokensTransactions(address: string, limit: number) {
    const result = await this.userModel.aggregate([
      { $match: { address } },
      {
        $lookup: {
          from: 'tokens', // this should be the actual name of your Token collection
          localField: 'followingTokens',
          foreignField: '_id',
          as: 'followingTokensData',
        },
      },
      { $unwind: '$followingTokensData' },
      { $unwind: '$followingTokensData.transactions' },
      { $match: { 'followingTokensData.transactions.details': { $ne: null } } },
      { $sort: { 'followingTokensData.transactions.blockNumber': -1 } },
      { $limit: Number(limit) },
      {
        $group: {
          _id: '$followingTokensData._id',
          address: { $first: '$followingTokensData.address' },
          comments: { $first: '$followingTokensData.comments' },
          likes: { $first: '$followingTokensData.likes' },
          dislikes: { $first: '$followingTokensData.dislikes' },
          transactions: { $push: '$followingTokensData.transactions' },
        },
      },
    ]);

    if (!result || result.length === 0) {
      throw new BadRequestException('Transactions not found!');
    }

    return result;
  }

  async getFollowingNfts(address: string): Promise<Nft[]> {
    const user = await this.userModel
      .findOne({ address })
      .populate('followingNfts', ['address', 'network', 'followers']);
    if (!user) {
      logger.error(`User not found #${address}`);
      throw new BadRequestException(`User not found!`);
    }
    return user.followingNfts;
  }

  async getFollowing(address: string): Promise<User> {
    const user = await this.userModel
      .findOne({ address })
      .populate('followingWallets', ['address', 'followers'])
      .populate('followingTokens', ['address', 'network', 'followers'])
      .populate('followingNfts', ['address', 'network', 'followers']);
    if (!user) {
      logger.error(`User not found #${address}`);
      throw new BadRequestException(`User not found!`);
    }
    return user;
  }

  async getByAddress(address: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ address });
    if (!user) {
      logger.error(`User not found #${address}`);
      throw new BadRequestException(`User not found!`);
    }
    return user;
  }

  async getById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      logger.error(`User not found #${id}`);
      throw new BadRequestException(`User not found!`);
    }
    return user;
  }

  async getByIds(ids: string[]): Promise<User[]> {
    return await this.userModel.find().where('_id').in(ids).select(['address', 'email']);
  }

  async follow(address: string, userToFollowAddress: string) {
    try {
      const user = await this.getByAddress(address);
      const userToFollow = await this.getByAddress(userToFollowAddress);
      if (!userToFollow) {
        throw new BadRequestException(`Follower not found!`);
      }
      if (userToFollow.followers.includes(user.id)) {
        throw new BadRequestException(`You already follow this user`);
      }
      await userToFollow.updateOne({ $push: { followers: user.id } });
      await user.updateOne({ $push: { followings: userToFollow.id } });

      return new SuccessResponse(true);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async unfollowUser(address: string, userToUnfollowAddress: string) {
    try {
      const user = await this.getByAddress(address);
      const userToUnfollow = await this.getByAddress(userToUnfollowAddress);

      if (!userToUnfollow.followers.includes(user.id)) {
        throw new BadRequestException(`You don\'t follow this user`);
      }
      await userToUnfollow.updateOne({ $pull: { followers: user.id } });
      await user.updateOne({ $pull: { followings: userToUnfollow.id } });
      return new SuccessResponse(true);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getFollowers(address: string) {
    try {
      const user = await this.getByAddress(address);
      const followers = await this.getByIds(user.followers);
      return followers;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getFollowings(address: string) {
    try {
      const user = await this.getByAddress(address);
      const followings = await this.getByIds(user.followings);
      return followings;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getNotifications(address: string) {
    const user = await this.userModel.findOne({ address }).populate('notifications');
    return user.notifications;
  }

  async login(address: string) {
    const user = await this.userModel.findOne({ address });

    if (!user) {
      const newUser = await this.userModel.create({ address });
      return newUser;
    }
    return user;
  }
}
