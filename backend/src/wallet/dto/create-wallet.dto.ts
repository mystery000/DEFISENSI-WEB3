import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    description: 'The address of the wallet',
  })
  @IsString()
  address: string;
}
