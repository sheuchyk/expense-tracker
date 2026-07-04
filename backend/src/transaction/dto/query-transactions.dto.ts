import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query-string params accepted by `GET /transactions`. All fields are optional;
 * omitted `page`/`limit` default to `1` / `10` inside the handler.
 */
export class QueryTransactionsDto {
  /** Calendar month, 1–12. Defaults year to current when used alone. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  /** 4-digit calendar year, 1970–2100. */
  @IsOptional()
  @IsInt()
  @Min(1970)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  /** 1-based page number, 1–10 000. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10_000)
  @Type(() => Number)
  page?: number;

  /** Page size, 1–100. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
