import { Module } from '@nestjs/common';

import { UsersService } from '@app/users/users.service';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
