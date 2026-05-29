import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, Query, Put } from '@nestjs/common';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';

@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(+id);
  }

  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.documentService.search(keyword);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @Body() body: any) {
    const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
    const { filePath, filename } = await this.documentService.saveFile(file, uploadDir);
    
    const content = await this.documentService.parseFile(filePath, file.mimetype);
    
    return this.documentService.create({
      title: body.title || file.originalname,
      filename,
      originalFilename: file.originalname,
      content,
      summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      fileType: file.mimetype,
      filePath,
      categoryId: body.categoryId ? +body.categoryId : null,
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.documentService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(+id);
  }
}
