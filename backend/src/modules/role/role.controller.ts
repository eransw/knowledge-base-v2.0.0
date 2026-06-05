import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleService } from './role.service';
import { PermissionConfig } from './role.entity';

@Controller('roles')
@UseGuards(AuthGuard('jwt'))
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  async getAll() {
    const roles = await this.roleService.findAll();
    return roles.map(role => ({
      ...role,
      permissions: JSON.parse(role.permissions),
    }));
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    const role = await this.roleService.findOne(id);
    if (!role) return { error: 'Role not found' };
    return {
      ...role,
      permissions: JSON.parse(role.permissions),
    };
  }

  @Post()
  async create(@Body() body: { name: string; description?: string; permissions?: PermissionConfig }) {
    const { name, description = '', permissions = { menus: [], edit: false, delete: false } } = body;
    
    const existing = await this.roleService.findByName(name);
    if (existing) return { error: 'Role name already exists' };
    
    const role = await this.roleService.create(name, description, permissions);
    return {
      ...role,
      permissions: JSON.parse(role.permissions),
    };
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: { name: string; description?: string; permissions?: PermissionConfig }) {
    const { name, description = '', permissions = { menus: [], edit: false, delete: false } } = body;
    
    const role = await this.roleService.update(id, name, description, permissions);
    if (!role) return { error: 'Role not found' };
    
    return {
      ...role,
      permissions: JSON.parse(role.permissions),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const success = await this.roleService.delete(id);
    return { success };
  }

  @Put(':id/permissions')
  async updatePermissions(@Param('id') id: number, @Body() body: { permissions: PermissionConfig }) {
    const role = await this.roleService.updatePermissions(id, body.permissions);
    if (!role) return { error: 'Role not found' };
    
    return {
      ...role,
      permissions: JSON.parse(role.permissions),
    };
  }
}