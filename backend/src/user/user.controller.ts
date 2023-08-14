import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { User } from './schemas/user.schema';
import { UserService } from './user.service';
import { Nft } from '../nft/schemas/nft.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Token } from '../token/schemas/token.schema';
import { Wallet } from '../wallet/schemas/wallet.schema';
import { FindOneParams } from './dto/find-one-params.dto';
import { SuccessResponse } from '../utils/dtos/success-response';
import { FollowUserDto, UnFollowUserDto } from './dto/follow-user.dto';
import { Notification } from '../notification/schemas/notification.schema';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user.' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  async create(@Body() user: CreateUserDto): Promise<User> {
    return this.userService.create(user);
  }

  @Patch('/:address')
  @ApiOperation({ summary: 'Update a user by address.' })
  @ApiOkResponse({
    description: 'The user was successfully updated.',
    type: User,
  })
  @ApiParam({ name: 'address', description: 'The wallet address of user' })
  async update(@Param() { address }: FindOneParams, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(address, updateUserDto);
  }

  @Get('/:address')
  @ApiOperation({ summary: ' Get a user by address' })
  @ApiOkResponse({ type: User })
  @ApiParam({ name: 'address', description: 'The wallet address of user' })
  async getByAddress(@Param() { address }: FindOneParams): Promise<User> {
    return this.userService.getByAddress(address);
  }

  @Get('/:address/get-following-wallets')
  @ApiOperation({ summary: ' Get following wallets' })
  @ApiOkResponse({ type: Wallet, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of user' })
  async getFollowingWallets(@Param() { address }: FindOneParams): Promise<Wallet[]> {
    return this.userService.getFollowingWallets(address);
  }

  @Get('/:address/get-following-tokens')
  @ApiOperation({ summary: ' Get following tokens' })
  @ApiOkResponse({ type: Token, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of user' })
  async getFollowingTokens(@Param() { address }: FindOneParams): Promise<Token[]> {
    return this.userService.getFollowingTokens(address);
  }

  @Get('/:address/get-following-nfts')
  @ApiOperation({ summary: ' Get following nfts' })
  @ApiOkResponse({ type: Nft, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of user' })
  async getFollowingNfts(@Param() { address }: FindOneParams): Promise<Nft[]> {
    return this.userService.getFollowingNfts(address);
  }

  @Get('/:address/get-following')
  @ApiOperation({ summary: ' Get following nfts' })
  @ApiOkResponse({ type: User })
  @ApiParam({ name: 'address', description: 'The address of user' })
  async getFollowing(@Param() { address }: FindOneParams): Promise<User> {
    return this.userService.getFollowing(address);
  }

  @Post('follow/:address/:userToFollowAddress')
  @ApiOperation({ summary: 'Follow other user' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiParam({ name: 'address', description: 'The address of user' })
  @ApiParam({ name: 'userToFollowAddress', description: 'The follower user address' })
  async followUser(@Param() { address, userToFollowAddress }: FollowUserDto): Promise<SuccessResponse> {
    return this.userService.follow(address, userToFollowAddress);
  }

  @Post('unfollow/:address/:userToUnFollowAddress')
  @ApiOperation({ summary: 'Un-follow other user' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiParam({ name: 'address', description: 'The address of user' })
  @ApiParam({ name: 'userToUnFollowAddress', description: 'The user address of unfollow' })
  async unFollowUser(@Param() { address, userToUnFollowAddress }: UnFollowUserDto): Promise<SuccessResponse> {
    return this.userService.unfollowUser(address, userToUnFollowAddress);
  }

  @Get('/:address/followers')
  @ApiOperation({ summary: ' Get followers' })
  @ApiOkResponse({ type: User, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of user' })
  async getFollowers(@Param() { address }: FindOneParams): Promise<User[]> {
    return this.userService.getFollowers(address);
  }

  @Get('/:address/followings')
  @ApiOperation({ summary: ' Get followings' })
  @ApiOkResponse({ type: User, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of user' })
  async getFollowings(@Param() { address }: FindOneParams): Promise<User[]> {
    return this.userService.getFollowings(address);
  }

  @Get('/:address/notifications')
  @ApiOperation({ summary: ' Get notifications for this user' })
  @ApiOkResponse({ type: Notification, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of user' })
  async getNotifications(@Param() { address }: FindOneParams): Promise<Notification[]> {
    return this.userService.getNotifications(address);
  }

  @Get('/:address/wallet/transactions')
  @ApiOperation({ summary: ' Get transactions of following wallets' })
  @ApiOkResponse({ type: Wallet, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of user' })
  @ApiQuery({ name: 'limit', description: 'The limit of transactions returned', required: false })
  async getFollowingWalletTransactions(
    @Param('address') address: string,
    @Query('limit') limit: number,
  ): Promise<Wallet[]> {
    return this.userService.getFollowingWalletsTransactions(address, limit);
  }

  @Get('/:address/token/transactions')
  @ApiOperation({ summary: ' Get transactions of following tokens' })
  @ApiOkResponse({ type: Token, isArray: true })
  @ApiParam({ name: 'address', description: 'The address of user' })
  @ApiQuery({ name: 'limit', description: 'The limit of transactions returned', required: false })
  async getFollowingTokensTransactions(
    @Param('address') address: string,
    @Query('limit') limit: number,
  ): Promise<Token[]> {
    return this.userService.getFollowingTokensTransactions(address, limit);
  }
}
