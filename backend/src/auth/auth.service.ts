import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithOAuth(dto: OAuthCallbackDto) {
    const user = await this.prisma.user.upsert({
      where: {
        provider_providerUserId: {
          provider: dto.provider,
          providerUserId: dto.providerUserId,
        },
      },
      update: {
        email: dto.email,
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
      },
      create: {
        email: dto.email,
        displayName: dto.displayName,
        provider: dto.provider,
        providerUserId: dto.providerUserId,
        avatarUrl: dto.avatarUrl,
        profile: {
          create: {},
        },
      },
    });

    return {
      user: this.toAuthUser(user),
      accessToken: await this.signAccessToken(user),
    };
  }

  async getCurrentUser(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });
  }

  private signAccessToken(user: User) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private toAuthUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
  }

  getCookieMaxAge() {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const days = Number.parseInt(expiresIn, 10);

    return Number.isFinite(days) ? days * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  }
}
