import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './types/authenticated-request';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register with email and password' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setAuthCookie(response, result.accessToken);

    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookie(response, result.accessToken);

    return result;
  }

  @Post('oauth/callback')
  @ApiOperation({
    summary: 'Educational OAuth/OpenID Connect callback',
    description:
      'Accepts normalized external provider profile data, creates or updates a local user, and issues an internal JWT session.',
  })
  @ApiBody({ type: OAuthCallbackDto })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async oauthCallback(
    @Body() dto: OAuthCallbackDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.loginWithOAuth(dto);
    this.setAuthCookie(response, result.accessToken);

    return result;
  }

  @Get('google')
  @Redirect()
  @ApiOperation({ summary: 'Redirect to Google OAuth' })
  redirectToGoogle() {
    return {
      url: this.authService.getAuthorizationUrl('google'),
      statusCode: 302,
    };
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  googleCallback(
    @Query('code') code: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.handleProviderCallback('google', code, response);
  }

  @Get('github')
  @Redirect()
  @ApiOperation({ summary: 'Redirect to GitHub OAuth' })
  redirectToGithub() {
    return {
      url: this.authService.getAuthorizationUrl('github'),
      statusCode: 302,
    };
  }

  @Get('github/callback')
  @ApiOperation({ summary: 'Handle GitHub OAuth callback' })
  githubCallback(
    @Query('code') code: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.handleProviderCallback('github', code, response);
  }

  @Get('yandex')
  @Redirect()
  @ApiOperation({ summary: 'Redirect to Yandex OAuth' })
  redirectToYandex() {
    return {
      url: this.authService.getAuthorizationUrl('yandex'),
      statusCode: 302,
    };
  }

  @Get('yandex/callback')
  @ApiOperation({ summary: 'Handle Yandex OAuth callback' })
  yandexCallback(
    @Query('code') code: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.handleProviderCallback('yandex', code, response);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear the internal auth cookie' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', this.getAuthCookieOptions());
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ description: 'Current user with profile.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.getCurrentUser(request.user.id);
  }

  private setAuthCookie(response: Response, accessToken: string) {
    response.cookie('access_token', accessToken, {
      ...this.getAuthCookieOptions(),
      maxAge: this.authService.getCookieMaxAge(),
    });
  }

  private getAuthCookieOptions(): CookieOptions {
    const secureCookie = this.configService.get<string>('AUTH_COOKIE_SECURE');
    const secure = secureCookie ? secureCookie === 'true' : process.env.NODE_ENV === 'production';
    const sameSite =
      this.configService.get<CookieOptions['sameSite']>('AUTH_COOKIE_SAME_SITE') ??
      (secure ? 'none' : 'lax');

    return {
      httpOnly: true,
      sameSite,
      secure,
      path: '/',
    };
  }

  private getFrontendRedirectUrl(path: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    return `${frontendUrl}${path}`;
  }

  private async handleProviderCallback(
    provider: 'google' | 'github' | 'yandex',
    code: string | undefined,
    response: Response,
  ) {
    if (!code) {
      return response.redirect(this.getFrontendRedirectUrl('/auth?error=oauth_missing_code'));
    }

    try {
      const result = await this.authService.loginWithAuthorizationCode(provider, code);
      this.setAuthCookie(response, result.accessToken);

      return response.redirect(this.getFrontendRedirectUrl('/app/feed'));
    } catch {
      return response.redirect(this.getFrontendRedirectUrl('/auth?error=oauth_failed'));
    }
  }
}
