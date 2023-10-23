import { ApiProperty } from '@nestjs/swagger';
import { WalletTransaction } from 'src/utils/types';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class FollowWalletDto {
  @ApiProperty({ description: 'The address of the user' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'The address of the wallet' })
  @IsNotEmpty()
  @IsString()
  walletAddress: string;

  @ApiProperty({ description: 'The transactions of the wallet' })
  @IsArray()
  transactions: WalletTransaction[];
}
