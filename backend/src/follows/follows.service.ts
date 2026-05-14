import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const followUserSelect = {
  id: true,
  displayName: true,
  avatarUrl: true,
  profile: {
    select: {
      bio: true,
      location: true,
    },
  },
};

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followingId: string, followerId: string) {
    if (followingId === followerId) {
      throw new BadRequestException('User cannot follow themselves.');
    }

    await this.ensureUserExists(followingId);

    return this.prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
      update: {},
      create: {
        followerId,
        followingId,
      },
    });
  }

  async unfollow(followingId: string, followerId: string) {
    if (followingId === followerId) {
      throw new BadRequestException('User cannot unfollow themselves.');
    }

    await this.ensureUserExists(followingId);

    await this.prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });

    return { following: false };
  }

  async getFollowers(userId: string) {
    await this.ensureUserExists(userId);

    const follows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: followUserSelect,
        },
      },
    });

    return follows.map((follow) => follow.follower);
  }

  async getFollowing(userId: string) {
    await this.ensureUserExists(userId);

    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: followUserSelect,
        },
      },
    });

    return follows.map((follow) => follow.following);
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User was not found.');
    }
  }
}
