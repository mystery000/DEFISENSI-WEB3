import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import Moralis from 'moralis';
import { ZenRows } from 'zenrows';
import { logger } from 'src/utils/logger';
import { FollowWalletDto } from './dto/follow.dto';
import { UserService } from '../user/user.service';
import { WalletTransaction } from 'src/utils/types';
import { CommentWalletDto } from './dto/comment.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { NetworkType } from 'src/utils/enums/network.enum';
import { CommentService } from '../comment/comment.service';
import { BscscanService } from 'src/bscscan/bscscan.service';
import { ArbitrumService } from 'src/arbitrum/arbitrum.service';
import { SuccessResponse } from '../utils/dtos/success-response';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { EtherscanService } from 'src/etherscan/etherscan.service';
import { AvalancheService } from 'src/avalanche/avalanche.service';
import { PolygonscanService } from 'src/polygonscan/polygonscan.service';
import { FeedbackTransactionDto } from './dto/feedback-transaction.dto';
import { CommentTransactionDto } from './dto/comment-transaction.dto';

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
    const { address, walletAddress, transactions } = followWalletDto;
    const foundUser = await this.userService.getByAddress(address);
    const foundWallet = await this.getOrCreate(walletAddress);

    if (!foundWallet.followers.includes(foundUser.id)) {
      await foundWallet.updateOne({ $push: { followers: foundUser.id } });
      await foundUser.updateOne({ $push: { followingWallets: foundWallet.id } });
      await this.setTransactions(walletAddress, transactions);
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

  async like(likeDto: FeedbackTransactionDto): Promise<SuccessResponse> {
    // Retrieve the token document containing the transaction
    const wallet = await this.walletModel.findOne({ 'transactions.id': likeDto.transactionId });
    if (!wallet) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = wallet.transactions.find((t) => t.id === likeDto.transactionId);

    if (transaction.likes.includes(likeDto.address)) {
      throw new BadRequestException('You already like this transaction');
    }
    if (transaction.dislikes.includes(likeDto.address)) {
      throw new BadRequestException('You already dislike this transaction');
    }

    if (!transaction.likes.includes(likeDto.address)) {
      transaction.likes.push(likeDto.address);
      await this.walletModel.updateOne(
        { 'transactions.id': likeDto.transactionId },
        { $set: { 'transactions.$.likes': transaction.likes } },
      );
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already like this transaction');
    }
  }

  async unlike(likeDto: FeedbackTransactionDto): Promise<SuccessResponse> {
    // Retrieve the token document containing the transaction
    const wallet = await this.walletModel.findOne({ 'transactions.id': likeDto.transactionId });
    if (!wallet) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = wallet.transactions.find((t) => t.id === likeDto.transactionId);
    if (transaction.likes.includes(likeDto.address)) {
      await this.walletModel.updateOne(
        { 'transactions.id': likeDto.transactionId },
        { $set: { 'transactions.$.likes': transaction.likes.filter((address) => address !== likeDto.address) } },
      );
    }
    return new SuccessResponse(true);
  }

  async dislike(dislikeDto: FeedbackTransactionDto): Promise<SuccessResponse> {
    // Retrieve the token document containing the transaction
    const wallet = await this.walletModel.findOne({ 'transactions.id': dislikeDto.transactionId });
    if (!wallet) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = wallet.transactions.find((t) => t.id === dislikeDto.transactionId);

    if (transaction.dislikes.includes(dislikeDto.address)) {
      throw new BadRequestException('You already dislike this transaction');
    }

    if (transaction.likes.includes(dislikeDto.address)) {
      throw new BadRequestException('You already like this transaction');
    }

    if (!transaction.dislikes.includes(dislikeDto.address)) {
      transaction.dislikes.push(dislikeDto.address);
      await this.walletModel.updateOne(
        { 'transactions.id': dislikeDto.transactionId },
        { $set: { 'transactions.$.dislikes': transaction.dislikes } },
      );
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already dislike this transaction');
    }
  }

  async unDislike(dislikeDto: FeedbackTransactionDto): Promise<SuccessResponse> {
    // Retrieve the token document containing the transaction
    const wallet = await this.walletModel.findOne({ 'transactions.id': dislikeDto.transactionId });
    if (!wallet) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = wallet.transactions.find((t) => t.id === dislikeDto.transactionId);
    if (transaction.dislikes.includes(dislikeDto.address)) {
      await this.walletModel.updateOne(
        { 'transactions.id': dislikeDto.transactionId },
        {
          $set: { 'transactions.$.dislikes': transaction.dislikes.filter((address) => address !== dislikeDto.address) },
        },
      );
    }
    return new SuccessResponse(true);
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

  async comment(commentTransactionDto: CommentTransactionDto) {
    const { transactionId, address, content } = commentTransactionDto;
    // Retrieve the token document containing the transaction
    const wallet = await this.walletModel.findOne({ 'transactions.id': transactionId });
    if (!wallet) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = wallet.transactions.find((t) => t.id === transactionId);

    if (transaction.comments.findIndex((comment) => comment.address === address) > -1) {
      throw new BadRequestException('You already commented this transaction');
    }

    if (transaction.comments.findIndex((comment) => comment.address === address) < 0) {
      transaction.comments.push({ address, comment: content });
      await this.walletModel.updateOne(
        { 'transactions.id': transactionId },
        { $set: { 'transactions.$.comments': transaction.comments } },
      );
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already commented this transaction');
    }
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

  async setTransactions(address: string, transactions: WalletTransaction[]) {
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
      const [ethereumTxns, polygonTxns, bscTxns, avalancheTxns, arbitrumTxns] = await Promise.all([
        this.etherscanService.getTransactionsByAccount(address),
        this.polygonscanService.getTransactionsByAccount(address),
        [],
        [],
        [],
      ]);

      const transactions = [...ethereumTxns, ...polygonTxns, ...bscTxns, ...avalancheTxns, ...arbitrumTxns];

      return transactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
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
          this.polygonscanService.getTransactionsByAccount(address),
        ]);
        await this.setTransactions(address, [...ethereumTxns, ...polygonTxns]);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  async initializeTransactions(address: string) {
    try {
      const [ethereumTxns, polygonTxns] = await Promise.all([
        this.etherscanService.getTransactionsByAccount(address),
        this.polygonscanService.getTransactionsByAccount(address),
      ]);
      await this.setTransactions(address, [...ethereumTxns, ...polygonTxns]);
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

  async searchHandler(network: string, keyword: string) {
    try {
      const client = new ZenRows(process.env.ZENROWS_API_KEY);
      switch (network) {
        case NetworkType.ETHEREUM:
          const ethereum_tokens = await client.get(`https://etherscan.io/searchHandler?term=${keyword}&filterby=0`, {
            autoparse: true,
          });
          return ethereum_tokens.data
            .filter((token) => token.groupid === '2' && token.group === 'Addresses')
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
            .filter((token) => token.groupid === '2' && token.group === 'Addresses')
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
            polygon_grouped_data['Addresses']?.map((token: any) => {
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
            arbitrum_grouped_data['Addresses']?.map((token: any) => {
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
