import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';
import { FileAttachment } from './file-attachment.entity';
import { User } from '../auth/user.entity';

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

  @ManyToOne(() => User, (user) => user.documents)
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => FileAttachment, (attachment) => attachment.document, { cascade: true })
  attachments: FileAttachment[];

  @Column({ default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}