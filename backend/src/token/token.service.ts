import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import { ZenRows } from 'zenrows';
import { logger } from 'src/utils/logger';
import { FollowTokenDto } from './dto/follow.dto';
import { UserService } from '../user/user.service';
import { TokenTransaction } from 'src/utils/types';
import { CommentTokenDto } from './dto/comment.dto';
import { CreateTokenDto } from './dto/create-token.dto';
import { FindOneParams } from './dto/find-one-params.dto';
import { NetworkType } from 'src/utils/enums/network.enum';
import { CommentService } from '../comment/comment.service';
import { BscscanService } from 'src/bscscan/bscscan.service';
import { Token, TokenDocument } from './schemas/token.schema';
import { ArbitrumService } from 'src/arbitrum/arbitrum.service';
import { SuccessResponse } from '../utils/dtos/success-response';
import { EtherscanService } from 'src/etherscan/etherscan.service';
import { AvalancheService } from 'src/avalanche/avalanche.service';
import { PolygonscanService } from 'src/polygonscan/polygonscan.service';
import { FeedbackTransactionDto } from './dto/feedback-transaction.dto';
import { CommentTransactionDto } from './dto/comment-transaction.dto';

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
    private readonly avalancheService: AvalancheService,
  ) {}

  async create(token: CreateTokenDto): Promise<Token> {
    let foundToken = await this.tokenModel.findOne({ address: token.address, network: token.network });
    if (!foundToken) {
      let createdWallet = await this.tokenModel.findOneAndUpdate(
        { address: token.address }, // filter
        {}, // update (empty as you're only interested in finding or creating a document)
        {
          upsert: true, // will create a new document if none is found
          new: true, // will return the new document if one is created
          setDefaultsOnInsert: true, // will set default values defined in your schema
        },
      );
      return createdWallet;
    }
    return foundToken;
  }

  async getOrCreate(address: string, network: string) {
    let foundToken = await this.tokenModel.findOne({ address, network });
    if (!foundToken) {
      foundToken = await this.tokenModel.create({ address, network });
    }
    return foundToken;
  }

  async follow(followTokenDto: FollowTokenDto): Promise<SuccessResponse> {
    const { address, network, tokenAddress, transactions } = followTokenDto;
    const foundUser = await this.userService.getByAddress(address);
    const foundToken = await this.getOrCreate(tokenAddress, network);
    if (!foundToken.followers.includes(foundUser.id)) {
      await foundToken.updateOne({
        $push: { followers: foundUser.id },
      });
      await foundUser.updateOne({
        $push: { followingTokens: foundToken.id },
      });
      await this.setTransactions(tokenAddress, network, transactions);
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

  async like(likeDto: FeedbackTransactionDto): Promise<SuccessResponse> {
    // Retrieve the token document containing the transaction
    const token = await this.tokenModel.findOne({ 'transactions.id': likeDto.transactionId });
    if (!token) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = token.transactions.find((t) => t.id === likeDto.transactionId);

    if (transaction.likes.includes(likeDto.address)) {
      throw new BadRequestException('You already like this transaction');
    }
    if (transaction.dislikes.includes(likeDto.address)) {
      throw new BadRequestException('You already dislike this transaction');
    }

    if (!transaction.likes.includes(likeDto.address)) {
      transaction.likes.push(likeDto.address);
      await this.tokenModel.updateOne(
        { 'transactions.id': likeDto.transactionId },
        { $set: { 'transactions.$.likes': transaction.likes } },
      );
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already like this token');
    }
  }

  async dislike(dislikeDto: FeedbackTransactionDto): Promise<SuccessResponse> {
    // Retrieve the token document containing the transaction
    const token = await this.tokenModel.findOne({ 'transactions.id': dislikeDto.transactionId });
    if (!token) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = token.transactions.find((t) => t.id === dislikeDto.transactionId);

    if (transaction.dislikes.includes(dislikeDto.address)) {
      throw new BadRequestException('You already dislike this transaction');
    }

    if (transaction.likes.includes(dislikeDto.address)) {
      throw new BadRequestException('You already like this transaction');
    }

    if (!transaction.dislikes.includes(dislikeDto.address)) {
      transaction.dislikes.push(dislikeDto.address);
      await this.tokenModel.updateOne(
        { 'transactions.id': dislikeDto.transactionId },
        { $set: { 'transactions.$.disdlikes': transaction.dislikes } },
      );
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

  async getFollowings(dto: FindOneParams) {
    const foundToken = await this.tokenModel.findOne(dto);
    if (!foundToken) {
      // throw new BadRequestException('Token not found!');
      return [];
    }
    return this.userService.getByIds(foundToken.followings);
  }

  async comment(commentTransactionDto: CommentTransactionDto) {
    const { transactionId, address, content } = commentTransactionDto;
    // Retrieve the token document containing the transaction
    const token = await this.tokenModel.findOne({ 'transactions.id': transactionId });
    if (!token) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = token.transactions.find((t) => t.id === transactionId);

    if (transaction.comments.findIndex((comment) => comment.address === address) > -1) {
      throw new BadRequestException('You already commented this transaction');
    }

    if (transaction.comments.findIndex((comment) => comment.address === address) < 0) {
      transaction.comments.push({ address, comment: content });
      await this.tokenModel.updateOne(
        { 'transactions.id': transactionId },
        { $set: { 'transactions.$.comments': transaction.comments } },
      );
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already commented this transaction');
    }
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
      const foundToken = await this.tokenModel.findOne({ address, network });
      if (!foundToken) {
        throw new BadRequestException('Token not found!');
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
      switch (network) {
        case NetworkType.ETHEREUM:
          return await this.etherscanService.getTransactionsByContract(address);
        case NetworkType.POLYGON:
          return await this.polygonService.getTransactionsByContract(address);
        case NetworkType.BSC:
          return await this.bscService.getTransactionsByContract(address);
        case NetworkType.ARBITRUM:
          return await this.arbitrumService.getTransactionsByContract(address);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateTransactions(address: string, network: string) {
    if (!Object.values(NetworkType).includes(network as NetworkType)) return;
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

  async getTokenPrices(network: string, address: string, from: string, to: string) {
    switch (network) {
      case NetworkType.ETHEREUM:
        return this.etherscanService.getTokenPrices(address, from, to);
      case NetworkType.POLYGON:
        return this.polygonService.getTokenPrices(address, from, to);
      case NetworkType.BSC:
        return this.bscService.getTokenPrices(address, from, to);
      case NetworkType.ARBITRUM:
        return this.arbitrumService.getTokenPrices(address, from, to);
      case NetworkType.AVALANCHE:
        return this.avalancheService.getTokenPrices(address, from, to);
    }
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
        return this.arbitrumService.getPriceFromExchanges(address);
      case NetworkType.AVALANCHE:
        return this.avalancheService.getPriceFromExchanges(address);
    }
    return null;
  }

  async getTopERC20Tokens(network: string) {
    switch (network) {
      case NetworkType.ETHEREUM:
        return this.etherscanService.getTopERC20Tokens();
      case NetworkType.POLYGON:
        return this.polygonService.getTopERC20Tokens();
      case NetworkType.BSC:
        return this.bscService.getTopERC20Tokens();
      case NetworkType.ARBITRUM:
        return this.arbitrumService.getTopERC20Tokens();
      case NetworkType.AVALANCHE:
        return this.avalancheService.getTopERC20Tokens();
    }
  }

  async searchHandler(network: string, keyword: string) {
    try {
      const client = new ZenRows(process.env.ZENROWS_API_KEY);
      switch (network) {
        case NetworkType.ETHEREUM:
          const ethereum_tokens = await client.get(`https://etherscan.io/searchHandler?term=${keyword}&filterby=0`, {
            autoparse: true,
          });
          return ethereum_tokens.data
            .filter((token) => token.groupid === '3' && token.group === 'Tokens (ERC 20)')
            .map((token) => ({
              img: token.img ? `https://etherscan.io/token/images/${token.img}` : '',
              address: token.address,
              title: token.title,
            }));
        case NetworkType.BSC:
          const bsc_tokens = await client.get(`https://bscscan.com/searchHandler?term=${keyword}&filterby=0`, {
            autoparse: true,
          });
          return bsc_tokens.data
            .filter((token) => token.groupid === '3' && token.group === 'Tokens (BEP 20)')
            .map((token: any) => ({ img: '', address: token.address, title: token.title }));
        case NetworkType.POLYGON:
          const polygon_tokens = await client.get(`https://polygonscan.com/searchHandler?term=${keyword}&filterby=0`, {
            autoparse: true,
          });
          const polygon_grouped_data = polygon_tokens.data.reduce((acc, line) => {
            if (line.startsWith('Tokens (ERC 20)')) {
              acc['ERC 20'] = [];
              acc.curr = 'ERC 20';
            } else if (line.startsWith('Tokens (ERC 1155)') || line.startsWith('Tokens (ERC 721)')) {
              acc['NFT'] = [];
              acc.curr = 'NFT';
            } else if (line.startsWith('Addresses')) {
              acc['Addresses'] = [];
              acc.curr = 'Addresses';
            } else if (acc.curr) {
              acc[acc.curr].push(line);
            }
            return acc;
          }, {});
          return (
            polygon_grouped_data['ERC 20']?.map((token: any) => {
              const params = token.split('\t');
              return {
                img: params[5] ? `https://polygonscan.com/token/images/${params[5]}` : '',
                address: params[1],
                title: params[0],
              };
            }) || []
          );
        case NetworkType.ARBITRUM:
          const arbitrum_tokens = await client.get(`https://arbiscan.io/searchHandler?term=${keyword}&filterby=0`, {
            autoparse: true,
          });

          const arbitrum_grouped_data = arbitrum_tokens.data.reduce((acc, line) => {
            if (line.startsWith('Tokens (ERC 20)')) {
              acc['ERC 20'] = [];
              acc.curr = 'ERC 20';
            } else if (line.startsWith('Tokens (ERC 1155)') || line.startsWith('Tokens (ERC 721)')) {
              acc['NFT'] = [];
              acc.curr = 'NFT';
            } else if (line.startsWith('Addresses')) {
              acc['Addresses'] = [];
              acc.curr = 'Addresses';
            } else if (acc.curr) {
              acc[acc.curr].push(line);
            }
            return acc;
          }, {});
          return (
            arbitrum_grouped_data['ERC 20']?.map((token: any) => {
              const params = token.split('\t');
              return {
                img: params[5] ? `https://arbiscan.io/token/images/${params[5]}` : '',
                address: params[1],
                title: params[0],
              };
            }) || []
          );
      }
    } catch (error) {
      logger.error(error);
      return [];
    }
  }
}
