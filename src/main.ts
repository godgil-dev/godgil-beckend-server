import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
// import { winstonLogger } from './utils/winston.util';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ThrottlerBehindProxyGuard } from './shared/guards/throttler-behind-proxy.guard';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Express 인스턴스에서 'trust proxy' 설정
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
        },
      },
    }),
  );
  app.enableCors({
    credentials: true,
    // origin: process.env.FRONTEND_URL,
  });
  app.use(cookieParser());
  app.useGlobalGuards(app.get(ThrottlerBehindProxyGuard));
  //swagger
  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .addBearerAuth()
    .addCookieAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
