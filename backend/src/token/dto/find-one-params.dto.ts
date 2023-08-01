import { IsEnum, IsString } from 'class-validator';

import { NetworkType } from '../../utils/enums/network.enum';

export class FindOneParams {
  @IsString()
  address: string;

  @IsEnum(NetworkType)
  network: string;
}
