import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../role/role.entity';
import { Document } from '../document/document.entity';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';
import { Config } from '../config/config.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    
    if (existingUser) {
      throw new ConflictException('用户已存在');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const defaultRole = await this.roleRepository.findOne({ where: { name: '普通用户' } });
    
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: defaultRole,
    });
    
    await this.userRepository.save(user);
    return this.login({ username, password });
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.userRepository.findOne({ 
      where: { username }, 
      relations: { role: true } 
    });
    
    // 先检查用户是否存在
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    
    // 再检查密码是否正确
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('密码错误');
    }
    
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        theme: user.theme,
        role: user.role ? { 
          id: user.role.id, 
          name: user.role.name,
          permissions: user.role.permissions 
        } : null 
      },
    };
  }

  async updateTheme(userId: number, theme: string) {
    await this.userRepository.update(userId, { theme });
    return { success: true, message: '主题更新成功' };
  }

  async getAllUsers() {
    const users = await this.userRepository.find({ relations: { role: true } });
    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      theme: user.theme,
      roleId: user.roleId,
      role: user.role ? { id: user.role.id, name: user.role.name } : null,
      createdAt: user.createdAt,
    }));
  }

  async getUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id }, relations: { role: true } });
    if (!user) return { error: 'User not found' };
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      theme: user.theme,
      roleId: user.roleId,
      role: user.role ? { id: user.role.id, name: user.role.name } : null,
      createdAt: user.createdAt,
    };
  }

  async updateUserRole(userId: number, roleId: number | null) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return { error: 'User not found' };
    
    user.roleId = roleId;
    await this.userRepository.save(user);
    
    return { success: true, message: 'User role updated' };
  }

  async deleteUser(userId: number) {
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    
    try {
      await queryRunner.manager.delete(Document, { userId });
      await queryRunner.manager.delete(Category, { userId });
      await queryRunner.manager.delete(Tag, { userId });
      await queryRunner.manager.delete(Config, { userId });
      
      const result = await queryRunner.manager.delete(User, userId);
      await queryRunner.commitTransaction();
      
      return { success: result.affected > 0 };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createUser(username: string, email: string, password: string, roleId?: number) {
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    
    if (existingUser) {
      throw new UnauthorizedException('用户已存在');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      roleId,
    });
    
    await this.userRepository.save(user);
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
    };
  }
}