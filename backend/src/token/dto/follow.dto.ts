import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { TokenTransaction } from 'src/utils/types';
import { NetworkType } from '../../utils/enums/network.enum';

export class FollowTokenDto {
  @ApiProperty({ description: 'The address of the user' })
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
  network: string;

  @ApiProperty({ description: 'The transactions of the token' })
  @IsArray()
  transactions: TokenTransaction[];
}
