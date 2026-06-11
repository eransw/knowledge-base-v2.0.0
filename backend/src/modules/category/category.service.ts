import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './category.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectEntityManager()
    private entityManager: EntityManager,
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
    // 获取该分类及其所有子分类
    const allCategories = await this.findAll(userId);
    const categoryIdsToDelete = this.getAllDescendantIds(id, allCategories);
    categoryIdsToDelete.push(id); // 包含当前分类
    
    console.log('Categories to delete:', categoryIdsToDelete);
    
    // 先获取所有要删除的文档 ID
    const documents = await this.entityManager
      .createQueryBuilder()
      .select('d.id', 'id')
      .from('document', 'd')
      .where('d.categoryId IN (:...ids)', { ids: categoryIdsToDelete })
      .getRawMany();
    
    const documentIds = documents.map(doc => doc.id);
    console.log('Documents to delete:', documentIds.length);
    
    // 获取所有要删除的文件附件路径
    const attachments = await this.entityManager
      .createQueryBuilder()
      .select('fa.filePath', 'filePath')
      .from('file_attachment', 'fa')
      .where('fa.documentId IN (:...docIds)', { docIds: documentIds })
      .getRawMany();
    
    console.log('Attachments to delete:', attachments.length);
    
    // 开始事务
    await this.entityManager.transaction(async (manager) => {
      // 删除文件附件记录
      if (documentIds.length > 0) {
        await manager
          .createQueryBuilder()
          .delete()
          .from('file_attachment')
          .where('documentId IN (:...docIds)', { docIds: documentIds })
          .execute();
      }
      
      // 删除文档记录
      await manager
        .createQueryBuilder()
        .delete()
        .from('document')
        .where('categoryId IN (:...ids)', { ids: categoryIdsToDelete })
        .execute();
      
      // 删除分类记录
      await manager
        .createQueryBuilder()
        .delete()
        .from('category')
        .where('id IN (:...ids)', { ids: categoryIdsToDelete })
        .execute();
    });
    
    // 删除服务器上的文件（事务成功后执行）
    for (const attachment of attachments) {
      try {
        const filePath = attachment.filePath;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Deleted file:', filePath);
        }
      } catch (error) {
        console.error('Failed to delete file:', attachment.filePath, error);
      }
    }
    
    console.log('Category deletion completed successfully');
  }
  
  private getAllDescendantIds(parentId: number, allCategories: Category[]): number[] {
    const children = allCategories.filter(cat => cat.parentId === parentId);
    let ids: number[] = [];
    
    for (const child of children) {
      ids.push(child.id);
      ids = [...ids, ...this.getAllDescendantIds(child.id, allCategories)];
    }
    
    return ids;
  }

  async getDeleteInfo(userId: number, id: number): Promise<{ 
    subcategoryCount: number; 
    documentCount: number; 
    fileCount: number;
    subcategories: Category[];
  }> {
    try {
      console.log('getDeleteInfo called with userId:', userId, 'id:', id);
      
      const allCategories = await this.findAll(userId);
      console.log('All categories found:', allCategories.length);
      
      const categoryIdsToDelete = this.getAllDescendantIds(id, allCategories);
      categoryIdsToDelete.push(id);
      console.log('Category IDs to delete:', categoryIdsToDelete);
      
      // 获取子分类列表
      const subcategories = allCategories.filter(cat => categoryIdsToDelete.includes(cat.id) && cat.id !== id);
      console.log('Subcategories:', subcategories.length);
      
      // 获取文档数量 - 使用 TypeORM 查询代替原生 SQL
      const documentCount = await this.entityManager
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('document', 'd')
        .where('d.categoryId IN (:...ids)', { ids: categoryIdsToDelete })
        .getRawOne();
      
      const docCount = parseInt(documentCount?.count || '0');
      console.log('Document count:', docCount);
      
      // 获取文件数量
      const fileCount = await this.entityManager
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('file_attachment', 'fa')
        .innerJoin('document', 'd', 'fa.documentId = d.id')
        .where('d.categoryId IN (:...ids)', { ids: categoryIdsToDelete })
        .getRawOne();
      
      const fCount = parseInt(fileCount?.count || '0');
      console.log('File count:', fCount);
      
      return {
        subcategoryCount: subcategories.length,
        documentCount: docCount,
        fileCount: fCount,
        subcategories
      };
    } catch (error) {
      console.error('Error in getDeleteInfo:', error);
      throw error;
    }
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