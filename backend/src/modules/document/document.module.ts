import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { FileAttachment } from './file-attachment.entity';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document, FileAttachment, Category, Tag])],
  providers: [DocumentService],
  controllers: [DocumentController],
})
export class DocumentModule {}