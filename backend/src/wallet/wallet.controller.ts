import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Wallet } from './schemas/wallet.schema';
import { ApiBalance, ApiBalanceHistory, ApiTransaction } from 'src/utils/types';
import { WalletService } from './wallet.service';
import { User } from '../user/schemas/user.schema';
import { FollowWalletDto } from './dto/follow.dto';
import { CommentWalletDto } from './dto/comment.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FindOneParams } from './dto/find-one-params.dto';
import { Comment } from '../comment/schema/comment.schema';
import { SuccessResponse } from '../utils/dtos/success-response';

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

  @Get('top-wallets')
  @ApiOperation({ summary: 'Get the top wallets' })
  // @ApiOkResponse({ type: [Wallet] })
  // getTopWallets(): Promise<Wallet[]> {
  //   return this.walletService.getTopWallets();
  // }
  getTopWallets() {
    return this.walletService.getTopWallets();
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get wallet' })
  @ApiOkResponse({ type: Wallet })
  @ApiParam({ name: 'address', description: 'The wallet address' })
  get(@Param() { address }: FindOneParams): Promise<Wallet> {
    return this.walletService.get(address);
  }

  @Get('followers/:address')
  @ApiOperation({ summary: 'Get followers of this wallet' })
  @ApiOkResponse({ type: User, isArray: true })
  @ApiParam({ name: 'address', description: 'Get followers for wallet' })
  getFollowers(@Param() { address }: FindOneParams): Promise<User[]> {
    return this.walletService.getFollowers(address);
  }

  @Get('followings/:address')
  @ApiOperation({ summary: 'Get followings of this wallet' })
  @ApiOkResponse({ type: User, isArray: true })
  @ApiParam({ name: 'address', description: 'Get followings for wallet' })
  getFollowings(@Param() { address }: FindOneParams): Promise<User[]> {
    return this.walletService.getFollowings(address);
  }

  @Get('comments/:address')
  @ApiOperation({ summary: 'Get comments of this wallet' })
  @ApiOkResponse({ type: Comment, isArray: true })
  @ApiParam({ name: 'address', description: 'Address of wallet' })
  getComments(@Param() { address }: FindOneParams): Promise<Comment[]> {
    return this.walletService.getComments(address);
  }

  @Get(':address/transactions')
  @ApiOperation({ summary: 'Get transactions of this wallet' })
  @ApiOkResponse({ type: ApiTransaction, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of wallet' })
  @ApiQuery({ name: 'limit', description: 'Limit of transactions returned', required: false })
  getWalletTransactions(@Param('address') address: string, @Query('limit') limit: number) {
    return this.walletService.getTransactions(address, limit);
  }

  @Get(':address/balance')
  @ApiOperation({ summary: 'Get balances of tokens owned by address' })
  @ApiOkResponse({ type: ApiBalance, isArray: false })
  @ApiParam({ name: 'address', description: 'The address of wallet' })
  getBalance(@Param() { address }: FindOneParams) {
    return this.walletService.getBalance(address);
  }

  @Get(':address/balancehistory')
  @ApiOperation({ summary: 'Get balances of tokens owned by address' })
  @ApiOkResponse({ type: ApiBalanceHistory, isArray: false })
  @ApiParam({ name: 'address', description: 'The address of wallet' })
  getBalanceHistory(@Param() { address }: FindOneParams) {
    return this.walletService.getBalanceHistory(address);
  }
}
