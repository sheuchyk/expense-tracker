import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTransactionsQuery } from '../get-transactions.query';
import { TransactionRepository } from '../../transaction.repository';
import { Prisma, Transaction, TransactionType } from '@prisma/client';

export interface TransactionsSummary {
  totalIncome: string;
  totalExpense: string;
  balance: string;
}

export interface GetTransactionsResult {
  transactions: Transaction[];
  summary: TransactionsSummary;
}

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(query: GetTransactionsQuery): Promise<GetTransactionsResult> {
    const transactions = await this.transactionRepository.findManyByUser(query.userId, query.filter);

    let totalIncome = new Prisma.Decimal(0);
    let totalExpense = new Prisma.Decimal(0);

    for (const tx of transactions) {
      if (tx.type === TransactionType.income) {
        totalIncome = totalIncome.add(tx.amount);
      } else {
        totalExpense = totalExpense.add(tx.amount);
      }
    }

    return {
      transactions,
      summary: {
        totalIncome: totalIncome.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
        balance: totalIncome.sub(totalExpense).toFixed(2),
      },
    };
  }
}
