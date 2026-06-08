import { IsString, IsNumber, IsPositive, IsEnum, IsDateString, IsInt, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsString()
  @MaxLength(255)
  description!: string;

  @IsDateString()
  date!: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoryId!: number;
}
