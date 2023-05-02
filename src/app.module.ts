import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BookDiscussionsModule } from './modules/book-discussions/book-discussions.module';
import { ProConDiscussionsModule } from './modules/pro-con-discussions/pro-con-discussions.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PostLikesModule } from './modules/post-likes/post-likes.module';
import { AdminModule } from './admin/admin.module';

// import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { JwtStrategy } from './modules/auth/strategys/jwt.strategy';
import { ProConDiscussionsHelperService } from './modules/pro-con-discussions-helper/pro-con-discussions-helper.service';
import { AppService } from './app.service';
import { ThrottlerBehindProxyGuard } from './shared/guards/throttler-behind-proxy.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SearchModule } from './modules/search/search.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SecurityModule } from './shared/security/security.module';
import { LoggerModule } from 'nestjs-pino';
import cacheConfig from './config/cache.config';
import throttlerConfig from './config/throttler.config';
import pinoConfig from './config/pino.config';
import { OptionalJwtAuthGuard } from './modules/auth/guards/optional-jwt-auth.guard';
import { ClientOpts } from 'redis';
import { ConfigModule } from '@nestjs/config';
import { RecommendationBooksModule } from './modules/recommendation-books/recommendation-books.module';
import { PaginationService } from './modules/pagination/pagination.service';
import * as redisStore from 'cache-manager-redis-store';
import { MypageModule } from './modules/mypage/mypage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cacheConfig, throttlerConfig, throttlerConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CommentsModule,
    BookDiscussionsModule,
    ProConDiscussionsModule,
    PostLikesModule,
    AdminModule,

    SecurityModule,
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
    ThrottlerModule.forRootAsync({
      useFactory: throttlerConfig,
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRootAsync({
      useFactory: pinoConfig,
    }),
    SearchModule,
    RecommendationBooksModule,
    MypageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    // Logger,
    ThrottlerBehindProxyGuard,
    {
      provide: APP_GUARD,
      useClass: OptionalJwtAuthGuard,
    },
    ProConDiscussionsHelperService,
    PaginationService,
  ],
})
export class AppModule {}
