import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../auth/user.entity';

@Entity()
export class Config {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.configs)
  user: User;
}
