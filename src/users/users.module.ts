import { Module } from '@nestjs/common';

import { UsersController } from '@app/users/users.controller';
import { UsersService } from '@app/users/users.service';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
