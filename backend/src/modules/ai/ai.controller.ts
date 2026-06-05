import { Controller, Post, Body, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Req() req: Request, @Body() body: { question: string; documentId?: string }) {
    const userId = req.user['id'];
    const { question, documentId } = body;
    return await this.aiService.chat(userId, question, documentId);
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