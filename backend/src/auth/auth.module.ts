import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '7d');
        const expiresInSeconds = expiresIn.endsWith('d')
          ? Number.parseInt(expiresIn, 10) * 24 * 60 * 60
          : Number.parseInt(expiresIn, 10);

        return {
          secret: configService.get<string>('JWT_SECRET', 'change-me-in-development'),
          signOptions: {
            expiresIn: Number.isFinite(expiresInSeconds)
              ? expiresInSeconds
              : 7 * 24 * 60 * 60,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
