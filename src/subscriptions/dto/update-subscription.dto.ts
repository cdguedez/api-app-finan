import {
  IsOptional,
  IsNumber,
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { SubscriptionFrequency } from '@prisma/client';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(SubscriptionFrequency)
  frequency?: SubscriptionFrequency;

  @IsOptional()
  @IsDateString()
  nextPaymentDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
