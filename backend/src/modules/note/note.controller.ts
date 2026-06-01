import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { NoteService } from './note.service';

@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get(':documentId')
  async findByDocumentId(@Param('documentId') documentId: string) {
    const note = await this.noteService.findByDocumentId(parseInt(documentId));
    return note ? { content: note.content } : { content: '' };
  }

  @Post(':documentId')
  async createOrUpdate(
    @Param('documentId') documentId: string,
    @Body() body: { content: string },
  ) {
    return this.noteService.createOrUpdate(parseInt(documentId), body.content);
  }

  @Delete(':documentId')
  async delete(@Param('documentId') documentId: string) {
    return this.noteService.delete(parseInt(documentId));
  }
}