import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';

import { AppModule } from '@app/app.module';
import { HttpExceptionFilter } from '@app/filters/http-exception.filter';

class App {
  private nestApp: NestExpressApplication;
  private configService: ConfigService;

  private prepareServer() {
    this.nestApp.setGlobalPrefix('api');
    this.nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));
    const { httpAdapter } = this.nestApp.get(HttpAdapterHost);
    this.nestApp.useGlobalFilters(new HttpExceptionFilter(httpAdapter));
    this.nestApp.use((req: Request, res: Response, next: NextFunction) => {
      Logger.log(
        `[${new Date().toDateString()}] - [${req.ip}] - \x1b[33m[${
          req.method
        }]:\x1b[0m ${req.url}`,
      );
      next();
    });
  }

  private prepareSwagger() {
    Logger.log('Creating a swagger documentation...');
    const config = new DocumentBuilder()
      .addSecurity('bearer', {
        type: 'http',
        scheme: 'bearer',
      })
      .setTitle('AppSick NestJS Backend')
      .setDescription('REST API')
      .setVersion('1.0')
      .build();
    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    };
    const document = SwaggerModule.createDocument(
      this.nestApp,
      config,
      options,
    );
    SwaggerModule.setup('docs', this.nestApp, document);
    Logger.log('Creating complete.');
  }

  private async bootstrap() {
    this.nestApp = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    this.configService = this.nestApp.get(ConfigService);
    if (!this.configService.get('production')) {
      this.prepareSwagger();
    }
    this.prepareServer();
  }

  public startServer() {
    this.bootstrap()
      .then(async () => {
        Logger.log(
          `Starting server in ${
            this.configService.get('production') ? 'production' : 'development'
          } mode...`,
        );
        const port = this.configService.get<number>('port');
        await this.nestApp.listen(port);
        Logger.log(`🚀 Server running on http://localhost:${port}/api`);
      })
      .catch(async () => {
        Logger.error('Something went wrong!');
        if (this.nestApp) {
          await this.nestApp.close();
        }
        process.exit(1);
      });
  }
}

export default App;
