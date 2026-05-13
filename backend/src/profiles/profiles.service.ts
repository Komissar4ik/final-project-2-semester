import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile was not found.');
    }

    return profile;
  }

  async updateCurrentUserProfile(userId: string, dto: UpdateProfileDto) {
    const { displayName, birthDate, ...profileData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (displayName) {
        await tx.user.update({
          where: { id: userId },
          data: { displayName },
        });
      }

      return tx.profile.upsert({
        where: { userId },
        update: {
          ...profileData,
          birthDate: birthDate ? new Date(birthDate) : undefined,
        },
        create: {
          userId,
          ...profileData,
          birthDate: birthDate ? new Date(birthDate) : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              role: true,
              avatarUrl: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      include: { profile: true },
    });
  }
}
