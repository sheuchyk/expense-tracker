import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetTransactionByIdQuery } from '../get-transaction-by-id.query';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler implements IQueryHandler<GetTransactionByIdQuery> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(query: GetTransactionByIdQuery): Promise<Transaction> {
    const transaction = await this.transactionRepository.findByIdForUser(query.id, query.userId);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }
}
