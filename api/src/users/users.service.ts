import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { UpdateUserDto } from './dto/index.js';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async getMe(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // User data is already safe - no passwordHash in schema
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.update(userId, dto);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
