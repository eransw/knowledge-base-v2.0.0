import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  filename: string;

  @Column()
  originalFilename: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  summary: string;

  @Column()
  fileType: string;

  @Column()
  filePath: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.documents)
  category: Category;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];
}
