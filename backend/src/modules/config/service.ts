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

  async get(key: string): Promise<string | null> {
    const config = await this.configRepository.findOneBy({ key });
    return config?.value || null;
  }

  async set(key: string, value: string): Promise<void> {
    let config = await this.configRepository.findOneBy({ key });
    if (config) {
      config.value = value;
    } else {
      config = this.configRepository.create({ key, value });
    }
    await this.configRepository.save(config);
  }

  async getAll(): Promise<Record<string, string>> {
    const configs = await this.configRepository.find();
    const result: Record<string, string> = {};
    configs.forEach(config => {
      result[config.key] = config.value;
    });
    return result;
  }
}
