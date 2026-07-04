import { GetTransactionsHandler } from './get-transactions.handler';
import { GetTransactionByIdHandler } from './get-transaction-by-id.handler';

/**
 * Aggregate of every CQRS query handler in the transactions module.
 * Registered as providers by `TransactionModule`.
 */
export const QueryHandlers = [GetTransactionsHandler, GetTransactionByIdHandler];
