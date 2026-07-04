import { IsString, IsNumber, IsPositive, IsEnum, IsDateString, IsInt, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '@prisma/client';

/**
 * Payload accepted by `POST /transactions` — validated by class-validator
 * before the CQRS command is dispatched.
 */
export class CreateTransactionDto {
  /** Monetary amount (> 0, up to 2 decimal places). */
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount!: number;

  /** `income` or `expense` — Prisma `TransactionType` enum. */
  @IsEnum(TransactionType)
  type!: TransactionType;

  /** Free-form description, up to 255 characters. */
  @IsString()
  @MaxLength(255)
  description!: string;

  /** ISO 8601 date string; parsed to `Date` by the repository. */
  @IsDateString()
  date!: string;

  /** Positive integer id of an existing `Category`. */
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoryId!: number;
}
