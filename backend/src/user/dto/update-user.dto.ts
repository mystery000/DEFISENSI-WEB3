import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The email of the user',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The tg_id of the user',
  })
  @IsOptional()
  @IsString()
  readonly tg_id: string;
}
