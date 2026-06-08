import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Transaction } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

interface DateFilter {
  month?: number;
  year?: number;
}

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateTransactionDto): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: { ...dto, date: new Date(dto.date), userId },
    });
  }

  async findManyByUser(userId: number, filter: DateFilter): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { userId, ...this.buildDateWhere(filter) },
      orderBy: { date: 'desc' },
    });
  }

  async findByIdForUser(id: number, userId: number): Promise<Transaction | null> {
    return this.prisma.transaction.findFirst({ where: { id, userId } });
  }

  async update(id: number, userId: number, dto: UpdateTransactionDto): Promise<Transaction> {
    const { date, ...rest } = dto;
    return this.prisma.transaction.update({
      where: { id, userId },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
    });
  }

  async delete(id: number, userId: number): Promise<Transaction> {
    return this.prisma.transaction.delete({ where: { id, userId } });
  }

  private buildDateWhere({ month, year }: DateFilter): Prisma.TransactionWhereInput {
    if (!year && !month) return {};

    // When only month is given, default the year to the current calendar year.
    const effectiveYear = year ?? new Date().getFullYear();

    if (month) {
      const gte = new Date(effectiveYear, month - 1, 1);
      const lt = new Date(effectiveYear, month, 1);
      return { date: { gte, lt } };
    }

    const gte = new Date(effectiveYear, 0, 1);
    const lt = new Date(effectiveYear + 1, 0, 1);
    return { date: { gte, lt } };
  }
}
