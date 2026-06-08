import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Log } from './log.entity';
import { Response } from 'express';

export interface CreateLogDto {
  userId: number;
  username: string;
  action: string;
  module: string;
  description?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface QueryLogDto {
  page?: number;
  pageSize?: number;
  userId?: number;
  action?: string;
  module?: string;
  username?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  // 创建日志
  async createLog(createLogDto: CreateLogDto): Promise<Log> {
    const log = this.logRepository.create({
      ...createLogDto,
      details: createLogDto.details ? JSON.stringify(createLogDto.details) : null,
    });
    return await this.logRepository.save(log);
  }

  // 查询日志列表
  async findAll(query: QueryLogDto) {
    const { page = 1, pageSize = 20, userId, action, module, username, startDate, endDate } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.logRepository.createQueryBuilder('log');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (module) {
      queryBuilder.andWhere('log.module = :module', { module });
    }

    if (username) {
      queryBuilder.andWhere('log.username LIKE :username', { username: `%${username}%` });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    queryBuilder.orderBy('log.createdAt', 'DESC');
    queryBuilder.skip(skip).take(pageSize);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      logs: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 删除单条日志
  async remove(id: number): Promise<void> {
    await this.logRepository.delete(id);
  }

  // 批量删除日志
  async removeBatch(ids: number[]): Promise<void> {
    await this.logRepository.delete(ids);
  }

  // 清空所有日志
  async clearAll(): Promise<void> {
    await this.logRepository.clear();
  }

  // 导出日志为CSV格式（Excel兼容）
  async exportToExcel(query: QueryLogDto, res: Response) {
    const { userId, action, module, username, startDate, endDate } = query;

    const queryBuilder = this.logRepository.createQueryBuilder('log');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (module) {
      queryBuilder.andWhere('log.module = :module', { module });
    }

    if (username) {
      queryBuilder.andWhere('log.username LIKE :username', { username: `%${username}%` });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    queryBuilder.orderBy('log.createdAt', 'DESC');

    const logs = await queryBuilder.getMany();

    // 生成CSV内容（Excel兼容）
    const headers = ['ID', '用户名', '操作类型', '模块', '描述', 'IP地址', '创建时间'];
    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.id,
        log.username,
        log.action,
        log.module,
        `"${(log.description || '').replace(/"/g, '""')}"`,
        log.ipAddress || '',
        log.createdAt.toISOString(),
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n'); // 添加BOM以支持中文

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=logs_${Date.now()}.csv`);
    res.send(csvContent);
  }
}