import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ai_config')
export class AiConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'doubao-pro' })
  provider: string;

  @Column({ default: '' })
  apiKey: string;

  @Column({ default: '' })
  apiSecret: string;

  @Column({ default: 'https://api.doubao.com/v1/chat/completions' })
  apiUrl: string;

  @Column({ default: 'Doubao-Pro' })
  model: string;

  @Column({ type: 'float', default: 0.7 })
  temperature: number;

  @Column({ default: 2000 })
  maxTokens: number;

  @Column({ default: 'bearer' })
  authType: string;

  @Column({ default: false })
  mockMode: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
