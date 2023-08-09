import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TokenService } from './token.service';
import { Token } from './schemas/token.schema';
import { FollowTokenDto } from './dto/follow.dto';
import { User } from '../user/schemas/user.schema';
import { CommentTokenDto } from './dto/comment.dto';
import { CreateTokenDto } from './dto/create-token.dto';
import { FindOneParams } from './dto/find-one-params.dto';
import { Comment } from '../comment/schema/comment.schema';
import { SuccessResponse } from '../utils/dtos/success-response';
import { ApiTransaction, Transaction } from 'src/utils/types';

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
}
