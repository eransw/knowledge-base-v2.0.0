import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Document } from './document.entity';

@Entity()
export class FileAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  originalFilename: string;

  @Column()
  filePath: string;

  @Column()
  fileType: string;

  @Column()
  fileSize: number;

  @ManyToOne(() => Document, (document) => document.attachments)
  document: Document;

  @CreateDateColumn()
  createdAt: Date;
}