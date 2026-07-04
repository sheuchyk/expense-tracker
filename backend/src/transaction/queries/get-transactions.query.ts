import { QueryTransactionsDto } from '../dto/query-transactions.dto';

/**
 * CQRS query requesting a paginated list of a user's transactions plus
 * aggregated totals. Handled by `GetTransactionsHandler`.
 */
export class GetTransactionsQuery {
  /**
   * @param userId - Owner whose transactions are queried.
   * @param filter - Optional month/year and pagination params.
   */
  constructor(
    public readonly userId: number,
    public readonly filter: QueryTransactionsDto,
  ) {}
}
