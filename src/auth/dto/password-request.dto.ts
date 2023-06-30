import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class PasswordRequestDto {
  @ApiProperty({
    description: 'User password',
    minimum: 8,
    default: '$2b$10$mg7KG9fSZaHbOU0EZzSYk.I20qiYB/AAbSOtb37kODVTXWQVLEmCm',
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
