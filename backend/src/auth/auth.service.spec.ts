import { AuthProvider } from '@prisma/client';
import { OAuthProviderDto } from './dto/oauth-callback.dto';
import { AuthService } from './auth.service';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const jwtMock = {
  signAsync: jest.fn(),
};

const configValues: Record<string, string> = {
  GOOGLE_CLIENT_ID: 'google-client',
  GOOGLE_CLIENT_SECRET: 'google-secret',
  GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/auth/google/callback',
  GITHUB_CLIENT_ID: 'github-client',
  GITHUB_CLIENT_SECRET: 'github-secret',
  GITHUB_CALLBACK_URL: 'http://localhost:3000/api/auth/github/callback',
  YANDEX_CLIENT_ID: 'yandex-client',
  YANDEX_CLIENT_SECRET: 'yandex-secret',
  YANDEX_CALLBACK_URL: 'http://localhost:3000/api/auth/yandex/callback',
  JWT_EXPIRES_IN: '7d',
};

const configMock = {
  get: jest.fn((key: string, fallback?: string) => configValues[key] ?? fallback),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prismaMock as never, jwtMock as never, configMock as never);
    jwtMock.signAsync.mockResolvedValue('signed.jwt');
  });

  it('builds a Google authorization URL from env config', () => {
    const url = new URL(service.getAuthorizationUrl('google'));

    expect(url.origin).toBe('https://accounts.google.com');
    expect(url.searchParams.get('client_id')).toBe('google-client');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/api/auth/google/callback',
    );
    expect(url.searchParams.get('scope')).toBe('openid email profile');
  });

  it('builds GitHub and Yandex authorization URLs from env config', () => {
    const githubUrl = new URL(service.getAuthorizationUrl('github'));
    const yandexUrl = new URL(service.getAuthorizationUrl('yandex'));

    expect(githubUrl.origin).toBe('https://github.com');
    expect(githubUrl.searchParams.get('scope')).toBe('read:user user:email');
    expect(yandexUrl.origin).toBe('https://oauth.yandex.ru');
    expect(yandexUrl.searchParams.get('scope')).toBe('login:email login:info');
  });

  it('throws when OAuth provider env config is missing', () => {
    configMock.get.mockImplementationOnce(() => undefined as unknown as string);

    expect(() => service.getAuthorizationUrl('google')).toThrow(
      'OAuth provider google is not configured.',
    );
  });

  it('creates a new OAuth user when provider identity is unknown', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'student@example.com',
      displayName: 'Student',
      role: 'USER',
    });

    await expect(
      service.loginWithOAuth({
        provider: OAuthProviderDto.GOOGLE,
        providerUserId: 'google-1',
        email: 'student@example.com',
        displayName: 'Student',
        avatarUrl: 'https://example.com/a.png',
      }),
    ).resolves.toEqual({
      user: {
        id: 'user-1',
        email: 'student@example.com',
        displayName: 'Student',
        role: 'USER',
      },
      accessToken: 'signed.jwt',
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          provider: AuthProvider.GOOGLE,
          providerUserId: 'google-1',
          profile: { create: {} },
        }),
      }),
    );
  });

  it('updates an existing user matched by email during OAuth login', async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'local-1',
        email: 'student@example.com',
        displayName: 'Old Name',
        role: 'USER',
        profile: null,
      });
    prismaMock.user.update.mockResolvedValue({
      id: 'local-1',
      email: 'student@example.com',
      displayName: 'Student',
      role: 'USER',
    });

    await service.loginWithOAuth({
      provider: OAuthProviderDto.GITHUB,
      providerUserId: 'github-1',
      email: 'student@example.com',
      displayName: 'Student',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'local-1' },
        data: expect.objectContaining({
          provider: AuthProvider.GITHUB,
          providerUserId: 'github-1',
          profile: { create: {} },
        }),
      }),
    );
  });

  it('converts JWT expiration days to cookie max age', () => {
    expect(service.getCookieMaxAge()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('uses seven days as a cookie max age fallback', () => {
    configMock.get.mockReturnValueOnce('bad-value');

    expect(service.getCookieMaxAge()).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
