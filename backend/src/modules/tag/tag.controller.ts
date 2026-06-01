import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';

@Controller('tags')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Post()
  create(@Body() tag: Partial<Tag>) {
    return this.tagService.create(tag);
  }

  @Put('order')
  updateOrder(@Body() body: { order: { id: number; order: number }[] }) {
    return this.tagService.updateOrder(body.order);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() tag: Partial<Tag>) {
    return this.tagService.update(+id, tag);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}