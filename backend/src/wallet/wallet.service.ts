import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, forwardRef, Inject } from '@nestjs/common';

import { TokenBalance, Transaction } from 'src/utils/types';
import { FollowWalletDto } from './dto/follow.dto';
import { UserService } from '../user/user.service';
import { CommentWalletDto } from './dto/comment.dto';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
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

  async findTransactions(address: string, limit: Number) {
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

  async getTokenBalances(address: string) {
    const ethereumAlchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_ETH_MAINNET_API_KEY,
      network: Network.ETH_MAINNET,
    });
    const polygonAlchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_MATIC_MAINNET_API_KEY,
      network: Network.MATIC_MAINNET,
    });

    // Get balance and format in terms of ETH or MATIC
    let ether_balance = await ethereumAlchemy.core.getBalance(address, 'latest');
    let matic_balance = await polygonAlchemy.core.getBalance(address, 'latest');

    console.log(ether_balance, matic_balance);
    const now = new Date().getTime();
    const ether_price = (await this.etherscanService.getPrice('eth', now)) as number;
    const matic_price = (await this.etherscanService.getPrice('matic', now)) as number;
    console.log('PRICES: ', ether_price, matic_price);

    const ethereum_tokens: TokenBalance[] = [];
    const polygon_tokens: TokenBalance[] = [];

    ethereum_tokens.push({
      logo: '',
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      balance: Utils.formatEther(ether_balance),
      usd: (Number(Utils.formatEther(ether_balance)) * ether_price).toString(),
      contractAddress: 'Ethereum Native Coin',
    });

    polygon_tokens.push({
      logo: '',
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
      balance: Utils.formatEther(matic_balance),
      usd: (Number(Utils.formatEther(matic_balance)) * matic_price).toString(),
      contractAddress: 'Polygon Native Coin',
    });

    // Get token balances
    let ethereum_erc20_balances = await ethereumAlchemy.core.getTokenBalances(address);
    let polygon_erc20_balances = await polygonAlchemy.core.getTokenBalances(address);

    console.log('ERC20 BALANCES', ethereum_erc20_balances, polygon_erc20_balances);
    // Loop through all tokens with non-zero balance
    for (let token of ethereum_erc20_balances.tokenBalances.filter((token) => token.tokenBalance !== '0')) {
      // Get balance of token
      let balance = Number(token.tokenBalance);

      // Get metadata of token
      const metadata = await ethereumAlchemy.core.getTokenMetadata(token.contractAddress);

      if (!metadata.logo || balance === 0) continue;

      // Compute token balance in human-readable format
      balance = balance / Math.pow(10, metadata.decimals);
      const price = (await this.etherscanService.getPrice(metadata.symbol, now)) as number;

      ethereum_tokens.push({
        ...metadata,
        balance: balance.toString(),
        usd: (balance * price).toString(),
        contractAddress: token.contractAddress,
      });
    }

    // Loop through all tokens with non-zero balance
    for (let token of polygon_erc20_balances.tokenBalances.filter((token) => token.tokenBalance !== '0')) {
      // Get balance of token
      let balance = Number(token.tokenBalance);

      // Get metadata of token
      const metadata = await polygonAlchemy.core.getTokenMetadata(token.contractAddress);

      if (!metadata.logo || balance === 0) continue;

      // Compute token balance in human-readable format
      balance = balance / Math.pow(10, metadata.decimals);
      const price = (await this.etherscanService.getPrice(metadata.symbol, now)) as number;

      polygon_tokens.push({
        ...metadata,
        balance: balance.toString(),
        usd: (balance * price).toString(),
        contractAddress: token.contractAddress,
      });
    }

    // return {
    //   ethereum: { date: now, tokens: ethereum_tokens },
    //   polygon: { date: now, tokens: polygon_tokens },
    //   binance: { date: now, tokens: [] as TokenBalance[] },
    // };

    try {
      await this.walletModel.updateOne(
        { address },
        { $push: { 'balance.ethereum': { date: now, tokens: ethereum_tokens } } },
      );

      await this.walletModel.updateOne(
        { address },
        { $push: { 'balance.polygon': { date: now, tokens: polygon_tokens } } },
      );

      await this.walletModel.updateOne(
        { address },
        { $push: { 'balance.binance': { date: now, tokens: [] as TokenBalance[] } } },
      );
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`There was no wallet with ${address} found!`);
    }
  }

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
      console.error(error);
      throw new BadRequestException('An error occurred while fetching the balance!');
    }
  }

  async getBalanceHistory(address: string) {
    const foundWallet = await this.walletModel.findOne({ address });
    if (!foundWallet) {
      throw new BadRequestException('Wallet not found!');
    }
    return foundWallet.balance;
  }
}
