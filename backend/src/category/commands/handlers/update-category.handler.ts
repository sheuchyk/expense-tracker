import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateCategoryCommand } from '../update-category.command';
import { CategoryRepository } from '../../category.repository';
import { Category } from '@prisma/client';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(command: UpdateCategoryCommand): Promise<Category> {
    const existing = await this.categoryRepository.findByIdForUser(command.id, command.userId);
    if (!existing) throw new NotFoundException('Category not found');
    return this.categoryRepository.update(command.id, command.userId, command.dto);
  }
}
