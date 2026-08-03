import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyAccountOwnership(userId: string, accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException(`Account #${accountId} not found`);
    }
    if (account.userId !== userId) {
      throw new ForbiddenException(`You do not have access to this account`);
    }
    return account;
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    await this.verifyAccountOwnership(userId, createTransactionDto.accountId);

    if (createTransactionDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createTransactionDto.categoryId },
      });
      if (!category || category.userId !== userId) {
        throw new ForbiddenException(`You do not have access to this category`);
      }
    }

    return this.prisma.transaction.create({
      data: createTransactionDto,
    });
  }

  async findAll(userId: string, accountId?: string) {
    if (accountId) {
      await this.verifyAccountOwnership(userId, accountId);
      return this.prisma.transaction.findMany({
        where: { accountId },
        orderBy: { date: 'desc' },
      });
    }

    // Find all transactions for all accounts belonging to the user
    return this.prisma.transaction.findMany({
      where: {
        account: {
          userId: userId,
        },
      },
      orderBy: { date: 'desc' },
      include: {
        account: true,
        category: true,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction #${id} not found`);
    }

    if (transaction.account.userId !== userId) {
      throw new ForbiddenException(
        `You do not have access to this transaction`,
      );
    }

    return transaction;
  }

  async update(
    userId: string,
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    await this.findOne(userId, id); // verify transaction exists and belongs to user

    if (updateTransactionDto.accountId) {
      await this.verifyAccountOwnership(userId, updateTransactionDto.accountId);
    }

    if (updateTransactionDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateTransactionDto.categoryId },
      });
      if (!category || category.userId !== userId) {
        throw new ForbiddenException(`You do not have access to this category`);
      }
    }

    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // verify ownership
    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}
