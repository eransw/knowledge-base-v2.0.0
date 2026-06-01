import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderTree,
  X,
  GripVertical,
  Folder
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function RootDropzone({ onDrop }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root-dropzone',
  })

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-xl p-4 mb-4 transition-colors min-h-[60px] flex items-center justify-center ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
    >
      <p className="text-gray-500 text-center">
        拖拽分类到此处设为顶级分类
      </p>
    </div>
  )
}

function SortableCategoryItem({ item, level, onToggle, onAddChild, isExpanded, onEdit, onSave, onDelete, editCategory }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
    >
      <Card
        id={`category-${item.id}`}
        className={`mb-2 transition-all cursor-grab active:cursor-grabbing ${
          isDragging ? 'shadow-xl ring-2 ring-blue-400' : 'hover:shadow-md border-2 hover:border-blue-300'
        }`}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {item.children && item.children.length > 0 && (
              <button
                onClick={() => onToggle(item.id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            {!item.children || item.children.length === 0 && (
              <div className="w-5" />
            )}
            
            <div
              style={{ marginLeft: `${level * 16}px` }}
              className="flex items-center gap-3 flex-1"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                level === 0
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-gray-100'
              }`}>
                {(level === 0 && item.children && item.children.length > 0) ? (
                  <FolderOpen className="w-5 h-5 text-white" />
                ) : (
                  <Folder className={`w-5 h-5 ${level === 0 ? 'text-white' : 'text-gray-600'}`} />
                )}
              </div>
              {editCategory?.id === item.id ? (
                <Input
                  type="text"
                  value={editCategory.name}
                  onChange={(e) => onEdit({ ...editCategory, name: e.target.value })}
                  onBlur={() => onSave(item.id)}
                  className="flex-1 max-w-md"
                  autoFocus
                />
              ) : (
                <span className="font-semibold text-gray-800 flex-1">{item.name}</span>
              )}
              {item.children && item.children.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {item.children.length} 个子分类
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                onClick={() => onAddChild(item.id)}
                className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
              {editCategory?.id === item.id ? (
                <Button size="sm" onClick={() => onSave(item.id)}>
                  保存
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onEdit({ id: item.id, name: item.name })}
                  className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(item.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CategoryTree({ categories, expandedIds, onToggle, onAddChild, onEdit, onSave, onDelete, editCategory }) {
  const renderTree = useCallback((items, level = 0) => {
    // 按照 order 字段排序
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0))
    
    return sortedItems.map(item => (
      <div key={item.id}>
        <SortableCategoryItem
          item={item}
          level={level}
          onToggle={onToggle}
          onAddChild={onAddChild}
          isExpanded={expandedIds.includes(item.id)}
          onEdit={onEdit}
          onSave={onSave}
          onDelete={onDelete}
          editCategory={editCategory}
        />
        {item.children && item.children.length > 0 && expandedIds.includes(item.id) && (
          <div className="ml-4">
            {renderTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }, [expandedIds, onToggle, onAddChild, onEdit, onSave, onDelete, editCategory])

  return renderTree(categories)
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState(null)
  const [expandedIds, setExpandedIds] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [renderKey, setRenderKey] = useState(0)
  const [isDragOverLeft, setIsDragOverLeft] = useState(true)
  const [lastMouseX, setLastMouseX] = useState(0)
  const [lastMouseY, setLastMouseY] = useState(0)
  const [activeElementLeft, setActiveElementLeft] = useState(0)
  const [activeElementTop, setActiveElementTop] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const response = await axios.get('/api/categories/tree')
      const data = response.data
      setCategories(data)
      setRenderKey(prev => prev + 1)
      
      const getAllExpandedIds = (items) => {
        let ids = []
        items.forEach(item => {
          if (item.children && item.children.length > 0) {
            ids.push(item.id)
            ids = [...ids, ...getAllExpandedIds(item.children)]
          }
        })
        return ids
      }
      setExpandedIds(getAllExpandedIds(data))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  async function handleAdd() {
    try {
      await axios.post('/api/categories', { name, parentId })
      setShowAddModal(false)
      setName('')
      setParentId(null)
      fetchCategories()
    } catch (error) {
      console.error('Add category failed:', error)
    }
  }

  async function handleEdit(id) {
    try {
      await axios.put(`/api/categories/${id}`, { name: editCategory.name })
      setEditCategory(null)
      fetchCategories()
    } catch (error) {
      console.error('Edit category failed:', error)
    }
  }

  async function handleDelete(id) {
    if (confirm('确定要删除这个分类吗？所有子分类将变为顶级分类。')) {
      try {
        await axios.delete(`/api/categories/${id}`)
        fetchCategories()
      } catch (error) {
        console.error('Delete category failed:', error)
      }
    }
  }

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const expandAll = () => {
    const getAllIds = (items) => {
      let ids = []
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          ids.push(item.id)
          ids = [...ids, ...getAllIds(item.children)]
        }
      })
      return ids
    }
    setExpandedIds(getAllIds(categories))
  }

  const collapseAll = () => {
    setExpandedIds([])
  }

  const flattenCategories = (items, parentId = null) => {
    let result = []
    items.forEach(item => {
      result.push({ ...item, parentId })
      if (item.children) {
        result = [...result, ...flattenCategories(item.children, item.id)]
      }
    })
    return result
  }

  const findCategoryById = (items, id) => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findCategoryById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  const removeCategoryById = (items, id) => {
    return items.filter(item => item.id !== id).map(item => ({
      ...item,
      children: item.children ? removeCategoryById(item.children, id) : undefined
    }))
  }

  const addCategoryToParent = (items, parentId, category) => {
    return items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), category]
        }
      }
      return {
        ...item,
        children: item.children ? addCategoryToParent(item.children, parentId, category) : undefined
      }
    })
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    setOverId(null)
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (over) {
      setOverId(over.id)
      
      const mouseX = event.activatorEvent?.clientX || event.originalEvent?.clientX || 0
      const mouseY = event.activatorEvent?.clientY || event.originalEvent?.clientY || 0
      setLastMouseX(mouseX)
      setLastMouseY(mouseY)
      
      // 记录被拖拽元素的位置（使用鼠标位置作为左上角位置的近似）
      // 由于拖拽时鼠标通常在被拖拽元素上方，我们假设鼠标位置就是元素左上角
      setActiveElementLeft(mouseX)
      setActiveElementTop(mouseY)
      
      const overElement = document.getElementById(`category-${over.id}`)
      const overLeft = overElement?.getBoundingClientRect?.()?.left || 0
      const overWidth = overElement?.getBoundingClientRect?.()?.width || 0
      const result = mouseX <= overLeft + overWidth * 0.3
      console.log('Drag over:', { activeId: active.id, overId: over.id, mouseX, mouseY, overLeft, overWidth, isOverLeft: result })
      setIsDragOverLeft(result)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    const activeId = active.id

    // 处理拖到根容器的情况
    if (over && over.id === 'root-dropzone') {
      const flatCategories = flattenCategories(categories)
      const activeCategory = flatCategories.find(cat => cat.id === activeId)
      
      if (activeCategory && activeCategory.parentId !== null) {
        try {
          await axios.put(`/api/categories/${activeId}`, { parentId: null })
        } catch (error) {
          console.error('Failed to move category:', error)
        }
      }
      // 重置状态
      setActiveId(null)
      setOverId(null)
      setTimeout(() => fetchCategories(), 100)
      return
    }

    if (!over) {
      setActiveId(null)
      setOverId(null)
      return
    }

    const overId = over.id

    if (activeId === overId) {
      setActiveId(null)
      setOverId(null)
      return
    }

    const flatCategories = flattenCategories(categories)
    const activeCategory = flatCategories.find(cat => cat.id === activeId)
    const overCategory = flatCategories.find(cat => cat.id === overId)
    
    if (!activeCategory || !overCategory) {
      setActiveId(null)
      setOverId(null)
      return
    }

    // 防止将父分类拖到子分类下（避免循环引用）
    const isOverChildOfActive = flatCategories.some(cat => {
      let current = cat
      while (current) {
        if (current.parentId === activeId && cat.id === overId) return true
        current = flatCategories.find(c => c.id === current.parentId)
      }
      return false
    })
    
    if (isOverChildOfActive) {
      alert('不能将父分类拖到子分类下')
      setActiveId(null)
      setOverId(null)
      return
    }

    const targetElement = document.getElementById(`category-${overId}`)
    if (!targetElement) {
      setActiveId(null)
      setOverId(null)
      return
    }
    
    const overRect = targetElement.getBoundingClientRect()
    const mouseX = event.activatorEvent?.clientX || event.originalEvent?.clientX || lastMouseX
    const mouseY = event.activatorEvent?.clientY || event.originalEvent?.clientY || lastMouseY
    
    // 判断逻辑：
    // 1. 如果鼠标位置在目标分类的左侧30%区域内 → 修改为子分类
    // 2. 如果鼠标位置在目标分类的右侧70%区域内 → 同级排序
    const overWidth = overRect.width
    const relativeX = mouseX - overRect.left
    const isDropAsChild = relativeX <= overWidth * 0.3
    
    // 先重置状态
    setActiveId(null)
    setOverId(null)
    
    const activeParentId = activeCategory.parentId ?? null
    const targetParentId = overCategory.parentId ?? null
    
    if (isDropAsChild) {
      // 场景一：鼠标在目标分类左侧 → 修改为子分类
      console.log('Changing to child:', { activeId, activeName: activeCategory.name, targetId: overCategory.id, targetName: overCategory.name })
      
      try {
        await axios.put(`/api/categories/${activeId}`, { parentId: overCategory.id })
      } catch (error) {
        console.error('Failed to move category:', error.response?.data || error.message)
        return
      }
    } else {
      // 场景二：鼠标在目标分类右侧 → 同级排序或提级
      
      if (activeParentId === targetParentId) {
        // 已经是同级，只排序
        console.log('Reordering within same level:', { activeId, targetId: overId })
        
        // 根据鼠标相对于目标分类中心的位置决定排序方向
        const targetCenterY = overRect.top + overRect.height / 2
        const isAboveCenter = mouseY < targetCenterY
        const targetOrder = isAboveCenter 
          ? ((overCategory.order || 0) - 0.5) 
          : ((overCategory.order || 0) + 0.5)
        
        try {
          await axios.put(`/api/categories/${activeId}`, { order: targetOrder })
        } catch (error) {
          console.error('Failed to reorder category:', error.response?.data || error.message)
        }
      } else {
        // 提级：修改父级并排序
        console.log('Promoting and reordering:', { activeId, activeParentId, toParentId: targetParentId })
        try {
          const siblings = flatCategories.filter(cat => (cat.parentId ?? null) === targetParentId && cat.id !== activeId)
          const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order || 0)) : 0
          
          await axios.put(`/api/categories/${activeId}`, { parentId: targetParentId, order: maxOrder + 1 })
        } catch (error) {
          console.error('Failed to promote category:', error.response?.data || error.message)
          return
        }
      }
    }
    
    setTimeout(() => fetchCategories(), 300)
  }

  const activeCategory = activeId ? findCategoryById(categories, activeId) : null

  const getAllCategories = (items) => {
    let result = []
    items.forEach(item => {
      result.push(item)
      if (item.children) {
        result = [...result, ...getAllCategories(item.children)]
      }
    })
    return result
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            分类管理
          </h1>
          <p className="text-gray-500 mt-1">管理文档分类结构，支持拖拽排序和更改父级</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="shadow"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            展开所有
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="shadow"
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            收缩所有
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="shadow-lg bg-green-600 hover:bg-green-700">
              <Plus className="w-5 h-5 mr-2" />
              添加分类
            </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="w-5 h-5" />
            分类结构
          </CardTitle>
          <CardDescription>
            创建和管理您的文档分类层级，拖拽分类可调整顺序或更改父级
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无分类，点击上方按钮添加</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="relative">
                <RootDropzone onDrop={() => {}} />
                
                <CategoryTree
                  key={renderKey}
                  categories={categories}
                  expandedIds={expandedIds}
                  onToggle={toggleExpand}
                  onAddChild={(parentId) => {
                    setParentId(parentId)
                    setShowAddModal(true)
                  }}
                  onEdit={setEditCategory}
                  onSave={handleEdit}
                  onDelete={handleDelete}
                  editCategory={editCategory}
                />
              </div>

              <DragOverlay>
                {activeCategory ? (
                  <Card className="shadow-2xl ring-2 ring-blue-400">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          activeCategory.children && activeCategory.children.length > 0
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            : 'bg-gray-100'
                        }`}>
                          {activeCategory.children && activeCategory.children.length > 0 ? (
                            <FolderOpen className="w-5 h-5 text-white" />
                          ) : (
                            <Folder className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <span className="font-semibold text-gray-800">{activeCategory.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>添加分类</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAddModal(false)
                    setName('')
                    setParentId(null)
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
              <CardDescription>创建新的文档分类</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入分类名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent">上级分类（可选）</Label>
                <select
                  id="parent"
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value ? +e.target.value : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">无上级分类（顶级分类）</option>
                  {getAllCategories(categories).map(category => (
                    <option key={category.id} value={category.id}>
                      {'└'.repeat(category.level || 0)} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddModal(false)
                    setName('')
                    setParentId(null)
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleAdd} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  添加
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}