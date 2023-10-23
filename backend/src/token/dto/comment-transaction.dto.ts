import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { NetworkType } from '../../utils/enums/network.enum';

export class CommentTransactionDto {
  @ApiProperty({ description: 'The address of the author' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'The content of the comment' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'The id of the transaction' })
  @IsNotEmpty()
  @IsString()
  transactionId: string;
}
