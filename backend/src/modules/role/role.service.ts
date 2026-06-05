import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, PermissionConfig } from './role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: { users: true } });
  }

  async findOne(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id }, relations: { users: true } });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { name } });
  }

  async create(name: string, description: string, permissions: PermissionConfig): Promise<Role> {
    const role = this.roleRepository.create({
      name,
      description,
      permissions: JSON.stringify(permissions),
    });
    return this.roleRepository.save(role);
  }

  async update(id: number, name: string, description: string, permissions: PermissionConfig): Promise<Role | null> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) return null;
    
    role.name = name;
    role.description = description;
    role.permissions = JSON.stringify(permissions);
    return this.roleRepository.save(role);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.roleRepository.delete(id);
    return result.affected > 0;
  }

  async updatePermissions(id: number, permissions: PermissionConfig): Promise<Role | null> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) return null;
    
    role.permissions = JSON.stringify(permissions);
    return this.roleRepository.save(role);
  }
}