import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTransactionsQuery } from '../get-transactions.query';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

export interface TransactionsSummary {
  totalIncome: string;
  totalExpense: string;
  balance: string;
}

export interface GetTransactionsResult {
  transactions: Transaction[];
  summary: TransactionsSummary;
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

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
