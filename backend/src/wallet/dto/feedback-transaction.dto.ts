import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FeedbackTransactionDto {
  @ApiProperty({ description: 'The address of the user' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'The id of the transaction' })
  @IsNotEmpty()
  @IsString()
  transactionId: string;
}
