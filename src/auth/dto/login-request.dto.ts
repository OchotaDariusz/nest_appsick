import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'User email',
    minimum: 4,
    default: 'user@mail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MinLength(4)
  email: string;

  @ApiProperty({
    description: 'User password',
    minimum: 8,
    default: '$2b$10$mg7KG9fSZaHbOU0EZzSYk.I20qiYB/AAbSOtb37kODVTXWQVLEmCm',
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
