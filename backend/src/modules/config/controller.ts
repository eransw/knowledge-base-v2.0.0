import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAll(@Req() req: Request) {
    const userId = req.user['id'];
    return this.configService.getAll(userId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async set(@Req() req: Request, @Body() body: { key: string; value: string }) {
    const userId = req.user['id'];
    await this.configService.set(body.key, body.value, userId);
    return { success: true };
  }
}
