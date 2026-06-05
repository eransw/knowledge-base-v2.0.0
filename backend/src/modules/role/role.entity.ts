import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../auth/user.entity';

export type PermissionType = 'menu' | 'edit' | 'delete';

export interface PermissionConfig {
  menus: string[];
  edit: boolean;
  delete: boolean;
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', default: '{"menus": [], "edit": false, "delete": false}' })
  permissions: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  getPermissions(): PermissionConfig {
    try {
      return JSON.parse(this.permissions);
    } catch {
      return { menus: [], edit: false, delete: false };
    }
  }

  setPermissions(config: PermissionConfig): void {
    this.permissions = JSON.stringify(config);
  }
}