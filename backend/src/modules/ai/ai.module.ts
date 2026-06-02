import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DocumentModule } from '../document/document.module';
import { Note } from '../note/note.entity';

@Module({
  imports: [DocumentModule, TypeOrmModule.forFeature([Note])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}