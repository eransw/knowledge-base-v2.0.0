import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from '../document/document.entity';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';
import { Config } from '../config/config.entity';
import { Role } from '../role/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'police' })
  theme: string;

  @Column({ nullable: true })
  roleId: number;

  @Column({ type: 'text', nullable: true })
  menuOrder: string;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ type: 'datetime', nullable: true })
  lockedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lockExpireTime: Date;

  @Column({ default: 0 })
  failedAttempts: number;

  @Column({ type: 'datetime', nullable: true })
  lastFailedAttempt: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToMany(() => Document, (document) => document.user)
  documents: Document[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Tag[];

  @OneToMany(() => Config, (config) => config.user)
  configs: Config[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}