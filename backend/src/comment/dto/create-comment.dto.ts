import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'The userId of the author' })
  userId: string;

  @ApiProperty({ description: 'The description of the comment' })
  @IsString()
  content: string;
}
