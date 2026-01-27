import { Controller, Post, Get, Body } from '@nestjs/common';
import { WaitlistService } from './waitlist.service.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Public()
  @Post()
  async join(@Body() body: { name: string; email: string }) {
    return this.waitlistService.join(body);
  }

  @Get()
  async getAll() {
    return this.waitlistService.getAll();
  }
}
