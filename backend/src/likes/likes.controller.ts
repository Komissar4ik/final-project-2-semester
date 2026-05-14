import { Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
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
import { LikesService } from './likes.service';

@ApiTags('likes')
@Controller('posts/:postId/likes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'postId', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiCreatedResponse({ description: 'Created or existing like.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  like(@Param('postId') postId: string, @Req() request: AuthenticatedRequest) {
    return this.likesService.like(postId, request.user.id);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove like from a post' })
  @ApiParam({ name: 'postId', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiOkResponse({ description: 'Remove-like result.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  unlike(@Param('postId') postId: string, @Req() request: AuthenticatedRequest) {
    return this.likesService.unlike(postId, request.user.id);
  }
}
