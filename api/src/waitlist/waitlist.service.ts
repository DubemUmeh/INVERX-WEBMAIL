import { Injectable, ConflictException } from '@nestjs/common';
import { WaitlistRepository } from './waitlist.repository.js';

@Injectable()
export class WaitlistService {
  constructor(private readonly waitlistRepository: WaitlistRepository) {}

  async join(data: { name: string; email: string }) {
    try {
      return await this.waitlistRepository.create(data);
    } catch (error) {
      if (error.code === '23505') {
        // Postgres unique violation
        throw new ConflictException('Email already on the waitlist');
      }
      throw error;
    }
  }

  async getAll() {
    return await this.waitlistRepository.findAll();
  }
}
