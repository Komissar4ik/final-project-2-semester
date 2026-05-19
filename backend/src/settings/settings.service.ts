import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const defaultSettings = {
  theme: 'light',
  publicProfile: true,
};

const settingsSelect = {
  id: true,
  userId: true,
  theme: true,
  publicProfile: true,
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  findCurrentUserSettings(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        ...defaultSettings,
      },
      select: settingsSelect,
    });
  }

  updateCurrentUserSettings(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...defaultSettings,
        ...dto,
      },
      select: settingsSelect,
    });
  }
}
