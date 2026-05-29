import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Document } from '../document/document.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToMany(() => Document, (document) => document.tags)
  documents: Document[];
}
