import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['children', 'documents'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'documents'],
    });
  }

  async create(category: Partial<Category>): Promise<Category> {
    const newCategory = this.categoryRepository.create(category);
    return this.categoryRepository.save(newCategory);
  }

  async update(id: number, category: Partial<Category>): Promise<Category> {
    await this.categoryRepository.update(id, category);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }

  async getTree(): Promise<Category[]> {
    const categories = await this.findAll();
    const rootCategories = categories.filter((c) => !c.parentId);
    return rootCategories.map((root) => this.buildTree(root, categories));
  }

  private buildTree(category: Category, allCategories: Category[]): Category {
    const children = allCategories.filter((c) => c.parentId === category.id);
    return {
      ...category,
      children: children.map((child) => this.buildTree(child, allCategories)),
    };
  }
}
