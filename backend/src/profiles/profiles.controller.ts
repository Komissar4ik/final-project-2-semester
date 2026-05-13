import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get profile by user id' })
  @ApiParam({ name: 'userId', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiOkResponse({ description: 'Profile with related user.' })
  findByUserId(@Param('userId') userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ description: 'Updated profile.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  updateMe(@Req() request: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateCurrentUserProfile(request.user.id, dto);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: 'uploads/avatars',
        filename: (_request, file, callback) => {
          const extension = extname(file.originalname) || '.jpg';
          callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
        },
      }),
      fileFilter: (_request, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Only image files are allowed.'), false);
          return;
        }

        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiOperation({ summary: 'Upload current user avatar' })
  @ApiOkResponse({ description: 'User with updated avatar URL.' })
  uploadAvatar(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Avatar file is required.');
    }

    return this.profilesService.updateAvatar(
      request.user.id,
      `/uploads/avatars/${file.filename}`,
    );
  }
}
