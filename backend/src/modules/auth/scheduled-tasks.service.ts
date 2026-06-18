import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './user.entity';
import { LogService } from '../log/log.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private logService: LogService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleUnlockExpiredLocks() {
    this.logger.debug('Running scheduled task to unlock expired locked users...');
    
    const now = new Date();
    const nowTimestamp = now.getTime();
    
    // 查找所有被锁定且锁定已过期的用户
    // 使用query builder确保SQLite布尔值正确匹配
    const lockedUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.isLocked = :isLocked', { isLocked: 1 })
      .andWhere('user.lockExpireTime IS NOT NULL')
      .getMany();
    
    this.logger.debug(`Found ${lockedUsers.length} locked users`);
    
    const unlockedUsers: string[] = [];
    
    for (const user of lockedUsers) {
      if (user.lockExpireTime) {
        const expireTimestamp = typeof user.lockExpireTime === 'string' 
          ? new Date(user.lockExpireTime).getTime() 
          : user.lockExpireTime.getTime();
        
        this.logger.debug(`Checking user ${user.username}: lockExpireTime=${user.lockExpireTime}, expireTimestamp=${expireTimestamp}, now=${nowTimestamp}`);
        
        if (nowTimestamp > expireTimestamp) {
          user.isLocked = false;
          user.lockedAt = null;
          user.lockExpireTime = null;
          user.failedAttempts = 0;
          user.lastFailedAttempt = null;
          await this.userRepository.save(user);
          
          unlockedUsers.push(user.username);
          
          await this.logService.createLog({
            userId: 1,
            username: 'system',
            action: 'unlock',
            module: '用户管理',
            description: `用户 ${user.username} 因锁定时间到期自动解锁`,
          });
        }
      }
    }
    
    if (unlockedUsers.length > 0) {
      this.logger.log(`Automatically unlocked ${unlockedUsers.length} users: ${unlockedUsers.join(', ')}`);
    }
  }
}