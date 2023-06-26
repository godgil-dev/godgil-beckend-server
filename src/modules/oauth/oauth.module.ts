import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [OauthService],
  imports: [PrismaModule],
  exports: [OauthService],
})
export class OauthModule {}
