import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Controller('waitlist')
export class WaitlistController {
  constructor(
    private readonly waitlistService: WaitlistService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post()
  async join(@Body() body: { name: string; email: string }) {
    return this.waitlistService.join(body);
  }

  @Public()
  @Get()
  async getAll(@Headers('x-admin-token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Admin token is required');
    }

    try {
      await this.jwtService.verifyAsync(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired admin token');
    }

    return this.waitlistService.getAll();
  }
}
