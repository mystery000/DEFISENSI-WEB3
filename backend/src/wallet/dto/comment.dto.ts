import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentWalletDto {
  @ApiProperty({ description: 'The id of the author' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'The address of the wallet' })
  @IsNotEmpty()
  @IsString()
  walletAddress: string;

  @ApiProperty({ description: 'The content of the comment' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
