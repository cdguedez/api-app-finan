import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryBankDto } from './dto/query-bank.dto';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class BanksService {
  private cache = new Map<string, CacheEntry<{ code: string; name: string }[]>>();

  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryBankDto) {
    const cacheKey = `banks_${query.isNational ?? 'all'}_${query.isActive ?? 'all'}`;
    const now = Date.now();

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const where: { isNational?: boolean; isActive?: boolean } = {};

    if (query.isNational !== undefined) {
      where.isNational = query.isNational;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const banks = await this.prisma.bank.findMany({
      where,
      select: {
        code: true,
        name: true,
      },
      orderBy: { code: 'asc' },
    });

    this.cache.set(cacheKey, {
      data: banks,
      expiresAt: now + SEVEN_DAYS_MS,
    });

    return banks;
  }

  clearCache() {
    this.cache.clear();
  }
}
