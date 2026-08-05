import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Length(4, 7)
  color?: string;
}
