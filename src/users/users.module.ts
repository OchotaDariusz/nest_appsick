import { Module } from '@nestjs/common';

import { UsersController } from '@app/users/users.controller';
import { UsersService } from '@app/users/users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
