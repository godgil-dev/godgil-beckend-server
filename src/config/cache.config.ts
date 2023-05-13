import { CacheModuleOptions } from '@nestjs/cache-manager';
import { registerAs } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export default registerAs(
  'cache',
  (): CacheModuleOptions => ({
    store: redisStore,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    isGlobal: true,
  }),
);
