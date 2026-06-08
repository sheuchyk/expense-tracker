import { CreateTransactionDto } from '../dto/create-transaction.dto';

export class CreateTransactionCommand {
  constructor(
    public readonly userId: number,
    public readonly dto: CreateTransactionDto,
  ) {}
}
