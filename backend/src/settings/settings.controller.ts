import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user settings' })
  @ApiOkResponse({ description: 'Current user settings.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  findMe(@Req() request: AuthenticatedRequest) {
    return this.settingsService.findCurrentUserSettings(request.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user settings' })
  @ApiOkResponse({ description: 'Updated current user settings.' })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid.' })
  updateMe(@Req() request: AuthenticatedRequest, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateCurrentUserSettings(request.user.id, dto);
  }
}
