import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
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
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Create a post' })
  @ApiCreatedResponse({ description: 'Created post with author and counters.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreatePostDto) {
    return this.postsService.create(request.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get posts feed' })
  @ApiOkResponse({ description: 'Posts ordered from newest to oldest.' })
  findAll() {
    return this.postsService.findAll();
  }

  @Get('trending-tags')
  @ApiOperation({ summary: 'Get most used hashtags in posts' })
  @ApiOkResponse({ description: 'Top hashtags ordered by post count.' })
  findTrendingTags() {
    return this.postsService.findTrendingTags();
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'uploads/posts',
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
        fileSize: 8 * 1024 * 1024,
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
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['image'],
    },
  })
  @ApiOperation({ summary: 'Upload an image for a post' })
  @ApiOkResponse({ description: 'Public image URL.' })
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    return { imageUrl: `/uploads/posts/${file.filename}` };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  @ApiParam({ name: 'id', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiOkResponse({ description: 'Post with author, counters and comments.' })
  findById(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update own post' })
  @ApiParam({ name: 'id', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiOkResponse({ description: 'Updated post.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Only the author can update this post.' })
  update(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, request.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Delete own post' })
  @ApiParam({ name: 'id', example: '51f4d7c4-7d2a-4f9c-9f17-965b51d671d6' })
  @ApiOkResponse({ description: 'Delete result.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Only the author can delete this post.' })
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.postsService.remove(id, request.user.id);
  }
}
