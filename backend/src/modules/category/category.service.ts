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

  async findAll(userId: number): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { userId },
      relations: { children: true, documents: true, parent: true },
    });
    return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async findOne(userId: number, id: number): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { id, userId },
      relations: { children: true, documents: true },
    });
  }

  async create(userId: number, category: Partial<Category> & { parentId?: number }): Promise<Category> {
    const { parentId, ...rest } = category;
    const newCategory = this.categoryRepository.create({
      ...rest,
      userId,
      parent: parentId ? { id: parentId } as Category : null,
    });
    return this.categoryRepository.save(newCategory);
  }

  async update(userId: number, id: number, category: Partial<Category> & { parentId?: number }): Promise<Category> {
    const { parentId, order, ...rest } = category;
    const updateData: any = { ...rest };
    
    // 处理order值，过滤NaN和无效值
    if (order !== undefined && !isNaN(order)) {
      updateData.order = order;
    }
    
    if (parentId !== undefined) {
      updateData.parent = parentId ? { id: parentId } as Category : null;
    }
    
    await this.categoryRepository.update({ id, userId }, updateData);
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number): Promise<void> {
    await this.categoryRepository.delete({ id, userId });
  }

  async getTree(userId: number): Promise<Category[]> {
    const categories = await this.findAll(userId);
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

  async getDocumentCount(userId: number): Promise<{ categoryId: number; count: number }[]> {
    const categories = await this.findAll(userId);
    const result = categories.map(cat => ({
      categoryId: cat.id,
      count: cat.documents?.length || 0
    }));
    return result;
  }
}