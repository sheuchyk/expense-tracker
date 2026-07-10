import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { GetTransactionByIdHandler } from './get-transaction-by-id.handler';
import { GetTransactionByIdQuery } from '../get-transaction-by-id.query';
import { TransactionRepository } from '../../transaction.repository';

describe('GetTransactionByIdHandler', () => {
  let handler: GetTransactionByIdHandler;
  let repository: { findByIdForUser: jest.Mock };

  beforeEach(async () => {
    repository = { findByIdForUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionByIdHandler,
        { provide: TransactionRepository, useValue: repository },
      ],
    }).compile();

    handler = module.get<GetTransactionByIdHandler>(GetTransactionByIdHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('должен вернуть транзакцию, если она принадлежит пользователю (happy path)', async () => {
      const transaction = {
        id: 1,
        userId: 42,
        categoryId: 7,
        amount: '100.00',
        type: 'expense',
        description: 'Coffee',
        date: new Date('2026-07-10'),
      } as unknown as Transaction;
      repository.findByIdForUser.mockResolvedValue(transaction);

      const query = new GetTransactionByIdQuery(1, 42);
      const result = await handler.execute(query);

      expect(result).toBe(transaction);
      expect(repository.findByIdForUser).toHaveBeenCalledTimes(1);
      expect(repository.findByIdForUser).toHaveBeenCalledWith(1, 42);
    });

    it('должен пробросить граничные значения id и userId в репозиторий (edge case)', async () => {
      repository.findByIdForUser.mockResolvedValue(null);

      const query = new GetTransactionByIdQuery(0, 0);

      await expect(handler.execute(query)).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.findByIdForUser).toHaveBeenCalledWith(0, 0);
    });

    it('должен бросить NotFoundException, если транзакция не найдена (error case)', async () => {
      repository.findByIdForUser.mockResolvedValue(null);

      const query = new GetTransactionByIdQuery(999, 42);

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(query)).rejects.toThrow('Transaction not found');
    });

    it('должен пробросить исключение репозитория без изменений (error case)', async () => {
      const dbError = new Error('DB is down');
      repository.findByIdForUser.mockRejectedValue(dbError);

      const query = new GetTransactionByIdQuery(1, 42);

      await expect(handler.execute(query)).rejects.toBe(dbError);
    });
  });
});
