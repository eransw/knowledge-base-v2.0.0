import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './config.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async get(key: string, userId: number): Promise<string | null> {
    const config = await this.configRepository.findOneBy({ key, userId });
    return config?.value || null;
  }

  async set(key: string, value: string, userId: number): Promise<void> {
    let config = await this.configRepository.findOneBy({ key, userId });
    if (config) {
      config.value = value;
    } else {
      config = this.configRepository.create({ key, value, userId });
    }
    await this.configRepository.save(config);
  }

  async getAll(userId: number): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    const configs = await this.configRepository.findBy({ userId });
    configs.forEach(config => {
      result[config.key] = config.value;
    });
    return result;
  }
}
