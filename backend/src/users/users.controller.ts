import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ description: 'Current user with profile and counters.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  me(@Req() request: AuthenticatedRequest) {
    return this.usersService.findMe(request.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a public user profile by user id' })
  @ApiParam({ name: 'id', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiOkResponse({ description: 'User with profile and counters.' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
