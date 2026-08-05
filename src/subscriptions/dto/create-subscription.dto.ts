import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { SubscriptionFrequency } from '@prisma/client';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(SubscriptionFrequency)
  @IsNotEmpty()
  frequency: SubscriptionFrequency;

  @IsDateString()
  @IsNotEmpty()
  nextPaymentDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
