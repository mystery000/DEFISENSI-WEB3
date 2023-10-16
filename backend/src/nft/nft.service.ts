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
import { NetworkType } from 'src/utils/enums/network.enum';
import { BscscanService } from 'src/bscscan/bscscan.service';
import { ArbitrumService } from 'src/arbitrum/arbitrum.service';
import { SuccessResponse } from '../utils/dtos/success-response';
import { EtherscanService } from 'src/etherscan/etherscan.service';
import { AvalancheService } from 'src/avalanche/avalanche.service';
import { PolygonscanService } from 'src/polygonscan/polygonscan.service';
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
    private readonly arbitrumService: ArbitrumService,
    private readonly avalancheService: AvalancheService,
  ) {}

  async create(nft: CreateNftDto): Promise<Nft> {
    let foundNFT = await this.nftModel.findOne({ address: nft.address, network: nft.network });
    if (!foundNFT) {
      let createdWallet = await this.nftModel.findOneAndUpdate(
        { address: nft.address }, // filter
        {}, // update (empty as you're only interested in finding or creating a document)
        {
          upsert: true, // will create a new document if none is found
          new: true, // will return the new document if one is created
          setDefaultsOnInsert: true, // will set default values defined in your schema
        },
      );
      return createdWallet;
    }
    return foundNFT;
  }

  async getOrCreate(address: string, network: string) {
    let foundNft = await this.nftModel.findOne({ address, network });
    if (!foundNft) {
      foundNft = await this.nftModel.create({ address, network });
    }
    return foundNft;
  }

  async follow(followNftDto: FollowNftDto): Promise<SuccessResponse> {
    const foundUser = await this.userService.getByAddress(followNftDto.address);
    const foundNft = await this.getOrCreate(followNftDto.nftAddress, followNftDto.network);

    if (!foundNft.followers.includes(foundUser.id)) {
      await foundNft.updateOne({ $push: { followers: foundUser.id } });
      await foundUser.updateOne({ $push: { followingNfts: foundNft.id } });

      try {
        const resp = await this.getTransactions(followNftDto.network, followNftDto.nftAddress);
        await this.setTransactions(followNftDto.nftAddress, followNftDto.network, resp.transactions);
      } catch (error) {
        logger.error(error);
      }
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

  async getTopNFTs(network: string) {
    switch (network) {
      case NetworkType.ETHEREUM:
        return this.etherscanService.getTopNFTs();
      case NetworkType.POLYGON:
        return this.polygonService.getTopNFTs();
      case NetworkType.BSC:
        return this.bscService.getTopNFTs();
      case NetworkType.ARBITRUM:
        return this.arbitrumService.getTopNFTs();
      case NetworkType.AVALANCHE:
        return this.avalancheService.getTopNFTs();
    }
  }

  async getTransactions(network: string, address: string, limit: Number = 4) {
    try {
      const foundToken = await this.nftModel.findOne({ address, network });

      const { _id, likes, dislikes, comments } = foundToken || { _id: '', likes: [], dislikes: [], comments: [] };

      switch (network) {
        case NetworkType.ETHEREUM:
          const ethereumTxns = await this.etherscanService.getTransactionsByNFT(address);
          return { transactions: ethereumTxns, _id, likes, dislikes, comments };
        case NetworkType.POLYGON:
          const polygonTxns = await this.polygonService.getTransactionsByNFT(address);
          return { transactions: polygonTxns, _id, likes, dislikes, comments };
        case NetworkType.BSC:
          const bscTxns = await this.bscService.getTransactionsByNFT(address);
          return { transactions: bscTxns, _id, likes, dislikes, comments };
        case NetworkType.ARBITRUM:
          const arbitrumTxns = await this.arbitrumService.getTransactionsByNFT(address);
          return { transactions: arbitrumTxns, _id, likes, dislikes, comments };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
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

      switch (network) {
        case NetworkType.ETHEREUM:
          const ethereumTxns = await this.etherscanService.getTransactionsByNFT(address);
          await this.setTransactions(address, network, ethereumTxns);
          break;
        case NetworkType.POLYGON:
          const polygonTxns = await this.polygonService.getTransactionsByNFT(address);
          await this.setTransactions(address, network, polygonTxns);
          break;
        case NetworkType.BSC:
          const bscTxns = await this.bscService.getTransactionsByNFT(address);
          await this.setTransactions(address, network, bscTxns);
          break;
        case NetworkType.ARBITRUM:
          const arbitrumTxns = await this.arbitrumService.getTransactionsByNFT(address);
          await this.setTransactions(address, network, arbitrumTxns);
          break;
      }
    } catch (err) {
      logger.error(err);
    }
  }

  async initializeTransactions(address: string, network: string) {
    try {
      switch (network) {
        case NetworkType.ETHEREUM:
          const ethereumTxns = await this.etherscanService.getTransactionsByNFT(address);
          await this.setTransactions(address, network, ethereumTxns);
          break;
        case NetworkType.POLYGON:
          const polygonTxns = await this.polygonService.getTransactionsByNFT(address);
          await this.setTransactions(address, network, polygonTxns);
          break;
        case NetworkType.BSC:
          const bscTxns = await this.bscService.getTransactionsByNFT(address);
          await this.setTransactions(address, network, bscTxns);
          break;
        case NetworkType.ARBITRUM:
          const arbitrumTxns = await this.arbitrumService.getTransactionsByNFT(address);
          await this.setTransactions(address, network, arbitrumTxns);
          break;
      }
    } catch (err) {
      logger.error(err);
    }
  }
}
