import { Module } from '@nestjs/common';
import { MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { SecurityMiddleware } from '../middlewares/security.middleware';

@Module({})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
