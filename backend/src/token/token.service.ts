import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import { TokenTransaction } from 'src/utils/types';
import { FollowTokenDto } from './dto/follow.dto';
import { UserService } from '../user/user.service';
import { CommentTokenDto } from './dto/comment.dto';
import { CreateTokenDto } from './dto/create-token.dto';
import { FindOneParams } from './dto/find-one-params.dto';
import { CommentService } from '../comment/comment.service';
import { Token, TokenDocument } from './schemas/token.schema';
import { SuccessResponse } from '../utils/dtos/success-response';
import { EtherscanService } from 'src/etherscan/etherscan.service';
import { logger } from 'src/utils/logger';
import { NetworkType } from 'src/utils/enums/network.enum';
import { PolygonscanService } from 'src/polygonscan/polygonscan.service';
import { BscscanService } from 'src/bscscan/bscscan.service';
import { ArbitrumService } from 'src/arbitrum/arbitrum.service';
import axios from 'axios';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<TokenDocument>,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly polygonService: PolygonscanService,
    private readonly etherscanService: EtherscanService,
    private readonly bscService: BscscanService,
    private readonly arbitrumService: ArbitrumService,
  ) {}

  async create(token: CreateTokenDto): Promise<Token> {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const newToken = await this.tokenModel.findOneAndUpdate(token, token, options);
    // Fetch latest 4 transactions when a new ERC20 token is created
    await this.initializeTransactions(token.address, token.network);
    return newToken;
  }

  async getOrCreate(address: string, network: string) {
    let foundToken = await this.tokenModel.findOne({ address, network });
    if (!foundToken) {
      foundToken = await this.tokenModel.create({ address, network });
      // Fetch latest 4 transactions when a new ERC20 token is created
      await this.initializeTransactions(address, network);
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
      // throw new BadRequestException('Token not found!');
      return [];
    }
    return this.userService.getByIds(foundToken.followers);
  }

  async getFollowings(dto: FindOneParams) {
    const foundToken = await this.tokenModel.findOne(dto);
    if (!foundToken) {
      // throw new BadRequestException('Token not found!');
      return [];
    }
    return this.userService.getByIds(foundToken.followings);
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

  async setTransactions(address: string, network: string, transactions: TokenTransaction[]) {
    try {
      const foundToken = await this.tokenModel.findOne({ address: address, network });
      if (!foundToken) {
        throw new BadRequestException('Wallet not found!');
      }
      await foundToken.updateOne({
        $push: { transactions: { $each: transactions } },
      });
    } catch (error) {
      return new SuccessResponse(false, error.message);
    }
    return new SuccessResponse(true);
  }

  async getTransactions(network: string, address: string, limit: Number = 4) {
    try {
      const foundToken = await this.tokenModel.findOne({ address, network });

      const { _id, likes, dislikes, comments } = foundToken || { _id: '', likes: [], dislikes: [], comments: [] };

      switch (network) {
        case NetworkType.ETHEREUM:
          const ethereumTxns = await this.etherscanService.getTransactionsByContract(address);
          return { transactions: ethereumTxns, _id, likes, dislikes, comments };
        case NetworkType.POLYGON:
          const polygonTxns = await this.polygonService.getTransactionsByContract(address);
          return { transactions: polygonTxns, _id, likes, dislikes, comments };
        case NetworkType.BSC:
          const bscTxns = await this.bscService.getTransactionsByContract(address);
          return { transactions: bscTxns, _id, likes, dislikes, comments };
        case NetworkType.ARBITRUM:
          const arbitrumTxns = await this.arbitrumService.getTransactionsByContract(address);
          return { transactions: arbitrumTxns, _id, likes, dislikes, comments };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateTransactions(address: string, network: string) {
    if (!Object.values(NetworkType).includes(network as NetworkType)) return;
    try {
      let latestBlockNumber = 0;
      const token = await this.tokenModel.findOne({ address, network });
      if (token && token.transactions && token.transactions.length > 0)
        latestBlockNumber = Number(token.transactions.at(-1).blockNumber);
      switch (network) {
        case NetworkType.ETHEREUM:
          const ethereumTxns = await this.etherscanService.getTransactionsByContract(address);
          await this.setTransactions(address, network, ethereumTxns);
          break;
        case NetworkType.POLYGON:
          const polygonTxns = await this.polygonService.getTransactionsByContract(address);
          await this.setTransactions(address, network, polygonTxns);
          break;
        case NetworkType.BSC:
          const bscTxns = await this.bscService.getTransactionsByContract(address);
          await this.setTransactions(address, network, bscTxns);
          break;
        case NetworkType.ARBITRUM:
          const arbitrumTxns = await this.arbitrumService.getTransactionsByContract(address);
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
          const ethereumTxns = await this.etherscanService.getTransactionsByContract(address);
          await this.setTransactions(address, network, ethereumTxns);
          break;
        case NetworkType.POLYGON:
          const polygonTxns = await this.polygonService.getTransactionsByContract(address);
          await this.setTransactions(address, network, polygonTxns);
          break;
        case NetworkType.BSC:
          const bscTxns = await this.bscService.getTransactionsByContract(address);
          await this.setTransactions(address, network, bscTxns);
          break;
        case NetworkType.ARBITRUM:
          const arbitrumTxns = await this.arbitrumService.getTransactionsByContract(address);
          await this.setTransactions(address, network, arbitrumTxns);
          break;
      }
    } catch (err) {
      logger.error(err);
    }
  }

  async getPriceHistory(network: string, address: string) {
    switch (network) {
      case NetworkType.ETHEREUM:
        return this.etherscanService.getPriceHistory(address);
      case NetworkType.POLYGON:
        return this.polygonService.getPriceHistory(address);
      case NetworkType.BSC:
        return this.bscService.getPriceHistory(address);
      case NetworkType.ARBITRUM:
        return this.arbitrumService.getPriceHistory(address);
    }
    return null;
  }

  async getTokenPriceFromExchanges(network: string, address: string) {
    switch (network) {
      case NetworkType.ETHEREUM:
        return this.etherscanService.getPriceFromExchanges(address);
      case NetworkType.POLYGON:
        return this.polygonService.getPriceFromExchanges(address);
      case NetworkType.BSC:
        return this.bscService.getPriceFromExchanges(address);
      case NetworkType.ARBITRUM:
        break;
    }
    return null;
  }

  async getTopERC20Tokens(network: string, order: string) {
    switch (network) {
      case NetworkType.ETHEREUM:
        return this.etherscanService.getTopERC20Tokens(order);
      case NetworkType.POLYGON:
        return this.polygonService.getTopERC20Tokens(order);
      case NetworkType.BSC:
        return this.bscService.getTopERC20Tokens(order);
      case NetworkType.ARBITRUM:
        return this.arbitrumService.getTopERC20Tokens(order);
    }
  }

  async getTokenAddress(network: string, id: string) {
    if (!network || !id) {
      throw new BadRequestException('network and id are required');
    }
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
      );
      switch (network) {
        case NetworkType.ETHEREUM:
          return response.data.platforms['ethereum'];
        case NetworkType.POLYGON:
          return response.data.platforms['polygon-pos'];
        case NetworkType.BSC:
          return response.data.platforms['binance-smart-chain'];
        case NetworkType.ARBITRUM:
          return response.data.platforms['arbitrum-one'];
      }
    } catch (error) {
      logger.error(error);
    }
  }
}
