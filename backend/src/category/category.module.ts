import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '../user/user.module';
import { CategoryRepository } from './category.repository';
import { CategoryController } from './category.controller';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule, UserModule],
  controllers: [CategoryController],
  providers: [CategoryRepository, ...CommandHandlers, ...QueryHandlers],
})
export class CategoryModule {}
