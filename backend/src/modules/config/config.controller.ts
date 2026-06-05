import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAll(@Req() req: Request) {
    const user = req.user as any;
    const userId = user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.configService.getAll(userId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async set(@Req() req: Request, @Body() body: { key: string; value: string }) {
    const user = req.user as any;
    const userId = user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.configService.set(body.key, body.value, userId);
    return { success: true };
  }
}
