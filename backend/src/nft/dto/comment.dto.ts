import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { NetworkType } from '../../utils/enums/network.enum';

export class CommentNftDto {
  @ApiProperty({ description: 'The address of the author' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'The address of the nft' })
  @IsNotEmpty()
  @IsString()
  nftAddress: string;

  @ApiProperty({ description: 'The network of the nft' })
  @IsNotEmpty()
  @IsEnum(NetworkType)
  nftNetwork: string;

  @ApiProperty({ description: 'The content of the comment' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
