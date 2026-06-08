import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { LogService, QueryLogDto } from './log.service';

@Controller('logs')
@UseGuards(AuthGuard('jwt'))
export class LogController {
  constructor(private logService: LogService) {}

  @Get()
  async findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.logService.remove(id);
    return { success: true, message: '日志删除成功' };
  }

  @Post('batch-delete')
  async removeBatch(@Body() body: { ids: number[] }) {
    await this.logService.removeBatch(body.ids);
    return { success: true, message: '日志批量删除成功' };
  }

  @Delete('clear')
  async clearAll() {
    await this.logService.clearAll();
    return { success: true, message: '所有日志已清空' };
  }

  @Get('export')
  async exportToExcel(@Query() query: QueryLogDto, @Res() res: Response) {
    return this.logService.exportToExcel(query, res);
  }
}