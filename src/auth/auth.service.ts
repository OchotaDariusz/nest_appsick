import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '@app/users/users.service';
import { CreateUserDto } from '@app/users/dto';
import { LoginRequestDto } from '@app/auth/dto';
import { AuthEntity } from '@app/auth/entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.user({ email });
    if (user && (await bcrypt.compare(pass, user.password))) {
      return { ...user };
    }
    return null;
  }

  async register(user: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(user);
  }

  async login(userCredentials: LoginRequestDto): Promise<AuthEntity> {
    const user = await this.usersService.user({ email: userCredentials.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(userCredentials.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
