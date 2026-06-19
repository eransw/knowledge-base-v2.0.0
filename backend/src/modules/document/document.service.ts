import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Document } from './document.entity';
import { FileAttachment } from './file-attachment.entity';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';
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
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async findAll(userId: number, categoryId?: number, tagIds?: string): Promise<Document[]> {
    // 使用简单查询方式，避免queryBuilder的问题
    const where: any = { userId };
    
    if (categoryId) {
      // 获取分类及其所有子分类的ID
      const categoryIds = await this.getCategoryIdsWithChildren(userId, categoryId);
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
  private async getCategoryIdsWithChildren(userId: number, categoryId: number): Promise<number[]> {
    const categoryIds: number[] = [categoryId];
    
    // 查询该分类的子分类（使用关系字段）
    const subCategories = await this.categoryRepository.find({
      where: { parent: { id: categoryId }, userId },
    });
    
    // 递归获取子分类的子分类
    for (const subCat of subCategories) {
      const childIds = await this.getCategoryIdsWithChildren(userId, subCat.id);
      categoryIds.push(...childIds);
    }
    
    return categoryIds;
  }

  async findOne(userId: number, id: number): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id, userId },
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

  async search(userId: number, keyword: string): Promise<Document[]> {
    return this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.category', 'category')
      .leftJoinAndSelect('document.tags', 'tags')
      .where('document.userId = :userId', { userId })
      .andWhere('document.title LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('document.userId = :userId', { userId })
      .andWhere('document.content LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }

  async create(document: Partial<Document>): Promise<Document> {
    const newDocument = this.documentRepository.create(document);
    return this.documentRepository.save(newDocument);
  }

  async update(userId: number, id: number, document: Partial<Document>): Promise<Document> {
    // 使用 save 方法来正确处理关联关系
    const existingDocument = await this.findOne(userId, id);
    
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

  async addAttachments(userId: number, documentId: number, files: any[]): Promise<void> {
    console.log('=== addAttachments called ===');
    console.log('Document ID:', documentId);
    console.log('Files received:', files);
    
    const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
    console.log('Upload directory:', uploadDir);
    
    const document = await this.findOne(userId, documentId);
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

  async remove(userId: number, id: number): Promise<void> {
    const document = await this.findOne(userId, id);
    
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

  async batchUpload(
    userId: number, 
    files: any[], 
    paths: string[], 
    parentCategory: Category | null,
    metadata: { path: string; description: string; tags: string[] }[] = []
  ): Promise<{ documents: Document[], categories: Category[] }> {
    try {
      console.log('=== batchUpload service called ===');
      console.log('userId:', userId);
      console.log('files count:', files?.length || 0);
      console.log('paths count:', paths?.length || 0);
      console.log('paths:', paths);
      console.log('parentCategory:', parentCategory?.id || null);
      
      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }
      
      const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
      
      // 按路径分组文件
      const pathMap: { [key: string]: { files: any[] } } = {};
      
      files.forEach((file, index) => {
        console.log(`Processing file ${index}:`, file.originalname);
        console.log(`File details:`, {
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        });
        
        const fileKey = paths[index] || file.originalname;
        console.log(`File key for index ${index}:`, fileKey);
        
        const parts = fileKey.split('/');
        const fileName = parts.pop();
        const directoryPath = parts.join('/');
        
        console.log(`Directory path:`, directoryPath);
        console.log(`File name:`, fileName);
        
        if (!pathMap[directoryPath]) {
          pathMap[directoryPath] = { files: [] };
        }
        
        // 解码文件名 - 处理中文文件名乱码问题
        let originalFilename = file.originalname;
        try {
          // 尝试解码 URL 编码的文件名
          const decoded = decodeURIComponent(file.originalname);
          // 如果解码后的字符串包含中文字符，则使用解码后的文件名
          if (/[\u4e00-\u9fa5]/.test(decoded)) {
            originalFilename = decoded;
          } else {
            // 尝试检测是否是 UTF-8 编码被错误解码的情况
            const utf8Decoded = Buffer.from(file.originalname, 'latin1').toString('utf-8');
            if (/[\u4e00-\u9fa5]/.test(utf8Decoded)) {
              originalFilename = utf8Decoded;
            }
          }
        } catch (e) {
          console.log('Failed to decode filename, using original:', file.originalname);
        }
        
        pathMap[directoryPath].files.push({
          file,
          originalFilename,
          fileName: fileName || file.originalname
        });
      });

      console.log('Path map:', Object.keys(pathMap));
      
      const createdCategories: Category[] = [];
      const createdDocuments: Document[] = [];

    // 递归创建分类和文档
    const processPath = async (dirPath: string, parentCat: Category | null): Promise<Category | null> => {
      if (!pathMap[dirPath]) return parentCat;
      
      const parts = dirPath.split('/').filter(p => p);
      if (parts.length === 0) return parentCat;
      
      let currentParent = parentCat;
      let currentPath = '';
      
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        // 检查分类是否已存在
        let category: Category | null;
        if (currentParent) {
          category = await this.categoryRepository.findOne({
            where: { name: part, userId, parentId: currentParent.id }
          });
        } else {
          // 使用 IsNull() 操作符来匹配 NULL 值
          category = await this.categoryRepository.findOne({
            where: { name: part, userId, parentId: IsNull() }
          });
        }
        
        // 如果不存在，创建分类
        if (!category) {
          category = this.categoryRepository.create({
            name: part,
            userId,
            parent: currentParent
          });
          category = await this.categoryRepository.save(category);
          createdCategories.push(category);
        }
        
        currentParent = category;
      }
      
      // 处理当前目录下的文件
      const dirFiles = pathMap[dirPath];
      if (dirFiles && dirFiles.files.length > 0) {
        // 按文件名中的数字分组
        const documentGroups: { [key: string]: any[] } = {};
        
        dirFiles.files.forEach(item => {
          // 提取文件名中的数字作为分组标识
          const match = item.fileName.match(/(\d+)/);
          const groupNumber = match ? match[1] : 'default';
          
          if (!documentGroups[groupNumber]) {
            documentGroups[groupNumber] = [];
          }
          documentGroups[groupNumber].push(item);
        });
        
        // 为每个分组创建文档
        for (const group of Object.values(documentGroups)) {
          const firstFile = group[0];
          // 使用完整文件名（不含扩展名）作为文档标题，与前端保持一致
          const cleanName = firstFile.fileName.replace(/\.[^/.]+$/, '');
          
          // 查找对应的元数据 - 使用前端传入的完整路径
          const docPath = dirPath ? `${dirPath}/${cleanName}` : cleanName;
          const docMetadata = metadata.find(m => m.path === docPath) || { description: '', tags: [] };
          
          // 创建文档
          const document = this.documentRepository.create({
            title: cleanName,
            content: '',
            description: docMetadata.description || '',
            userId,
            category: currentParent
          });
          
          // 处理标签
          if (docMetadata.tags && docMetadata.tags.length > 0) {
            const documentTags: Tag[] = [];
            for (const tagName of docMetadata.tags) {
              let tag = await this.tagRepository.findOne({ where: { name: tagName, userId } });
              if (!tag) {
                tag = this.tagRepository.create({ name: tagName, userId });
                tag = await this.tagRepository.save(tag);
              }
              documentTags.push(tag);
            }
            document.tags = documentTags;
          }
          
          // 处理附件
          const attachments: FileAttachment[] = [];
          for (const item of group) {
            const file = item.file;
            const filename = file.filename;
            const filePath = file.path;
            
            // 尝试解析文本内容
            if (file.mimetype.includes('text') || 
                file.mimetype.includes('pdf') || 
                file.mimetype.includes('word') ||
                file.mimetype.includes('markdown')) {
              const content = await this.parseFile(filePath, file.mimetype);
              if (content) {
                document.content += content + '\n\n';
              }
            }
            
            attachments.push({
              filename,
              originalFilename: item.originalFilename,
              filePath,
              fileType: file.mimetype,
              fileSize: file.size,
            } as FileAttachment);
          }
          
          document.attachments = attachments;
          const savedDocument = await this.documentRepository.save(document);
          createdDocuments.push(savedDocument);
        }
      }
      
      return currentParent;
    };

    // 获取所有目录路径
    const allPaths = Object.keys(pathMap);
    
    // 按路径长度排序，确保父目录先处理
    allPaths.sort((a, b) => a.split('/').length - b.split('/').length);
    
    // 处理根目录文件（如果有）
    if (pathMap['']) {
      await processPath('', parentCategory);
    }
    
    // 处理其他目录
    for (const dirPath of allPaths) {
      if (dirPath) {
        await processPath(dirPath, parentCategory);
      }
    }
    
    console.log('=== batchUpload completed ===');
    console.log('Created documents:', createdDocuments.length);
    console.log('Created categories:', createdCategories.length);
    
    return { documents: createdDocuments, categories: createdCategories };
    } catch (error: any) {
      console.error('=== batchUpload service error ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
}