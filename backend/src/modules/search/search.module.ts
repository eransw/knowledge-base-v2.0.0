import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SystemConfig } from './system-config.entity';
import { Document } from '../document/document.entity';
import { Note } from '../note/note.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig, Document, Note]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
