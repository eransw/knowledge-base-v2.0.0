import { Controller, Get, Post, Put, Delete, Body, Query, Req, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService, SearchResult, DocumentIndex } from './search.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../document/document.entity';
import { Note } from '../note/note.entity';
import { SystemConfig } from './system-config.entity';

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
  ) {}

  @Get()
  async search(
    @Req() req: any,
    @Query('keyword') keyword: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const userId = req.user['id'];
    const catId = categoryId && !isNaN(parseInt(categoryId, 10)) ? parseInt(categoryId, 10) : undefined;
    return this.searchService.search(userId, keyword, catId);
  }

  @Post('index/:documentId')
  async indexDocument(@Req() req: any, @Param('documentId') documentId: string) {
    const userId = req.user['id'];
    const document = await this.documentRepository.findOne({
      where: { id: parseInt(documentId, 10), userId },
      relations: { category: true, tags: true, attachments: true },
    });

    if (!document) {
      return { success: false, message: 'Document not found' };
    }

    const note = await this.noteRepository.findOne({
      where: { documentId: document.id },
    });

    const attachments: any[] = [];
    for (const attachment of document.attachments || []) {
      const content = await this.searchService.extractTextFromAttachment(
        attachment.filePath,
        attachment.fileType,
      );
      attachments.push({
        id: attachment.id,
        filename: attachment.filename,
        originalFilename: attachment.originalFilename,
        fileType: attachment.fileType,
        content,
      });
    }

    const indexData: DocumentIndex = {
      id: document.id.toString(),
      title: document.title,
      content: document.content || '',
      description: document.description || '',
      categoryId: document.category?.id,
      categoryName: document.category?.name || '',
      tags: document.tags?.map(t => t.name) || [],
      attachments,
      noteContent: note?.content || '',
      createdAt: document.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: document.updatedAt?.toISOString() || new Date().toISOString(),
      userId: document.userId,
    };

    await this.searchService.indexDocument(indexData);
    return { success: true, message: 'Document indexed successfully' };
  }

  @Post('index-all')
  async indexAllDocuments(@Req() req: any) {
    const userId = req.user['id'];
    const documents = await this.documentRepository.find({
      where: { userId },
      relations: { category: true, tags: true, attachments: true },
    });

    let successCount = 0;
    let failCount = 0;

    for (const document of documents) {
      try {
        const note = await this.noteRepository.findOne({
          where: { documentId: document.id },
        });

        const attachments: any[] = [];
        for (const attachment of document.attachments || []) {
          const content = await this.searchService.extractTextFromAttachment(
            attachment.filePath,
            attachment.fileType,
          );
          attachments.push({
            id: attachment.id,
            filename: attachment.filename,
            originalFilename: attachment.originalFilename,
            fileType: attachment.fileType,
            content,
          });
        }

        const indexData: DocumentIndex = {
          id: document.id.toString(),
          title: document.title,
          content: document.content || '',
          description: document.description || '',
          categoryId: document.category?.id,
          categoryName: document.category?.name || '',
          tags: document.tags?.map(t => t.name) || [],
          attachments,
          noteContent: note?.content || '',
          createdAt: document.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: document.updatedAt?.toISOString() || new Date().toISOString(),
          userId: document.userId,
        };

        await this.searchService.indexDocument(indexData);
        successCount++;
      } catch (error) {
        console.error(`Failed to index document ${document.id}:`, error);
        failCount++;
      }
    }

    return {
      success: true,
      message: `Indexed ${successCount} documents, ${failCount} failed`,
      total: documents.length,
      successCount,
      failCount,
    };
  }

  @Post('index-category/:categoryId')
  async indexCategory(@Req() req: any, @Param('categoryId') categoryId: string) {
    const userId = req.user['id'];
    const documents = await this.documentRepository.find({
      where: { userId, category: { id: parseInt(categoryId, 10) } },
      relations: { category: true, tags: true, attachments: true },
    });

    let successCount = 0;
    for (const document of documents) {
      try {
        const note = await this.noteRepository.findOne({
          where: { documentId: document.id },
        });

        const attachments: any[] = [];
        for (const attachment of document.attachments || []) {
          const content = await this.searchService.extractTextFromAttachment(
            attachment.filePath,
            attachment.fileType,
          );
          attachments.push({
            id: attachment.id,
            filename: attachment.filename,
            originalFilename: attachment.originalFilename,
            fileType: attachment.fileType,
            content,
          });
        }

        const indexData: DocumentIndex = {
          id: document.id.toString(),
          title: document.title,
          content: document.content || '',
          description: document.description || '',
          categoryId: document.category?.id,
          categoryName: document.category?.name || '',
          tags: document.tags?.map(t => t.name) || [],
          attachments,
          noteContent: note?.content || '',
          createdAt: document.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: document.updatedAt?.toISOString() || new Date().toISOString(),
          userId: document.userId,
        };

        await this.searchService.indexDocument(indexData);
        successCount++;
      } catch (error) {
        console.error(`Failed to index document ${document.id}:`, error);
      }
    }

    return {
      success: true,
      message: `Indexed ${successCount} documents in category`,
      total: documents.length,
      successCount,
    };
  }

  @Delete('document/:documentId')
  async removeDocument(@Param('documentId') documentId: string) {
    await this.searchService.removeDocument(documentId);
    return { success: true, message: 'Document removed from index' };
  }

  @Get('stats')
  async getStats() {
    return this.searchService.getIndexStats();
  }

  @Get('configs')
  async getConfigs() {
    const configs = await this.searchService.getAllConfigs();
    return configs.map(c => ({
      key: c.key,
      value: c.value ? '********' : '',
      hasValue: !!c.value,
      description: c.description,
    }));
  }

  @Put('config')
  async updateConfig(@Body() body: { key: string; value: string; description?: string }) {
    await this.searchService.setConfig(body.key, body.value, body.description);
    return { success: true, message: 'Config updated' };
  }
}
