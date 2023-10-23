import { ApiProperty } from '@nestjs/swagger';

import { NFTTransaction } from 'src/utils/types';
import { NetworkType } from '../../utils/enums/network.enum';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class FollowNftDto {
  @ApiProperty({ description: 'The address of the user' })
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
  network: string;

  @ApiProperty({ description: 'The transactions of the nft' })
  @IsArray()
  transactions: NFTTransaction[];
}
