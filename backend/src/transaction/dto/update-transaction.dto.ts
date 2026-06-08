import { IsString, IsNumber, IsPositive, IsEnum, IsDateString, IsInt, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '@prisma/client';

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoryId?: number;
}
