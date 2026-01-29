import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('auth/admin')
export class AdminAuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() body: { passcode: string }) {
    const adminPass = this.configService.get<string>('WEB_ADMIN_PASS');

    if (!body.passcode || body.passcode !== adminPass) {
      throw new UnauthorizedException('Invalid admin passcode');
    }

    // Sign a token with a 5-minute expiry
    const token = await this.jwtService.signAsync(
      { role: 'admin' },
      {
        expiresIn: '5m',
        // Use a specific secret for admin if desired, but we'll use the default for now
      },
    );

    return {
      success: true,
      token,
    };
  }
}
