import { UpdateTransactionDto } from '../dto/update-transaction.dto';

export class UpdateTransactionCommand {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly dto: UpdateTransactionDto,
  ) {}
}
