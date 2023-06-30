import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/client';

import { PrismaService } from '@app/prisma/prisma.service';

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

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
      },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    const userToUpdate = await this.prisma.user.findUnique({
      where: { id: where.id },
    });
    if (!userToUpdate) {
      throw new NotFoundException('User not found.');
    }

    const { ...updateDetails } = data;
    if (userToUpdate.email === data.email) {
      delete updateDetails.email;
    } else {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email as string },
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

    return this.prisma.user.update({
      data: {
        ...updateDetails,
      },
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
