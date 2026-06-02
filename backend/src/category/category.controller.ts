import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryCommand } from './commands/create-category.command';
import { UpdateCategoryCommand } from './commands/update-category.command';
import { DeleteCategoryCommand } from './commands/delete-category.command';
import { GetCategoriesByUserQuery } from './queries/get-categories-by-user.query';
import { GetCategoryByIdQuery } from './queries/get-category-by-id.query';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateCategoryDto) {
    return this.commandBus.execute(new CreateCategoryCommand(user.id, dto));
  }

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.queryBus.execute(new GetCategoriesByUserQuery(user.id));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.queryBus.execute(new GetCategoryByIdQuery(id, user.id));
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.commandBus.execute(new UpdateCategoryCommand(id, user.id, dto));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.commandBus.execute(new DeleteCategoryCommand(id, user.id));
  }
}
