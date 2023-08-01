import { IsEnum, IsString } from 'class-validator';
import { NetworkType } from 'src/utils/enums/network.enum';

export class FindOneParams {
  @IsString()
  address: string;
}
