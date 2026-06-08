import { QueryTransactionsDto } from '../dto/query-transactions.dto';

export class GetTransactionsQuery {
  constructor(
    public readonly userId: number,
    public readonly filter: QueryTransactionsDto,
  ) {}
}
