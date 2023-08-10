import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, forwardRef, Inject } from '@nestjs/common';

import { TokenBalance, Transaction } from 'src/utils/types';
import { logger } from 'src/utils/logger';
import { FollowWalletDto } from './dto/follow.dto';
import { UserService } from '../user/user.service';
import { CommentWalletDto } from './dto/comment.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CommentService } from '../comment/comment.service';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { SuccessResponse } from '../utils/dtos/success-response';
import { EtherscanService } from 'src/etherscan/etherscan.service';
@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly etherscanService: EtherscanService,
  ) {}

  async create(wallet: CreateWalletDto): Promise<Wallet> {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const newWallet = await this.walletModel.findOneAndUpdate(
      { address: wallet.address },
      { address: wallet.address },
      options,
    );
    // Fetch latest 4 transactions when a new wallet is created
    await this.initializeTransactions(wallet.address);
    return newWallet;
  }

  async getOrCreate(address: string) {
    let foundWallet = await this.walletModel.findOne({ address });
    if (!foundWallet) {
      foundWallet = await this.walletModel.create({ address });
      // Fetch latest 4 transactions when wallet is created
      await this.initializeTransactions(address);
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

  async getTransactions(address: string, limit: Number = 4) {
    try {
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

      if (!foundWallet || foundWallet.length === 0) {
        throw new BadRequestException('Wallet not found!');
      }
      return foundWallet[0];
    } catch (error) {
      logger.log(error);
      return null;
    }
  }

  async updateTransactions(address: string) {
    try {
      let latestBlockNumber = 0;

      const wallet = await this.walletModel.findOne({ address: address });

      if (wallet && wallet.transactions && wallet.transactions.length > 0)
        latestBlockNumber = Number(wallet.transactions.at(-1).blockNumber);

      const txs = await this.etherscanService.getTransactionsByWallet(address, latestBlockNumber + 1);
      await this.setTransactions(address, txs);
    } catch (err) {
      logger.error(err);
    }
  }

  async initializeTransactions(address: string) {
    try {
      const txs = await this.etherscanService.getTransactionsByWallet(address);
      await this.setTransactions(address, txs);
    } catch (err) {
      logger.error(err);
    }
  }

  // Get balance of tokens owned by this wallet at current timestamp
  // async getTokenBalances(address: string) {
  //   const ethereumAlchemy = new Alchemy({
  //     apiKey: process.env.ALCHEMY_ETH_MAINNET_API_KEY,
  //     network: Network.ETH_MAINNET,
  //   });
  //   const polygonAlchemy = new Alchemy({
  //     apiKey: process.env.ALCHEMY_MATIC_MAINNET_API_KEY,
  //     network: Network.MATIC_MAINNET,
  //   });

  //   try {
  //     // Get balance and format in terms of ETH or MATIC
  //     let ether_balance = await ethereumAlchemy.core.getBalance(address, 'latest');
  //     let matic_balance = await polygonAlchemy.core.getBalance(address, 'latest');

  //     const now = new Date().getTime();
  //     const ether_price = (await this.coinGeckoService.getPrice('eth', now)) as number;
  //     const matic_price = (await this.coinGeckoService.getPrice('matic', now)) as number;

  //     const ethereum_tokens: TokenBalance[] = [];
  //     const polygon_tokens: TokenBalance[] = [];

  //     ethereum_tokens.push({
  //       logo: '',
  //       name: 'ETH',
  //       symbol: 'ETH',
  //       decimals: 18,
  //       balance: Utils.formatEther(ether_balance),
  //       usd: (Number(Utils.formatEther(ether_balance)) * ether_price).toString(),
  //       contractAddress: 'Ethereum Native Coin',
  //     });

  //     polygon_tokens.push({
  //       logo: '',
  //       name: 'MATIC',
  //       symbol: 'MATIC',
  //       decimals: 18,
  //       balance: Utils.formatEther(matic_balance),
  //       usd: (Number(Utils.formatEther(matic_balance)) * matic_price).toString(),
  //       contractAddress: 'Polygon Native Coin',
  //     });

  //     // Get token balances
  //     let ethereum_erc20_balances = await ethereumAlchemy.core.getTokenBalances(address);
  //     let polygon_erc20_balances = await polygonAlchemy.core.getTokenBalances(address);

  //     console.log('ERC20 BALANCES', ethereum_erc20_balances, polygon_erc20_balances);
  //     // Loop through all tokens with non-zero balance
  //     for (let token of ethereum_erc20_balances.tokenBalances.filter((token) => token.tokenBalance !== '0')) {
  //       // Get balance of token
  //       let balance = Number(token.tokenBalance);

  //       // Get metadata of token
  //       const metadata = await ethereumAlchemy.core.getTokenMetadata(token.contractAddress);

  //       if (!metadata.logo || balance === 0) continue;

  //       // Compute token balance in human-readable format
  //       balance = balance / Math.pow(10, metadata.decimals);
  //       const price = (await this.coinGeckoService.getPrice(metadata.symbol, now)) as number;

  //       ethereum_tokens.push({
  //         ...metadata,
  //         balance: balance.toString(),
  //         usd: (balance * price).toString(),
  //         contractAddress: token.contractAddress,
  //       });
  //     }

  //     // Loop through all tokens with non-zero balance
  //     for (let token of polygon_erc20_balances.tokenBalances.filter((token) => token.tokenBalance !== '0')) {
  //       // Get balance of token
  //       let balance = Number(token.tokenBalance);

  //       // Get metadata of token
  //       const metadata = await polygonAlchemy.core.getTokenMetadata(token.contractAddress);

  //       if (!metadata.logo || balance === 0) continue;

  //       // Compute token balance in human-readable format
  //       balance = balance / Math.pow(10, metadata.decimals);
  //       const price = (await this.coinGeckoService.getPrice(metadata.symbol, now)) as number;

  //       polygon_tokens.push({
  //         ...metadata,
  //         balance: balance.toString(),
  //         usd: (balance * price).toString(),
  //         contractAddress: token.contractAddress,
  //       });
  //     }

  //     await this.walletModel.updateOne(
  //       { address },
  //       { $push: { 'balance.ethereum': { date: now, tokens: ethereum_tokens } } },
  //     );

  //     await this.walletModel.updateOne(
  //       { address },
  //       { $push: { 'balance.polygon': { date: now, tokens: polygon_tokens } } },
  //     );

  //     await this.walletModel.updateOne(
  //       { address },
  //       { $push: { 'balance.binance': { date: now, tokens: [] as TokenBalance[] } } },
  //     );
  //   } catch (error) {
  //     logger.error(error);
  //     throw new BadRequestException(`There was no wallet with ${address} found!`);
  //   }
  // }

  // Get latest balance of tokens owned by this wallet
  async getBalance(address: string) {
    try {
      const result = await this.walletModel.aggregate([
        { $match: { address: address } },
        {
          $project: {
            ethereum: { $arrayElemAt: ['$balance.ethereum', -1] },
            polygon: { $arrayElemAt: ['$balance.polygon', -1] },
            binance: { $arrayElemAt: ['$balance.binance', -1] },
          },
        },
      ]);

      if (result.length === 0) {
        throw new BadRequestException('Wallet not found!');
      }

      return result[0];
    } catch (error) {
      logger.error(error);
      throw new BadRequestException('An error occurred while fetching the balance!');
    }
  }

  // Get balance history of this wallet
  async getBalanceHistory(address: string) {
    const foundWallet = await this.walletModel.findOne({ address });
    if (!foundWallet) {
      throw new BadRequestException('Wallet not found!');
    }
    return foundWallet.balance;
  }
}
