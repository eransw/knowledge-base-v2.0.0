import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/user.entity';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  username: string;

  @Column()
  action: string; // 操作类型：login, logout, create, update, delete等

  @Column()
  module: string; // 模块名称：用户、文档、分类、标签等

  @Column({ type: 'text', nullable: true })
  description: string; // 操作描述

  @Column({ type: 'text', nullable: true })
  details: string; // 详细信息，JSON格式

  @Column({ nullable: true })
  ipAddress: string; // IP地址

  @Column({ nullable: true })
  userAgent: string; // 浏览器信息

  @CreateDateColumn()
  createdAt: Date;
}