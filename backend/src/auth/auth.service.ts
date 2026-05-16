import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, type User } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { RegisterDto } from './dto/register.dto';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        displayName: dto.displayName,
        provider: AuthProvider.LOCAL,
        providerUserId: dto.email,
        passwordHash: await this.hashPassword(dto.password),
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

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await this.verifyPassword(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      user: this.toAuthUser(user),
      accessToken: await this.signAccessToken(user),
    };
  }

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

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(password: string, storedHash: string) {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const storedKey = Buffer.from(hash, 'hex');

    return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
  }

  getCookieMaxAge() {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const days = Number.parseInt(expiresIn, 10);

    return Number.isFinite(days) ? days * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  }
}
