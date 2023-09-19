import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TokenService } from './token.service';
import { Token } from './schemas/token.schema';
import { ExchangePrice } from 'src/utils/types';
import { FollowTokenDto } from './dto/follow.dto';
import { User } from '../user/schemas/user.schema';
import { CommentTokenDto } from './dto/comment.dto';
import { CreateTokenDto } from './dto/create-token.dto';
import { FindOneParams } from './dto/find-one-params.dto';
import { Comment } from '../comment/schema/comment.schema';
import { SuccessResponse } from '../utils/dtos/success-response';

@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new token.' })
  @ApiCreatedResponse({
    type: Token,
    description: 'The token has been successfully created.',
  })
  create(@Body() createTokenDto: CreateTokenDto): Promise<Token> {
    return this.tokenService.create(createTokenDto);
  }

  @Post('follow')
  @ApiOperation({ summary: 'Follow token' })
  @ApiOkResponse({ type: SuccessResponse })
  followToken(@Body() followTokenDto: FollowTokenDto): Promise<SuccessResponse> {
    return this.tokenService.follow(followTokenDto);
  }

  @Post('cancel-follow')
  @ApiOperation({ summary: 'Cancel follow token' })
  @ApiOkResponse({ type: SuccessResponse })
  cancelFollow(@Body() followTokenDto: FollowTokenDto): Promise<SuccessResponse> {
    return this.tokenService.cancelFollow(followTokenDto);
  }

  @Post('like')
  @ApiOperation({ summary: 'Follow wallet' })
  @ApiOkResponse({ type: SuccessResponse })
  likeWallet(@Body() likeDto: FollowTokenDto): Promise<SuccessResponse> {
    return this.tokenService.like(likeDto);
  }

  @Post('dislike')
  @ApiOperation({ summary: 'Follow wallet' })
  @ApiOkResponse({ type: SuccessResponse })
  dislikeWallet(@Body() dislikeDto: FollowTokenDto): Promise<SuccessResponse> {
    return this.tokenService.dislike(dislikeDto);
  }

  @Get('top/:network')
  @ApiOperation({ summary: 'Get the top ERC20 tokens' })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiQuery({
    name: 'order',
    description:
      'Valid values: current_price_asc, current_price_desc, price_change_percentage_24h_asc, price_change_percentage_24h_desc\n\n Sort results by field',
    required: false,
  })
  getTopERC20Tokens(@Param('network') network: string, @Query('order') order: string) {
    return this.tokenService.getTopERC20Tokens(network, order);
  }

  @Get('top/:network/:id')
  @ApiOperation({ summary: 'Get current data (name, price, platforms...) for a ERC0 token' })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'id', description: 'pass the coin id (can be obtained from /coins) eg. bitcoin' })
  getTokenAddress(@Param('network') network: string, @Param('id') id: string) {
    return this.tokenService.getTokenAddress(network, id);
  }

  @Get('/:network/:address')
  @ApiOperation({ summary: 'Get token' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'address', description: 'The token address' })
  get(@Param() dto: FindOneParams): Promise<Token> {
    return this.tokenService.get(dto);
  }

  @Get('followers/:network/:address')
  @ApiOperation({ summary: 'Get followers of this token' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'address', description: 'Get followers for token' })
  getFollowers(@Param() dto: FindOneParams): Promise<User[]> {
    return this.tokenService.getFollowers(dto);
  }

  @Get('followings/:network/:address')
  @ApiOperation({ summary: 'Get followings of this token' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'address', description: 'Get followers for token' })
  getFollowings(@Param() dto: FindOneParams): Promise<User[]> {
    return this.tokenService.getFollowings(dto);
  }

  @Post('comment')
  @ApiOperation({ summary: 'Write comment on this token' })
  @ApiOkResponse({ type: SuccessResponse })
  postComment(@Body() coomentDto: CommentTokenDto): Promise<SuccessResponse> {
    return this.tokenService.comment(coomentDto);
  }

  @Get('comments/:network/:address')
  @ApiOperation({ summary: 'Get comments of this token' })
  @ApiOkResponse({ type: Comment, isArray: true })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'address', description: 'Get followers for token' })
  getComments(@Param() query: FindOneParams): Promise<Comment[]> {
    return this.tokenService.getComments(query);
  }

  @Get('/:network/:address/transactions')
  @ApiOperation({ summary: 'Get transactions of this token contract' })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'address', description: 'The token address' })
  @ApiQuery({ name: 'limit', description: 'Limit of transactions returned', required: false })
  getTokenTransactions(
    @Param('network') network: string,
    @Param('address') address: string,
    @Query('limit') limit: number,
  ) {
    return this.tokenService.getTransactions(network, address, limit);
  }

  @Get(':network/:address/price/history')
  @ApiOperation({ summary: 'Get price history of ERC20 token contract' })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'address', description: 'The contract address of this token' })
  getHistoricalPrice(@Param('network') network: string, @Param('address') address: string) {
    return this.tokenService.getPriceHistory(network, address);
  }

  @Get('/:network/:address/price/exchanges')
  @ApiOperation({ summary: 'Get price of this token from various exchanges' })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'address', description: 'Token contract address' })
  getPriceFromExchanges(@Param('network') network: string, @Param('address') address: string): Promise<ExchangePrice> {
    return this.tokenService.getTokenPriceFromExchanges(network, address);
  }
}
