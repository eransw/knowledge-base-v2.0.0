import { Controller, Post, Body, Get, Put } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { question: string; documentId?: string }) {
    const { question, documentId } = body;
    return await this.aiService.chat(question, documentId);
  }

  @Get('config')
  async getConfig() {
    return await this.aiService.getConfig();
  }

  @Put('config')
  async updateConfig(@Body() config: any) {
    return await this.aiService.updateConfig(config);
  }
}