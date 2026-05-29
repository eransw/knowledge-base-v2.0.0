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

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({ order: { order: 'ASC' } });
  }

  async findOne(id: number): Promise<Tag> {
    return this.tagRepository.findOneBy({ id });
  }

  async findByName(name: string): Promise<Tag> {
    return this.tagRepository.findOneBy({ name });
  }

  async create(tag: Partial<Tag>): Promise<Tag> {
    const newTag = this.tagRepository.create(tag);
    return this.tagRepository.save(newTag);
  }

  async update(id: number, tag: Partial<Tag>): Promise<Tag> {
    await this.tagRepository.update(id, tag);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.tagRepository.delete(id);
  }

  async getOrCreate(names: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    for (const name of names) {
      let tag = await this.findByName(name);
      if (!tag) {
        tag = await this.create({ name });
      }
      tags.push(tag);
    }
    return tags;
  }
}
