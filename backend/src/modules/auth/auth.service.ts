import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../role/role.entity';
import { Document } from '../document/document.entity';
import { FileAttachment } from '../document/file-attachment.entity';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';
import { Config } from '../config/config.entity';
import { Note } from '../note/note.entity';
import { Log } from '../log/log.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LogService } from '../log/log.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthService {
  // 默认安全配置
  private readonly DEFAULT_MAX_FAILED_ATTEMPTS = 3;
  private readonly DEFAULT_LOCK_DURATION_HOURS = 24;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
    private logService: LogService,
    private configService: ConfigService,
  ) {}

  // 获取安全配置
  private async getSecurityConfig() {
    // 从系统配置中读取（userId=1 表示系统配置）
    const maxFailedAttemptsStr = await this.configService.get('security.passwordErrorLimit', 1);
    const lockDurationHoursStr = await this.configService.get('security.lockDurationHours', 1);
    
    const maxFailedAttempts = maxFailedAttemptsStr ? parseInt(maxFailedAttemptsStr, 10) : this.DEFAULT_MAX_FAILED_ATTEMPTS;
    const lockDurationHours = lockDurationHoursStr ? parseInt(lockDurationHoursStr, 10) : this.DEFAULT_LOCK_DURATION_HOURS;
    
    return { maxFailedAttempts, lockDurationHours };
  }

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
    
    // 记录注册日志
    await this.logService.createLog({
      userId: user.id,
      username: user.username,
      action: 'register',
      module: '认证',
      description: '新用户注册',
    });
    
    return this.login({ username, password });
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { username, password } = loginDto;
    const user = await this.userRepository.findOne({ 
      where: { username }, 
      relations: { role: true } 
    });
    
    // 先检查用户是否存在
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    
    // 检查用户是否被锁定
    if (user.isLocked) {
      // 检查锁定是否已过期
      if (user.lockExpireTime && new Date() > user.lockExpireTime) {
        // 自动解锁用户
        user.isLocked = false;
        user.lockedAt = null;
        user.lockExpireTime = null;
        user.failedAttempts = 0;
        await this.userRepository.save(user);
      } else {
        throw new UnauthorizedException('用户已锁定，请联系管理员解锁');
      }
    }
    
    // 再检查密码是否正确
    if (!(await bcrypt.compare(password, user.password))) {
      // 从系统配置中获取安全设置
      const { maxFailedAttempts, lockDurationHours } = await this.getSecurityConfig();
      
      // 增加失败次数
      user.failedAttempts += 1;
      user.lastFailedAttempt = new Date();
      
      // 检查是否需要锁定
      if (user.failedAttempts >= maxFailedAttempts) {
        user.isLocked = true;
        user.lockedAt = new Date();
        user.lockExpireTime = new Date(Date.now() + lockDurationHours * 60 * 60 * 1000);
        
        await this.logService.createLog({
          userId: user.id,
          username: user.username,
          action: 'lock',
          module: '认证',
          description: `用户因密码错误超过${maxFailedAttempts}次被自动锁定`,
        });
      }
      
      await this.userRepository.save(user);
      
      const remainingAttempts = maxFailedAttempts - user.failedAttempts;
      if (remainingAttempts > 0) {
        throw new UnauthorizedException(`密码错误，还剩${remainingAttempts}次尝试机会`);
      } else {
        throw new UnauthorizedException('用户已锁定，请联系管理员解锁');
      }
    }
    
    // 登录成功，重置失败计数
    if (user.failedAttempts > 0) {
      user.failedAttempts = 0;
      user.lastFailedAttempt = null;
      await this.userRepository.save(user);
    }
    
    // 记录登录日志
    await this.logService.createLog({
      userId: user.id,
      username: user.username,
      action: 'login',
      module: '认证',
      description: '用户登录成功',
      ipAddress,
      userAgent,
    });
    
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        theme: user.theme,
        menuOrder: user.menuOrder ? JSON.parse(user.menuOrder) : null,
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
      isLocked: user.isLocked,
    }));
  }

  async getUser(id: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.id = :id', { id })
      .getOne();
      
    if (!user) return { error: 'User not found' };
    
    console.log(`getUser: user.id=${user.id}, user.roleId=${user.roleId}, user.role=${user.role ? JSON.stringify(user.role) : null}`);
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      theme: user.theme,
      roleId: user.roleId,
      role: user.role ? { id: user.role.id, name: user.role.name, permissions: user.role.permissions } : null,
      menuOrder: user.menuOrder ? JSON.parse(user.menuOrder) : null,
      createdAt: user.createdAt,
    };
  }

  async updateUserRole(userId: number, roleId: number | null) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: { role: true } });
    if (!user) return { error: 'User not found' };
    
    const oldRole = user.role ? user.role.name : '无角色';
    user.roleId = roleId;
    await this.userRepository.save(user);
    
    // 记录更新角色日志
    await this.logService.createLog({
      userId: userId,
      username: user.username,
      action: 'update',
      module: '用户管理',
      description: `更新用户角色：${oldRole} -> ${roleId ? '角色ID:' + roleId : '无角色'}`,
    });
    
    return { success: true, message: 'User role updated' };
  }

  async updateUserInfo(userId: number, updateData: { email?: string; password?: string; currentPassword?: string }) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return { error: 'User not found' };
    
    const updates: string[] = [];
    
    if (updateData.email && updateData.email !== user.email) {
      user.email = updateData.email;
      updates.push('邮箱');
    }
    
    if (updateData.password) {
      // 验证原密码
      if (!updateData.currentPassword) {
        return { error: '请提供原密码' };
      }
      const passwordMatch = await bcrypt.compare(updateData.currentPassword, user.password);
      if (!passwordMatch) {
        return { error: '原密码错误' };
      }
      
      user.password = await bcrypt.hash(updateData.password, 10);
      updates.push('密码');
    }
    
    await this.userRepository.save(user);
    
    // 记录更新日志
    await this.logService.createLog({
      userId: userId,
      username: user.username,
      action: 'update',
      module: '用户管理',
      description: `更新用户信息：${updates.join('、')}`,
    });
    
    return { success: true, message: '用户信息更新成功' };
  }

  async resetPassword(userId: number, adminId: number = 1, adminUsername: string = 'admin') {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return { error: '用户不存在' };
    
    // 将密码重置为 123456
    const defaultPassword = '123456';
    user.password = await bcrypt.hash(defaultPassword, 10);
    await this.userRepository.save(user);
    
    // 记录重置密码日志
    await this.logService.createLog({
      userId: adminId,
      username: adminUsername,
      action: 'update',
      module: '用户管理',
      description: `重置用户密码: ${user.username}`,
    });
    
    return { success: true, message: '密码已重置为 123456' };
  }

  async lockUser(userId: number, adminId: number = 1, adminUsername: string = 'admin') {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return { error: '用户不存在' };
    
    if (user.isLocked) {
      return { error: '用户已被锁定' };
    }
    
    user.isLocked = true;
    user.lockedAt = new Date();
    user.lockExpireTime = null; // 手动锁定永不过期，除非手动解锁
    await this.userRepository.save(user);
    
    await this.logService.createLog({
      userId: adminId,
      username: adminUsername,
      action: 'lock',
      module: '用户管理',
      description: `手动锁定用户: ${user.username}`,
    });
    
    return { success: true, message: '用户已被锁定' };
  }

  async unlockUser(userId: number, adminId: number = 1, adminUsername: string = 'admin') {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return { error: '用户不存在' };
    
    if (!user.isLocked) {
      return { error: '用户未被锁定' };
    }
    
    user.isLocked = false;
    user.lockedAt = null;
    user.lockExpireTime = null;
    user.failedAttempts = 0;
    user.lastFailedAttempt = null;
    await this.userRepository.save(user);
    
    await this.logService.createLog({
      userId: adminId,
      username: adminUsername,
      action: 'unlock',
      module: '用户管理',
      description: `解锁用户: ${user.username}`,
    });
    
    return { success: true, message: '用户已被解锁' };
  }

  async deleteUser(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return { error: 'User not found' };
    
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    
    try {
      // 先获取用户的所有文档ID（使用QueryBuilder）
      const documentIds = await queryRunner.manager.createQueryBuilder(Document, 'doc')
        .select('doc.id')
        .where('doc.userId = :userId', { userId })
        .getRawMany()
        .then(rows => rows.map(row => row.doc_id));
      
      // 如果有文档，先删除关联的数据
      if (documentIds.length > 0) {
        // 删除文件附件（使用SQL查询）
        await queryRunner.query(`DELETE FROM file_attachment WHERE documentId IN (${documentIds.join(',')})`);
        
        // 删除笔记
        await queryRunner.manager.delete(Note, { documentId: In(documentIds) });
        
        // 尝试删除Document和Tag的关联表记录
        // 关联表名可能因TypeORM配置而异，这里使用try-catch处理
        try {
          // 尝试常见的关联表名
          await queryRunner.query(`DELETE FROM document_tags WHERE documentId IN (${documentIds.join(',')})`);
        } catch (e) {
          try {
            // 尝试另一种命名方式
            await queryRunner.query(`DELETE FROM tags_document WHERE documentId IN (${documentIds.join(',')})`);
          } catch (e2) {
            // 如果关联表不存在，忽略这个错误
            console.log('Document-Tag junction table not found or already cleaned');
          }
        }
      }
      
      // 删除用户的文档
      await queryRunner.manager.delete(Document, { userId });
      
      // 删除用户的分类
      await queryRunner.manager.delete(Category, { userId });
      
      // 删除用户的标签
      await queryRunner.manager.delete(Tag, { userId });
      
      // 删除用户的配置
      await queryRunner.manager.delete(Config, { userId });
      
      // 删除用户的日志记录
      await queryRunner.manager.delete(Log, { userId });
      
      // 删除用户
      const result = await queryRunner.manager.delete(User, userId);
      await queryRunner.commitTransaction();
      
      // 记录删除用户日志（使用管理员账户）
      await this.logService.createLog({
        userId: 1,
        username: 'admin',
        action: 'delete',
        module: '用户管理',
        description: `删除用户: ${user.username}`,
      });
      
      return { success: result.affected > 0 };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateMenuOrder(userId: number, menuOrder: string[]) {
    await this.userRepository.update(userId, { menuOrder: JSON.stringify(menuOrder) });
    return { success: true, message: '菜单排序更新成功' };
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
    
    // 记录创建用户日志
    await this.logService.createLog({
      userId: user.id,
      username: user.username,
      action: 'create',
      module: '用户管理',
      description: '创建新用户',
    });
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
    };
  }
}