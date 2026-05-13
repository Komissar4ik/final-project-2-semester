import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
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
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './types/authenticated-request';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.authService.getCookieMaxAge(),
      path: '/',
    });

    return result;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear the internal auth cookie' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', { path: '/' });
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
}
