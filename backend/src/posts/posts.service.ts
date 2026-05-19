import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const postInclude = {
  author: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      settings: {
        select: {
          publicProfile: true,
        },
      },
    },
  },
  _count: {
    select: {
      comments: true,
      likes: true,
    },
  },
};

const hashtagPattern = /#[\p{L}\p{N}_-]+/gu;
const publicPostWhere = {
  OR: [
    {
      author: {
        settings: {
          is: null,
        },
      },
    },
    {
      author: {
        settings: {
          is: {
            publicProfile: true,
          },
        },
      },
    },
  ],
};
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

interface PaginationOptions {
  page?: number;
  limit?: number;
}

function normalizePagination({ page, limit }: PaginationOptions) {
  const safePage = Number.isFinite(page) && page && page > 0 ? Math.floor(page) : DEFAULT_PAGE;
  const safeLimit =
    Number.isFinite(limit) && limit && limit > 0
      ? Math.min(Math.floor(limit), MAX_LIMIT)
      : DEFAULT_LIMIT;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  create(authorId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId,
        content: dto.content,
        imageUrl: dto.imageUrl,
      },
      include: postInclude,
    });
  }

  async findAll(options: PaginationOptions = {}) {
    const { page, limit, skip } = normalizePagination(options);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where: publicPostWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: postInclude,
      }),
      this.prisma.post.count({ where: publicPostWhere }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findTrendingTags(limit = 5) {
    const posts = await this.prisma.post.findMany({
      where: publicPostWhere,
      select: {
        id: true,
        content: true,
      },
    });

    const tagCounts = new Map<string, number>();

    posts.forEach((post) => {
      const tags = new Set(
        [...post.content.matchAll(hashtagPattern)].map(([tag]) => tag.slice(1).toLowerCase()),
      );

      tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });

    return [...tagCounts.entries()]
      .map(([tag, postsCount]) => ({ tag, postsCount }))
      .sort((a, b) => b.postsCount - a.postsCount || a.tag.localeCompare(b.tag))
      .slice(0, limit);
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        ...postInclude,
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    return post;
  }

  async update(id: string, authorId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException('Only the post author can update this post.');
    }

    return this.prisma.post.update({
      where: { id },
      data: dto,
      include: postInclude,
    });
  }

  async remove(id: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException('Only the post author can delete this post.');
    }

    await this.prisma.post.delete({ where: { id } });

    return { deleted: true };
  }
}
