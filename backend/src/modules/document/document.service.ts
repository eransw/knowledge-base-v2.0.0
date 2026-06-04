import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document } from './document.entity';
import { FileAttachment } from './file-attachment.entity';
import { Category } from '../category/category.entity';
import { Note } from '../note/note.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(FileAttachment)
    private fileAttachmentRepository: Repository<FileAttachment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async findAll(categoryId?: number, tagIds?: string): Promise<Document[]> {
    // 使用简单查询方式，避免queryBuilder的问题
    const where: any = {};
    
    if (categoryId) {
      // 获取分类及其所有子分类的ID
      const categoryIds = await this.getCategoryIdsWithChildren(categoryId);
      where.category = { id: In(categoryIds) };
    }
    
    let documents = await this.documentRepository.find({
      where,
      relations: {
        category: true,
        tags: true,
        attachments: true,
      },
    });
    
    // 如果有标签筛选（支持多个标签，用逗号分隔）
    if (tagIds) {
      const tagIdArray = tagIds.split(',').map(id => parseInt(id));
      // OR逻辑：文档包含任一选中的标签即可
      documents = documents.filter(doc => 
        doc.tags && tagIdArray.some(tagId => doc.tags.some(tag => tag.id === tagId))
      );
    }
    
    return documents;
  }

  // 递归获取分类及其所有子分类的ID
  private async getCategoryIdsWithChildren(categoryId: number): Promise<number[]> {
    const categoryIds: number[] = [categoryId];
    
    // 查询该分类的子分类（使用关系字段）
    const subCategories = await this.categoryRepository.find({
      where: { parent: { id: categoryId } },
    });
    
    // 递归获取子分类的子分类
    for (const subCat of subCategories) {
      const childIds = await this.getCategoryIdsWithChildren(subCat.id);
      categoryIds.push(...childIds);
    }
    
    return categoryIds;
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: { category: true, tags: true, attachments: true },
    });
    if (!document) {
      throw new NotFoundException('文档不存在');
    }
    // 确保附件文件名正确编码
    this.decodeAttachmentFilenames(document);
    return document;
  }

  private decodeAttachmentFilenames(document: Document): void {
    if (document.attachments && Array.isArray(document.attachments)) {
      document.attachments.forEach(attachment => {
        try {
          attachment.originalFilename = decodeURIComponent(attachment.originalFilename);
        } catch (e) {
          // 如果解码失败，保持原始文件名
        }
      });
    }
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
    // 使用 save 方法来正确处理关联关系
    const existingDocument = await this.findOne(id);
    
    // 手动复制属性，避免覆盖附件等关联关系
    if (document.title !== undefined) {
      existingDocument.title = document.title;
    }
    if (document.description !== undefined) {
      existingDocument.description = document.description;
    }
    if (document.category !== undefined) {
      existingDocument.category = document.category;
    }
    if (document.tags !== undefined) {
      existingDocument.tags = document.tags;
    }
    if (document.content !== undefined) {
      existingDocument.content = document.content;
    }
    
    existingDocument.updatedAt = new Date();
    return this.documentRepository.save(existingDocument);
  }

  async addAttachments(documentId: number, files: any[]): Promise<void> {
    console.log('=== addAttachments called ===');
    console.log('Document ID:', documentId);
    console.log('Files received:', files);
    
    const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
    console.log('Upload directory:', uploadDir);
    
    const document = await this.findOne(documentId);
    console.log('Document found:', document.title);
    
    for (const file of files) {
      const filename = file.filename;
      const filePath = file.path;
      
      // 使用 Base64 解码文件名
      let originalFilename = file.originalname;
      try {
        const decoded = Buffer.from(file.originalname, 'base64').toString('utf-8');
        if (decoded.includes('.') && decoded.length > 1) {
          originalFilename = decodeURIComponent(decoded);
        }
      } catch (e) {
        // 如果解码失败，使用原始文件名
      }
      
      // 尝试解析文本文件内容
      if (file.mimetype.includes('text') || 
          file.mimetype.includes('pdf') || 
          file.mimetype.includes('word') ||
          file.mimetype.includes('markdown')) {
        const content = await this.parseFile(filePath, file.mimetype);
        if (content) {
          document.content += content + '\n\n';
        }
      }
      
      try {
        const attachment = this.fileAttachmentRepository.create({
          filename,
          originalFilename,
          filePath,
          fileType: file.mimetype,
          fileSize: file.size,
          document,
        });
        
        const savedAttachment = await this.fileAttachmentRepository.save(attachment);
          console.log('Attachment saved:', savedAttachment.id, savedAttachment.originalFilename);
          // 将新附件添加到文档的 attachments 数组中
          document.attachments.push(savedAttachment);
        } catch (e) {
          console.error('Failed to save attachment:', e);
        }
      }
    
    document.updatedAt = new Date();
    await this.documentRepository.save(document);
    console.log('Document saved with', document.attachments.length, 'attachments');
  }

  async remove(id: number): Promise<void> {
    const document = await this.findOne(id);
    
    // 先删除相关笔记（外键约束）
    await this.noteRepository.delete({ document: { id } });
    
    // 再删除所有附件记录和文件
    if (document.attachments && Array.isArray(document.attachments)) {
      for (const attachment of document.attachments) {
        try {
          if (attachment?.filePath && fs.existsSync(attachment.filePath)) {
            fs.unlinkSync(attachment.filePath);
          }
          // 删除数据库中的附件记录
          await this.fileAttachmentRepository.delete(attachment.id);
        } catch (e) {
          console.error('Failed to delete attachment:', e);
        }
      }
    }
    // 最后删除文档
    await this.documentRepository.delete(id);
  }

  async getAttachment(id: number): Promise<FileAttachment | null> {
    return this.fileAttachmentRepository.findOne({ where: { id } });
  }

  async parseFile(filePath: string, fileType: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      
      switch (fileType.toLowerCase()) {
        case 'application/pdf':
          try {
            const pdfParser = new PDFParse({ data: fileBuffer });
            const pdfData = await pdfParser.getText();
            await pdfParser.destroy();
            return pdfData.text;
          } catch (e) {
            console.error('Failed to parse PDF:', e);
            return '';
          }
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          try {
            const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
            return docxResult.value;
          } catch (e) {
            console.error('Failed to parse DOCX:', e);
            return '';
          }
        case 'text/markdown':
        case 'text/plain':
          return fileBuffer.toString('utf-8');
        default:
          return '';
      }
    } catch (e) {
      console.error('Failed to parse file:', e);
      return '';
    }
  }

  async saveFile(file: any, uploadDir: string): Promise<{ filePath: string; filename: string; originalFilename: string }> {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // 使用时间戳作为存储文件名，避免中文编码问题
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    
    // 对原始文件名进行编码存储，避免乱码
    const originalFilename = encodeURIComponent(file.originalname);
    
    await new Promise<void>((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    return { filePath, filename, originalFilename };
  }
}