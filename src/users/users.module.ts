import { Module } from '@nestjs/common';

import { UsersService } from '@app/users/users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
