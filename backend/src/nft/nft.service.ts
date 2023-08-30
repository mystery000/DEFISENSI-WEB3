import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FollowNftDto } from './dto/follow.dto';
import { CommentNftDto } from './dto/comment.dto';
import { UserService } from '../user/user.service';
import { CreateNftDto } from './dto/create-nft.dto';
import { Nft, NftDocument } from './schemas/nft.schema';
import { FindOneParams } from './dto/find-one-params.dto';
import { CommentService } from '../comment/comment.service';
import { SuccessResponse } from '../utils/dtos/success-response';
import { EtherscanService } from 'src/etherscan/etherscan.service';

@Injectable()
export class NftService {
  constructor(
    @InjectModel(Nft.name)
    private readonly nftModel: Model<NftDocument>,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly etherscanService: EtherscanService,
  ) {}

  async create(nft: CreateNftDto): Promise<Nft> {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return this.nftModel.findOneAndUpdate(nft, nft, options);
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

  async getFollowers(dto: FindOneParams) {
    const foundNft = await this.nftModel.findOne(dto);
    if (!foundNft) {
      throw new BadRequestException('Nft not found!');
    }
    return this.userService.getByIds(foundNft.followers);
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
}
