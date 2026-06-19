import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFiles, Query, Put, Inject, Res, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import * as fs from 'fs';
import { DocumentService } from './document.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';
import { FileAttachment } from './file-attachment.entity';

// 自定义 multer 配置，正确处理中文文件名
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 使用时间戳作为存储文件名
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Multer 选项
const multerOptions = {
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB 单个文件大小限制
    files: 500, // 最多500个文件
    // 不限制整体请求大小
  },
  fileFilter: (req: any, file: any, cb: any) => {
    console.log('Multer fileFilter called:', file.originalname);
    cb(null, true);
  },
};



@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(FileAttachment)
    private fileAttachmentRepository: Repository<FileAttachment>,
  ) {}

  @Get()
  findAll(
    @Req() req: Request,
    @Query('categoryId') categoryId?: string,
    @Query('tagIds') tagIds?: string
  ) {
    const userId = req.user['id'];
    return this.documentService.findAll(
      userId,
      categoryId ? parseInt(categoryId) : undefined,
      tagIds || undefined
    );
  }

  @Get('by-ids')
  findByIds(@Req() req: Request, @Query('ids') ids: string) {
    const userId = req.user['id'];
    const idArray = ids.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    return this.documentService.findByIds(userId, idArray);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    return this.documentService.findOne(userId, +id);
  }

  @Post(':id/view')
  async incrementView(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    await this.documentService.incrementViewCount(userId, +id);
    return { success: true };
  }

  @Get('search')
  search(@Req() req: Request, @Query('keyword') keyword: string) {
    const userId = req.user['id'];
    return this.documentService.search(userId, keyword);
  }

  @Post('batch-upload')
  @UseInterceptors(FilesInterceptor('files', 100, multerOptions))
  async batchUpload(@UploadedFiles() files: any[], @Req() req: Request) {
    try {
      console.log('=== Batch upload request received ===');
      console.log('User:', req.user);
      console.log('Files count:', files?.length || 0);
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Request body:', req.body);
      
      if (!req.user || !req.user['id']) {
        throw new Error('User not authenticated');
      }
      
      const userId = req.user['id'];
    
      // 获取路径数组 - 尝试多种方式解析
      const paths: string[] = [];
      
      // 方式1: 解析 paths[0], paths[1] 等格式
      let key = 0;
      while (req.body[`paths[${key}]`] !== undefined) {
        paths.push(req.body[`paths[${key}]`]);
        key++;
      }
      
      // 方式2: 如果方式1失败，尝试解析 paths.0, paths.1 等格式
      if (paths.length === 0) {
        key = 0;
        while (req.body[`paths.${key}`] !== undefined) {
          paths.push(req.body[`paths.${key}`]);
          key++;
        }
      }
      
      // 方式3: 如果 paths 本身是一个数组
      if (paths.length === 0 && Array.isArray(req.body.paths)) {
        paths.push(...req.body.paths);
      }
      
      // 方式4: 从所有键中提取以 paths[ 开头的键
      if (paths.length === 0) {
        const allKeys = Object.keys(req.body);
        for (const k of allKeys) {
          if (k.startsWith('paths[')) {
            paths.push(req.body[k]);
          }
        }
      }
      
      console.log('Paths count:', paths.length);
      console.log('Paths:', paths);
      
      // 获取父分类
      let parentCategory = null;
      if (req.body.parentCategoryId) {
        const categoryId = parseInt(req.body.parentCategoryId, 10);
        if (!isNaN(categoryId) && categoryId > 0) {
          parentCategory = await this.categoryRepository.findOne({ where: { id: categoryId, userId } });
        }
      }
      
      // 获取文档元数据（描述和标签）
      let metadata: { path: string; description: string; tags: string[] }[] = [];
      if (req.body.metadata) {
        try {
          metadata = JSON.parse(req.body.metadata);
        } catch (e) {
          console.log('Failed to parse metadata:', e);
        }
      }
      
      console.log('Parent category:', parentCategory?.id || null);
      console.log('Metadata count:', metadata.length);
      
      const result = await this.documentService.batchUpload(userId, files, paths, parentCategory, metadata);
      console.log('Batch upload completed successfully:', result);
      return result;
    } catch (error: any) {
      console.error('=== Batch upload error ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  async uploadFiles(@UploadedFiles() files: any[], @Body() body: any, @Req() req: Request) {
    const userId = req.user['id'];
    const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
    
    // 保存所有附件
    const attachments: FileAttachment[] = [];
    let mainContent = '';
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 直接使用 multer 生成的文件名和路径
      const filename = file.filename;
      const filePath = file.path;
      
      // 使用 Base64 解码文件名
      let originalFilename = file.originalname;
      try {
        // 尝试 Base64 解码
        const decoded = Buffer.from(file.originalname, 'base64').toString('utf-8');
        // 如果解码结果看起来像有效的文件名（包含扩展名）
        if (decoded.includes('.') && decoded.length > 1) {
          // 尝试 URI 解码
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
        const content = await this.documentService.parseFile(filePath, file.mimetype);
        if (content) {
          mainContent += content + '\n\n';
        }
      }
      
      attachments.push({
        filename,
        originalFilename,
        filePath,
        fileType: file.mimetype,
        fileSize: file.size,
      } as FileAttachment);
    }
    
    // 获取分类
    let category = null;
    if (body.categoryId) {
      const categoryId = parseInt(body.categoryId, 10);
      if (!isNaN(categoryId) && categoryId > 0) {
        category = await this.categoryRepository.findOne({ where: { id: categoryId, userId } });
      }
    }
    
    // 获取标签
    let tags: Tag[] = [];
    if (body.tagIds) {
      try {
        const tagIds = JSON.parse(body.tagIds);
        console.log('Received tagIds:', tagIds);
        tags = await this.tagRepository.findBy({ id: In(tagIds), userId });
        console.log('Found tags:', tags);
      } catch (e) {
        console.error('Failed to parse tagIds:', e);
      }
    }
    
    // 使用第一个文件的名称作为文档标题
    const firstFile = files[0];
    return this.documentService.create({
      title: body.title || firstFile?.originalname || '未命名文档',
      content: body.description || mainContent,
      description: body.description,
      category,
      tags,
      attachments,
      userId,
    });
  }

  @Post(':id')
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files?: any[]
  ) {
    const userId = req.user['id'];
    try {
      const updateData: any = {};
    
    if (body.title !== undefined) {
      updateData.title = body.title;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    
    // 处理分类
    if (body.categoryId !== undefined) {
      const categoryId = parseInt(body.categoryId, 10);
      if (!isNaN(categoryId) && categoryId > 0) {
        updateData.category = await this.categoryRepository.findOne({ where: { id: categoryId, userId } });
      } else if (body.categoryId === null || body.categoryId === '') {
        updateData.category = null;
      }
    }
    
    // 处理标签
    if (body.tagIds) {
      try {
        const tagIds = JSON.parse(body.tagIds);
        const tags = await this.tagRepository.findBy({ id: In(tagIds), userId });
        updateData.tags = tags;
      } catch (e) {
        console.error('Failed to parse tagIds:', e);
      }
    }
    
    // 处理附件删除
    if (body.removeAttachmentIds) {
      try {
        const removeIds = JSON.parse(body.removeAttachmentIds);
        for (const attachmentId of removeIds) {
          const attachment = await this.fileAttachmentRepository.findOne({ where: { id: attachmentId } });
          if (attachment && attachment.filePath && fs.existsSync(attachment.filePath)) {
            fs.unlinkSync(attachment.filePath);
          }
          await this.fileAttachmentRepository.delete(attachmentId);
        }
      } catch (e) {
        console.error('Failed to delete attachments:', e);
      }
    }
    
    // 更新文档基本信息
    let document = await this.documentService.update(userId, +id, updateData);
    
    // 处理新附件上传
    if (files && files.length > 0) {
      console.log('=== Adding attachments in controller ===');
      console.log('Number of files:', files.length);
      console.log('Document ID:', id);
      console.log('=== Adding new attachments ===');
      console.log('Number of files to add:', files.length);
      // 使用文档ID重新获取最新的文档对象来添加附件
      await this.documentService.addAttachments(userId, +id, files);
      console.log('=== Attachments added successfully ===');
      // 重新获取文档以包含新附件
      document = await this.documentService.findOne(userId, +id);
    } else {
      console.log('=== No files to add ===');
      console.log('Files variable:', files);
    }
    
    console.log('=== Returning updated document ===');
    console.log('Attachments count:', document.attachments?.length || 0);
    return document;
      } catch (error) {
        console.error('Update document error:', error);
        throw error;
      }
    }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    try {
      await this.documentService.remove(userId, +id);
      return { success: true, message: '删除成功' };
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  @Delete('attachment/:attachmentId')
  @UseGuards(AuthGuard('jwt'))
  async removeAttachment(@Param('attachmentId') attachmentId: string) {
    try {
      const attachment = await this.fileAttachmentRepository.findOne({ where: { id: +attachmentId } });
      if (attachment && attachment.filePath && fs.existsSync(attachment.filePath)) {
        fs.unlinkSync(attachment.filePath);
      }
      await this.fileAttachmentRepository.delete(+attachmentId);
      return { success: true, message: '删除成功' };
    } catch (error) {
      console.error('Delete attachment error:', error);
      throw error;
    }
  }

  @Get('download/:attachmentId')
  @UseGuards(AuthGuard('jwt'))
  async downloadAttachment(@Param('attachmentId') attachmentId: string, @Res() res: Response) {
    const attachment = await this.documentService.getAttachment(+attachmentId);
    if (!attachment) {
      res.status(404).send('附件不存在');
      return;
    }
    
    const filePath = attachment.filePath;
    if (!fs.existsSync(filePath)) {
      res.status(404).send('文件不存在');
      return;
    }
    
    res.setHeader('Content-Type', attachment.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.originalFilename)}"`);
    res.sendFile(filePath);
  }

  @Get('preview/:attachmentId')
  @UseGuards(AuthGuard('jwt'))
  async previewAttachment(@Param('attachmentId') attachmentId: string, @Res() res: Response) {
    const attachment = await this.documentService.getAttachment(+attachmentId);
    if (!attachment) {
      res.status(404).send('附件不存在');
      return;
    }
    
    const filePath = attachment.filePath;
    if (!fs.existsSync(filePath)) {
      res.status(404).send('文件不存在');
      return;
    }
    
    res.setHeader('Content-Type', attachment.fileType);
    // 不设置 Content-Disposition 或设置为 inline，允许浏览器预览
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  }

  @Put(':id/content')
  @UseGuards(AuthGuard('jwt'))
  async updateContent(@Req() req: Request, @Param('id') id: string, @Body() body: { content: string }) {
    const userId = req.user['id'];
    try {
      const document = await this.documentService.update(userId, +id, {
        content: body.content
      });
      return document;
    } catch (error) {
      console.error('Update document content error:', error);
      throw error;
    }
  }
}