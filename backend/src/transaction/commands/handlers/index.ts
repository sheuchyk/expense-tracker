import { CreateTransactionHandler } from './create-transaction.handler';
import { UpdateTransactionHandler } from './update-transaction.handler';
import { DeleteTransactionHandler } from './delete-transaction.handler';

/**
 * Aggregate of every CQRS command handler in the transactions module.
 * Registered as providers by `TransactionModule`.
 */
export const CommandHandlers = [CreateTransactionHandler, UpdateTransactionHandler, DeleteTransactionHandler];
