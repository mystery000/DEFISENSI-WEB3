import { IsEnum, IsString } from 'class-validator';

export class FindOneParams {
  @IsString()
  address: string;
}
