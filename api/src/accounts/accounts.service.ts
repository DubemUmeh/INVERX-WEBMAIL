import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AccountsRepository } from './accounts.repository.js';
import {
  UpdateAccountDto,
  CreateMemberDto,
  UpdateMemberDto,
} from './dto/index.js';

@Injectable()
export class AccountsService {
  constructor(private accountsRepository: AccountsRepository) {}

  async getAccount(userId: string) {
    const result = await this.accountsRepository.findByUserId(userId);
    if (!result) {
      throw new NotFoundException('Account not found');
    }

    const { stripeCustomerId, ...safeAccount } = result.account;
    return safeAccount;
  }

  async updateAccount(accountId: string, dto: UpdateAccountDto) {
    const account = await this.accountsRepository.update(accountId, dto);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const { stripeCustomerId, ...safeAccount } = account;
    return safeAccount;
  }

  // Member operations
  async getMembers(accountId: string) {
    return this.accountsRepository.findMembers(accountId);
  }

  async addMember(accountId: string, dto: CreateMemberDto) {
    // Find user by email
    const user = await this.accountsRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    try {
      const member = await this.accountsRepository.addMember(
        accountId,
        user.id,
        dto.role || 'member',
      );

      return {
        id: member.id,
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: member.role,
        createdAt: member.createdAt,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException('User is already a member of this account');
      }
      throw error;
    }
  }

  async updateMember(
    accountId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ) {
    const member = await this.accountsRepository.findMemberById(
      accountId,
      memberId,
    );
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (dto.role) {
      const updated = await this.accountsRepository.updateMember(
        memberId,
        dto.role,
      );
      return { ...member, role: updated?.role };
    }

    return member;
  }

  async removeMember(accountId: string, memberId: string, userId: string) {
    const member = await this.accountsRepository.findMemberById(
      accountId,
      memberId,
    );
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Prevent removing yourself or the owner
    if (member.userId === userId) {
      throw new ForbiddenException('You cannot remove yourself');
    }

    if (member.role === 'owner') {
      throw new ForbiddenException('Cannot remove the account owner');
    }

    await this.accountsRepository.removeMember(memberId);
    return { message: 'Member removed successfully' };
  }
}
