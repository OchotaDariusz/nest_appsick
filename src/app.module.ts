import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import configuration from '@app/config/configuration';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UsersModule } from '@app/users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
