import {
  IsString,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Currency } from '@prisma/client';

export class CreateAccountDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;
}
