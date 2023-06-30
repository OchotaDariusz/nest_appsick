import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

import { CreateUserDto } from '@app/users/dto';

export class RegisterRequestDto extends CreateUserDto {
  @ApiProperty({
    description: 'User password confirmation',
    minimum: 8,
    default: '$2b$10$mg7KG9fSZaHbOU0EZzSYk.I20qiYB/AAbSOtb37kODVTXWQVLEmCm',
  })
  @IsNotEmpty()
  @MinLength(8)
  passwordConfirmation: string;
}
