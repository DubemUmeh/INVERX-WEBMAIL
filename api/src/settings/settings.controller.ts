import { Controller, Get, Patch, Body } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { UpdateProfileDto, UpdateSecurityDto } from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('profile')
  getProfile(@CurrentUser('sub') userId: string) {
    return this.settingsService.getProfile(userId);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.settingsService.updateProfile(userId, dto);
  }

  @Get('security')
  getSecurity(@CurrentUser('sub') userId: string) {
    return this.settingsService.getSecurity(userId);
  }

  @Patch('security')
  updateSecurity(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateSecurityDto,
  ) {
    return this.settingsService.updateSecurity(userId, dto);
  }
}
