import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { NetworkType } from '../../utils/enums/network.enum';

export class CreateTokenDto {
  @ApiProperty({ description: 'The address of the token' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'The network of the token' })
  @IsEnum(NetworkType)
  network: string;
}
