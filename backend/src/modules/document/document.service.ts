import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async findAll(): Promise<Document[]> {
    return this.documentRepository.find({ relations: ['category', 'tags'] });
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });
    if (!document) {
      throw new NotFoundException('文档不存在');
    }
    return document;
  }

  async search(keyword: string): Promise<Document[]> {
    return this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.category', 'category')
      .leftJoinAndSelect('document.tags', 'tags')
      .where('document.title LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('document.content LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }

  async create(document: Partial<Document>): Promise<Document> {
    const newDocument = this.documentRepository.create(document);
    return this.documentRepository.save(newDocument);
  }

  async update(id: number, document: Partial<Document>): Promise<Document> {
    await this.documentRepository.update(id, { ...document, updatedAt: new Date() });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const document = await this.findOne(id);
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    await this.documentRepository.delete(id);
  }

  async parseFile(filePath: string, fileType: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    
    switch (fileType.toLowerCase()) {
      case 'application/pdf':
        const pdfData = await pdfParse(fileBuffer);
        return pdfData.text;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        return docxResult.value;
      case 'text/markdown':
      case 'text/plain':
        return fileBuffer.toString('utf-8');
      default:
        return '';
    }
  }

  async saveFile(file: any, uploadDir: string): Promise<{ filePath: string; filename: string }> {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, filename);
    
    await new Promise<void>((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    return { filePath, filename };
  }
}
