import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

import { UsersService } from '@app/users/users.service';
import { LoginRequestDto, RegisterRequestDto } from '@app/auth/dto';
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

  async register(user: RegisterRequestDto): Promise<User> {
    const existingUser = await this.usersService.user({ email: user.email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    if (user.password !== user.passwordConfirmation) {
      throw new UnauthorizedException('Passwords do not match');
    }

    Logger.log(`user email: ${user.email}`);
    Logger.log(
      `activation token: ${this.jwtService.sign({ email: user.email })}`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirmation, ...restUserData } = user;
    const newUser = await this.usersService.createUser(restUserData);
    await this.sendActivationLink(user.email);
    return newUser;
  }

  async login(userCredentials: LoginRequestDto): Promise<AuthEntity> {
    const user = await this.usersService.user({ email: userCredentials.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(userCredentials.password, user.password))) {
      Logger.log(userCredentials);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Activate your account first.');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async sendActivationLink(email: string): Promise<any> {
    const user = await this.usersService.user({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isActive) {
      throw new UnauthorizedException('Account already activated');
    }
    const token = this.jwtService.sign({ email });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    Logger.log(`activation token: ${token}`);

    const link = `http://localhost:3000/api/auth/activate/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'AppSick - Account activation',
      text: `Click the link to activate your account: ${link}`,
      html: `<p>Click <a href='${link}'>here</a> to activate your account.</p>`,
    };

    return transporter.sendMail(mailOptions);
  }

  async activateAccount(token: string): Promise<{ message: string }> {
    try {
      const { email } = this.jwtService.verify(token);
      Logger.log(`email: ${email}`);
      const user = await this.usersService.user({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!user.isActive) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userDetails } = user;
        await this.usersService.updateUser({
          where: { email },
          data: { ...userDetails, isActive: true },
        });
        return { message: 'Account activated' };
      } else {
        return { message: 'Account already activated' };
      }
    } catch (_error) {
      if (_error instanceof NotFoundException) {
        throw new NotFoundException(_error.message);
      }
      Logger.log(_error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
