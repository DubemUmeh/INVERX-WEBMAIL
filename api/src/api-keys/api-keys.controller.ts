import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service.js';
import { CreateApiKeyDto } from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AccountGuard, RoleGuard } from '../common/guards/index.js';

@Controller('api-keys')
@UseGuards(AccountGuard, RoleGuard)
@Roles('owner', 'admin')
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Get()
  getApiKeys(@CurrentUser('accountId') accountId: string) {
    return this.apiKeysService.getApiKeys(accountId);
  }

  @Post()
  createApiKey(
    @CurrentUser('accountId') accountId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.apiKeysService.createApiKey(accountId, userId, dto);
  }

  @Delete(':id')
  deleteApiKey(
    @CurrentUser('accountId') accountId: string,
    @Param('id') keyId: string,
  ) {
    return this.apiKeysService.deleteApiKey(accountId, keyId);
  }
}
