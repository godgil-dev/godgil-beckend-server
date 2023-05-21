import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => ({
  ttl: 60,
  limit: 40,
}));
