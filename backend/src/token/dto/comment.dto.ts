import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { NetworkType } from '../../utils/enums/network.enum';

export class CommentTokenDto {
  @ApiProperty({ description: 'The address of the author' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'The address of the token' })
  @IsNotEmpty()
  @IsString()
  tokenAddress: string;

  @ApiProperty({ description: 'The network of the token' })
  @IsNotEmpty()
  @IsEnum(NetworkType)
  tokenNetwork: string;

  @ApiProperty({ description: 'The content of the comment' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
