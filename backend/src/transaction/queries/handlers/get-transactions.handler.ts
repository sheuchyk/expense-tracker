import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTransactionsQuery } from '../get-transactions.query';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

/** Aggregated monetary totals returned alongside a page of transactions. */
export interface TransactionsSummary {
  /** Sum of `income` amounts, formatted as a fixed-2 decimal string. */
  totalIncome: string;
  /** Sum of `expense` amounts, formatted as a fixed-2 decimal string. */
  totalExpense: string;
  /** `totalIncome - totalExpense`, formatted as a fixed-2 decimal string. */
  balance: string;
}

/** Paginated result returned by GetTransactionsQuery. */
export interface GetTransactionsResult {
  /** Transactions for the requested page. */
  transactions: Transaction[];
  /** Aggregated income / expense / balance totals for the applied filter (not just the current page). */
  summary: TransactionsSummary;
  /** Total number of transactions matching the filter. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Maximum number of transactions per page. */
  limit: number;
  /** Total number of pages; always ≥ 1. */
  pageCount: number;
}

/**
 * CQRS handler for {@link GetTransactionsQuery}. Loads a page of the user's
 * transactions in parallel with the count and per-type aggregate sums, then
 * assembles the paginated + summarized response.
 */
@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  /**
   * Runs the paginated list + aggregate query.
   *
   * `page` defaults to `1` and `limit` to `10` when omitted from the filter.
   * Monetary sums are returned as fixed-2 decimal strings to preserve precision.
   *
   * @param query - Contains `userId` and the (validated) filter DTO.
   * @returns A `GetTransactionsResult` with `transactions`, `summary`
   *   (`totalIncome`, `totalExpense`, `balance`), `total`, `page`, `limit`, `pageCount`.
   */
  async execute(query: GetTransactionsQuery): Promise<GetTransactionsResult> {
    const { month, year } = query.filter;
    const page = query.filter.page ?? 1;
    const limit = query.filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const [transactions, total, sums] = await Promise.all([
      this.transactionRepository.findManyByUser(query.userId, { month, year, skip, take: limit }),
      this.transactionRepository.countByUser(query.userId, { month, year }),
      this.transactionRepository.sumByUser(query.userId, { month, year }),
    ]);

    return {
      transactions,
      summary: {
        totalIncome: sums.income.toFixed(2),
        totalExpense: sums.expense.toFixed(2),
        balance: sums.income.sub(sums.expense).toFixed(2),
      },
      total,
      page,
      limit,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
