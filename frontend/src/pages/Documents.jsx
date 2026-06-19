import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from '../api/axios'
import { Search, Upload, FileText, FolderOpen, Tag, Trash2, Calendar, X, Plus, ChevronRight, ChevronDown, Edit3, Sparkles, Zap, Clock, Eye, AlertCircle, LayoutGrid, List } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import { cardClass, textClass, inputClass } from '../lib/themeStyles'

export default function Documents() {
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
  const [documents, setDocuments] = useState([])
  const [allDocuments, setAllDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [deleteDocumentId, setDeleteDocumentId] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [tags, setTags] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDocument, setEditingDocument] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategoryId, setEditCategoryId] = useState(null)
  const [editTagIds, setEditTagIds] = useState([])
  const [editAttachments, setEditAttachments] = useState([])
  const [editRemoveAttachmentIds, setEditRemoveAttachmentIds] = useState([])
  const [uploadFiles, setUploadFiles] = useState([])
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  // 批量上传相关状态
  const [showBatchUploadModal, setShowBatchUploadModal] = useState(false)
  const [batchUploadFiles, setBatchUploadFiles] = useState([])
  const [batchUploadPreview, setBatchUploadPreview] = useState([])
  const [batchUploadCategory, setBatchUploadCategory] = useState(null)
  const [showBatchUploadConfirm, setShowBatchUploadConfirm] = useState(false)
  // 交互式编辑状态
  const [batchUploadEditableData, setBatchUploadEditableData] = useState([])
  const [editingItemId, setEditingItemId] = useState(null)
  const [editingItemName, setEditingItemName] = useState('')
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [draggingAttachment, setDraggingAttachment] = useState(null)
  const [batchUploadTab, setBatchUploadTab] = useState('structure')
  const [tagInputValue, setTagInputValue] = useState('')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const tagIdsParam = searchParams.get('tagIds')
    
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam))
    }
    if (tagIdsParam) {
      setSelectedTags(tagIdsParam.split(',').map(id => parseInt(id)))
    }
    
    fetchDocuments()
    fetchCategories()
    fetchTags()
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.set('categoryId', selectedCategory)
    if (selectedTags.length > 0) params.set('tagIds', selectedTags.join(','))
    setSearchParams(params)
  }, [selectedCategory, selectedTags, setSearchParams])

  async function fetchDocuments() {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('categoryId', selectedCategory)
      if (selectedTags.length > 0) params.set('tagIds', selectedTags.join(','))
      
      const url = params.toString() ? `/api/documents?${params.toString()}` : '/api/documents'
      const response = await axios.get(url)
      setDocuments(response.data)
      const allResponse = await axios.get('/api/documents')
      setAllDocuments(allResponse.data)
    }
    catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  }

  async function fetchCategories() {
    try {
      const response = await axios.get('/api/categories/tree')
      setCategories(response.data)
    }
    catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  async function fetchTags() {
    try {
      const response = await axios.get('/api/tags')
      const sortedTags = [...response.data].sort((a, b) => (a.order || 0) - (b.order || 0))
      setTags(sortedTags)
    }
    catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  async function handleSearch() {
    if (!searchTerm.trim()) {
      fetchDocuments()
      return
    }
    try {
      const response = await axios.get(`/api/documents/search?keyword=${searchTerm}`)
      setDocuments(response.data)
    }
    catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteDocumentId(id)
    setShowConfirmDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDocumentId) return
    try {
      await axios.delete(`/api/documents/${deleteDocumentId}`)
      setDocuments(documents.filter(doc => doc.id !== deleteDocumentId))
      setAllDocuments(allDocuments.filter(doc => doc.id !== deleteDocumentId))
      await fetchCategories()
    }
    catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleEditClick = (document) => {
    setEditingDocument(document)
    setEditTitle(document.title)
    setEditDescription(document.description || '')
    setEditCategoryId(document.category?.id || null)
    setEditTagIds(document.tags?.map(tag => tag.id) || [])
    setEditAttachments(document.attachments || [])
    setEditRemoveAttachmentIds([])
    setShowEditModal(true)
  }

  const handleEditAttachmentRemove = (attachmentId) => {
    setEditRemoveAttachmentIds(prev => [...prev, attachmentId])
    setEditAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  const handleEditFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setEditAttachments(prev => [...prev, ...newFiles.map(file => ({ file, isNew: true, name: file.name }))])
  }

  const handleEdit = async () => {
    if (!editingDocument) return
    try {
      const formData = new FormData()
      formData.append('title', editTitle)
      formData.append('description', editDescription)
      if (editCategoryId !== null && editCategoryId !== undefined) {
        formData.append('categoryId', editCategoryId)
      }
      formData.append('tagIds', JSON.stringify(editTagIds))
      formData.append('removeAttachmentIds', JSON.stringify(editRemoveAttachmentIds))
      
      const newFiles = editAttachments.filter(a => a.isNew && a.file)
      newFiles.forEach((fileItem) => {
        const encodedName = btoa(encodeURIComponent(fileItem.file.name))
        const newFile = new File([fileItem.file], encodedName, { type: fileItem.file.type })
        formData.append('files', newFile)
      })
      
      formData.append('_method', 'PUT')
      await axios.post(`/api/documents/${editingDocument.id}`, formData)
      setShowEditModal(false)
      setEditingDocument(null)
      fetchDocuments()
    }
    catch (error) {
      console.error('Edit failed:', error)
    }
  }

  const toggleEditTag = (tagId) => {
    setEditTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  async function handleUpload() {
    if (uploadFiles.length === 0) return
    const formData = new FormData()
    uploadFiles.forEach((file, index) => {
      const encodedName = btoa(encodeURIComponent(file.name))
      const newFile = new File([file], encodedName, { type: file.type })
      formData.append('files', newFile)
    })
    formData.append('title', uploadTitle || uploadFiles[0].name)
    formData.append('description', uploadDescription)
    if (selectedCategory) {
      formData.append('categoryId', selectedCategory)
    }
    if (selectedTags.length > 0) {
      formData.append('tagIds', JSON.stringify(selectedTags))
    }
    try {
      const response = await axios.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setShowUploadModal(false)
      setUploadFiles([])
      setUploadTitle('')
      setUploadDescription('')
      setSelectedTags([])
      await fetchDocuments()
    }
    catch (error) {
      console.error('Upload failed:', error)
    }
  }

  // 生成唯一ID
  const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 递归查找项目
  const findItemById = (items, id) => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findItemById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 递归删除项目
  const removeItemById = (items, id) => {
    return items.filter(item => {
      if (item.id === id) return false
      if (item.children) {
        item.children = removeItemById(item.children, id)
      }
      return true
    })
  }

  // 递归更新项目名称
  const updateItemNameById = (items, id, newName) => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, name: newName }
      }
      if (item.children) {
        return { ...item, children: updateItemNameById(item.children, id, newName) }
      }
      return item
    })
  }

  // 切换展开/折叠
  const toggleExpand = (id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 开始编辑名称
  const startEditName = (item) => {
    setEditingItemId(item.id)
    setEditingItemName(item.name)
  }

  // 保存编辑的名称
  const saveEditName = () => {
    if (editingItemId && editingItemName.trim()) {
      setBatchUploadEditableData(prev => updateItemNameById(prev, editingItemId, editingItemName.trim()))
    }
    setEditingItemId(null)
    setEditingItemName('')
  }

  // 删除项目
  const deleteBatchItem = (id) => {
    setBatchUploadEditableData(prev => removeItemById(prev, id))
    if (selectedDocId === id) setSelectedDocId(null)
  }

  // 从文档中移除附件
  const removeAttachmentFromDoc = (docId, attachmentId) => {
    setBatchUploadEditableData(prev => {
      const doc = findItemById(prev, docId)
      if (!doc || !doc.attachments) return prev
      const newAttachments = doc.attachments.filter(a => a.id !== attachmentId)
      // 如果文档没有附件了，删除该文档
      if (newAttachments.length === 0) {
        return removeItemById(prev, docId)
      }
      // 更新文档的附件
      return prev.map(item => {
        if (item.id === docId) {
          return { ...item, attachments: newAttachments }
        }
        if (item.children) {
          return { ...item, children: updateItemAttachments(item.children, docId, newAttachments) }
        }
        return item
      })
    })
  }

  // 辅助函数：更新文档附件
  const updateItemAttachments = (items, docId, newAttachments) => {
    return items.map(item => {
      if (item.id === docId) {
        return { ...item, attachments: newAttachments }
      }
      if (item.children) {
        return { ...item, children: updateItemAttachments(item.children, docId, newAttachments) }
      }
      return item
    })
  }

  // 移动附件到另一个文档
  const moveAttachmentToDoc = (attachment, fromDocId, toDocId) => {
    if (fromDocId === toDocId) return
    setBatchUploadEditableData(prev => {
      let newData = [...prev]
      // 从源文档移除
      const fromDoc = findItemById(newData, fromDocId)
      if (fromDoc) {
        const newFromAttachments = fromDoc.attachments.filter(a => a.id !== attachment.id)
        if (newFromAttachments.length === 0) {
          newData = removeItemById(newData, fromDocId)
        } else {
          newData = newData.map(item => {
            if (item.id === fromDocId) return { ...item, attachments: newFromAttachments }
            if (item.children) return { ...item, children: updateItemAttachments(item.children, fromDocId, newFromAttachments) }
            return item
          })
        }
      }
      // 添加到目标文档
      const toDoc = findItemById(newData, toDocId)
      if (toDoc) {
        newData = newData.map(item => {
          if (item.id === toDocId) return { ...item, attachments: [...item.attachments, attachment] }
          if (item.children) return { ...item, children: updateItemAttachments(item.children, toDocId, [...toDoc.attachments, attachment]) }
          return item
        })
      }
      return newData
    })
  }

  const updateDocDescription = (docId, description) => {
    setBatchUploadEditableData(prev => {
      const updateItem = (items) => {
        return items.map(item => {
          if (item.id === docId) {
            return { ...item, description }
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) }
          }
          return item
        })
      }
      return updateItem(prev)
    })
  }

  const updateDocTags = (docId, tags) => {
    setBatchUploadEditableData(prev => {
      const updateItem = (items) => {
        return items.map(item => {
          if (item.id === docId) {
            return { ...item, tags }
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) }
          }
          return item
        })
      }
      return updateItem(prev)
    })
  }

  // 渲染可编辑树形项
  const renderEditableItem = (item, depth = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const isSelected = selectedDocId === item.id
    const hasChildren = item.children && item.children.length > 0
    const isCategory = item.type === 'category'
    const isDocument = item.type === 'document'
    const indent = depth * 16

    const handleDropOnDoc = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (draggingAttachment && isDocument && item.id !== draggingAttachment.fromDocId) {
        moveAttachmentToDoc(draggingAttachment.attachment, draggingAttachment.fromDocId, item.id)
        setDraggingAttachment(null)
      }
    }

    const handleDragOver = (e) => {
      e.preventDefault()
      if (isDocument && draggingAttachment && item.id !== draggingAttachment.fromDocId) {
        e.dataTransfer.dropEffect = 'move'
      }
    }

    return (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center gap-1 p-2 rounded-lg transition-all duration-200 group",
            isSelected
              ? isDark ? "bg-blue-500/20 border border-blue-500/30" : "bg-blue-50 border border-blue-200"
              : isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100",
            draggingAttachment && isDocument && item.id !== draggingAttachment.fromDocId
              ? isDark ? "border-dashed border-blue-500/30" : "border-dashed border-blue-300"
              : "border border-transparent"
          )}
          style={{ marginLeft: `${indent}px` }}
          onClick={() => isDocument && setSelectedDocId(item.id)}
          onDrop={handleDropOnDoc}
          onDragOver={handleDragOver}
        >
          {/* 展开/折叠按钮 */}
          {isCategory && hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(item.id)
              }}
              className={cn("h-6 w-6 p-0", isDark ? "hover:bg-slate-600" : "hover:bg-gray-200")}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          {/* 图标 */}
          {isCategory ? (
            <FolderOpen className={cn("w-4 h-4 flex-shrink-0", isDark ? "text-yellow-400" : "text-yellow-600")} />
          ) : (
            <FileText className={cn("w-4 h-4 flex-shrink-0", isDark ? "text-blue-400" : "text-blue-600")} />
          )}

          {/* 名称编辑 */}
          {editingItemId === item.id ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <Input
                value={editingItemName}
                onChange={(e) => setEditingItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditName()
                  if (e.key === 'Escape') {
                    setEditingItemId(null)
                    setEditingItemName('')
                  }
                }}
                onBlur={saveEditName}
                autoFocus
                className={cn(
                  "h-7 text-sm py-0 px-2",
                  isDark ? "bg-slate-600 border-slate-500 text-white" : "bg-white border-gray-300"
                )}
              />
            </div>
          ) : (
            <span
              className={cn(
                "text-sm truncate flex-1 min-w-0 cursor-pointer",
                isDark ? "text-slate-200" : "text-gray-700",
                isDocument && "hover:text-blue-500"
              )}
              onClick={(e) => {
                e.stopPropagation()
                if (isDocument) {
                  setSelectedDocId(item.id)
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                startEditName(item)
              }}
              title="双击编辑名称"
            >
              {item.name}
            </span>
          )}

          {/* 附件数量 */}
          {isDocument && item.attachments && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full flex-shrink-0",
              isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
            )}>
              {item.attachments.length}
            </span>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                startEditName(item)
              }}
              className={cn("h-6 w-6 p-0", isDark ? "hover:bg-slate-600 text-slate-400" : "hover:bg-gray-200 text-gray-500")}
              title="编辑名称"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                deleteBatchItem(item.id)
              }}
              className={cn("h-6 w-6 p-0 text-red-500 hover:text-red-400", isDark ? "hover:bg-red-500/10" : "hover:bg-red-50")}
              title="删除"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* 子项 */}
        {isCategory && hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children.map(child => renderEditableItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // 处理批量上传文件，构建可编辑结构
  const processBatchFiles = (files) => {
    // 按路径分组
    const pathMap = {}
    files.forEach(file => {
      const path = file.webkitRelativePath || file.name
      const parts = path.split('/')
      const fileName = parts.pop()
      const directoryPath = parts.join('/')
      
      if (!pathMap[directoryPath]) {
        pathMap[directoryPath] = { documents: {} }
      }
      
      // 提取文件名中的数字作为分组标识
      const match = fileName.match(/(\d+)/)
      const groupNumber = match ? match[1] : 'default'
      // 取第一个附件的名称（不含扩展名）作为文档名称
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
      
      if (!pathMap[directoryPath].documents[groupNumber]) {
        pathMap[directoryPath].documents[groupNumber] = {
          name: nameWithoutExt,  // 使用第一个附件的名称作为文档名称
          attachments: []
        }
      }
      pathMap[directoryPath].documents[groupNumber].attachments.push({
        id: generateId(),
        name: fileName,
        file: file,
        size: file.size
      })
    })

    // 获取所有唯一的目录路径
    const allPaths = [...new Set(files.map(f => {
      const path = f.webkitRelativePath || f.name
      const parts = path.split('/')
      parts.pop()
      return parts.join('/')
    }))]

    // 构建可编辑的树形结构
    const buildEditableTree = () => {
      const result = []
      const processedPaths = new Set()
      const allExpanded = new Set()

      allPaths.forEach(path => {
        if (processedPaths.has(path)) return
        
        const parts = path.split('/').filter(p => p)
        if (parts.length === 0) {
          // 根目录文件
          const data = pathMap['']
          if (data && Object.keys(data.documents).length > 0) {
            Object.values(data.documents).forEach(doc => {
              const docId = generateId()
              allExpanded.add(docId)
              result.push({
                id: docId,
                type: 'document',
                name: doc.name,
                originalName: doc.name,
                description: '',
                tags: [],
                attachments: doc.attachments
              })
            })
          }
          processedPaths.add(path)
          return
        }

        // 找到最顶层的路径
        let topPath = parts[0]
        let fullTopPath = topPath
        
        for (let i = 1; i < parts.length; i++) {
          const potentialPath = parts.slice(0, i).join('/')
          if (allPaths.some(p => p.startsWith(potentialPath + '/') && p !== potentialPath)) {
            fullTopPath = potentialPath
          }
        }

        if (processedPaths.has(fullTopPath)) return

        // 创建顶层分类
        const catId = generateId()
        allExpanded.add(catId)
        const categoryItem = {
          id: catId,
          type: 'category',
          name: topPath,
          originalName: topPath,
          children: []
        }

        // 添加当前路径下的文档
        const categoryData = pathMap[fullTopPath] || { documents: {} }
        if (Object.keys(categoryData.documents).length > 0) {
          Object.values(categoryData.documents).forEach(doc => {
            const docId = generateId()
            allExpanded.add(docId)
            categoryItem.children.push({
              id: docId,
              type: 'document',
              name: doc.name,
              originalName: doc.name,
              description: '',
              tags: [],
              attachments: doc.attachments
            })
          })
        }

        // 查找子目录
        const subPaths = allPaths.filter(p => p.startsWith(fullTopPath + '/') && p !== fullTopPath)
        const subCategories = {}
        
        subPaths.forEach(subPath => {
          const relativePath = subPath.substring(fullTopPath.length + 1)
          const subParts = relativePath.split('/')
          const subCategoryName = subParts[0]
          const subData = pathMap[subPath] || { documents: {} }
          
          if (!subCategories[subCategoryName]) {
            const subCatId = generateId()
            allExpanded.add(subCatId)
            subCategories[subCategoryName] = {
              id: subCatId,
              type: 'category',
              name: subCategoryName,
              originalName: subCategoryName,
              children: []
            }
          }
          
          if (Object.keys(subData.documents).length > 0) {
            Object.values(subData.documents).forEach(doc => {
              const exists = subCategories[subCategoryName].children.some(
                child => child.type === 'document' && child.name === doc.name
              )
              if (!exists) {
                const docId = generateId()
                allExpanded.add(docId)
                subCategories[subCategoryName].children.push({
                  id: docId,
                  type: 'document',
                  name: doc.name,
                  originalName: doc.name,
                  description: '',
                  tags: [],
                  attachments: doc.attachments
                })
              }
            })
          }
          processedPaths.add(subPath)
        })
        
        Object.values(subCategories).forEach(subCat => {
          categoryItem.children.push(subCat)
        })

        result.push(categoryItem)
        processedPaths.add(fullTopPath)
      })

      return { tree: result, expanded: allExpanded }
    }

    const { tree, expanded } = buildEditableTree()
    setBatchUploadEditableData(tree)
    setExpandedItems(expanded)
    setBatchUploadPreview(tree) // 保持兼容
  }

  // 执行批量上传
  const handleBatchUpload = async () => {
    if (batchUploadFiles.length === 0) return
    
    const formData = new FormData()
    
    // 根据编辑后的结构重新组织文件和路径
    let fileIndex = 0
    const documentMetadata = []
    const flattenItems = (items, currentPath = '') => {
      items.forEach(item => {
        if (item.type === 'category') {
          const newPath = currentPath ? `${currentPath}/${item.name}` : item.name
          if (item.children) {
            flattenItems(item.children, newPath)
          }
        } else if (item.type === 'document' && item.attachments) {
          const docPath = currentPath ? `${currentPath}/${item.name}` : item.name
          documentMetadata.push({
            path: docPath,
            description: item.description,
            tags: item.tags
          })
          item.attachments.forEach(att => {
            if (att.file) {
              const filePath = currentPath ? `${currentPath}/${att.name}` : att.name
              formData.append('files', att.file)
              formData.append(`paths[${fileIndex}]`, filePath)
              fileIndex++
            }
          })
        }
      })
    }
    
    flattenItems(batchUploadEditableData)
    
    if (documentMetadata.length > 0) {
      formData.append('metadata', JSON.stringify(documentMetadata))
    }
    
    if (batchUploadCategory) {
      formData.append('parentCategoryId', batchUploadCategory)
    }
    
    const token = localStorage.getItem('token')
    console.log('FormData entries:', [...formData.entries()])
    console.log('Token:', token ? 'Present' : 'Missing')
    
    try {
      console.log('Starting batch upload...')
      const response = await axios.post('/api/documents/batch-upload', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`
          // 不要手动设置 Content-Type，让浏览器自动处理
        },
      })
      console.log('Batch upload successful! Response:', response.data)
      setShowBatchUploadModal(false)
      setBatchUploadFiles([])
      setBatchUploadPreview([])
      setBatchUploadCategory(null)
      setBatchUploadEditableData([])
      setExpandedItems(new Set())
      setSelectedDocId(null)
      setEditingItemId(null)
      setEditingItemName('')
      console.log('Refreshing documents...')
      await fetchDocuments()
      console.log('Documents refreshed')
      await fetchCategories()
      console.log('Categories refreshed')
    } catch (error) {
      console.error('Batch upload failed:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      })
      if (error.response) {
        console.error('Error response data:', JSON.stringify(error.response.data, null, 2))
      }
      if (error.request) {
        console.error('Error request:', error.request)
      }
      alert(`批量上传失败: ${error.response?.data?.message || error.message}`)
    }
  }

  const [expandedCategories, setExpandedCategories] = useState([])

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const getAllParentIds = (items) => {
    let ids = []
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        ids.push(item.id)
        ids = [...ids, ...getAllParentIds(item.children)]
      }
    })
    return ids
  }

  useEffect(() => {
    if (categories.length > 0) {
      setExpandedCategories(getAllParentIds(categories))
    }
  }, [categories])

  const getCategoryIdsWithChildren = (category) => {
    let ids = [category.id]
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        ids = [...ids, ...getCategoryIdsWithChildren(child)]
      })
    }
    return ids
  }

  const getDocumentCount = (categoryId) => {
    const findCategory = (items) => {
      for (const item of items) {
        if (item.id === categoryId) return item
        if (item.children) {
          const found = findCategory(item.children)
          if (found) return found
        }
      }
      return null
    }
    
    const category = findCategory(categories)
    if (!category) return 0
    
    const relatedIds = getCategoryIdsWithChildren(category)
    return allDocuments.filter(doc => relatedIds.includes(doc.category?.id)).length
  }

  const renderCategoryOptions = (items, level = 0, prefix = '') => {
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0))
    const result = []
    sortedItems.forEach(category => {
      const key = `${prefix}${category.id}`
      result.push(
        <option key={key} value={category.id}>
          {'└──'.repeat(level)} {category.name}
        </option>
      )
      if (category.children && category.children.length > 0) {
        result.push(...renderCategoryOptions(category.children, level + 1, `${key}-`))
      }
    })
    return result
  }

  const renderCategoryTreeWithCount = (items, level = 0) => {
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0))
    
    return sortedItems.map(category => (
      <div key={category.id}>
        <button
          onClick={() => {
            setSelectedCategory(selectedCategory === category.id ? null : category.id)
          }}
          className={cn(
            "w-full text-left px-3 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group",
            selectedCategory === category.id
              ? isDark 
                ? cn('bg-gradient-to-r', cardColors.bgFrom, cardColors.bgTo, cardColors.text, 'shadow-lg', cardColors.shadow, `border ${cardColors.border}`)
                : 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 text-blue-700 shadow-md shadow-blue-100/50 border border-blue-200/50'
              : isDark 
                ? 'hover:bg-slate-700/60 text-slate-200 hover:text-white hover:border-slate-600/30 border border-transparent' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 hover:border-gray-200/50 border border-transparent'
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          {category.children && category.children.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                toggleCategory(category.id)
              }}
              className={cn(
                "p-1.5 rounded-lg cursor-pointer transition-all duration-200",
                isDark ? "hover:bg-blue-500/30 text-slate-300 hover:text-blue-400" : "hover:bg-blue-100 text-gray-500 hover:text-blue-500"
              )}
            >
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {(!category.children || category.children.length === 0) && (
            <span className="w-6" />
          )}
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
            selectedCategory === category.id
              ? isDark 
                ? isSpecialTheme ? `bg-${gradientColors.accent}-500/30 backdrop-blur-sm` : "bg-blue-500/30 backdrop-blur-sm"
                : "bg-blue-100"
              : isDark 
                ? isSpecialTheme ? `bg-slate-700/40 group-hover:bg-${gradientColors.accent}-500/20` : "bg-slate-700/40 group-hover:bg-blue-500/20"
                : "bg-gray-100 group-hover:bg-blue-50"
          )}>
            <FolderOpen className={cn(
              "w-5 h-5",
              selectedCategory === category.id
                ? isDark 
                  ? isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-blue-400"
                  : "text-blue-500"
                : isDark 
                  ? isSpecialTheme ? `text-slate-300 group-hover:text-${gradientColors.accent}-400` : "text-slate-300 group-hover:text-blue-400"
                  : "text-gray-500 group-hover:text-blue-500"
            )} />
          </div>
          <span className={cn("flex-1 text-sm font-semibold truncate", isDark ? "text-slate-200" : "text-gray-700")}>{category.name}</span>
          <span className={cn(
            "text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-300",
            selectedCategory === category.id
              ? isDark 
                ? isSpecialTheme ? cn(`bg-${gradientColors.accent}-500/30`, `text-${gradientColors.accent}-300`, `border border-${gradientColors.accent}-500/30`) : "bg-blue-500/30 text-blue-300 border border-blue-500/30"
                : "bg-blue-100 text-blue-600"
              : isDark ? "bg-slate-700/60 text-slate-300" : "bg-gray-100 text-gray-500"
          )}>{getDocumentCount(category.id)}</span>
        </button>
        {category.children && category.children.length > 0 && expandedCategories.includes(category.id) && (
          <div className="mt-1.5 space-y-0.5">{renderCategoryTreeWithCount(category.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  const filteredDocuments = documents.filter(doc => {
    if (selectedTags.length > 0) {
      const docTagIds = doc.tags?.map(tag => tag.id) || []
      return selectedTags.some(tagId => docTagIds.includes(tagId))
    }
    return true
  })

  const fileIcon = (attachments) => {
    if (!attachments || attachments.length === 0) {
      return isDark ? 'bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-slate-300' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
    }
    const fileType = attachments[0].fileType
    if (fileType?.includes('pdf')) return isDark ? 'bg-gradient-to-br from-red-600/30 to-red-700/30 text-red-400' : 'bg-gradient-to-br from-red-100 to-red-200 text-red-600'
    if (fileType?.includes('word') || fileType?.includes('docx')) return isDark ? 'bg-gradient-to-br from-blue-600/30 to-blue-700/30 text-blue-400' : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
    if (fileType?.includes('markdown') || fileType?.includes('text')) return isDark ? 'bg-gradient-to-br from-green-600/30 to-green-700/30 text-green-400' : 'bg-gradient-to-br from-green-100 to-green-200 text-green-600'
    if (fileType?.includes('image') || fileType?.includes('jpg') || fileType?.includes('png') || fileType?.includes('gif')) return isDark ? 'bg-gradient-to-br from-purple-600/30 to-purple-700/30 text-purple-400' : 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600'
    if (fileType?.includes('audio') || fileType?.includes('mp3') || fileType?.includes('wav')) return isDark ? 'bg-gradient-to-br from-orange-600/30 to-orange-700/30 text-orange-400' : 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600'
    if (fileType?.includes('video') || fileType?.includes('mp4') || fileType?.includes('avi') || fileType?.includes('mov')) return isDark ? 'bg-gradient-to-br from-pink-600/30 to-pink-700/30 text-pink-400' : 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600'
    return isDark ? 'bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-slate-300' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
  }

  return (
    <div className={cn(
      "p-6 lg:p-8 min-h-screen relative overflow-hidden",
      isDark 
        ? isSpecialTheme
          ? cn("bg-gradient-to-br", gradientColors.from, gradientColors.via, gradientColors.to)
          : "bg-gradient-to-br from-slate-900 via-slate-800/50 to-indigo-950/50"
        : "bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30"
    )}>
      {/* 动态背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-64 -right-64 w-[600px] h-[600px] rounded-full blur-3xl transition-all duration-1500",
          isDark 
            ? isSpecialTheme
              ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-600/25`, `via-${gradientColors.accent}-500/20`, `to-${gradientColors.accent}-400/15`)
              : "bg-gradient-to-br from-blue-600/25 via-indigo-600/20 to-purple-600/15" 
            : "bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/10"
        )} />
        <div className={cn(
          "absolute -bottom-64 -left-64 w-[500px] h-[500px] rounded-full blur-3xl transition-all duration-1500 delay-700",
          isDark 
            ? isSpecialTheme
              ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/15`, `via-${gradientColors.accent}-400/10`, `to-${gradientColors.accent}-300/15`)
              : "bg-gradient-to-br from-cyan-600/15 via-blue-600/10 to-teal-600/15" 
            : "bg-gradient-to-br from-cyan-400/10 via-blue-400/10 to-teal-400/10"
        )} />
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl",
          isDark 
            ? isSpecialTheme
              ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-400/5`, `via-${gradientColors.accent}-300/5`, `to-${gradientColors.accent}-200/5`)
              : "bg-gradient-to-br from-purple-600/5 via-indigo-600/5 to-blue-600/5" 
            : "bg-gradient-to-br from-purple-400/5 via-indigo-400/5 to-blue-400/5"
        )} />
      </div>

      {/* 网格背景 */}
      <div className={cn(
        "fixed inset-0 pointer-events-none",
        isDark 
          ? isPolice 
            ? "opacity-[0.08] bg-[linear-gradient(rgba(0,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.3)_1px,transparent_1px)] [background-size:60px_60px]"
            : isNight
              ? "opacity-[0.08] bg-[linear-gradient(rgba(167,139,250,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.3)_1px,transparent_1px)] [background-size:60px_60px]"
              : isCyber
                ? "opacity-[0.08] bg-[linear-gradient(rgba(239,68,68,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.3)_1px,transparent_1px)] [background-size:60px_60px]"
                : isPurple
                  ? "opacity-[0.08] bg-[linear-gradient(rgba(168,85,247,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.3)_1px,transparent_1px)] [background-size:60px_60px]"
                  : isGreen
                    ? "opacity-[0.08] bg-[linear-gradient(rgba(34,197,94,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.3)_1px,transparent_1px)] [background-size:60px_60px]"
                    : isOrange
                      ? "opacity-[0.08] bg-[linear-gradient(rgba(249,115,22,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.3)_1px,transparent_1px)] [background-size:60px_60px]"
                      : isPink
                        ? "opacity-[0.08] bg-[linear-gradient(rgba(236,72,153,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.3)_1px,transparent_1px)] [background-size:60px_60px]"
                        : "opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:50px_50px]"
          : "opacity-[0.04] bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:50px_50px]"
      )} />

      {/* 装饰线条 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={cn(
          "absolute top-20 left-10 w-px h-48 bg-gradient-to-b from-transparent",
          isDark 
            ? isSpecialTheme
              ? cn(`via-${gradientColors.accent}-400/40`, "to-transparent", "opacity-70")
              : "via-blue-500/20 to-transparent opacity-50"
            : "via-blue-500/20 to-transparent opacity-30"
        )} />
        <div className={cn(
          "absolute top-40 right-20 w-px h-64",
          isDark 
            ? isSpecialTheme
              ? cn("bg-gradient-to-b from-transparent", `via-${gradientColors.accent}-300/30`, "to-transparent", "opacity-70")
              : "bg-gradient-to-b from-transparent via-purple-500/20 to-transparent opacity-50"
            : "bg-gradient-to-b from-transparent via-purple-500/20 to-transparent opacity-30"
        )} />
        <div className={cn(
          "absolute bottom-20 left-1/4 w-32 h-px bg-gradient-to-r from-transparent",
          isDark 
            ? isSpecialTheme
              ? cn(`via-${gradientColors.accent}-400/20`, "to-transparent", "opacity-70")
              : "via-cyan-500/20 to-transparent opacity-50"
            : "via-cyan-500/20 to-transparent opacity-30"
        )} />
        {/* 特殊主题额外装饰 */}
        {isSpecialTheme && (
          <>
            <div className={cn(
              "absolute top-1/3 right-1/4 w-px h-32 bg-gradient-to-b from-transparent",
              `via-${gradientColors.accent}-400/40`, "to-transparent", "opacity-60"
            )} />
            <div className={cn(
              "absolute bottom-1/3 left-1/3 w-24 h-px bg-gradient-to-r from-transparent",
              `via-${gradientColors.accent}-300/30`, "to-transparent", "opacity-60"
            )} />
          </>
        )}
      </div>

      <div className="relative z-10">
        {/* 页面标题 */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 hover:scale-105",
                isDark 
                  ? isSpecialTheme
                    ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/30`, `via-${gradientColors.accent}-400/20`, `to-${gradientColors.accent}-500/30`, "backdrop-blur-md", `shadow-${gradientColors.accent}-500/40`, `border border-${gradientColors.accent}-500/30`)
                    : "bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-blue-500/30 backdrop-blur-md shadow-cyan-500/40 border border-blue-500/30" 
                  : "bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-100 shadow-blue-200/50"
              )}>
                <FileText className={cn("w-7 h-7", isDark ? isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-cyan-400" : "text-blue-500")} />
              </div>
              <div>
                <h1 className={cn(
                  "text-4xl lg:text-5xl font-bold",
                  isDark 
                    ? isSpecialTheme
                      ? "text-white drop-shadow-lg"
                      : "text-white drop-shadow-lg"
                    : "text-gray-800"
                )}>
                  文档管理
                </h1>
                <p className={cn("mt-1.5 text-lg", isDark ? "text-slate-300" : "text-gray-500")}>
                  管理您的知识库文档，高效组织与检索
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-5">
              <div className={cn(
                "px-5 py-2.5 rounded-2xl flex items-center gap-2.5 backdrop-blur-sm transition-all duration-300 hover:scale-105",
                isDark ? "bg-slate-800/70 border border-slate-700/50" : "bg-white/90 border border-gray-100 shadow-sm"
              )}>
                <Sparkles className={cn("w-5 h-5", isDark ? "text-amber-400" : "text-amber-500")} />
                <span className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>
                  共 {allDocuments.length} 份文档
                </span>
              </div>
              <div className={cn(
                "px-5 py-2.5 rounded-2xl flex items-center gap-2.5 backdrop-blur-sm transition-all duration-300 hover:scale-105",
                isDark ? "bg-slate-800/70 border border-slate-700/50" : "bg-white/90 border border-gray-100 shadow-sm"
              )}>
                <Zap className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-cyan-500")} />
                <span className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>
                  {categories.length} 个分类
                </span>
              </div>
              <div className={cn(
                "px-5 py-2.5 rounded-2xl flex items-center gap-2.5 backdrop-blur-sm transition-all duration-300 hover:scale-105",
                isDark ? "bg-slate-800/70 border border-slate-700/50" : "bg-white/90 border border-gray-100 shadow-sm"
              )}>
                <Tag className={cn("w-5 h-5", isDark ? "text-purple-400" : "text-purple-500")} />
                <span className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>
                  {tags.length} 个标签
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowUploadModal(true)} 
              variant="outline"
              className={cn(
                "h-12 px-6 text-base font-semibold rounded-xl shadow-md transition-all duration-300 border-2",
                isDark 
                  ? isSpecialTheme
                    ? cn(`border-${gradientColors.accent}-500/50 text-${gradientColors.accent}-200 hover:bg-${gradientColors.accent}-500/20 hover:border-${gradientColors.accent}-500/70`)
                    : "border-blue-500/50 text-blue-200 hover:bg-blue-500/20 hover:border-blue-500/70"
                  : "border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
              )}
            >
              <Upload className="w-5 h-5 mr-2" />
              上传文档
            </Button>
            <Button 
              onClick={() => {
                setBatchUploadCategory(selectedCategory || null)
                setShowBatchUploadModal(true)
              }} 
              className={cn(
                "h-12 px-8 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 scale-105",
                isDark 
                  ? isSpecialTheme 
                    ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `shadow-${gradientColors.accent}-500/40`, `hover:shadow-${gradientColors.accent}-500/60`, "hover:scale-107")
                    : "bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:via-teal-500 hover:to-green-500 shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-107"
                  : "bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-107"
              )}
            >
              <FolderOpen className="w-5 h-5 mr-2" />
              批量上传
            </Button>
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* 左侧导航 */}
          <div className="w-72 flex-shrink-0 space-y-4">
            {/* 分类管理卡片 */}
            <Card className={cn(
              cardClass(isDark, '', currentTheme),
              "shadow-2xl overflow-hidden",
              isDark 
                ? isSpecialTheme
                  ? cn("bg-gradient-to-br", cardColors.bgFrom, cardColors.bgTo, "backdrop-blur-xl", cardColors.border, cardColors.shadow, "shadow-black/40")
                  : "bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95 backdrop-blur-lg border border-slate-600/40 shadow-black/40" 
                : "bg-white/95 backdrop-blur-md border border-gray-100 shadow-gray-200/80"
            )}>
              <CardHeader className={cn(
                "pb-4 px-6",
                isDark 
                  ? isSpecialTheme
                    ? cn("bg-gradient-to-r", `from-${gradientColors.accent}-900/40`, "to-transparent")
                    : "bg-gradient-to-r from-slate-700/60 to-transparent"
                  : "bg-gradient-to-r from-gray-50 to-transparent"
              )}>
                <CardTitle className={cn("flex items-center gap-3 text-base font-semibold", isDark ? (isSpecialTheme ? cardColors.text : "text-blue-200") : "text-blue-600")}>
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    isDark 
                      ? isSpecialTheme
                        ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/30`, `to-${gradientColors.accent}-400/30`, `shadow-${gradientColors.accent}-500/20`)
                        : "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 shadow-cyan-500/20"
                      : "bg-gradient-to-br from-blue-100 to-cyan-100"
                  )}>
                    <FolderOpen className={cn("w-5 h-5", isDark ? (isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-cyan-400") : "text-blue-500")} />
                  </div>
                  分类管理
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 px-3 space-y-3">
                {/* 全部文档按钮 */}
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3",
                    !selectedCategory
                      ? isDark 
                        ? cn('bg-gradient-to-r', cardColors.bgFrom, cardColors.bgTo, cardColors.text, 'shadow-lg', cardColors.shadow, `border ${cardColors.border}`)
                        : 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 text-blue-700 shadow-md shadow-blue-100/50 border border-blue-200/50'
                      : isDark 
                        ? 'hover:bg-slate-700/60 text-slate-300 hover:text-slate-100' 
                        : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                    !selectedCategory
                      ? isDark 
                        ? cn("bg-gradient-to-br", cardColors.bgFrom.replace('800', '500').replace('95', '30').replace('90', '20'), cardColors.bgTo.replace('95', '500').replace('90', '20').replace('800', '600'))
                        : "bg-blue-100"
                      : isDark ? "bg-slate-700/40" : "bg-gray-100"
                  )}>
                    <FolderOpen className={cn(
                      "w-4.5 h-4.5",
                      !selectedCategory
                        ? isDark 
                          ? cardColors.text.replace('300', '400')
                          : "text-blue-500"
                        : isDark ? "text-slate-400" : "text-gray-500"
                    )} />
                  </div>
                  <span className="flex-1 text-sm font-medium">全部文档</span>
                  <span className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium",
                    !selectedCategory && selectedTags.length === 0
                      ? isDark 
                        ? cn("bg-gradient-to-r", cardColors.bgFrom.replace('800', '500').replace('95', '30').replace('90', '20'), cardColors.bgTo.replace('95', '500').replace('90', '20').replace('800', '600'), cardColors.text.replace('300', '200'))
                        : "bg-blue-100 text-blue-600"
                      : isDark ? "bg-slate-700/50 text-slate-400" : "bg-gray-100 text-gray-500"
                  )}>{allDocuments.length}</span>
                </button>
                
                {/* 分类树 */}
                <div className="mt-3 space-y-0.5">
                  {renderCategoryTreeWithCount(categories)}
                </div>
              </CardContent>
            </Card>

            {/* 标签筛选卡片 */}
            <Card className={cn(
              cardClass(isDark, '', currentTheme),
              "shadow-2xl overflow-hidden",
              isDark 
                ? isSpecialTheme
                  ? cn("bg-gradient-to-br", cardColors.bgFrom, cardColors.bgTo, "backdrop-blur-xl", cardColors.border, cardColors.shadow, "shadow-black/40")
                  : "bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95 backdrop-blur-lg border border-slate-600/40 shadow-black/40" 
                : "bg-white/95 backdrop-blur-md border border-gray-100 shadow-gray-200/80"
            )}>
              <CardHeader className={cn(
                "pb-4 px-6",
                isDark 
                  ? isSpecialTheme
                    ? cn("bg-gradient-to-r", `from-${gradientColors.accent}-900/40`, "to-transparent")
                    : "bg-gradient-to-r from-slate-700/60 to-transparent"
                  : "bg-gradient-to-r from-gray-50 to-transparent"
              )}>
                <CardTitle className={cn("flex items-center gap-3 text-base font-semibold", isDark ? (isSpecialTheme ? cardColors.text : "text-cyan-200") : "text-blue-600")}>
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    isDark 
                      ? isSpecialTheme
                        ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/30`, `to-${gradientColors.accent}-400/30`, `shadow-${gradientColors.accent}-500/20`)
                        : "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 shadow-cyan-500/20"
                      : "bg-gradient-to-br from-blue-100 to-cyan-100"
                  )}>
                    <Tag className={cn("w-5 h-5", isDark ? (isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-cyan-400") : "text-blue-500")} />
                  </div>
                  标签筛选
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => {
                    let filteredDocsForTag = allDocuments
                    if (selectedCategory) {
                      const findCategory = (items) => {
                        for (const item of items) {
                          if (item.id === selectedCategory) return item
                          if (item.children) {
                            const found = findCategory(item.children)
                            if (found) return found
                          }
                        }
                        return null
                      }
                      const category = findCategory(categories)
                      if (category) {
                        const relatedIds = getCategoryIdsWithChildren(category)
                        filteredDocsForTag = allDocuments.filter(doc => relatedIds.includes(doc.category?.id))
                      }
                    }
                    const tagCount = filteredDocsForTag.filter(doc => doc.tags?.some(t => t.id === tag.id)).length
                    const isSelected = selectedTags.includes(tag.id)
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                          isSelected
                            ? isDark 
                              ? cn('bg-gradient-to-r', cardColors.bgFrom, cardColors.bgTo, cardColors.text, 'shadow-md', cardColors.shadow, `border ${cardColors.border}`)
                              : 'bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 text-blue-700 shadow-md border border-blue-200/50'
                            : isDark 
                              ? 'hover:bg-slate-700/60 text-slate-300 hover:text-slate-100' 
                              : 'hover:bg-gray-100 text-gray-700'
                        )}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-sm"
                          style={{ backgroundColor: tag.color || '#6366f1' }}
                        />
                        <span className="truncate max-w-[100px]">{tag.name}</span>
                        <span className={cn(
                          "text-xs px-2.5 py-1 rounded-full",
                          isSelected
                            ? isDark ? cn("bg-gradient-to-r", cardColors.bgFrom.replace('800', '500').replace('95', '30').replace('90', '20'), cardColors.bgTo.replace('95', '500').replace('90', '20').replace('800', '600'), cardColors.text.replace('300', '200')) : "bg-purple-100 text-purple-600"
                            : isDark ? "bg-slate-700/50 text-slate-400" : "bg-gray-100 text-gray-500"
                        )}>{tagCount}</span>
                      </button>
                    )
                  })}
                  {tags.length === 0 && (
                    <span className={cn("text-sm px-4 py-2", textClass('muted', isDark, currentTheme))}>暂无标签</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧内容区域（文档列表） */}
          <div className="flex-1 space-y-6">
            {/* 搜索卡片 */}
            <Card 
              className={cn(
                cardClass(isDark, '', currentTheme),
                "shadow-2xl overflow-hidden",
                isDark 
                  ? isPolice 
                    ? "bg-gradient-to-br from-[#1a2f50]/90 via-[#0f1f3d]/85 to-[#1a2f50]/90 backdrop-blur-xl border border-cyan-500/30 shadow-cyan-500/20 shadow-black/40"
                  : isCyber
                    ? "bg-gradient-to-br from-[#18181b]/90 via-[#27272a]/85 to-[#18181b]/90 backdrop-blur-xl border border-red-500/30 shadow-red-500/20 shadow-black/40"
                  : isNight
                    ? "bg-gradient-to-br from-[#1a1333]/90 via-[#251d47]/85 to-[#1a1333]/90 backdrop-blur-xl border border-violet-500/30 shadow-violet-500/20 shadow-black/40"
                  : isOrange
                    ? "bg-gradient-to-br from-[#2c1810]/90 via-[#3d2012]/85 to-[#2c1810]/90 backdrop-blur-xl border border-orange-500/30 shadow-orange-500/20 shadow-black/40"
                  : isGreen
                    ? "bg-gradient-to-br from-[#102c18]/90 via-[#123d20]/85 to-[#102c18]/90 backdrop-blur-xl border border-green-500/30 shadow-green-500/20 shadow-black/40"
                  : isPink
                    ? "bg-gradient-to-br from-[#2c1020]/90 via-[#3d1225]/85 to-[#2c1020]/90 backdrop-blur-xl border border-pink-500/30 shadow-pink-500/20 shadow-black/40"
                  : isPurple
                    ? "bg-gradient-to-br from-[#1e1b4b]/90 via-[#312e81]/85 to-[#1e1b4b]/90 backdrop-blur-xl border border-purple-500/30 shadow-purple-500/20 shadow-black/40"
                  : "bg-slate-800/90 backdrop-blur-lg border border-slate-700/40 shadow-black/40"
                  : "bg-white/95 backdrop-blur-lg border border-gray-100 shadow-gray-200/80"
              )}
              style={{ marginTop: '3px' }}
            >
              <CardHeader className={cn(
                "pb-4 px-6",
                isDark 
                  ? isPolice
                    ? "bg-gradient-to-r from-cyan-900/40 to-transparent"
                  : isCyber
                    ? "bg-gradient-to-r from-red-900/40 to-transparent"
                  : isNight
                    ? "bg-gradient-to-r from-violet-900/40 to-transparent"
                  : isOrange
                    ? "bg-gradient-to-r from-orange-900/40 to-transparent"
                  : isGreen
                    ? "bg-gradient-to-r from-green-900/40 to-transparent"
                  : isPink
                    ? "bg-gradient-to-r from-pink-900/40 to-transparent"
                  : isPurple
                    ? "bg-gradient-to-r from-purple-900/40 to-transparent"
                  : "bg-gradient-to-r from-slate-700/60 to-transparent"
                  : "bg-gradient-to-r from-gray-50 to-transparent"
              )}>
              </CardHeader>
              <CardContent className="pt-4 px-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* 搜索框 */}
                  <div className={cn(
                    "flex-1 relative rounded-2xl overflow-hidden transition-all duration-300",
                    isDark 
                      ? isPolice
                        ? "bg-[#1a2f50]/80 border-2 border-cyan-500/30 shadow-inner focus-within:border-cyan-500/50 focus-within:shadow-cyan-500/20"
                      : isCyber
                        ? "bg-[#18181b]/80 border-2 border-red-500/30 shadow-inner focus-within:border-red-500/50 focus-within:shadow-red-500/20"
                      : isNight
                        ? "bg-[#1a1333]/80 border-2 border-violet-500/30 shadow-inner focus-within:border-violet-500/50 focus-within:shadow-violet-500/20"
                      : isOrange
                        ? "bg-[#2c1810]/80 border-2 border-orange-500/30 shadow-inner focus-within:border-orange-500/50 focus-within:shadow-orange-500/20"
                      : isGreen
                        ? "bg-[#102c18]/80 border-2 border-green-500/30 shadow-inner focus-within:border-green-500/50 focus-within:shadow-green-500/20"
                      : isPink
                        ? "bg-[#2c1020]/80 border-2 border-pink-500/30 shadow-inner focus-within:border-pink-500/50 focus-within:shadow-pink-500/20"
                      : isPurple
                        ? "bg-[#1e1b4b]/80 border-2 border-purple-500/30 shadow-inner focus-within:border-purple-500/50 focus-within:shadow-purple-500/20"
                      : "bg-slate-900/80 border-2 border-blue-500/30 shadow-inner focus-within:border-blue-500/50 focus-within:shadow-blue-500/20"
                      : "bg-white border-2 border-blue-300 shadow-inner focus-within:border-blue-500 focus-within:shadow-blue-500/20"
                  )}>
                    <Search className={cn(
                      "absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors",
                      isDark 
                        ? isPolice ? "text-cyan-400"
                        : isCyber ? "text-red-400"
                        : isNight ? "text-violet-400"
                        : isOrange ? "text-orange-400"
                        : isGreen ? "text-green-400"
                        : isPink ? "text-pink-400"
                        : isPurple ? "text-purple-400"
                        : "text-blue-400"
                        : "text-blue-500"
                    )} />
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className={cn(
                        "pl-14 pr-20 py-4 h-15 text-base border-0 focus-visible:ring-0",
                        isDark 
                          ? "bg-transparent text-slate-100 placeholder:text-slate-500" 
                          : "bg-transparent text-gray-900 placeholder:text-gray-400"
                      )}
                      placeholder="搜索文档标题、内容..."
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className={cn(
                          "absolute right-14 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200",
                          isDark 
                            ? isPolice ? "hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300"
                            : isCyber ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            : isNight ? "hover:bg-violet-500/20 text-violet-400 hover:text-violet-300"
                            : isOrange ? "hover:bg-orange-500/20 text-orange-400 hover:text-orange-300"
                            : isGreen ? "hover:bg-green-500/20 text-green-400 hover:text-green-300"
                            : isPink ? "hover:bg-pink-500/20 text-pink-400 hover:text-pink-300"
                            : isPurple ? "hover:bg-purple-500/20 text-purple-400 hover:text-purple-300"
                            : "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                            : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        )}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    className={cn(
                      "h-15 px-8 text-base font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-0.5",
                      isDark 
                        ? isSpecialTheme
                          ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `hover:from-${gradientColors.accent}-500`, `hover:via-${gradientColors.accent}-400`, `hover:to-${gradientColors.accent}-400`, `shadow-${gradientColors.accent}-500/30`, `hover:shadow-${gradientColors.accent}-500/50`)
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-blue-500/30 hover:shadow-blue-500/50"
                        : "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-500 shadow-blue-500/30 hover:shadow-blue-500/50"
                    )}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    搜索
                  </Button>
                  
                  {/* 视图切换按钮 */}
                  <div className={cn(
                    "flex items-center gap-2 p-1.5 rounded-xl",
                    isDark 
                      ? isSpecialTheme
                        ? `bg-${gradientColors.accent}-500/20 border border-${gradientColors.accent}-500/30`
                        : "bg-slate-700/50 border border-slate-600/50"
                      : "bg-gray-100 border border-gray-200"
                  )}>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "p-2.5 rounded-lg transition-all duration-200",
                        viewMode === 'grid'
                          ? isDark
                            ? isSpecialTheme
                              ? `bg-${gradientColors.accent}-500/40 text-${gradientColors.accent}-200 shadow-lg shadow-${gradientColors.accent}-500/30`
                              : "bg-blue-500/40 text-blue-200 shadow-lg shadow-blue-500/30"
                            : "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : isDark
                            ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600/30"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      )}
                      title="卡片视图"
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "p-2.5 rounded-lg transition-all duration-200",
                        viewMode === 'list'
                          ? isDark
                            ? isSpecialTheme
                              ? `bg-${gradientColors.accent}-500/40 text-${gradientColors.accent}-200 shadow-lg shadow-${gradientColors.accent}-500/30`
                              : "bg-blue-500/40 text-blue-200 shadow-lg shadow-blue-500/30"
                            : "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : isDark
                            ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600/30"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      )}
                      title="列表视图"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 文档列表/卡片 */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                {filteredDocuments.map(document => (
                  <Card
                    key={document.id}
                    className={cn(
                      "group cursor-pointer transition-all duration-500 overflow-hidden rounded-2xl",
                      "hover:-translate-y-2 hover:shadow-2xl",
                      cardClass(isDark, '', currentTheme),
                      isDark 
                        ? isPolice
                          ? 'bg-gradient-to-br from-[#1a2f50]/95 via-[#0f1f3d]/90 to-[#1a2f50]/95 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/50 shadow-xl shadow-cyan-500/15 shadow-black/40 hover:shadow-cyan-500/30'
                        : isCyber
                          ? 'bg-gradient-to-br from-[#18181b]/95 via-[#27272a]/90 to-[#18181b]/95 backdrop-blur-lg border border-red-500/30 hover:border-red-400/50 shadow-xl shadow-red-500/15 shadow-black/40 hover:shadow-red-500/30'
                        : isNight
                          ? 'bg-gradient-to-br from-[#1a1333]/95 via-[#251d47]/90 to-[#1a1333]/95 backdrop-blur-lg border border-violet-500/30 hover:border-violet-400/50 shadow-xl shadow-violet-500/15 shadow-black/40 hover:shadow-violet-500/30'
                        : isOrange
                          ? 'bg-gradient-to-br from-[#2c1810]/95 via-[#3d2012]/90 to-[#2c1810]/95 backdrop-blur-lg border border-orange-500/30 hover:border-orange-400/50 shadow-xl shadow-orange-500/15 shadow-black/40 hover:shadow-orange-500/30'
                        : isGreen
                          ? 'bg-gradient-to-br from-[#102c18]/95 via-[#123d20]/90 to-[#102c18]/95 backdrop-blur-lg border border-green-500/30 hover:border-green-400/50 shadow-xl shadow-green-500/15 shadow-black/40 hover:shadow-green-500/30'
                        : isPink
                          ? 'bg-gradient-to-br from-[#2c1020]/95 via-[#3d1225]/90 to-[#2c1020]/95 backdrop-blur-lg border border-pink-500/30 hover:border-pink-400/50 shadow-xl shadow-pink-500/15 shadow-black/40 hover:shadow-pink-500/30'
                        : isPurple
                          ? 'bg-gradient-to-br from-[#1a1333]/95 via-[#251d47]/90 to-[#1a1333]/95 backdrop-blur-lg border border-purple-500/30 hover:border-purple-400/50 shadow-xl shadow-purple-500/15 shadow-black/40 hover:shadow-purple-500/30'
                        : 'bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95 backdrop-blur-lg border border-slate-600/40 hover:border-blue-400/50 shadow-xl shadow-black/40 hover:shadow-blue-500/30'
                        : 'bg-white/95 backdrop-blur-md border border-gray-100 hover:border-blue-200 shadow-lg shadow-gray-100/50 hover:shadow-blue-100/40'
                    )}
                    onClick={() => navigate(`/documents/${document.id}`)}
                  >
                    <CardHeader className="pb-4 px-5">
                      <div className="flex items-start gap-4">
                        {/* 文件图标 */}
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                          fileIcon(document.attachments)
                        )}>
                          <FileText className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            "font-semibold text-base leading-tight line-clamp-2 transition-colors duration-300",
                            isDark 
                              ? isCyber 
                                ? "text-white group-hover:text-red-300"
                                : isNight
                                  ? "text-white group-hover:text-violet-300"
                                  : "text-white group-hover:text-cyan-300" 
                              : "text-gray-800 group-hover:text-blue-600"
                          )}>
                            {document.title}
                          </h3>
                          {document.category && (
                            <div className={cn(
                              "mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                              isDark 
                                ? isCyber
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : isNight
                                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                                : "bg-blue-50 text-blue-600 border border-blue-200"
                            )}>
                              <FolderOpen className="w-3 h-3" />
                              <span className={cn(
                                isDark 
                                  ? isCyber
                                    ? "text-red-200"
                                  : isNight
                                    ? "text-violet-200"
                                    : "text-blue-200" 
                                  : "text-blue-700")}>{document.category.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 relative">
                      <p className={cn(
                        "text-sm line-clamp-2 mb-4",
                        isDark ? "text-slate-400" : "text-gray-500"
                      )}>
                        {document.description || '暂无内容'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={cn("flex items-center gap-1.5", isDark ? "text-slate-300" : "text-gray-500")}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(document.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className={cn("flex items-center gap-1.5", isDark ? "text-slate-300" : "text-gray-500")}>
                            <Eye className="w-3.5 h-3.5" />
                            {document.viewCount || 0}
                          </span>
                        </div>
                        
                        {/* 标签 */}
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {document.tags.slice(0, 3).map(tag => (
                              <Badge 
                                key={tag.id} 
                                className={cn(
                                  "gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300 group-hover:scale-105",
                                  isDark 
                                    ? isCyber
                                      ? "bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 text-red-200"
                                    : isNight
                                      ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-200"
                                      : "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-200" 
                                    : "bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 text-cyan-700 hover:from-cyan-100 hover:to-blue-100"
                                )}
                              >
                                <Tag className="w-3 h-3" />
                                {tag.name}
                              </Badge>
                            ))}
                            {document.tags.length > 3 && (
                              <Badge className={cn(
                                "px-3 py-1.5 text-xs font-medium",
                                isDark 
                                  ? "bg-slate-700/50 text-slate-300 border border-slate-600/30" 
                                  : "bg-gray-100 text-gray-600"
                              )}>+{document.tags.length - 3}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* 虚线间隔线 */}
                      <div className="border-t border-dashed my-4" style={{
                        borderColor: isDark 
                          ? isPolice ? 'rgba(6, 182, 212, 0.4)'      // 公安蓝 - 青色
                            : isNight ? 'rgba(167, 139, 250, 0.4)'   // 暗夜紫 - 紫色
                            : isCyber ? 'rgba(239, 68, 68, 0.4)'     // 极客黑 - 红色
                            : isPurple ? 'rgba(168, 85, 247, 0.4)'   // 优雅紫 - 紫色
                            : isGreen ? 'rgba(34, 197, 94, 0.4)'     // 绿色主题
                            : isOrange ? 'rgba(249, 115, 22, 0.4)'   // 橙色主题
                            : isPink ? 'rgba(236, 72, 153, 0.4)'     // 粉色主题
                            : 'rgba(148, 163, 184, 0.4)'             // 默认深色
                          : 'rgba(229, 231, 235, 1)'                 // 浅色主题
                      }} />
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditClick(document)
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-all duration-200",
                              isDark 
                                ? isCyber
                                  ? "hover:bg-red-500/20 text-slate-300 hover:text-red-400"
                                : isNight
                                  ? "hover:bg-violet-500/20 text-slate-300 hover:text-violet-400"
                                : isOrange
                                  ? "hover:bg-orange-500/20 text-slate-300 hover:text-orange-400"
                                : isGreen
                                  ? "hover:bg-green-500/20 text-slate-300 hover:text-green-400"
                                : isPink
                                  ? "hover:bg-pink-500/20 text-slate-300 hover:text-pink-400"
                                : isPurple
                                  ? "hover:bg-purple-500/20 text-slate-300 hover:text-purple-400"
                                : isPolice
                                  ? "hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400"
                                : "hover:bg-blue-500/20 text-slate-300 hover:text-blue-400" 
                                : "hover:bg-blue-50 text-gray-500 hover:text-blue-600"
                            )}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick(document.id)
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-all duration-200",
                              isDark 
                                ? "hover:bg-red-500/20 text-slate-300 hover:text-red-400" 
                                : "hover:bg-red-50 text-gray-500 hover:text-red-600"
                            )}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className={cn("text-sm font-semibold flex items-center gap-1.5 transition-all duration-300", 
                          isDark 
                            ? isCyber
                              ? "text-red-400 hover:text-red-300"
                            : isNight
                              ? "text-violet-400 hover:text-violet-300"
                            : isOrange
                              ? "text-orange-400 hover:text-orange-300"
                            : isGreen
                              ? "text-green-400 hover:text-green-300"
                            : isPink
                              ? "text-pink-400 hover:text-pink-300"
                            : isPurple
                              ? "text-purple-400 hover:text-purple-300"
                            : isPolice
                              ? "text-cyan-400 hover:text-cyan-300"
                            : "text-blue-400 hover:text-blue-300" 
                            : "text-blue-600 hover:text-blue-700")}>
                          查看详情
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                {filteredDocuments.map(document => (
                  <Card
                    key={document.id}
                    className={cn(
                      "group cursor-pointer transition-all duration-300 overflow-hidden rounded-xl",
                      "hover:shadow-xl",
                      cardClass(isDark, '', currentTheme),
                      isDark 
                        ? isPolice
                          ? 'bg-gradient-to-r from-[#1a2f50]/95 to-[#0f1f3d]/95 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/40'
                        : 'bg-gradient-to-r from-slate-800/95 to-slate-700/95 backdrop-blur-lg border border-slate-600/30 hover:border-cyan-400/40'
                        : 'bg-white/95 backdrop-blur-md border border-gray-100 hover:border-cyan-200'
                    )}
                    onClick={() => navigate(`/documents/${document.id}`)}
                  >
                    <CardContent className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        {/* 文件图标 */}
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          fileIcon(document.attachments)
                        )}>
                          <FileText className="w-6 h-6" />
                        </div>
                        
                        {/* 文档信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className={cn(
                              "font-semibold text-base",
                              isDark ? "text-white" : "text-gray-800"
                            )}>
                              {document.title}
                            </h3>
                            {document.category && (
                              <Badge className={cn(
                                "px-2 py-0.5 text-xs",
                                isDark 
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                                  : "bg-blue-50 text-blue-600"
                              )}>
                                {document.category.name}
                              </Badge>
                            )}
                          </div>
                          <p className={cn(
                            "text-sm truncate mb-2",
                            isDark ? "text-slate-400" : "text-gray-500"
                          )}>
                            {document.description || '暂无内容'}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className={cn("flex items-center gap-1", isDark ? "text-slate-400" : "text-gray-500")}>
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(document.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                            <span className={cn("flex items-center gap-1", isDark ? "text-slate-400" : "text-gray-500")}>
                              <Eye className="w-3.5 h-3.5" />
                              {document.viewCount || 0} 次浏览
                            </span>
                            {document.tags && document.tags.length > 0 && (
                              <span className={cn("flex items-center gap-1", isDark ? "text-cyan-400" : "text-cyan-600")}>
                                <Tag className="w-3.5 h-3.5" />
                                {document.tags.length} 个标签
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditClick(document)
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-all duration-200",
                              isDark 
                                ? "hover:bg-blue-500/20 text-slate-300 hover:text-blue-400" 
                                : "hover:bg-blue-50 text-gray-500 hover:text-blue-600"
                            )}
                            title="编辑"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick(document.id)
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-all duration-200",
                              isDark 
                                ? "hover:bg-red-500/20 text-slate-300 hover:text-red-400" 
                                : "hover:bg-red-50 text-gray-500 hover:text-red-600"
                            )}
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className={cn(
                            "w-5 h-5 transition-transform",
                            isDark ? "text-slate-400" : "text-gray-400",
                            "group-hover:translate-x-1"
                          )} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 空状态 */}
            {filteredDocuments.length === 0 && (
              <Card className={cn(
                "shadow-2xl border rounded-2xl overflow-hidden",
                isPolice ? "shadow-blue-600/30 border-blue-500/30 bg-[#003366]/60 backdrop-blur-xl" :
                isNight ? "shadow-violet-600/30 border-violet-500/30 bg-[#1a1333]/60 backdrop-blur-xl" :
                isCyber ? "shadow-red-600/30 border-red-500/30 bg-[#18181b]/60 backdrop-blur-xl" :
                (isDark ? "shadow-black/30 border-slate-700/30 bg-slate-800/50 backdrop-blur-xl" : "shadow-gray-200/50 border-gray-200/50 bg-white/90 backdrop-blur-xl")
              )}>
                <CardContent className="text-center py-16">
                  <div className={cn(
                    "w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500",
                    isPolice ? "bg-gradient-to-br from-blue-600/40 to-cyan-600/40 shadow-lg shadow-blue-600/20" :
                    isNight ? "bg-gradient-to-br from-violet-600/40 to-purple-600/40 shadow-lg shadow-violet-600/20" :
                    isCyber ? "bg-gradient-to-br from-red-600/40 to-rose-600/40 shadow-lg shadow-red-600/20" :
                    (isDark ? "bg-gradient-to-br from-slate-700/50 to-slate-600/50" : "bg-gradient-to-br from-gray-100 to-gray-200")
                  )}>
                    <FileText className={cn("w-12 h-12",
                      isPolice ? "text-cyan-400/70" :
                      isNight ? "text-violet-400/70" :
                      isCyber ? "text-red-400/70" :
                      (isDark ? "text-slate-500" : "text-gray-400")
                    )} />
                  </div>
                  <h3 className={cn("text-xl font-bold mb-3", 
                    isPolice ? "text-cyan-200" :
                    isNight ? "text-violet-200" :
                    isCyber ? "text-red-200" :
                    (isDark ? "text-gray-200" : "text-gray-800")
                  )}>暂无文档</h3>
                  <p className={cn("text-sm mb-6", 
                    isPolice ? "text-cyan-300/70" :
                    isNight ? "text-violet-300/70" :
                    isCyber ? "text-red-300/70" :
                    (isDark ? "text-gray-400" : "text-gray-500")
                  )}>点击右上角按钮上传您的第一个文档</p>
                  <Button 
                    onClick={() => setShowUploadModal(true)} 
                    className={cn(
                      "shadow-lg rounded-xl px-8 py-3",
                      isPolice ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-600/30" :
                      isNight ? "bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white shadow-lg shadow-violet-600/30" :
                      isCyber ? "bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white shadow-lg shadow-red-600/30" :
                      (isDark ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white" : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white")
                    )}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    上传文档
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 上传模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className={cn(
            cardClass(isDark, '', currentTheme),
            "w-full max-w-4xl shadow-2xl overflow-hidden",
            isDark ? "shadow-black/60 border border-slate-700/50" : "shadow-gray-300/60 border border-gray-100"
          )}>
            <CardHeader className={cn(
              "pb-4",
              isDark ? "border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-transparent" : "border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent"
            )}>
              <CardTitle className={cn("flex items-center justify-between text-lg", textClass('primary', isDark, currentTheme))}>
                <span className="flex items-center gap-2">
                  <Upload className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-500")} />
                  上传文档
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFiles([])
                    setUploadTitle('')
                    setUploadDescription('')
                    setSelectedTags([])
                  }}
                  className={cn("h-9 w-9 rounded-xl", isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100")}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
              <CardDescription className={textClass('muted', isDark, currentTheme)}>
                支持文档（PDF/DOC/DOCX/MD/TXT）、图片（JPG/PNG/GIF）、音频（MP3/WAV）、视频（MP4/AVI/MOV/WEBM）格式，可多选
              </CardDescription>
              {selectedCategory && (
                <div className={cn("mt-3 text-sm flex items-center gap-2", isDark ? "text-green-400" : "text-green-600")}>
                  <FolderOpen className="w-4 h-4" />
                  文档将添加到选中的分类下
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="flex gap-6 h-full">
                {/* 左侧：基本信息 */}
                <div className="flex-1 flex flex-col overflow-y-auto pr-2">
                  <h3 className={cn("text-base font-semibold mb-4", textClass('primary', isDark, currentTheme))}>
                    基本信息
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>文档标题</label>
                      <Input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="输入文档标题"
                        className={inputClass(isDark, '', currentTheme)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>文档描述</label>
                      <textarea
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="输入文档描述"
                        rows={4}
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-none transition-all duration-200",
                          isDark 
                            ? "bg-slate-700/70 border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:ring-blue-500/50" 
                            : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500/30"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>选择分类</label>
                      <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value ? +e.target.value : null)}
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200",
                          isDark 
                            ? "bg-slate-700/70 border-slate-600/50 text-slate-100 focus:ring-blue-500/50" 
                            : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500/30"
                        )}
                      >
                        <option value="">无分类</option>
                        {renderCategoryOptions(categories)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>选择标签</label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => {
                          const isSelected = selectedTags.includes(tag.id)
                          const tagColor = tag.color || '#6366f1'
                          const bgColor = tagColor + '20'
                          const borderColor = tagColor + '50'
                          return (
                            <Badge
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              className="cursor-pointer transition-all duration-300"
                              style={{
                                backgroundColor: isSelected ? tagColor : bgColor,
                                color: isSelected ? '#fff' : tagColor,
                                borderColor: borderColor,
                                borderWidth: '1px',
                                borderStyle: 'solid'
                              }}
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 右侧：文件上传区域 */}
                <div className="w-80 flex-shrink-0 flex flex-col">
                  <h3 className={cn("text-base font-semibold mb-4", textClass('primary', isDark, currentTheme))}>
                    上传文件
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-2">
                    {/* 文件上传区域 */}
                    <label
                      htmlFor="upload-file-input"
                      className={cn(
                        "flex flex-col items-center justify-center gap-4 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 mb-4",
                        uploadFiles.length > 0
                          ? isDark
                            ? "border-blue-500/50 bg-blue-500/5"
                            : "border-blue-400 bg-blue-50"
                          : isDark
                            ? "border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-700/30"
                            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                      )}
                    >
                      <Upload className={cn(
                        "w-10 h-10",
                        uploadFiles.length > 0
                          ? isDark ? "text-blue-400" : "text-blue-500"
                          : isDark ? "text-slate-500" : "text-gray-400"
                      )} />
                      <p className={cn(
                        "text-sm font-medium text-center",
                        uploadFiles.length > 0
                          ? isDark ? "text-blue-300" : "text-blue-600"
                          : textClass('secondary', isDark, currentTheme)
                      )}>
                        {uploadFiles.length > 0
                          ? `已选择 ${uploadFiles.length} 个文件`
                          : '点击或拖拽文件到此处上传'}
                      </p>
                      <p className={cn("text-xs", textClass('muted', isDark, currentTheme))}>
                        支持 PDF, DOC, DOCX, MD, TXT, JPG, PNG, GIF, MP3, MP4 等格式
                      </p>
                      <input
                        id="upload-file-input"
                        type="file"
                        multiple
                        accept=".pdf,.docx,.doc,.md,.txt,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.wav,.avi,.mov,.webm"
                        className="hidden"
                        onChange={(e) => setUploadFiles([...uploadFiles, ...Array.from(e.target.files)])}
                      />
                    </label>
                    
                    {/* 文件列表 */}
                    {uploadFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadFiles.map((file, index) => (
                          <div key={index} className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                            isDark ? "bg-slate-700/50 hover:bg-slate-700/70" : "bg-gray-50 hover:bg-gray-100"
                          )}>
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                              file.type.includes('pdf') ? (isDark ? "bg-gradient-to-br from-red-600/30 to-red-700/30 text-red-400" : "bg-gradient-to-br from-red-100 to-red-200 text-red-600") :
                              file.type.includes('image') ? (isDark ? "bg-gradient-to-br from-purple-600/30 to-purple-700/30 text-purple-400" : "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600") :
                              file.type.includes('video') ? (isDark ? "bg-gradient-to-br from-pink-600/30 to-pink-700/30 text-pink-400" : "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600") :
                              file.type.includes('audio') ? (isDark ? "bg-gradient-to-br from-orange-600/30 to-orange-700/30 text-orange-400" : "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600") :
                              (isDark ? "bg-gradient-to-br from-slate-600/30 to-slate-700/30 text-slate-400" : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600")
                            )}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-medium truncate", textClass('primary', isDark, currentTheme))}>{file.name}</p>
                              <p className={cn("text-xs", textClass('muted', isDark, currentTheme))}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={() => setUploadFiles(uploadFiles.filter((_, i) => i !== index))}
                              className={cn(
                                "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
                                isDark ? "hover:bg-red-500/20 text-slate-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                              )}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <div className={cn(
              "flex gap-3 p-4 border-t flex-shrink-0",
              isDark ? "border-slate-700/50 bg-slate-800/80" : "border-gray-100 bg-gray-50"
            )}>
                <Button
                  variant="outline"
                  className={cn("flex-1 h-12 rounded-xl", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "border-gray-300")}
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFiles([])
                    setUploadTitle('')
                    setUploadDescription('')
                    setSelectedTags([])
                  }}
                >
                  取消
                </Button>
                <Button
                  className={cn(
                    "flex-1 h-12 rounded-xl shadow-lg",
                    isDark
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500"
                      : "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"
                  )}
                  onClick={handleUpload}
                  disabled={uploadFiles.length === 0}
                >
                  上传文档
                </Button>
              </div>
          </Card>
        </div>
      )}

      {/* 批量上传模态框 */}
      {showBatchUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className={cn(
            cardClass(isDark, '', currentTheme),
            "w-full h-[90vh] shadow-2xl flex flex-col rounded-2xl",
            isDark ? "shadow-black/60 border-0" : "shadow-gray-300/60 border-0"
          )}>
            <CardHeader className={cn(
              "pb-4 px-6 flex-shrink-0",
              isDark ? "border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-transparent" : "border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent"
            )}>
              <CardTitle className={cn("flex items-center justify-between text-lg", textClass('primary', isDark, currentTheme))}>
                <span className="flex items-center gap-2">
                  <FolderOpen className={cn("w-5 h-5", isDark ? "text-green-400" : "text-green-500")} />
                  批量上传文档
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowBatchUploadModal(false)
                    setBatchUploadFiles([])
                    setBatchUploadPreview([])
                    setBatchUploadCategory(null)
                    setBatchUploadEditableData([])
                    setExpandedItems(new Set())
                    setSelectedDocId(null)
                    setEditingItemId(null)
                    setEditingItemName('')
                  }}
                  className={cn("h-9 w-9 rounded-xl", isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100")}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
              <CardDescription className={textClass('muted', isDark, currentTheme)}>
                选择文件夹进行批量上传，支持自动创建分类和分组附件
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex">
              {/* 左侧：上传和列表区域 */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* 上传区域 */}
                <div className="p-6 border-b" style={{ borderColor: isDark ? 'rgba(100,116,139,0.3)' : 'rgba(229,231,235,1)' }}>
                  <div className="flex gap-4">
                    {/* 上传区域 */}
                    <div className="flex-1">
                      <div
                        id="batch-upload-dropzone"
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
                          batchUploadFiles.length > 0
                            ? isDark
                              ? "border-green-500/50 bg-green-500/10"
                              : "border-green-400 bg-green-100"
                            : isDark
                              ? "border-dashed border-slate-600/50 hover:border-solid hover:border-green-500/50 hover:bg-green-500/5"
                              : "border-dashed border-gray-300 hover:border-solid hover:border-green-400 hover:bg-green-50"
                        )}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const files = Array.from(e.dataTransfer.files)
                          if (files.length > 0) {
                            setBatchUploadFiles(files)
                            processBatchFiles(files)
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={() => document.getElementById('batch-upload-input').click()}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                          batchUploadFiles.length > 0
                            ? isDark
                              ? "bg-gradient-to-br from-green-600/30 to-emerald-600/30"
                              : "bg-gradient-to-br from-green-100 to-emerald-100"
                            : isDark
                              ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50"
                              : "bg-gradient-to-br from-gray-100 to-gray-200"
                        )}>
                          <FolderOpen className={cn(
                            "w-5 h-5",
                            batchUploadFiles.length > 0
                              ? isDark ? "text-green-400" : "text-green-500"
                              : isDark ? "text-slate-400" : "text-gray-400"
                          )} />
                        </div>
                        <p className={cn(
                          "text-sm font-semibold text-center",
                          batchUploadFiles.length > 0
                            ? isDark ? "text-green-300" : "text-green-600"
                            : textClass('primary', isDark, currentTheme)
                        )}>
                          {batchUploadFiles.length > 0
                            ? `${batchUploadFiles.length} 个文件`
                            : '拖拽或点击选择文件夹'}
                        </p>
                      </div>
                      <input
                        id="batch-upload-input"
                        type="file"
                        multiple
                        webkitdirectory="true"
                        directory="true"
                        mozdirectory="true"
                        allowdirs="true"
                        nwdirectory="true"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files)
                          setBatchUploadFiles(files)
                          processBatchFiles(files)
                        }}
                      />
                    </div>
                    
                    {/* 目标分类和统计 */}
                    <div className="w-[280px] flex-shrink-0 space-y-3">
                      <div>
                        <label className={cn("text-xs font-medium mb-1.5 block", textClass('secondary', isDark, currentTheme))}>
                          目标分类（可选）
                        </label>
                        <select
                          value={batchUploadCategory || ''}
                          onChange={(e) => setBatchUploadCategory(e.target.value ? +e.target.value : null)}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2",
                            isDark 
                              ? "bg-slate-700/70 border-slate-600/50 text-slate-100 focus:ring-green-500/50" 
                              : "bg-white border-gray-300 text-gray-900 focus:ring-green-500/30"
                          )}
                        >
                          <option value="">作为根分类</option>
                          {renderCategoryOptions(categories)}
                        </select>
                      </div>
                      
                      {batchUploadFiles.length > 0 && (
                        <div className={cn(
                          "p-3 rounded-lg",
                          isDark ? "bg-slate-700/50" : "bg-gray-50"
                        )}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-xs", textClass('secondary', isDark, currentTheme))}>文件总数</span>
                            <span className={cn("text-xs font-semibold", textClass('primary', isDark, currentTheme))}>{batchUploadFiles.length} 个</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs", textClass('secondary', isDark, currentTheme))}>总大小</span>
                            <span className={cn("text-xs font-semibold", textClass('primary', isDark, currentTheme))}>
                              {(batchUploadFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 标签页区域 */}
                <div className="flex-1 overflow-hidden p-6">
                  {/* 标签页 */}
                  <div className={cn(
                    "flex gap-2 p-1 rounded-lg mb-3",
                    isDark ? "bg-slate-700/50" : "bg-gray-100"
                  )}>
                    <Button
                      variant={batchUploadTab === 'structure' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setBatchUploadTab('structure')}
                      className={cn(
                        "h-8 rounded-md px-3",
                        batchUploadTab === 'structure'
                          ? isDark
                            ? "bg-green-600 text-white hover:bg-green-500"
                            : "bg-green-500 text-white hover:bg-green-600"
                          : isDark
                            ? "text-slate-300 hover:bg-slate-600/50"
                            : "text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
                      分类结构
                    </Button>
                    <Button
                      variant={batchUploadTab === 'files' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setBatchUploadTab('files')}
                      className={cn(
                        "h-8 rounded-md px-3",
                        batchUploadTab === 'files'
                          ? isDark
                            ? "bg-green-600 text-white hover:bg-green-500"
                            : "bg-green-500 text-white hover:bg-green-600"
                          : isDark
                            ? "text-slate-300 hover:bg-slate-600/50"
                            : "text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      文件列表
                    </Button>
                  </div>

                  {/* 标签页内容 */}
                  <div className={cn(
                    "border rounded-xl overflow-hidden h-full",
                    isDark ? "border-slate-600/50" : "border-gray-200"
                  )}>
                    <div className="h-full overflow-y-auto">
                      {batchUploadTab === 'structure' ? (
                        /* 分类结构视图 */
                        <div className="p-3 space-y-1">
                          {batchUploadEditableData.length > 0 ? (
                            batchUploadEditableData.map(item => renderEditableItem(item, 0))
                          ) : (
                            <div className={cn("flex flex-col items-center justify-center h-48 text-center", textClass('muted', isDark, currentTheme))}>
                              <FolderOpen className="w-12 h-12 mb-3 opacity-50" />
                              <p className={cn("text-sm", textClass('secondary', isDark, currentTheme))}>请选择文件夹</p>
                              <p className={cn("text-xs mt-1", textClass('muted', isDark, currentTheme))}>选择后可编辑分类结构</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* 文件列表视图 */
                        <div className="p-3 space-y-1">
                          {batchUploadFiles.length > 0 ? (
                            batchUploadFiles.map((file, index) => {
                              const path = file.webkitRelativePath || file.name
                              return (
                                <div
                                  key={index}
                                  className={cn(
                                    "flex items-center gap-3 p-2.5 rounded-lg",
                                    isDark ? "bg-slate-700/30" : "bg-gray-50"
                                  )}
                                >
                                  <FileText className={cn("w-4 h-4 flex-shrink-0", isDark ? "text-blue-400" : "text-blue-600")} />
                                  <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm truncate", textClass('primary', isDark, currentTheme))} title={file.name}>
                                      {file.name}
                                    </p>
                                  </div>
                                  <span className={cn("text-xs", textClass('secondary', isDark, currentTheme))}>
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              )
                            })
                          ) : (
                            <div className={cn("flex flex-col items-center justify-center h-48 text-center", textClass('muted', isDark, currentTheme))}>
                              <FileText className="w-12 h-12 mb-3 opacity-50" />
                              <p className={cn("text-sm", textClass('secondary', isDark, currentTheme))}>暂无文件</p>
                              <p className={cn("text-xs mt-1", textClass('muted', isDark, currentTheme))}>请选择文件夹</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：文档详情编辑面板 */}
              <div className={cn(
                "w-[420px] flex-shrink-0 flex flex-col border-l overflow-hidden",
                isDark ? "border-slate-700/50 bg-slate-800/30" : "border-gray-200 bg-gray-50/50"
              )}>
                {selectedDocId ? (() => {
                  const doc = findItemById(batchUploadEditableData, selectedDocId)
                  return doc ? (
                    <>
                      {/* 详情标题 */}
                      <div className={cn(
                        "p-4 border-b flex items-center justify-between",
                        isDark ? "border-slate-700/50" : "border-gray-200"
                      )}>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("text-sm font-semibold truncate", textClass('primary', isDark, currentTheme))}>
                            {doc.name}
                          </h4>
                          <p className={cn("text-xs mt-0.5", textClass('secondary', isDark, currentTheme))}>
                            {doc.attachments.length} 个附件
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocId(null)}
                          className={cn("h-8 w-8 p-0 ml-2", isDark ? "hover:bg-slate-600" : "hover:bg-gray-200")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* 详情内容 */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* 附件列表 */}
                        <div>
                          <label className={cn("text-xs font-medium mb-2 block", textClass('secondary', isDark, currentTheme))}>
                            附件
                          </label>
                          <div className="space-y-1.5">
                            {doc.attachments.map(att => (
                              <div
                                key={att.id}
                                draggable
                                onDragStart={() => setDraggingAttachment({ attachment: att, fromDocId: doc.id })}
                                onDragEnd={() => setDraggingAttachment(null)}
                                className={cn(
                                  "flex items-center justify-between p-2 rounded-lg text-xs",
                                  isDark ? "bg-slate-700/50" : "bg-white",
                                  "cursor-move"
                                )}
                              >
                                <span className={cn("truncate flex-1", textClass('primary', isDark, currentTheme))} title={att.name}>
                                  📎 {att.name}
                                </span>
                                <div className="flex items-center gap-1.5 ml-2">
                                  <span className={cn("text-xs", textClass('secondary', isDark, currentTheme))}>
                                    {(att.size / 1024).toFixed(1)} KB
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAttachmentFromDoc(doc.id, att.id)}
                                    className="h-5 w-5 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 描述编辑 */}
                        <div>
                          <label className={cn("text-xs font-medium mb-1.5 block", textClass('secondary', isDark, currentTheme))}>
                            描述
                          </label>
                          <textarea
                            value={doc.description}
                            onChange={(e) => updateDocDescription(doc.id, e.target.value)}
                            placeholder="输入文档描述..."
                            rows={4}
                            className={cn(
                              "w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2",
                              isDark
                                ? "bg-slate-700/70 border-slate-600/50 text-slate-100 focus:ring-green-500/50 placeholder:text-slate-500"
                                : "bg-white border-gray-200 text-gray-900 focus:ring-green-500/30 placeholder:text-gray-400"
                            )}
                          />
                        </div>

                        {/* 标签编辑 */}
                        <div>
                          <label className={cn("text-xs font-medium mb-2 block", textClass('secondary', isDark, currentTheme))}>
                            标签
                          </label>
                          
                          {/* 已添加的标签 */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {doc.tags.map((tag, index) => (
                              <span
                                key={index}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                                  isDark
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-blue-100 text-blue-600"
                                )}
                              >
                                {tag}
                                <button
                                  onClick={() => updateDocTags(doc.id, doc.tags.filter((_, i) => i !== index))}
                                  className="hover:text-red-400"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* 选择现有标签 */}
                          <div className="mb-2">
                            <p className={cn("text-xs mb-1.5", textClass('muted', isDark, currentTheme))}>选择现有标签：</p>
                            <div className="flex flex-wrap gap-1.5">
                              {tags.filter(t => !doc.tags.includes(t.name)).map(tag => (
                                <button
                                  key={tag.id}
                                  onClick={() => updateDocTags(doc.id, [...doc.tags, tag.name])}
                                  className={cn(
                                    "px-2 py-1 rounded-full text-xs border",
                                    isDark
                                      ? "border-slate-600/50 text-slate-300 hover:bg-blue-500/20 hover:border-blue-500/50"
                                      : "border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300"
                                  )}
                                >
                                  {tag.name}
                                </button>
                              ))}
                              {tags.length === 0 && (
                                <p className={cn("text-xs", textClass('muted', isDark, currentTheme))}>暂无标签，请在标签管理中创建</p>
                              )}
                            </div>
                          </div>

                          {/* 新增标签输入 */}
                          <div className="flex gap-1.5">
                            <Input
                              value={tagInputValue}
                              onChange={(e) => setTagInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && tagInputValue.trim()) {
                                  updateDocTags(doc.id, [...doc.tags, tagInputValue.trim()])
                                  setTagInputValue('')
                                }
                              }}
                              placeholder="输入新标签"
                              className={cn(
                                "flex-1 px-2.5 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2",
                                isDark
                                  ? "bg-slate-700/70 border-slate-600/50 text-slate-100 focus:ring-green-500/50"
                                  : "bg-white border-gray-200 text-gray-900 focus:ring-green-500/30"
                              )}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (tagInputValue.trim()) {
                                  updateDocTags(doc.id, [...doc.tags, tagInputValue.trim()])
                                  setTagInputValue('')
                                }
                              }}
                              className={cn(
                                "h-7 px-3 rounded-lg text-xs",
                                isDark
                                  ? "bg-green-600 hover:bg-green-500"
                                  : "bg-green-500 hover:bg-green-600"
                              )}
                            >
                              添加
                            </Button>
                          </div>
                        </div>
                      </div>

                      <p className={cn("px-4 py-2 text-xs border-t", textClass('muted', isDark, currentTheme), isDark ? "border-slate-700/50" : "border-gray-200")}>
                        💡 拖拽附件到其他文档可移动分配
                      </p>
                    </>
                  ) : null
                })() : (
                  /* 未选择文档时的提示 */
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <FileText className={cn("w-12 h-12 mb-4 opacity-40", isDark ? "text-slate-500" : "text-gray-400")} />
                    <p className={cn("text-sm", textClass('secondary', isDark, currentTheme))}>选择文档编辑详情</p>
                    <p className={cn("text-xs mt-1", textClass('muted', isDark, currentTheme))}>点击左侧分类结构中的文档</p>
                  </div>
                )}
              </div>
            </CardContent>
            <div className={cn(
              "flex gap-3 p-4 border-t flex-shrink-0",
              isDark ? "border-slate-700/50 bg-slate-800/80" : "border-gray-100 bg-gray-50"
            )}>
              <Button
                variant="outline"
                className={cn("flex-1 h-12 rounded-xl", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "border-gray-300")}
                onClick={() => {
                  setShowBatchUploadModal(false)
                  setBatchUploadFiles([])
                  setBatchUploadPreview([])
                  setBatchUploadCategory(null)
                  setBatchUploadEditableData([])
                  setExpandedItems(new Set())
                  setSelectedDocId(null)
                  setEditingItemId(null)
                  setEditingItemName('')
                }}
              >
                取消
              </Button>
              <Button
                className={cn(
                  "flex-1 h-12 rounded-xl shadow-lg",
                  isDark
                    ? "bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 hover:from-green-500 hover:via-emerald-500 hover:to-green-400"
                    : "bg-gradient-to-r from-green-500 via-emerald-600 to-green-500"
                )}
                onClick={() => setShowBatchUploadConfirm(true)}
                disabled={batchUploadFiles.length === 0}
              >
                开始上传
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 批量上传确认弹窗 */}
      {showBatchUploadConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <Card className={cn(
            cardClass(isDark, '', currentTheme),
            "w-full max-w-md shadow-2xl overflow-hidden",
            isDark ? "shadow-black/60 border border-slate-700/50" : "shadow-gray-300/60 border border-gray-100"
          )}>
            <CardHeader className={cn(
              "pb-4",
              isDark ? "border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-transparent" : "border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent"
            )}>
              <CardTitle className={cn("flex items-center justify-center text-lg", textClass('primary', isDark, currentTheme))}>
                <span className="flex items-center gap-2">
                  <AlertCircle className={cn("w-5 h-5", isDark ? "text-amber-400" : "text-amber-500")} />
                  确认上传
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                  isDark ? "bg-amber-500/20" : "bg-amber-100"
                )}>
                  <Upload className={cn("w-8 h-8", isDark ? "text-amber-400" : "text-amber-600")} />
                </div>
                <h3 className={cn("text-lg font-semibold mb-2", textClass('primary', isDark, currentTheme))}>
                  即将上传 {batchUploadFiles.length} 个文件
                </h3>
                <p className={cn("text-sm mb-4", textClass('secondary', isDark, currentTheme))}>
                  请确认您要将这些文件上传到知识库系统
                </p>
                
                {/* 文件大小统计 */}
                <div className={cn(
                  "p-4 rounded-xl mb-6",
                  isDark ? "bg-slate-700/50" : "bg-gray-50"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-sm", textClass('secondary', isDark, currentTheme))}>文件总数</span>
                    <span className={cn("text-sm font-semibold", textClass('primary', isDark, currentTheme))}>{batchUploadFiles.length} 个</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm", textClass('secondary', isDark, currentTheme))}>总大小</span>
                    <span className={cn("text-sm font-semibold", textClass('primary', isDark, currentTheme))}>
                      {(batchUploadFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className={cn(
              "flex gap-3 p-4 border-t flex-shrink-0",
              isDark ? "border-slate-700/50 bg-slate-800/80" : "border-gray-100 bg-gray-50"
            )}>
              <Button
                variant="outline"
                className={cn("flex-1 h-12 rounded-xl", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "border-gray-300")}
                onClick={() => setShowBatchUploadConfirm(false)}
              >
                取消
              </Button>
              <Button
                className={cn(
                  "flex-1 h-12 rounded-xl shadow-lg",
                  isDark
                    ? "bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 hover:from-green-500 hover:via-emerald-500 hover:to-green-400"
                    : "bg-gradient-to-r from-green-500 via-emerald-600 to-green-500"
                )}
                onClick={() => {
                  setShowBatchUploadConfirm(false)
                  handleBatchUpload()
                }}
              >
                确认上传
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 编辑模态框 */}
      {showEditModal && editingDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className={cn(
            cardClass(isDark, '', currentTheme),
            "w-full max-w-5xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col",
            isDark ? "shadow-black/60 border border-slate-700/50" : "shadow-gray-300/60 border border-gray-100"
          )}>
            <CardHeader className={cn(
              "pb-4 flex-shrink-0",
              isDark ? "border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-transparent" : "border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent"
            )}>
              <CardTitle className={cn("flex items-center justify-between text-lg", textClass('primary', isDark, currentTheme))}>
                <span className="flex items-center gap-2">
                  <Edit3 className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-500")} />
                  编辑文档
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingDocument(null)
                  }}
                  className={cn("h-9 w-9 rounded-xl", isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100")}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
              <CardDescription className={textClass('muted', isDark, currentTheme)}>
                修改文档的基本信息和附件
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="flex gap-6 h-full">
                {/* 左侧：基本信息 */}
                <div className="flex-1 flex flex-col overflow-y-auto pr-2">
                  <h3 className={cn("text-base font-semibold mb-4", textClass('primary', isDark, currentTheme))}>
                    基本信息
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>文档标题</label>
                      <Input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="输入文档标题"
                        className={inputClass(isDark, '', currentTheme)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>文档描述</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="输入文档描述"
                        rows={4}
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-none transition-all duration-200",
                          isDark
                            ? "bg-slate-700/70 border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:ring-blue-500/50"
                            : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500/30"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>选择分类</label>
                      <select
                        value={editCategoryId || ''}
                        onChange={(e) => setEditCategoryId(e.target.value ? +e.target.value : null)}
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200",
                          isDark
                            ? "bg-slate-700/70 border-slate-600/50 text-slate-100 focus:ring-blue-500/50"
                            : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500/30"
                        )}
                      >
                        <option value="">无分类</option>
                        {renderCategoryOptions(categories)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>选择标签</label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => {
                          const isSelected = editTagIds.includes(tag.id)
                          const tagColor = tag.color || '#6366f1'
                          const bgColor = tagColor + '20'
                          const borderColor = tagColor + '50'
                          return (
                            <Badge
                              key={tag.id}
                              onClick={() => toggleEditTag(tag.id)}
                              className="cursor-pointer transition-all duration-300"
                              style={{
                                backgroundColor: isSelected ? tagColor : bgColor,
                                color: isSelected ? '#fff' : tagColor,
                                borderColor: borderColor,
                                borderWidth: '1px',
                                borderStyle: 'solid'
                              }}
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 右侧：附件管理 */}
                <div className="w-80 flex-shrink-0 flex flex-col">
                  <h3 className={cn("text-base font-semibold mb-4", textClass('primary', isDark, currentTheme))}>
                    附件管理
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {editAttachments && editAttachments.length > 0 ? (
                      <>
                        <div className="text-xs mb-2 text-slate-500">现有附件 ({editAttachments.length})</div>
                        {editAttachments.map((attachment, index) => (
                          <div key={attachment.id || index} className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                            isDark ? "bg-slate-700/50 hover:bg-slate-700/70" : "bg-gray-50 hover:bg-gray-100"
                          )}>
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                              attachment.fileType?.includes('pdf') ? (isDark ? "bg-gradient-to-br from-red-600/30 to-red-700/30 text-red-400" : "bg-gradient-to-br from-red-100 to-red-200 text-red-600") :
                              attachment.fileType?.includes('image') ? (isDark ? "bg-gradient-to-br from-purple-600/30 to-purple-700/30 text-purple-400" : "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600") :
                              attachment.fileType?.includes('video') ? (isDark ? "bg-gradient-to-br from-pink-600/30 to-pink-700/30 text-pink-400" : "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600") :
                              attachment.fileType?.includes('audio') ? (isDark ? "bg-gradient-to-br from-orange-600/30 to-orange-700/30 text-orange-400" : "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600") :
                              (isDark ? "bg-gradient-to-br from-slate-600/30 to-slate-700/30 text-slate-400" : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600")
                            )}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-medium truncate", textClass('primary', isDark, currentTheme))}>{attachment.name || attachment.originalFilename || attachment.filename}</p>
                            </div>
                            <button
                              onClick={() => handleEditAttachmentRemove(attachment.id)}
                              className={cn(
                                "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
                                isDark ? "hover:bg-red-500/20 text-slate-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                              )}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className={cn("text-center py-8", textClass('muted', isDark, currentTheme))}>
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无附件</p>
                      </div>
                    )}
                    {/* 添加新附件 */}
                    <div className="pt-4 border-t mt-4">
                      <label
                        htmlFor="edit-file-input"
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
                          isDark
                            ? "border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-700/30"
                            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                        )}
                      >
                        <Upload className={cn("w-8 h-8", isDark ? "text-slate-500" : "text-gray-400")} />
                        <p className={cn("text-xs font-medium text-center", textClass('secondary', isDark, currentTheme))}>点击或拖拽文件到此处添加</p>
                        <input
                          id="edit-file-input"
                          type="file"
                          multiple
                          accept=".pdf,.docx,.doc,.md,.txt,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.wav,.avi,.mov,.webm"
                          className="hidden"
                          onChange={handleEditFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className={cn(
              "flex gap-3 p-4 border-t flex-shrink-0",
              isDark ? "border-slate-700/50 bg-slate-800/80" : "border-gray-100 bg-gray-50"
            )}>
              <Button
                variant="outline"
                className={cn("flex-1 h-12 rounded-xl", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "border-gray-300")}
                onClick={() => {
                  setShowEditModal(false)
                  setEditingDocument(null)
                }}
              >
                取消
              </Button>
              <Button
                className={cn(
                  "flex-1 h-12 rounded-xl shadow-lg",
                  isDark
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500"
                    : "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"
                )}
                onClick={handleEdit}
              >
                保存修改
              </Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="确认删除"
        message="确定要删除这份文档吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        danger
      />
    </div>
  )
}
