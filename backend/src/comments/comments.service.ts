import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const commentInclude = {
  author: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  _count: {
    select: {
      likes: true,
    },
  },
};

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    return this.prisma.comment.create({
      data: {
        postId,
        authorId,
        content: dto.content,
      },
      include: commentInclude,
    });
  }

  async findByPost(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: commentInclude,
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { post: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment was not found.');
    }

    const canDelete = comment.authorId === userId || comment.post.authorId === userId;

    if (!canDelete) {
      throw new ForbiddenException('Only the comment author or post author can delete this comment.');
    }

    await this.prisma.comment.delete({ where: { id } });

    return { deleted: true };
  }

  async like(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment was not found.');
    }

    return this.prisma.commentLike.upsert({
      where: {
        commentId_userId: {
          commentId: id,
          userId,
        },
      },
      update: {},
      create: {
        commentId: id,
        userId,
      },
    });
  }

  async unlike(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment was not found.');
    }

    await this.prisma.commentLike.deleteMany({
      where: {
        commentId: id,
        userId,
      },
    });

    return { liked: false };
  }
}
