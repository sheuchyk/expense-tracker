import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({ data: { ...dto, userId } });
  }

  async findAllByUser(userId: number): Promise<Category[]> {
    return this.prisma.category.findMany({ where: { userId } });
  }

  async findByIdForUser(id: number, userId: number): Promise<Category | null> {
    return this.prisma.category.findFirst({ where: { id, userId } });
  }

  async update(id: number, userId: number, dto: UpdateCategoryDto): Promise<Category> {
    return this.prisma.category.update({ where: { id, userId }, data: dto });
  }

  async delete(id: number, userId: number): Promise<Category> {
    return this.prisma.category.delete({ where: { id, userId } });
  }
}
