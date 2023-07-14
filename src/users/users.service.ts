import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@app/prisma/prisma.service';
import { Role } from '@app/auth/roles';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(userData: Prisma.UserCreateInput): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hashedPassword = await this.encryptPassword(userData.password);
    return this.prisma.user.create({
      data: {
        ...userData,
        dateOfBirth: new Date(userData.dateOfBirth),
        password: hashedPassword,
        roles: [Role.USER],
        isActive: false,
      },
    });
  }

  private async encryptPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async updateUser(
    userId: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    const userToUpdate = await this.findUserById(userId);
    if (!userToUpdate) {
      throw new NotFoundException('User not found.');
    }

    const { ...updateDetails } = data;
    if ('email' in userToUpdate && userToUpdate.email === data.email) {
      delete updateDetails.email;
    } else if ('email' in updateDetails) {
      const emailExists = await this.prisma.user.findUnique({
        where: {
          email: updateDetails.email as string,
        },
      });
      if (emailExists) {
        throw new ConflictException('Email already exists.');
      }
    }

    if (
      'dateOfBirth' in updateDetails &&
      typeof updateDetails.dateOfBirth === 'string'
    ) {
      updateDetails.dateOfBirth = new Date(updateDetails.dateOfBirth as string);
    }

    if ('password' in updateDetails) {
      updateDetails.password = await this.encryptPassword(
        updateDetails.password as string,
      );
    }

    return this.prisma.user.update({
      data: {
        ...updateDetails,
      },
      where: { id: userId },
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async findUserById(uuid: string) {
    return this.prisma.user.findUnique({
      where: { id: uuid },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
