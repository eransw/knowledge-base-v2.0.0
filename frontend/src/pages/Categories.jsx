import React, { useState, useEffect, useCallback } from 'react'
import axios from '../api/axios'
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
  Folder,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import { cardClass, textClass, inputClass } from '../lib/themeStyles'
import { ConfirmDialog } from '../components/ConfirmDialog'
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

function RootDropzone({ onDrop, isDark }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root-dropzone',
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-2 border-dashed rounded-xl p-4 mb-4 transition-colors min-h-[60px] flex items-center justify-center",
        isOver 
          ? (isDark ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50') 
          : (isDark ? 'border-slate-600/50' : 'border-gray-300')
      )}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
    >
      <p className={cn("text-center", isDark ? "text-slate-400" : "text-gray-500")}>
        拖拽分类到此处设为顶级分类
      </p>
    </div>
  )
}

function SortableCategoryItem({ item, level, onToggle, onAddChild, isExpanded, onEdit, onSave, onDelete, editCategory, isDark, onMoveUp, onMoveDown, isFirst, isLast }) {
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
        className={cn(
          "mb-2 transition-all cursor-grab active:cursor-grabbing",
          cardClass(isDark),
          isDragging 
            ? 'shadow-xl ring-2 ring-blue-400' 
            : isDark 
              ? 'hover:shadow-md border-2 hover:border-blue-500/50' 
              : 'hover:shadow-md border-2 hover:border-blue-300'
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className={cn(
                "opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity",
                isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100"
              )}
            >
              <GripVertical className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-gray-400")} />
            </button>
            
            {item.children && item.children.length > 0 && (
              <button
                onClick={() => onToggle(item.id)}
                className={cn(
                  "p-1 rounded transition-colors",
                  isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100"
                )}
              >
                {isExpanded ? (
                  <ChevronDown className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-gray-500")} />
                ) : (
                  <ChevronRight className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-gray-500")} />
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
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center",
                level === 0
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : isDark ? 'bg-slate-700/50' : 'bg-gray-100'
              )}>
                {(level === 0 && item.children && item.children.length > 0) ? (
                  <FolderOpen className="w-5 h-5 text-white" />
                ) : (
                  <Folder className={cn("w-5 h-5", level === 0 ? 'text-white' : isDark ? 'text-slate-400' : 'text-gray-600')} />
                )}
              </div>
              {editCategory?.id === item.id ? (
                <Input
                  type="text"
                  value={editCategory.name}
                  onChange={(e) => onEdit({ ...editCategory, name: e.target.value })}
                  onBlur={() => onSave(item.id)}
                  className={cn("flex-1 max-w-md", inputClass(isDark))}
                  autoFocus
                />
              ) : (
                <span className={cn("font-semibold flex-1", textClass('primary', isDark))}>{item.name}</span>
              )}
              {item.children && item.children.length > 0 && (
                <Badge className={cn(
                  "text-xs",
                  isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-100 text-gray-600"
                )}>
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
              <Button
                size="sm"
                onClick={() => {
                  console.log('Move Up button clicked for item:', item.id, 'isFirst:', isFirst)
                  onMoveUp(item.id)
                }}
                disabled={isFirst}
                className={cn(
                  "h-8 w-8 p-0",
                  isFirst 
                    ? "opacity-30 cursor-not-allowed bg-gray-600" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                )}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  console.log('Move Down button clicked for item:', item.id, 'isLast:', isLast)
                  onMoveDown(item.id)
                }}
                disabled={isLast}
                className={cn(
                  "h-8 w-8 p-0",
                  isLast 
                    ? "opacity-30 cursor-not-allowed bg-gray-500" 
                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                )}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CategoryTree({ categories, expandedIds, onToggle, onAddChild, onEdit, onSave, onDelete, editCategory, isDark, onMoveUp, onMoveDown }) {
  const renderTree = useCallback((items, level = 0) => {
    // 按照 order 字段排序
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0))
    console.log('CategoryTree renderTree - level:', level, 'items count:', items.length, 'sortedItems:', sortedItems)
    
    return sortedItems.map((item, index) => (
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
          isDark={isDark}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isFirst={index === 0}
          isLast={index === sortedItems.length - 1}
        />
        {item.children && item.children.length > 0 && expandedIds.includes(item.id) && (
          <div className="ml-4">
            {renderTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }, [expandedIds, onToggle, onAddChild, onEdit, onSave, onDelete, editCategory, onMoveUp, onMoveDown])

  return renderTree(categories)
}

export default function Categories() {
  const { isDark, currentTheme } = useTheme()
  const isPolice = currentTheme === 'police'
  const isNight = currentTheme === 'night'
  const isCyber = currentTheme === 'cyber'
  const isPurple = currentTheme === 'purple'
  const isGreen = currentTheme === 'green'
  const isOrange = currentTheme === 'orange'
  const isPink = currentTheme === 'pink'
  const isSpecialTheme = isPolice || isNight || isCyber || isPurple || isGreen || isOrange || isPink

  // 获取主题特定的主色调用于渐变和装饰
  const getGradientColors = () => {
    if (isPolice) return { from: 'from-[#0a1628]', via: 'via-[#0f1f3d]', to: 'to-[#0a1628]', accent: 'cyan', glow: '0,255,255' }
    if (isNight) return { from: 'from-[#0f0a1e]', via: 'via-[#1a1333]', to: 'to-[#251d47]', accent: 'violet', glow: '167,139,250' }
    if (isCyber) return { from: 'from-[#09090b]', via: 'via-[#18181b]', to: 'to-[#27272a]', accent: 'red', glow: '239,68,68' }
    if (isPurple) return { from: 'from-[#0f172a]', via: 'via-[#1e1b4b]', to: 'to-[#1e1b4b]', accent: 'purple', glow: '168,85,247' }
    if (isGreen) return { from: 'from-[#0f172a]', via: 'via-[#14532d]', to: 'to-[#14532d]', accent: 'green', glow: '34,197,94' }
    if (isOrange) return { from: 'from-[#0f172a]', via: 'via-[#7c2d12]', to: 'to-[#7c2d12]', accent: 'orange', glow: '249,115,22' }
    if (isPink) return { from: 'from-[#0f172a]', via: 'via-[#831843]', to: 'to-[#831843]', accent: 'pink', glow: '236,72,153' }
    return { from: 'from-slate-900', via: 'via-slate-800/50', to: 'to-indigo-950/50', accent: 'blue', glow: '59,130,246' }
  }
  const gradientColors = getGradientColors()

  // 获取主题特定的卡片样式
  const getCardColors = () => {
    if (isPolice) return { bgFrom: 'from-[#1a2f50]/95', bgTo: 'to-[#0f1f3d]/90', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/20', text: 'text-cyan-300', btnFrom: 'from-cyan-600', btnVia: 'via-blue-600', btnTo: 'to-cyan-500' }
    if (isNight) return { bgFrom: 'from-[#1a1333]/95', bgTo: 'to-[#251d47]/90', border: 'border-violet-500/30', shadow: 'shadow-violet-500/20', text: 'text-violet-300', btnFrom: 'from-violet-600', btnVia: 'via-purple-600', btnTo: 'to-violet-500' }
    if (isCyber) return { bgFrom: 'from-[#18181b]/95', bgTo: 'to-[#27272a]/90', border: 'border-red-500/30', shadow: 'shadow-red-500/20', text: 'text-red-300', btnFrom: 'from-red-600', btnVia: 'via-rose-600', btnTo: 'to-red-500' }
    if (isPurple) return { bgFrom: 'from-[#1e1b4b]/95', bgTo: 'to-[#0f172a]/90', border: 'border-purple-500/30', shadow: 'shadow-purple-500/20', text: 'text-purple-300', btnFrom: 'from-purple-600', btnVia: 'via-violet-600', btnTo: 'to-purple-500' }
    if (isGreen) return { bgFrom: 'from-[#14532d]/95', bgTo: 'to-[#0f172a]/90', border: 'border-green-500/30', shadow: 'shadow-green-500/20', text: 'text-green-300', btnFrom: 'from-green-600', btnVia: 'via-emerald-600', btnTo: 'to-green-500' }
    if (isOrange) return { bgFrom: 'from-[#7c2d12]/95', bgTo: 'to-[#0f172a]/90', border: 'border-orange-500/30', shadow: 'shadow-orange-500/20', text: 'text-orange-300', btnFrom: 'from-orange-600', btnVia: 'via-amber-600', btnTo: 'to-orange-500' }
    if (isPink) return { bgFrom: 'from-[#831843]/95', bgTo: 'to-[#0f172a]/90', border: 'border-pink-500/30', shadow: 'shadow-pink-500/20', text: 'text-pink-300', btnFrom: 'from-pink-600', btnVia: 'via-rose-600', btnTo: 'to-pink-500' }
    return { bgFrom: 'from-slate-800/95', bgTo: 'to-slate-700/90', border: 'border-slate-600/40', shadow: 'shadow-black/40', text: 'text-slate-300', btnFrom: 'from-blue-600', btnVia: 'via-indigo-600', btnTo: 'to-purple-600' }
  }
  const cardColors = getCardColors()
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
  // 删除确认对话框状态
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteConfirmData, setDeleteConfirmData] = useState(null)

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
    fetchCategories().then(() => {
      // 测试排序功能
      if (categories.length > 1) {
        console.log('Testing sort functionality...')
        console.log('Categories data:', categories)
        const flat = flattenCategories(categories)
        console.log('Flat categories:', flat)
      }
    })
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

  async function handleMoveUp(categoryId) {
    const flatCategories = flattenCategories(categories)
    const currentCategory = flatCategories.find(cat => cat.id === categoryId)
    
    if (!currentCategory) return
    
    const currentParentId = currentCategory.parentId ?? null
    const siblings = flatCategories.filter(
      cat => (cat.parentId ?? null) === currentParentId
    ).sort((a, b) => (a.order || 0) - (b.order || 0))
    
    const currentIndex = siblings.findIndex(sib => sib.id === categoryId)
    if (currentIndex <= 0) return
    
    const prevSibling = siblings[currentIndex - 1]
    
    try {
      // 如果两个分类的order值相同，先给所有同级分类重新分配唯一的order值
      if (currentCategory.order === prevSibling.order) {
        for (let i = 0; i < siblings.length; i++) {
          await axios.put(`/api/categories/${siblings[i].id}`, { order: i * 10 })
        }
      } else {
        // 交换两个分类的order值
        await axios.put(`/api/categories/${categoryId}`, { order: prevSibling.order })
        await axios.put(`/api/categories/${prevSibling.id}`, { order: currentCategory.order })
      }
      fetchCategories()
    } catch (error) {
      console.error('Failed to move category up:', error.response?.data || error.message)
    }
  }

  async function handleMoveDown(categoryId) {
    const flatCategories = flattenCategories(categories)
    const currentCategory = flatCategories.find(cat => cat.id === categoryId)
    
    if (!currentCategory) return
    
    const currentParentId = currentCategory.parentId ?? null
    const siblings = flatCategories.filter(
      cat => (cat.parentId ?? null) === currentParentId
    ).sort((a, b) => (a.order || 0) - (b.order || 0))
    
    const currentIndex = siblings.findIndex(sib => sib.id === categoryId)
    if (currentIndex >= siblings.length - 1) return
    
    const nextSibling = siblings[currentIndex + 1]
    
    try {
      // 如果两个分类的order值相同，先给所有同级分类重新分配唯一的order值
      if (currentCategory.order === nextSibling.order) {
        for (let i = 0; i < siblings.length; i++) {
          await axios.put(`/api/categories/${siblings[i].id}`, { order: i * 10 })
        }
      } else {
        // 交换两个分类的order值
        await axios.put(`/api/categories/${categoryId}`, { order: nextSibling.order })
        await axios.put(`/api/categories/${nextSibling.id}`, { order: currentCategory.order })
      }
      fetchCategories()
    } catch (error) {
      console.error('Failed to move category down:', error.response?.data || error.message)
    }
  }

  async function handleDelete(id) {
    try {
      // 获取删除信息
      const deleteInfoResponse = await axios.get(`/api/categories/${id}/delete-info`)
      const { subcategoryCount, documentCount, fileCount } = deleteInfoResponse.data
      
      // 构建警告消息
      let warningMessage = '删除后将同时删除：<ul>'
      if (subcategoryCount > 0) {
        warningMessage += `<li>${subcategoryCount} 个子分类</li>`
      }
      if (documentCount > 0) {
        warningMessage += `<li>${documentCount} 个文档</li>`
      }
      if (fileCount > 0) {
        warningMessage += `<li>${fileCount} 个文件附件</li>`
      }
      warningMessage += '</ul>'
      
      // 设置删除确认对话框数据
      setDeleteConfirmData({
        id,
        message: warningMessage
      })
      // 打开删除确认对话框
      setDeleteConfirmOpen(true)
    } catch (error) {
      console.error('Delete category failed:', error)
      alert(`删除失败: ${error.response?.data?.message || error.message}`)
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmData) return
    
    try {
      await axios.delete(`/api/categories/${deleteConfirmData.id}`)
      fetchCategories()
    } catch (error) {
      console.error('Delete category failed:', error)
      alert(`删除失败: ${error.response?.data?.message || error.message}`)
    } finally {
      setDeleteConfirmOpen(false)
      setDeleteConfirmData(null)
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
    <div className={cn("p-6 space-y-6 min-h-screen", 
      isDark 
        ? isSpecialTheme
          ? cn("bg-gradient-to-br", gradientColors.from, gradientColors.via, gradientColors.to)
          : "bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900"
        : "bg-gradient-to-br from-white via-gray-50 to-blue-50")}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("text-3xl font-bold",
            isDark && isSpecialTheme 
              ? cn(`text-${gradientColors.accent}-300`, `drop-shadow-[0_0_10px_rgba(${gradientColors.glow},0.5)]`)
              : isDark 
                ? "text-white"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent")}>
            分类管理
          </h1>
          <p className={cn("mt-1", textClass('muted', isDark))}>管理文档分类结构，支持拖拽排序和更改父级</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className={cn("shadow", isDark && isSpecialTheme ? cn(cardColors.border, `hover:bg-${gradientColors.accent}-500/10`, `text-${gradientColors.accent}-400`) : "border-slate-600/50 hover:bg-slate-700/30 text-gray-200")}
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            展开所有
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className={cn("shadow", isDark && isSpecialTheme ? cn(cardColors.border, `hover:bg-${gradientColors.accent}-500/10`, `text-${gradientColors.accent}-400`) : "border-slate-600/50 hover:bg-slate-700/30 text-gray-200")}
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            收缩所有
          </Button>
          <Button onClick={() => setShowAddModal(true)} className={cn("shadow-lg",
            isDark && isSpecialTheme
              ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, "hover:opacity-90")
              : "bg-green-600 hover:bg-green-700")}>
              <Plus className="w-5 h-5 mr-2" />
              添加分类
            </Button>
        </div>
      </div>

      <Card className={cn(cardClass(isDark), isSpecialTheme ? cardColors.shadow : "shadow-lg")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClass('primary', isDark))}>
            <FolderTree className={cn("w-5 h-5", isDark ? isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-blue-400" : "text-blue-500")} />
            分类结构
          </CardTitle>
          <CardDescription className={textClass('muted', isDark)}>
            创建和管理您的文档分类层级，拖拽分类可调整顺序或更改父级
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-slate-600" : "text-gray-300")} />
              <p className={textClass('muted', isDark)}>暂无分类，点击上方按钮添加</p>
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
                <RootDropzone onDrop={() => {}} isDark={isDark} />
                
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
                  isDark={isDark}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              </div>

              <DragOverlay>
                {activeCategory ? (
                  <Card className={cn(cardClass(isDark), "shadow-2xl ring-2 ring-blue-400")}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center",
                          activeCategory.children && activeCategory.children.length > 0
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            : isDark ? 'bg-slate-700/50' : 'bg-gray-100'
                        )}>
                          {activeCategory.children && activeCategory.children.length > 0 ? (
                            <FolderOpen className="w-5 h-5 text-white" />
                          ) : (
                            <Folder className={cn("w-5 h-5", isDark ? "text-slate-400" : "text-gray-600")} />
                          )}
                        </div>
                        <span className={cn("font-semibold", textClass('primary', isDark))}>{activeCategory.name}</span>
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
          <Card className={cn(cardClass(isDark), "w-full max-w-md shadow-2xl")}>
            <CardHeader>
              <CardTitle className={cn("flex items-center justify-between", textClass('primary', isDark))}>
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
              <CardDescription className={textClass('muted', isDark)}>创建新的文档分类</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={textClass('secondary', isDark)} htmlFor="name">分类名称</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入分类名称"
                  className={inputClass(isDark)}
                />
              </div>
              <div className="space-y-2">
                <Label className={textClass('secondary', isDark)} htmlFor="parent">上级分类（可选）</Label>
                <select
                  id="parent"
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value ? +e.target.value : null)}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500",
                    isDark 
                      ? "bg-slate-700/50 border-slate-600/50 text-slate-200" 
                      : "border-gray-300"
                  )}
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
                  className={cn("flex-1", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "")}
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

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setDeleteConfirmData(null)
        }}
        onConfirm={confirmDelete}
        title="确定要删除这个分类吗？"
        message={deleteConfirmData?.message}
      />
    </div>
  )
}