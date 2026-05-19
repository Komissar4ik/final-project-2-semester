import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, type User } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { OAuthCallbackDto, OAuthProviderDto } from './dto/oauth-callback.dto';
import { RegisterDto } from './dto/register.dto';

const scrypt = promisify(scryptCallback);

type OAuthProviderKey = 'google' | 'github' | 'yandex';

type OAuthProviderConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

type NormalizedOAuthProfile = {
  provider: Exclude<AuthProvider, 'LOCAL'>;
  providerUserId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

type GithubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GithubUserInfo = {
  id: number;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string;
};

type GithubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
};

type YandexTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type YandexUserInfo = {
  id: string;
  login: string;
  default_email?: string;
  real_name?: string;
  display_name?: string;
  default_avatar_id?: string;
};

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
    const existingProviderUser = await this.prisma.user.findUnique({
      where: {
        provider_providerUserId: {
          provider: dto.provider,
          providerUserId: dto.providerUserId,
        },
      },
    });

    if (existingProviderUser) {
      const user = await this.prisma.user.update({
        where: { id: existingProviderUser.id },
        data: {
          email: dto.email,
          displayName: dto.displayName,
          avatarUrl: dto.avatarUrl,
        },
      });

      return {
        user: this.toAuthUser(user),
        accessToken: await this.signAccessToken(user),
      };
    }

    const existingEmailUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (existingEmailUser) {
      const user = await this.prisma.user.update({
        where: { id: existingEmailUser.id },
        data: {
          displayName: dto.displayName,
          provider: dto.provider,
          providerUserId: dto.providerUserId,
          avatarUrl: dto.avatarUrl,
          profile: existingEmailUser.profile
            ? undefined
            : {
                create: {},
              },
        },
        include: { profile: true },
      });

      return {
        user: this.toAuthUser(user),
        accessToken: await this.signAccessToken(user),
      };
    }

    const user = await this.prisma.user.create({
      data: {
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

  getAuthorizationUrl(provider: OAuthProviderKey) {
    const config = this.getOAuthProviderConfig(provider);

    if (provider === 'google') {
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('redirect_uri', config.callbackUrl);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'openid email profile');
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'select_account');

      return url.toString();
    }

    if (provider === 'github') {
      const url = new URL('https://github.com/login/oauth/authorize');
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('redirect_uri', config.callbackUrl);
      url.searchParams.set('scope', 'read:user user:email');

      return url.toString();
    }

    const url = new URL('https://oauth.yandex.ru/authorize');
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', config.callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'login:email login:info');

    return url.toString();
  }

  async loginWithAuthorizationCode(provider: OAuthProviderKey, code: string) {
    const profile = await this.fetchOAuthProfile(provider, code);

    return this.loginWithOAuth({
      provider: profile.provider as OAuthProviderDto,
      providerUserId: profile.providerUserId,
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    });
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

  private getOAuthProviderConfig(provider: OAuthProviderKey): OAuthProviderConfig {
    const prefix = provider.toUpperCase();
    const clientId = this.configService.get<string>(`${prefix}_CLIENT_ID`);
    const clientSecret = this.configService.get<string>(`${prefix}_CLIENT_SECRET`);
    const callbackUrl = this.configService.get<string>(`${prefix}_CALLBACK_URL`);

    if (!clientId || !clientSecret || !callbackUrl) {
      throw new BadRequestException(`OAuth provider ${provider} is not configured.`);
    }

    return { clientId, clientSecret, callbackUrl };
  }

  private async fetchOAuthProfile(provider: OAuthProviderKey, code: string) {
    if (provider === 'google') {
      return this.fetchGoogleProfile(code);
    }

    if (provider === 'github') {
      return this.fetchGithubProfile(code);
    }

    return this.fetchYandexProfile(code);
  }

  private async fetchGoogleProfile(code: string): Promise<NormalizedOAuthProfile> {
    const config = this.getOAuthProviderConfig('google');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    const tokenBody = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenBody.access_token) {
      throw new UnauthorizedException(tokenBody.error_description ?? 'Google OAuth failed.');
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    const profile = (await profileResponse.json()) as GoogleUserInfo;

    if (!profileResponse.ok || !profile.sub || !profile.email) {
      throw new UnauthorizedException('Google profile does not contain required data.');
    }

    return {
      provider: AuthProvider.GOOGLE,
      providerUserId: profile.sub,
      email: profile.email,
      displayName: profile.name ?? profile.email,
      avatarUrl: profile.picture,
    };
  }

  private async fetchGithubProfile(code: string): Promise<NormalizedOAuthProfile> {
    const config = this.getOAuthProviderConfig('github');
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callbackUrl,
      }),
    });
    const tokenBody = (await tokenResponse.json()) as GithubTokenResponse;

    if (!tokenResponse.ok || !tokenBody.access_token) {
      throw new UnauthorizedException(tokenBody.error_description ?? 'GitHub OAuth failed.');
    }

    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${tokenBody.access_token}`,
      },
    });
    const profile = (await profileResponse.json()) as GithubUserInfo;

    if (!profileResponse.ok || !profile.id) {
      throw new UnauthorizedException('GitHub profile does not contain required data.');
    }

    const email = profile.email ?? (await this.fetchGithubPrimaryEmail(tokenBody.access_token));

    return {
      provider: AuthProvider.GITHUB,
      providerUserId: String(profile.id),
      email: email ?? `${profile.id}+${profile.login}@users.noreply.github.com`,
      displayName: profile.name ?? profile.login,
      avatarUrl: profile.avatar_url,
    };
  }

  private async fetchGithubPrimaryEmail(accessToken: string) {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const emails = (await response.json()) as GithubEmail[];
    return emails.find((item) => item.primary && item.verified)?.email ?? emails[0]?.email;
  }

  private async fetchYandexProfile(code: string): Promise<NormalizedOAuthProfile> {
    const config = this.getOAuthProviderConfig('yandex');
    const tokenResponse = await fetch('https://oauth.yandex.ru/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    const tokenBody = (await tokenResponse.json()) as YandexTokenResponse;

    if (!tokenResponse.ok || !tokenBody.access_token) {
      throw new UnauthorizedException(tokenBody.error_description ?? 'Yandex OAuth failed.');
    }

    const profileResponse = await fetch('https://login.yandex.ru/info?format=json', {
      headers: { Authorization: `OAuth ${tokenBody.access_token}` },
    });
    const profile = (await profileResponse.json()) as YandexUserInfo;

    if (!profileResponse.ok || !profile.id || !profile.default_email) {
      throw new UnauthorizedException('Yandex profile does not contain required data.');
    }

    return {
      provider: AuthProvider.YANDEX,
      providerUserId: profile.id,
      email: profile.default_email,
      displayName: profile.real_name ?? profile.display_name ?? profile.login,
      avatarUrl: profile.default_avatar_id
        ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
        : undefined,
    };
  }

  getCookieMaxAge() {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const days = Number.parseInt(expiresIn, 10);

    return Number.isFinite(days) ? days * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  }
}
