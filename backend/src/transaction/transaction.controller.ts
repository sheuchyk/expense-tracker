import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

/**
 * HTTP controller exposing CRUD endpoints for user transactions.
 *
 * All routes are protected by {@link JwtAuthGuard} and scoped to the
 * authenticated user. Requests are dispatched to CQRS command/query
 * handlers via `CommandBus` / `QueryBus`.
 */
@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Creates a new transaction for the current user.
   *
   * @param user - Authenticated user injected by {@link CurrentUser}.
   * @param dto - Transaction payload validated by class-validator.
   * @returns The created `Transaction` entity.
   * @throws {UnauthorizedException} When the JWT is missing or invalid.
   * @throws {BadRequestException} When the DTO fails validation.
   */
  @ApiOperation({ summary: 'Create a new transaction for the current user' })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateTransactionDto) {
    return this.commandBus.execute(new CreateTransactionCommand(user.id, dto));
  }

  /**
   * Returns a paginated list of transactions for the current user with
   * aggregated income/expense/balance totals for the applied filter.
   *
   * @param user - Authenticated user injected by {@link CurrentUser}.
   * @param query - Optional `month`, `year`, `page`, `limit` filters.
   * @returns A `GetTransactionsResult` with items, summary, and pagination info.
   * @throws {UnauthorizedException} When the JWT is missing or invalid.
   * @throws {BadRequestException} When query parameters are out of range.
   */
  @ApiOperation({ summary: 'List transactions with pagination and summary totals' })
  @ApiResponse({ status: 200, description: 'Paginated transactions with income/expense/balance summary' })
  @ApiResponse({ status: 400, description: 'Query parameters out of range' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @Get()
  findAll(@CurrentUser() user: { id: number }, @Query() query: QueryTransactionsDto) {
    return this.queryBus.execute(new GetTransactionsQuery(user.id, query));
  }

  /**
   * Returns a single transaction by id, scoped to the current user.
   *
   * @param id - Numeric transaction id parsed from the URL.
   * @param user - Authenticated user injected by {@link CurrentUser}.
   * @returns The matching `Transaction` entity.
   * @throws {UnauthorizedException} When the JWT is missing or invalid.
   * @throws {NotFoundException} When the transaction does not exist or does not belong to the user.
   */
  @ApiOperation({ summary: 'Get a single transaction by id' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Transaction not found or not owned by user' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.queryBus.execute(new GetTransactionByIdQuery(id, user.id));
  }

  /**
   * Updates fields of a transaction owned by the current user.
   *
   * @param id - Numeric transaction id parsed from the URL.
   * @param user - Authenticated user injected by {@link CurrentUser}.
   * @param dto - Partial transaction payload; only provided fields are updated.
   * @returns The updated `Transaction` entity.
   * @throws {UnauthorizedException} When the JWT is missing or invalid.
   * @throws {NotFoundException} When the transaction does not exist or does not belong to the user.
   * @throws {BadRequestException} When the DTO fails validation.
   */
  @ApiOperation({ summary: 'Update fields of a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Transaction not found or not owned by user' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.commandBus.execute(new UpdateTransactionCommand(id, user.id, dto));
  }

  /**
   * Deletes a transaction owned by the current user.
   *
   * @param id - Numeric transaction id parsed from the URL.
   * @param user - Authenticated user injected by {@link CurrentUser}.
   * @returns The deleted `Transaction` entity.
   * @throws {UnauthorizedException} When the JWT is missing or invalid.
   * @throws {NotFoundException} When the transaction does not exist or does not belong to the user.
   */
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Transaction not found or not owned by user' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.commandBus.execute(new DeleteTransactionCommand(id, user.id));
  }
}
