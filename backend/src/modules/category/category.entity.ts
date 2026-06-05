import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Document } from '../document/document.entity';
import { User } from '../auth/user.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Category, (category) => category.children)
  parent: Category;

  @Column({ nullable: true })
  parentId: number;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Document, (document) => document.category)
  documents: Document[];

  @ManyToOne(() => User, (user) => user.categories)
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'float', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}