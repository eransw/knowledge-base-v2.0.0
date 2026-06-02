import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentModule } from './modules/document/document.module';
import { CategoryModule } from './modules/category/category.module';
import { TagModule } from './modules/tag/tag.module';
import { ConfigModule } from './modules/config/config.module';
import { NoteModule } from './modules/note/note.module';
import { AiModule } from './modules/ai/ai.module';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: path.join(__dirname, '..', 'database.sqlite'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    DocumentModule,
    CategoryModule,
    TagModule,
    ConfigModule,
    NoteModule,
    AiModule,
  ],
})
export class AppModule {}