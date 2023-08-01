import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { Wallet } from './schemas/wallet.schema';
import { ApiTransaction } from 'src/utils/types';
import { WalletService } from './wallet.service';
import { User } from '../user/schemas/user.schema';
import { FollowWalletDto } from './dto/follow.dto';
import { CommentWalletDto } from './dto/comment.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FindOneParams } from './dto/find-one-params.dto';
import { Comment } from '../comment/schema/comment.schema';
import { SuccessResponse } from '../utils/dtos/success-response';
import { Transaction } from 'src/etherscan/schemas/transaction.schema';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @ApiOperation({ description: 'Create a new wallet.' })
  @ApiCreatedResponse({
    type: Wallet,
    description: 'The wallet has been successfully created.',
  })
  create(@Body() createWalletDto: CreateWalletDto): Promise<Wallet> {
    return this.walletService.create(createWalletDto);
  }

  @Post('follow')
  @ApiOperation({ summary: 'Follow wallet' })
  @ApiOkResponse({ type: SuccessResponse })
  followWallet(@Body() followWalletDto: FollowWalletDto): Promise<SuccessResponse> {
    return this.walletService.follow(followWalletDto);
  }

  @Post('like')
  @ApiOperation({ summary: 'Follow wallet' })
  @ApiOkResponse({ type: SuccessResponse })
  likeWallet(@Body() likeDto: FollowWalletDto): Promise<SuccessResponse> {
    return this.walletService.like(likeDto);
  }

  @Post('dislike')
  @ApiOperation({ summary: 'Follow wallet' })
  @ApiOkResponse({ type: SuccessResponse })
  dislikeWallet(@Body() dislikeDto: FollowWalletDto): Promise<SuccessResponse> {
    return this.walletService.dislike(dislikeDto);
  }

  @Post('cancel-follow')
  @ApiOperation({ summary: 'Cancel follow wallet' })
  @ApiOkResponse({ type: SuccessResponse })
  cancelFollowWallet(@Body() followWalletDto: FollowWalletDto): Promise<SuccessResponse> {
    return this.walletService.cancelfollow(followWalletDto);
  }

  @Post('comment')
  @ApiOperation({ summary: 'Write comment on this wallet' })
  @ApiOkResponse({ type: SuccessResponse })
  postComment(@Body() commentWalletDto: CommentWalletDto): Promise<SuccessResponse> {
    return this.walletService.comment(commentWalletDto);
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get wallet' })
  @ApiOkResponse({ type: Wallet })
  @ApiParam({ name: 'address', description: 'The wallet address' })
  get(@Param() { address }: FindOneParams): Promise<Wallet> {
    return this.walletService.get(address);
  }

  @Get('follower/:address')
  @ApiOperation({ summary: 'Get follower of this wallet' })
  @ApiOkResponse({ type: User, isArray: true })
  @ApiParam({ name: 'address', description: 'Get follower for wallet' })
  getFollowers(@Param() { address }: FindOneParams): Promise<User[]> {
    return this.walletService.getFollowers(address);
  }

  @Get('comments/:address')
  @ApiOperation({ summary: 'Get comments of this wallet' })
  @ApiOkResponse({ type: Comment, isArray: true })
  @ApiParam({ name: 'address', description: 'Address of wallet' })
  getComments(@Param() { address }: FindOneParams): Promise<Comment[]> {
    return this.walletService.getComments(address);
  }

  @Get('transactions/:address')
  @ApiOperation({ summary: 'Get list of transactions of this token' })
  @ApiOkResponse({ type: Transaction, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of wallet' })
  getWalletTransactions(@Param() { address }: FindOneParams) {
    return this.walletService.findTransactions(address);
  }
}
