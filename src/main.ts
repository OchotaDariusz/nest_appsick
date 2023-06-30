import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';

import { AppModule } from '@app/app.module';
import { HttpExceptionFilter } from '@app/filters/http-exception.filter';
import { PrismaService } from '@app/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.use((req: Request, res: Response, next: NextFunction) => {
    Logger.log(
      `[${new Date().toDateString()}] - [${req.ip}] - \x1b[33m[${
        req.method
      }]:\x1b[0m ${req.url}`,
    );
    next();
  });

  const configService = app.get(ConfigService);
  Logger.log(
    `Starting server in ${
      configService.get('production') ? 'production' : 'development'
    } mode...`,
  );

  const port = configService.get<number>('port');
  await app.listen(port);
  Logger.log(`🚀 Server running on http://localhost:${port}/api`);
}

bootstrap();
