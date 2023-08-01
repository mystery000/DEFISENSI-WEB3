import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { NetworkType } from '../../utils/enums/network.enum';

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
}
