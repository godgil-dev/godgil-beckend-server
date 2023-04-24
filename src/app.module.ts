import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import type { ClientOpts } from 'redis';
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
import { JwtStrategy } from './modules/auth/strategys/jwt.strategy';
import { ProConDiscussionsHelperService } from './modules/pro-con-discussions-helper/pro-con-discussions-helper.service';
import { AppService } from './app.service';
import { ThrottlerBehindProxyGuard } from './shared/guards/throttler-behind-proxy.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SearchModule } from './modules/search/search.module';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      isGlobal: true,
    }),

    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 20,
    }),

    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    Logger,
    ThrottlerBehindProxyGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ProConDiscussionsHelperService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
