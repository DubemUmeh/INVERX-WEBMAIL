import { Controller, Get, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';

@Controller('me')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch()
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(userId, dto);
  }
}
