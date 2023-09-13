import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import { logger } from 'src/utils/logger';
import { NFTTransaction } from 'src/utils/types';
import { FollowNftDto } from './dto/follow.dto';
import { CommentNftDto } from './dto/comment.dto';
import { UserService } from '../user/user.service';
import { CreateNftDto } from './dto/create-nft.dto';
import { Nft, NftDocument } from './schemas/nft.schema';
import { FindOneParams } from './dto/find-one-params.dto';
import { CommentService } from '../comment/comment.service';
import { SuccessResponse } from '../utils/dtos/success-response';
import { EtherscanService } from 'src/etherscan/etherscan.service';
import { NetworkType } from 'src/utils/enums/network.enum';
import { PolygonscanService } from 'src/polygonscan/polygonscan.service';
import { BscscanService } from 'src/bscscan/bscscan.service';

@Injectable()
export class NftService {
  constructor(
    @InjectModel(Nft.name)
    private readonly nftModel: Model<NftDocument>,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly etherscanService: EtherscanService,
    private readonly polygonService: PolygonscanService,
    private readonly bscService: BscscanService,
  ) {}

  async create(nft: CreateNftDto): Promise<Nft> {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const newToken = await this.nftModel.findOneAndUpdate(nft, nft, options);
    // Fetch latest 4 transactions when a new ERC20 token is created
    await this.initializeTransactions(newToken.address, newToken.network);
    return newToken;
  }

  async getOrCreate(address: string, network: string) {
    let foundNft = await this.nftModel.findOne({ address, network });
    if (!foundNft) {
      foundNft = await this.nftModel.create({ address, network });
      // Fetch latest 4 transactions when a new ERC20 token is created
      await this.initializeTransactions(address, network);
    }
    return foundNft;
  }

  async follow(followNftDto: FollowNftDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(followNftDto.address);
    const foundNft = await this.getOrCreate(followNftDto.nftAddress, followNftDto.network);

    if (!foundNft.followers.includes(foundUser.id)) {
      await foundNft.updateOne({ $push: { followers: foundUser.id } });
      await foundUser.updateOne({ $push: { followingNfts: foundNft.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already follow this nft');
    }
  }

  async cancelFollow(followNftDto: FollowNftDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(followNftDto.address);
    const foundNft = await this.getOrCreate(followNftDto.nftAddress, followNftDto.network);
    if (foundNft.followers.includes(foundUser.id)) {
      await foundNft.updateOne({ $pull: { followers: foundUser.id } });
      await foundUser.updateOne({ $pull: { followingNfts: foundNft.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException("You don't follow this nft yet.");
    }
  }

  async like(likeDto: FollowNftDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(likeDto.address);
    const foundNft = await this.getOrCreate(likeDto.nftAddress, likeDto.network);
    if (foundNft.dislikes.includes(foundUser.id)) {
      throw new BadRequestException('You already dislike this nft');
    }
    if (!foundNft.likes.includes(foundUser.id)) {
      await foundNft.updateOne({ $push: { likes: foundUser.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already like this token');
    }
  }

  async dislike(dislikeDto: FollowNftDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(dislikeDto.address);
    const foundNft = await this.getOrCreate(dislikeDto.nftAddress, dislikeDto.network);
    if (foundNft.likes.includes(foundUser.id)) {
      throw new BadRequestException('You already like this nft');
    }
    if (!foundNft.dislikes.includes(foundUser.id)) {
      await foundNft.updateOne({ $push: { dislikes: foundUser.id } });
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already dislike this token');
    }
  }

  async get(dto: FindOneParams) {
    const foundNft = await this.nftModel.findOne(dto);
    if (!foundNft) {
      throw new BadRequestException('Nft not found!');
    }
    return foundNft;
  }

  async getAll() {
    return await this.nftModel.find({});
  }

  async getFollowers(dto: FindOneParams) {
    const foundNft = await this.nftModel.findOne(dto);
    if (!foundNft) {
      throw new BadRequestException('Nft not found!');
    }
    return this.userService.getByIds(foundNft.followers);
  }

  async getFollowings(dto: FindOneParams) {
    const foundToken = await this.nftModel.findOne(dto);
    if (!foundToken) {
      throw new BadRequestException('Token not found!');
    }
    return this.userService.getByIds(foundToken.followings);
  }

  async comment(commentNftDto: CommentNftDto) {
    const user = await this.userService.getByAddress(commentNftDto.address);
    const foundNft = await this.getOrCreate(commentNftDto.nftAddress, commentNftDto.nftNetwork);
    try {
      const newComment = await this.commentService.postComment({
        userId: user.id,
        content: commentNftDto.content,
      });
      await foundNft.updateOne({
        $push: { comments: newComment.id },
      });
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }

    return new SuccessResponse(true);
  }

  async getComments(query: FindOneParams) {
    const foundNft = await this.nftModel
      .findOne(query)
      .populate({ path: 'comments', populate: { path: 'author', select: ['address'] } });

    if (!foundNft) {
      throw new BadRequestException('Nft not found!');
    }
    return foundNft.comments;
  }

  async getTopNFTs() {
    return this.etherscanService.getTopNFTs();
  }

  async getTransactions(network: string, address: string, limit: Number = 4) {
    try {
      const foundToken = await this.nftModel.aggregate([
        { $match: { address: address, network } },
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
          $limit: Number(limit),
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

      if (!foundToken || foundToken.length === 0) {
        // throw new BadRequestException('Transactions not found!');
        logger.error('Transactions not found');
        return [];
      }

      return foundToken[0];
    } catch (err) {
      logger.error(err);
      return [];
    }
  }

  async setTransactions(address: string, network: string, transactions: NFTTransaction[]) {
    try {
      const foundToken = await this.nftModel.findOne({ address, network });
      if (!foundToken) {
        throw new BadRequestException('NFT not found!');
      }
      await foundToken.updateOne({
        $push: { transactions: { $each: transactions } },
      });
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }
    return new SuccessResponse(true);
  }

  async updateTransactions(address: string, network: string) {
    if (!Object.values(NetworkType).includes(network as NetworkType)) return;
    try {
      // Get the latest block number
      let latestBlockNumber = 0;
      const token = await this.nftModel.findOne({ address: address, network: network });
      if (token && token.transactions && token.transactions.length > 0)
        latestBlockNumber = Number(token.transactions.at(-1).blockNumber);

      if (network === NetworkType.ETHEREUM) {
        const txs = await this.etherscanService.getTransactionsByNFT(address, latestBlockNumber + 1);
        await this.setTransactions(address, network, txs);
      } else if (network === NetworkType.POLYGON) {
        const txs = await this.polygonService.getTransactionsByNFT(address, latestBlockNumber + 1);
        await this.setTransactions(address, network, txs);
      } else if (network === NetworkType.BSC) {
        const txs = await this.bscService.getTransactionsByNFT(address, latestBlockNumber + 1);
        await this.setTransactions(address, network, txs);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  async initializeTransactions(address: string, network: string) {
    try {
      if (network === NetworkType.ETHEREUM) {
        const txs = await this.etherscanService.getTransactionsByNFT(address);
        await this.setTransactions(address, network, txs);
      } else if (network === NetworkType.POLYGON) {
        const txs = await this.polygonService.getTransactionsByNFT(address);
        await this.setTransactions(address, network, txs);
      } else if (network === NetworkType.BSC) {
        const txs = await this.bscService.getTransactionsByNFT(address);
        await this.setTransactions(address, network, txs);
      }
    } catch (err) {
      logger.error(err);
    }
  }
}
