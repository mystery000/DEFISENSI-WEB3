import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import Moralis from 'moralis';
import { logger } from 'src/utils/logger';
import { FollowWalletDto } from './dto/follow.dto';
import { UserService } from '../user/user.service';
import { CommentWalletDto } from './dto/comment.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { NetworkType } from 'src/utils/enums/network.enum';
import { CommentService } from '../comment/comment.service';
import { BscscanService } from 'src/bscscan/bscscan.service';
import { ArbitrumService } from 'src/arbitrum/arbitrum.service';
import { SuccessResponse } from '../utils/dtos/success-response';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { EtherscanService } from 'src/etherscan/etherscan.service';
import { TokenTransaction, NFTTransaction } from 'src/utils/types';
import { AvalancheService } from 'src/avalanche/avalanche.service';
import { PolygonscanService } from 'src/polygonscan/polygonscan.service';

type Transaction = TokenTransaction | NFTTransaction;

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly etherscanService: EtherscanService,
    private readonly polygonscanService: PolygonscanService,
    private readonly bscService: BscscanService,
    private readonly arbitrumService: ArbitrumService,
    private readonly avalancheService: AvalancheService,
  ) {}

  async create(wallet: CreateWalletDto): Promise<Wallet> {
    let foundWallet = await this.walletModel.findOne({ address: wallet.address });
    if (!foundWallet) {
      let createdWallet = await this.walletModel.findOneAndUpdate(
        { address: wallet.address }, // filter
        {}, // update (empty as you're only interested in finding or creating a document)
        {
          upsert: true, // will create a new document if none is found
          new: true, // will return the new document if one is created
          setDefaultsOnInsert: true, // will set default values defined in your schema
        },
      );
      return createdWallet;
    }
    return foundWallet;
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
      try {
        const resp = await this.getTransactions(followWalletDto.walletAddress);
        await this.setTransactions(followWalletDto.walletAddress, resp.transactions);
      } catch (error) {
        logger.error(error);
      }

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

  async getFollowings(address: string) {
    const foundWallet = await this.walletModel.findOne({ address });

    if (!foundWallet) {
      throw new BadRequestException('Wallet not found!');
    }

    return this.userService.getByIds(foundWallet.followings);
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

  async setTransactions(address: string, transactions: Transaction[]) {
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

  async getTransactions(address: string, limit: number = 4) {
    try {
      const foundWallet = await this.walletModel.findOne({ address });

      const { _id, likes, dislikes, comments } = foundWallet || { _id: '', likes: [], dislikes: [], comments: [] };

      const [ethereumTxns, polygonTxns] = await Promise.all([
        this.etherscanService.getTransactionsByAccount(address),
        this.polygonscanService.getTransactionsByAccount(address),
      ]);

      const transactions = [...ethereumTxns, ...polygonTxns];

      return {
        _id,
        likes,
        dislikes,
        comments,
        transactions: transactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateTransactions(address: string) {
    try {
      const foundWallet = await this.walletModel.findOne({ address: address });

      if (foundWallet) {
        const [ethereumTxns, polygonTxns] = await Promise.all([
          this.etherscanService.getTransactionsByAccount(address),
          this.polygonscanService.getTransactionsByAccount(address)
        ]);
        await this.setTransactions(address, [
          ...ethereumTxns,
          ...polygonTxns,
        ]);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  async initializeTransactions(address: string) {
    try {
      const [ethereumTxns, polygonTxns] = await Promise.all([
        this.etherscanService.getTransactionsByAccount(address),
        this.polygonscanService.getTransactionsByAccount(address)
      ]);
      await this.setTransactions(address, [
        ...ethereumTxns,
        ...polygonTxns
      ]);
    } catch (err) {
      logger.error(err);
    }
  }

  async getTopWallets(network: string) {
    switch (network) {
      case NetworkType.ETHEREUM:
        return this.etherscanService.getTopWallets();
      case NetworkType.POLYGON:
        return this.polygonscanService.getTopWallets();
      case NetworkType.BSC:
        return this.bscService.getTopWallets();
      case NetworkType.ARBITRUM:
        return this.arbitrumService.getTopWallets();
      case NetworkType.AVALANCHE:
        return this.avalancheService.getTopWallets();
    }
  }

  async resolveAddress(address: string) {
    try {
      const response = await Moralis.EvmApi.resolve.resolveAddress({
        address,
      });
      return response.toJSON().name;
    } catch (error) {
      logger.error(error);
    }
  }

  async resolveENSDomain(domain: string) {
    try {
      const response = await Moralis.EvmApi.resolve.resolveENSDomain({
        domain,
      });
      return response.toJSON().address;
    } catch (error) {
      logger.error(error);
    }
  }

  async getTokenBalancesForWalletAddress(network: string, address: string) {
    switch (network) {
      case NetworkType.ETHEREUM:
        return this.etherscanService.getTokenBalancesForWalletAddress(address);
      case NetworkType.POLYGON:
        return this.polygonscanService.getTokenBalancesForWalletAddress(address);
      case NetworkType.BSC:
        return this.bscService.getTokenBalancesForWalletAddress(address);
      case NetworkType.ARBITRUM:
        return this.arbitrumService.getTokenBalancesForWalletAddress(address);
      case NetworkType.AVALANCHE:
        return this.avalancheService.getTokenBalancesForWalletAddress(address);
    }
  }

  async getHistoricalPortfolioForWalletAddress(network: string, address: string, days: number = 30) {
    switch (network) {
      case NetworkType.ETHEREUM:
        return this.etherscanService.getHistoricalPortfolioForWalletAddress(address, days);
      case NetworkType.POLYGON:
        return this.polygonscanService.getHistoricalPortfolioForWalletAddress(address, days);
      case NetworkType.BSC:
        return this.bscService.getHistoricalPortfolioForWalletAddress(address, days);
      case NetworkType.ARBITRUM:
        return this.arbitrumService.getHistoricalPortfolioForWalletAddress(address, days);
      case NetworkType.AVALANCHE:
        return this.avalancheService.getHistoricalPortfolioForWalletAddress(address, days);
    }
  }
}
