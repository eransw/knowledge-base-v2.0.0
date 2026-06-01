import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async findByDocumentId(documentId: number): Promise<Note | null> {
    return this.noteRepository.findOne({ where: { documentId } });
  }

  async createOrUpdate(documentId: number, content: string): Promise<Note> {
    let note = await this.findByDocumentId(documentId);
    
    if (note) {
      note.content = content;
      return this.noteRepository.save(note);
    } else {
      note = this.noteRepository.create({ documentId, content });
      return this.noteRepository.save(note);
    }
  }

  async delete(documentId: number): Promise<void> {
    await this.noteRepository.delete({ documentId });
  }
}