import { registerAs } from '@nestjs/config';
import { pino } from 'pino';

export default registerAs('pino', () => ({
  pinoHttp: {
    logger: pino({
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          destination: './logs/app.log',
        },
      },
    }),
    autoLogging: true,
  },
}));
