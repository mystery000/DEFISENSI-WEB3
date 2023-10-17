import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { NftService } from './nft.service';
import { Nft } from './schemas/nft.schema';
import { FollowNftDto } from './dto/follow.dto';
import { CommentNftDto } from './dto/comment.dto';
import { User } from '../user/schemas/user.schema';
import { CreateNftDto } from './dto/create-nft.dto';
import { FindOneParams } from './dto/find-one-params.dto';
import { Comment } from '../comment/schema/comment.schema';
import { SuccessResponse } from '../utils/dtos/success-response';

@ApiTags('NFT')
@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new nft.' })
  @ApiCreatedResponse({
    type: Nft,
    description: 'The nft has been successfully created.',
  })
  create(@Body() createNftDto: CreateNftDto): Promise<Nft> {
    return this.nftService.create(createNftDto);
  }

  @Post('follow')
  @ApiOperation({ summary: 'Follow token' })
  @ApiOkResponse({ type: SuccessResponse })
  followToken(@Body() followNftDto: FollowNftDto): Promise<SuccessResponse> {
    return this.nftService.follow(followNftDto);
  }

  @Post('follow')
  @ApiOperation({ summary: 'Follow nft' })
  @ApiOkResponse({ type: SuccessResponse })
  followNft(@Body() followNftDto: FollowNftDto): Promise<SuccessResponse> {
    return this.nftService.follow(followNftDto);
  }

  @Post('cancel-follow')
  @ApiOperation({ summary: 'Cancel follow nft' })
  @ApiOkResponse({ type: SuccessResponse })
  cancelFollowNft(@Body() followNftDto: FollowNftDto): Promise<SuccessResponse> {
    return this.nftService.cancelFollow(followNftDto);
  }

  @Post('like')
  @ApiOperation({ summary: 'Follow wallet' })
  @ApiOkResponse({ type: SuccessResponse })
  likeWallet(@Body() likeDto: FollowNftDto): Promise<SuccessResponse> {
    return this.nftService.like(likeDto);
  }

  @Post('dislike')
  @ApiOperation({ summary: 'Follow wallet' })
  @ApiOkResponse({ type: SuccessResponse })
  dislikeWallet(@Body() dislikeDto: FollowNftDto): Promise<SuccessResponse> {
    return this.nftService.dislike(dislikeDto);
  }

  @Get('top-nfts/:network')
  @ApiOperation({ summary: 'Get the top NFTs' })
  @ApiParam({ name: 'network', description: 'Name of network issuing tokens' })
  getTopNFTs(@Param('network') network: string) {
    return this.nftService.getTopNFTs(network);
  }

  @Get('/:network/:address')
  @ApiOperation({ summary: 'Get NFTs for a given contract address' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiParam({ name: 'network', description: 'The nft network' })
  @ApiParam({ name: 'address', description: 'The nft address' })
  get(@Param() dto: FindOneParams): Promise<Nft> {
    return this.nftService.get(dto);
  }

  @Get('followings/:network/:address')
  @ApiOperation({ summary: 'Get followings of this token' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'address', description: 'Get followers for token' })
  getFollowings(@Param() dto: FindOneParams): Promise<User[]> {
    return this.nftService.getFollowings(dto);
  }

  @Get('followers/:network/:address')
  @ApiOperation({ summary: 'Get followers of this nft' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiParam({ name: 'network', description: 'The nft network' })
  @ApiParam({ name: 'address', description: 'Get followers for nft' })
  getFollowers(@Param() dto: FindOneParams): Promise<User[]> {
    return this.nftService.getFollowers(dto);
  }

  @Post('comment')
  @ApiOperation({ summary: 'Write comment on this nft' })
  @ApiOkResponse({ type: SuccessResponse })
  postComment(@Body() commentDto: CommentNftDto): Promise<SuccessResponse> {
    return this.nftService.comment(commentDto);
  }

  @Get('comments/:network/:address')
  @ApiOperation({ summary: 'Get comments of this nft' })
  @ApiOkResponse({ type: Comment, isArray: true })
  @ApiParam({ name: 'network', description: 'The network of nft' })
  @ApiParam({ name: 'address', description: 'The address of nft' })
  getComments(@Param() query: FindOneParams): Promise<Comment[]> {
    return this.nftService.getComments(query);
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
    return this.nftService.getTransactions(network, address, limit);
  }

  @Get('/:network/:address/sale-volumes')
  @ApiOperation({ summary: 'Get sales volume history of NFT collection' })
  @ApiParam({ name: 'network', description: 'The token network' })
  @ApiParam({ name: 'address', description: 'The token address' })
  getSalesVolumes(@Param('network') network: string, @Param('address') address: string) {
    return this.nftService.getSalesVolumes(address, network);
  }
}
