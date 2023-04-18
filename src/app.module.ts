import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import type { ClientOpts } from 'redis';
import { APP_GUARD } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BookDiscussionsModule } from './modules/book-discussions/book-discussions.module';
import { ProConDiscussionsModule } from './modules/pro-con-discussions/pro-con-discussions.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PostLikesModule } from './modules/post-likes/post-likes.module';
import { AdminModule } from './admin/admin.module';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { LoggerMiddleware } from './shared/middlewares/logger.middleware';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CommentsModule,
    BookDiscussionsModule,
    ProConDiscussionsModule,
    PostLikesModule,
    AdminModule,
    CacheModule.register<ClientOpts>({
      store: redisStore,

      // Store-specific configuration:
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
