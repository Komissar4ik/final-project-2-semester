import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [FollowsController],
  providers: [FollowsService],
})
export class FollowsModule {}
