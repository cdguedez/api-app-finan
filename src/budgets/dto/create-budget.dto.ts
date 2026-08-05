import { IsNotEmpty, IsNumber, IsUUID, IsDateString } from 'class-validator';

export class CreateBudgetDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
