import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DocumentModule } from '../document/document.module';
import { Note } from '../note/note.entity';

@Module({
  imports: [DocumentModule, TypeOrmModule.forFeature([Note]), AuthModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}