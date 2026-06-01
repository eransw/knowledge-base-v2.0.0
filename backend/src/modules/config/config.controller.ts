import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  async getAll() {
    return this.configService.getAll();
  }

  @Post()
  async set(@Body() body: { key: string; value: string }) {
    await this.configService.set(body.key, body.value);
    return { success: true };
  }
}
