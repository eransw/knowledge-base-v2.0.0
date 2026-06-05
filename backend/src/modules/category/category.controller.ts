import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CategoryService } from './category.service';
import { Category } from './category.entity';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  findAll(@Req() req: Request) {
    const userId = req.user['id'];
    return this.categoryService.findAll(userId);
  }

  @Get('tree')
  getTree(@Req() req: Request) {
    const userId = req.user['id'];
    return this.categoryService.getTree(userId);
  }

  @Get('doc-count')
  getDocumentCount(@Req() req: Request) {
    const userId = req.user['id'];
    return this.categoryService.getDocumentCount(userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    return this.categoryService.findOne(userId, +id);
  }

  @Post()
  create(@Req() req: Request, @Body() category: Partial<Category>) {
    const userId = req.user['id'];
    return this.categoryService.create(userId, category);
  }

  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() category: Partial<Category>) {
    const userId = req.user['id'];
    return this.categoryService.update(userId, +id, category);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    return this.categoryService.remove(userId, +id);
  }
}