import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { NetworkType } from '../../utils/enums/network.enum';

export class CreateNftDto {
  @ApiProperty({ description: 'The address of the nft' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'The network of the nft' })
  @IsEnum(NetworkType)
  network: string;
}
