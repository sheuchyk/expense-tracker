import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { UpdateTransactionCommand } from './commands/update-transaction.command';
import { DeleteTransactionCommand } from './commands/delete-transaction.command';
import { GetTransactionsQuery } from './queries/get-transactions.query';
import { GetTransactionByIdQuery } from './queries/get-transaction-by-id.query';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateTransactionDto) {
    return this.commandBus.execute(new CreateTransactionCommand(user.id, dto));
  }

  @Get()
  findAll(@CurrentUser() user: { id: number }, @Query() query: QueryTransactionsDto) {
    return this.queryBus.execute(new GetTransactionsQuery(user.id, query));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.queryBus.execute(new GetTransactionByIdQuery(id, user.id));
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.commandBus.execute(new UpdateTransactionCommand(id, user.id, dto));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.commandBus.execute(new DeleteTransactionCommand(id, user.id));
  }
}
