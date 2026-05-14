import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { FollowsService } from './follows.service';

@ApiTags('follows')
@Controller('users/:userId')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiParam({ name: 'userId', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiCreatedResponse({ description: 'Created or existing follow relation.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  @ApiBadRequestResponse({ description: 'User cannot follow themselves.' })
  follow(@Param('userId') userId: string, @Req() request: AuthenticatedRequest) {
    return this.followsService.follow(userId, request.user.id);
  }

  @Delete('follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiParam({ name: 'userId', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiOkResponse({ description: 'Unfollow result.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  @ApiBadRequestResponse({ description: 'User cannot unfollow themselves.' })
  unfollow(@Param('userId') userId: string, @Req() request: AuthenticatedRequest) {
    return this.followsService.unfollow(userId, request.user.id);
  }

  @Get('followers')
  @ApiOperation({ summary: 'Get user followers' })
  @ApiParam({ name: 'userId', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiOkResponse({ description: 'Users who follow the selected user.' })
  getFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get('following')
  @ApiOperation({ summary: 'Get users followed by selected user' })
  @ApiParam({ name: 'userId', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiOkResponse({ description: 'Users followed by the selected user.' })
  getFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId);
  }
}
