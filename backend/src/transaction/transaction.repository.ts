import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Transaction, TransactionType } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

/** Optional month (1–12) and year filter for aggregating transactions. */
interface DateFilter {
  month?: number;
  year?: number;
}

/** Date filter extended with Prisma pagination offsets. */
interface PageFilter extends DateFilter {
  skip?: number;
  take?: number;
}

/**
 * Data-access layer for the `Transaction` model.
 *
 * Encapsulates every Prisma call used by the CQRS handlers, so business
 * logic never touches the ORM directly. All read/write operations are
 * scoped by `userId` to enforce per-user data isolation.
 */
@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persists a new transaction for the given user.
   *
   * @param userId - Owner of the new transaction.
   * @param dto - Validated create payload; `date` is parsed to a `Date`.
   * @returns The created `Transaction` row.
   * @throws {Prisma.PrismaClientKnownRequestError} When the foreign key
   *   (e.g. `categoryId`) does not exist or a DB constraint is violated.
   */
  async create(userId: number, dto: CreateTransactionDto): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: { ...dto, date: new Date(dto.date), userId },
    });
  }

  /**
   * Returns a page of the user's transactions ordered by date desc, id desc.
   *
   * @param userId - Owner whose transactions are returned.
   * @param filter - Optional month/year filter plus `skip`/`take` pagination.
   * @returns The matching page of `Transaction` rows (may be empty).
   */
  async findManyByUser(userId: number, filter: PageFilter): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { userId, ...this.buildDateWhere(filter) },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      skip: filter.skip,
      take: filter.take,
    });
  }

  /**
   * Counts the user's transactions matching the given date filter.
   *
   * @param userId - Owner whose transactions are counted.
   * @param filter - Optional month/year filter.
   * @returns Total number of matching rows.
   */
  async countByUser(userId: number, filter: DateFilter): Promise<number> {
    return this.prisma.transaction.count({
      where: { userId, ...this.buildDateWhere(filter) },
    });
  }

  /**
   * Aggregates income and expense sums for the user under the given filter.
   *
   * @param userId - Owner whose totals are aggregated.
   * @param filter - Optional month/year filter.
   * @returns Object with `income` and `expense` as `Prisma.Decimal`
   *   (`0` when a bucket has no rows).
   */
  async sumByUser(
    userId: number,
    filter: DateFilter,
  ): Promise<{ income: Prisma.Decimal; expense: Prisma.Decimal }> {
    const grouped = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, ...this.buildDateWhere(filter) },
      _sum: { amount: true },
    });

    let income = new Prisma.Decimal(0);
    let expense = new Prisma.Decimal(0);
    for (const row of grouped) {
      const amount = row._sum.amount ?? new Prisma.Decimal(0);
      if (row.type === TransactionType.income) income = amount;
      else expense = amount;
    }
    return { income, expense };
  }

  /**
   * Loads a single transaction by id, scoped to the given user.
   *
   * @param id - Transaction id.
   * @param userId - Expected owner.
   * @returns The matching `Transaction` or `null` if not found / not owned.
   */
  async findByIdForUser(id: number, userId: number): Promise<Transaction | null> {
    return this.prisma.transaction.findFirst({ where: { id, userId } });
  }

  /**
   * Updates the given user's transaction with the provided fields.
   *
   * @param id - Transaction id.
   * @param userId - Expected owner (part of the composite where).
   * @param dto - Partial payload; `date` (if present) is parsed to a `Date`.
   * @returns The updated `Transaction` row.
   * @throws {Prisma.PrismaClientKnownRequestError} P2025 when no row matches
   *   `{ id, userId }`, or on foreign-key/constraint violations.
   */
  async update(id: number, userId: number, dto: UpdateTransactionDto): Promise<Transaction> {
    const { date, ...rest } = dto;
    return this.prisma.transaction.update({
      where: { id, userId },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
    });
  }

  /**
   * Deletes the given user's transaction.
   *
   * @param id - Transaction id.
   * @param userId - Expected owner (part of the composite where).
   * @returns The deleted `Transaction` row.
   * @throws {Prisma.PrismaClientKnownRequestError} P2025 when no row matches
   *   `{ id, userId }`.
   */
  async delete(id: number, userId: number): Promise<Transaction> {
    return this.prisma.transaction.delete({ where: { id, userId } });
  }

  /**
   * Builds a Prisma `where` clause narrowing `date` to a month or year range.
   *
   * If only `month` is provided, the current calendar year is assumed.
   *
   * @param filter - Optional `{ month, year }` filter.
   * @returns A Prisma `TransactionWhereInput` fragment (empty when both are absent).
   */
  private buildDateWhere({ month, year }: DateFilter): Prisma.TransactionWhereInput {
    if (!year && !month) return {};

    // When only month is given, default the year to the current calendar year.
    const effectiveYear = year ?? new Date().getFullYear();

    if (month) {
      const gte = new Date(effectiveYear, month - 1, 1);
      const lt = new Date(effectiveYear, month, 1);
      return { date: { gte, lt } };
    }

    const gte = new Date(effectiveYear, 0, 1);
    const lt = new Date(effectiveYear + 1, 0, 1);
    return { date: { gte, lt } };
  }
}
