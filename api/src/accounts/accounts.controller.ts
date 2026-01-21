import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import {
  UpdateAccountDto,
  CreateMemberDto,
  UpdateMemberDto,
} from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AccountGuard, RoleGuard } from '../common/guards/index.js';

@Controller('account')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  getAccount(@CurrentUser('sub') userId: string) {
    return this.accountsService.getAccount(userId);
  }

  @Patch()
  @UseGuards(AccountGuard, RoleGuard)
  @Roles('owner', 'admin')
  updateAccount(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.updateAccount(accountId, dto);
  }

  // Member endpoints
  @Get('members')
  @UseGuards(AccountGuard)
  getMembers(@CurrentUser('accountId') accountId: string) {
    return this.accountsService.getMembers(accountId);
  }

  @Post('members')
  @UseGuards(AccountGuard, RoleGuard)
  @Roles('owner', 'admin')
  addMember(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: CreateMemberDto,
  ) {
    return this.accountsService.addMember(accountId, dto);
  }

  @Patch('members/:id')
  @UseGuards(AccountGuard, RoleGuard)
  @Roles('owner', 'admin')
  updateMember(
    @CurrentUser('accountId') accountId: string,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.accountsService.updateMember(accountId, memberId, dto);
  }

  @Delete('members/:id')
  @UseGuards(AccountGuard, RoleGuard)
  @Roles('owner', 'admin')
  removeMember(
    @CurrentUser('sub') userId: string,
    @CurrentUser('accountId') accountId: string,
    @Param('id') memberId: string,
  ) {
    return this.accountsService.removeMember(accountId, memberId, userId);
  }
}
