import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { AuthService } from '@app/auth/auth.service';
import { CreateUserDto } from '@app/users/dto';
import { JwtAuthGuard } from '@app/auth/guards';
import { LoginRequestDto } from '@app/auth/dto';
import { User } from '@prisma/client';
import { AuthEntity } from '@app/auth/entity';

@ApiTags('auth')
@ApiSecurity('bearer')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() user: CreateUserDto): Promise<User> {
    return this.authService.register(user);
  }

  @Post('/login')
  async login(@Body() loginRequest: LoginRequestDto): Promise<AuthEntity> {
    return this.authService.login(loginRequest);
  }

  @Post('/logout')
  async logout(): Promise<AuthEntity> {
    return { accessToken: null };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/current')
  async getCurrentUser(@Request() req): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = req.user;
    return user;
  }
}
