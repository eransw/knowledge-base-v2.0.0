import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';

@Controller('tags')
@UseGuards(AuthGuard('jwt'))
export class TagController {
  constructor(private tagService: TagService) {}

  @Get()
  findAll(@Req() req: Request) {
    const userId = req.user['id'];
    return this.tagService.findAll(userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    return this.tagService.findOne(userId, +id);
  }

  @Post()
  create(@Req() req: Request, @Body() tag: Partial<Tag>) {
    const userId = req.user['id'];
    return this.tagService.create(userId, tag);
  }

  @Put('order')
  updateOrder(@Req() req: Request, @Body() body: { order: { id: number; order: number }[] }) {
    const userId = req.user['id'];
    return this.tagService.updateOrder(userId, body.order);
  }

  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() tag: Partial<Tag>) {
    const userId = req.user['id'];
    return this.tagService.update(userId, +id, tag);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    return this.tagService.remove(userId, +id);
  }
}