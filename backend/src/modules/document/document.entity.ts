import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';
import { FileAttachment } from './file-attachment.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.documents, { nullable: true })
  category: Category;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => FileAttachment, (attachment) => attachment.document, { cascade: true })
  attachments: FileAttachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}