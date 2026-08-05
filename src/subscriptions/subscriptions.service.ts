import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        ...createSubscriptionDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { category: true, account: true },
    });
  }

  async findOne(userId: string, id: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, userId },
      include: { category: true, account: true },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  async update(
    userId: string,
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    await this.findOne(userId, id); // Ensure exists and belongs to user
    return this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.subscription.delete({
      where: { id },
    });
  }
}
