import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';

import axios from 'axios';
import * as moment from 'moment';
import { ZenRows } from 'zenrows';
import { logger } from 'src/utils/logger';
import { FollowNftDto } from './dto/follow.dto';
import { NFTTransaction } from 'src/utils/types';
import { CommentNftDto } from './dto/comment.dto';
import { UserService } from '../user/user.service';
import { CreateNftDto } from './dto/create-nft.dto';
import { Nft, NftDocument } from './schemas/nft.schema';
import { FindOneParams } from './dto/find-one-params.dto';
import { ServiceConfig } from 'src/config/service.config';
import { NetworkType } from 'src/utils/enums/network.enum';
import { CommentService } from '../comment/comment.service';
import { BscscanService } from 'src/bscscan/bscscan.service';
import { ArbitrumService } from 'src/arbitrum/arbitrum.service';
import { SuccessResponse } from '../utils/dtos/success-response';
import { EtherscanService } from 'src/etherscan/etherscan.service';
import { AvalancheService } from 'src/avalanche/avalanche.service';
import { PolygonscanService } from 'src/polygonscan/polygonscan.service';
import { FeedbackTransactionDto } from './dto/feedback-transaction.dto';
import { CommentTransactionDto } from './dto/comment-transaction.dto';
@Injectable()
export class NftService {
  private readonly serviceConfig: ServiceConfig;

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
    private readonly configService: ConfigService,
  ) {
    this.serviceConfig = this.configService.get<ServiceConfig>('service');
  }

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
    const { address, network, nftAddress, transactions } = followNftDto;
    const foundUser = await this.userService.getByAddress(address);
    const foundNft = await this.getOrCreate(nftAddress, network);

    if (!foundNft.followers.includes(foundUser.id)) {
      await foundNft.updateOne({ $push: { followers: foundUser.id } });
      await foundUser.updateOne({ $push: { followingNfts: foundNft.id } });
      await this.setTransactions(nftAddress, network, transactions);
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

  async like(likeDto: FeedbackTransactionDto): Promise<SuccessResponse> {
    // Retrieve the token document containing the transaction
    const token = await this.nftModel.findOne({ 'transactions.id': likeDto.transactionId });
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
      await this.nftModel.updateOne(
        { 'transactions.id': likeDto.transactionId },
        { $set: { 'transactions.$.likes': transaction.likes } },
      );
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already like this token');
    }
  }

  async unlike(likeDto: FeedbackTransactionDto) {
    // Retrieve the token document containing the transaction
    const token = await this.nftModel.findOne({ 'transactions.id': likeDto.transactionId });
    if (!token) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = token.transactions.find((t) => t.id === likeDto.transactionId);
    if (transaction.likes.includes(likeDto.address)) {
      await this.nftModel.updateOne(
        { 'transactions.id': likeDto.transactionId },
        { $set: { 'transactions.$.likes': transaction.likes.filter((address) => address !== likeDto.address) } },
      );
    }
    return new SuccessResponse(true);
  }

  async dislike(dislikeDto: FeedbackTransactionDto): Promise<SuccessResponse> {
    // Retrieve the token document containing the transaction
    const token = await this.nftModel.findOne({ 'transactions.id': dislikeDto.transactionId });
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
      await this.nftModel.updateOne(
        { 'transactions.id': dislikeDto.transactionId },
        { $set: { 'transactions.$.dislikes': transaction.dislikes } },
      );
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already dislike this token');
    }
  }

  async unDislike(dislikeDto: FeedbackTransactionDto) {
    // Retrieve the token document containing the transaction
    const token = await this.nftModel.findOne({ 'transactions.id': dislikeDto.transactionId });
    if (!token) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = token.transactions.find((t) => t.id === dislikeDto.transactionId);
    if (transaction.dislikes.includes(dislikeDto.address)) {
      await this.nftModel.updateOne(
        { 'transactions.id': dislikeDto.transactionId },
        {
          $set: { 'transactions.$.dislikes': transaction.dislikes.filter((address) => address !== dislikeDto.address) },
        },
      );
    }
    return new SuccessResponse(true);
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

  async comment(commentTransactionDto: CommentTransactionDto) {
    const { transactionId, address, content } = commentTransactionDto;
    // Retrieve the token document containing the transaction
    const nft = await this.nftModel.findOne({ 'transactions.id': transactionId });
    if (!nft) {
      throw new BadRequestException('Invalid transaction Id');
    }
    // Find the specific transaction within the token document's transactions array
    const transaction = nft.transactions.find((t) => t.id === transactionId);

    if (transaction.comments.findIndex((comment) => comment.address === address) > -1) {
      throw new BadRequestException('You already commented this transaction');
    }

    if (transaction.comments.findIndex((comment) => comment.address === address) < 0) {
      transaction.comments.push({ address, comment: content });
      await this.nftModel.updateOne(
        { 'transactions.id': transactionId },
        { $set: { 'transactions.$.comments': transaction.comments } },
      );
      return new SuccessResponse(true);
    } else {
      throw new BadRequestException('You already commented this transaction');
    }
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
      switch (network) {
        case NetworkType.ETHEREUM:
          return await this.etherscanService.getTransactionsByNFT(address);
        case NetworkType.POLYGON:
          return await this.polygonService.getTransactionsByNFT(address);
        case NetworkType.BSC:
          return await this.bscService.getTransactionsByNFT(address);
        case NetworkType.ARBITRUM:
          return await this.arbitrumService.getTransactionsByNFT(address);
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
        case NetworkType.AVALANCHE:
          const avalancheTxns = await this.avalancheService.getTransactionsByNFT(address);
          await this.setTransactions(address, network, avalancheTxns);
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

  async getSalesVolumes(address: string, network: string) {
    try {
      const url = `https://api.opensea.io/api/v2/chain/${
        network === NetworkType.BSC ? 'bsc' : network === NetworkType.POLYGON ? 'matic' : network
      }/contract/${address}`;
      const resp = await axios.get(url, {
        headers: {
          'x-api-key': this.serviceConfig.opensea_api_key,
        },
      });
      const collection = resp.data;
      // Define your date range in Unix timestamp
      const occurred_after = Math.floor(moment().subtract(3, 'months').toDate().getTime() / 1000); // Start of the range
      const occurred_before = Math.floor(moment().toDate().getTime() / 1000); // End of the range
      const events: any[] = [];
      let next = '';
      do {
        try {
          const url = `https://api.opensea.io/api/v2/events/collection/${collection.collection}?after=${occurred_after}&before=${occurred_before}&event_type=sale&next=${next}%3D%3D`;
          const resp = await axios.get(url, {
            headers: {
              'x-api-key': this.serviceConfig.opensea_api_key,
            },
          });
          events.push(...resp.data.asset_events);
          if (events.length > 2000) break;
          next = resp.data.next;
        } catch (error) {
          logger.error(error);
          break;
        }
      } while (next.length > 0);

      const data = events.reduce((result, item) => {
        const key = moment(item.closing_date * 1000).format('YYYY-MM-DD');
        if (!result[key]) {
          result[key] = item.payment.quantity;
        } else {
          result[key] += item.payment.quantity;
        }
        return result;
      }, {});

      const saleVolumes =
        Object.entries(data).map(([key, value]) => ({
          date: key,
          volume: Number(value) / 10 ** 18,
        })) || [];

      let collectionStats;
      try {
        const url = `https://api.opensea.io/api/v2/collections/${collection.collection}/stats`;
        const resp = await axios.get(url, {
          headers: {
            'x-api-key': this.serviceConfig.opensea_api_key,
          },
        });
        collectionStats = resp.data;
      } catch (error) {
        logger.error(error);
      }
      return {
        name: collection.name,
        address: collection.address,
        network: collection.chain,
        collection: collection.collection,
        volume: collectionStats?.total.volume.toString() || '0',
        sales: collectionStats?.total.sales || 0,
        holders: collectionStats?.total.num_owners || 0,
        floor_price: collectionStats?.total.floor_price || 0,
        floor_price_symbol: collectionStats?.total.floor_price_symbol || '',
        sale_volumes: saleVolumes,
      };
    } catch (error) {
      logger.error(error);
      return;
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
            .filter((token) => token.groupid === '3' && token.group !== 'Tokens (ERC 20)')
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
            .filter((token) => token.groupid === '3' && token.group !== 'Tokens (BEP 20)')
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
            polygon_grouped_data['NFT']?.map((token: any) => {
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
            arbitrum_grouped_data['NFT']?.map((token: any) => {
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
