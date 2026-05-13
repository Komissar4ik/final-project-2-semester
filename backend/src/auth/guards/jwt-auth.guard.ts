import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthenticatedRequest, AuthenticatedUser } from '../types/authenticated-request';

type JwtPayload = AuthenticatedUser & {
  sub: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Authentication token is invalid.');
    }
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    const [scheme, bearerToken] = authHeader?.split(' ') ?? [];

    if (scheme === 'Bearer' && bearerToken) {
      return bearerToken;
    }

    return this.readCookie(request.headers.cookie, 'access_token');
  }

  private readCookie(cookieHeader: string | undefined, name: string) {
    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));

    return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
  }
}
