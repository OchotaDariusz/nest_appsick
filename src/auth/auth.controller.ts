import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { AuthService } from '@app/auth/auth.service';
import { JwtAuthGuard } from '@app/auth/guards';
import {
  UserRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
} from '@app/auth/dto';
import { User } from '@prisma/client';
import { AuthEntity } from '@app/auth/entity';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { PasswordRequestDto } from '@app/auth/dto/password-request.dto';

@ApiTags('auth')
@ApiSecurity('bearer')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerRequest: RegisterRequestDto): Promise<User> {
    return this.authService.register(registerRequest);
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

  @Post('/send-activation-link')
  async sendActivationLink(
    @Body() activationRequest: UserRequestDto,
  ): Promise<void> {
    const { email } = activationRequest;
    return await this.authService.sendActivationLink(email);
  }

  @Get('/activate/:token')
  async activateAccount(
    @Param('token') token: string,
  ): Promise<{ message: string }> {
    return this.authService.activateAccount(token);
  }

  @Post('/forgot-password')
  async forgotPassword(
    @Body() forgotPasswordRequest: UserRequestDto,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const { email } = forgotPasswordRequest;
    return await this.authService.sendPasswordResetLink(email);
  }

  @Post('/reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() passwordRequest: PasswordRequestDto,
  ): Promise<{ message: string }> {
    const { password } = passwordRequest;
    return this.authService.resetPassword(token, password);
  }
}
