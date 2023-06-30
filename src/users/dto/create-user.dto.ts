import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email',
    minimum: 4,
    default: 'user@mail.com',
  })
  @IsNotEmpty()
  @IsEmail()
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

  @ApiProperty({
    description: 'User first name',
    minimum: 3,
    default: 'John',
  })
  @IsNotEmpty()
  @MinLength(3)
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    minimum: 3,
    default: 'Doe',
  })
  @IsNotEmpty()
  @MinLength(3)
  lastName: string;

  @ApiProperty({
    description: 'User date of birth',
    minimum: 4,
    type: Date || String,
    default: new Date('1990-01-01'),
  })
  @IsNotEmpty()
  @MinLength(4)
  dateOfBirth: Date | string;

  @ApiProperty({
    description: 'User sex',
    minimum: 8,
    default: 'MALE',
  })
  @IsNotEmpty()
  @MinLength(4)
  sex: string;
}
