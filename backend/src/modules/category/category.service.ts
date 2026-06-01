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
    const categories = await this.categoryRepository.find({
      relations: { children: true, documents: true, parent: true },
    });
    return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async findOne(id: number): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: { children: true, documents: true },
    });
  }

  async create(category: Partial<Category> & { parentId?: number }): Promise<Category> {
    const { parentId, ...rest } = category;
    const newCategory = this.categoryRepository.create({
      ...rest,
      parent: parentId ? { id: parentId } as Category : null,
    });
    return this.categoryRepository.save(newCategory);
  }

  async update(id: number, category: Partial<Category> & { parentId?: number }): Promise<Category> {
    const { parentId, order, ...rest } = category;
    const updateData: any = { ...rest };
    
    // 处理order值，过滤NaN和无效值
    if (order !== undefined && !isNaN(order)) {
      updateData.order = order;
    }
    
    if (parentId !== undefined) {
      updateData.parent = parentId ? { id: parentId } as Category : null;
    }
    
    await this.categoryRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }

  async getTree(): Promise<Category[]> {
    const categories = await this.findAll();
    const rootCategories = categories.filter((c) => !c.parent);
    return rootCategories.map((root) => this.buildTree(root, categories));
  }

  private buildTree(category: Category, allCategories: Category[]): Category {
    const children = allCategories
      .filter((c) => c.parent?.id === category.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    return {
      ...category,
      children: children.map((child) => this.buildTree(child, allCategories)),
    };
  }

  async getDocumentCount(): Promise<{ categoryId: number; count: number }[]> {
    const categories = await this.findAll();
    const result = categories.map(cat => ({
      categoryId: cat.id,
      count: cat.documents?.length || 0
    }));
    return result;
  }
}