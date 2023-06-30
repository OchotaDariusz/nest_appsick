import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserRequestDto {
  @ApiProperty({
    description: 'User email',
    minimum: 4,
    default: 'user@mail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MinLength(4)
  email: string;
}
