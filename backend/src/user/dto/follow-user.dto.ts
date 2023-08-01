import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class FollowUserDto {
  @ApiProperty({
    description: 'The wallet address of the user',
  })
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  userToFollowAddress: string;
}

export class UnFollowUserDto {
  @ApiProperty({
    description: 'The wallet address of the user',
  })
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  userToUnFollowAddress: string;
}
