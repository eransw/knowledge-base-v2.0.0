import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(userId: number): Promise<Tag[]> {
    return this.tagRepository.find({ where: { userId }, order: { order: 'ASC' } });
  }

  async findOne(userId: number, id: number): Promise<Tag> {
    return this.tagRepository.findOneBy({ id, userId });
  }

  async findByName(userId: number, name: string): Promise<Tag> {
    return this.tagRepository.findOneBy({ name, userId });
  }

  async create(userId: number, tag: Partial<Tag>): Promise<Tag> {
    const newTag = this.tagRepository.create({ ...tag, userId });
    return this.tagRepository.save(newTag);
  }

  async update(userId: number, id: number, tag: Partial<Tag>): Promise<Tag> {
    await this.tagRepository.update({ id, userId }, tag);
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number): Promise<void> {
    await this.tagRepository.delete({ id, userId });
  }

  async updateOrder(userId: number, orderData: { id: number; order: number }[]): Promise<void> {
    for (const item of orderData) {
      await this.tagRepository.update({ id: item.id, userId }, { order: item.order });
    }
  }

  async getOrCreate(userId: number, names: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    for (const name of names) {
      let tag = await this.findByName(userId, name);
      if (!tag) {
        tag = await this.create(userId, { name });
      }
      tags.push(tag);
    }
    return tags;
  }
}