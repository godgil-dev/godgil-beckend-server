import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
// import { winstonLogger } from './utils/winston.util';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ThrottlerBehindProxyGuard } from './shared/guards/throttler-behind-proxy.guard';
import { setupSwagger } from './utils/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  // Express 인스턴스에서 'trust proxy' 설정
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    exposedHeaders: ['Authorization'],
  });
  app.use(cookieParser());
  app.useGlobalGuards(app.get(ThrottlerBehindProxyGuard));

  //swagger
  setupSwagger(app);

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
