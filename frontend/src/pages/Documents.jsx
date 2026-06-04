import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Search, Upload, FileText, FolderOpen, Tag, Trash2, Calendar, X, Plus, ChevronRight, ChevronDown, Edit3, Sparkles, Zap, Clock, Eye } from 'lucide-react'
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
  const [selectedTag, setSelectedTag] = useState(null)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const tagParam = searchParams.get('tag')
    
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam))
    }
    if (tagParam) {
      setSelectedTag(parseInt(tagParam))
    }
    
    fetchDocuments()
    fetchCategories()
    fetchTags()
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedTag) params.set('tag', selectedTag)
    setSearchParams(params)
  }, [selectedCategory, selectedTag, setSearchParams])

  async function fetchDocuments() {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedTag) params.set('tag', selectedTag)
      
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
            setSelectedTag(null)
          }}
          className={cn(
            "w-full text-left px-3 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group",
            selectedCategory === category.id
              ? isDark 
                ? 'bg-gradient-to-r from-blue-500/30 via-blue-600/20 to-purple-500/20 text-blue-200 shadow-lg shadow-blue-500/15 border border-blue-500/20' 
                : 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 text-blue-700 shadow-md shadow-blue-100/50 border border-blue-200/50'
              : isDark 
                ? 'hover:bg-slate-700/60 text-slate-200 hover:text-white hover:border-slate-600/30' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 hover:border-gray-200/50'
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
              ? isDark ? "bg-blue-500/30 backdrop-blur-sm" : "bg-blue-100"
              : isDark ? "bg-slate-700/40 group-hover:bg-blue-500/20" : "bg-gray-100 group-hover:bg-blue-50"
          )}>
            <FolderOpen className={cn(
              "w-5 h-5",
              selectedCategory === category.id
                ? isDark ? "text-blue-400" : "text-blue-500"
                : isDark ? "text-slate-300 group-hover:text-blue-400" : "text-gray-500 group-hover:text-blue-500"
            )} />
          </div>
          <span className={cn("flex-1 text-sm font-semibold truncate", isDark ? "text-slate-200" : "text-gray-700")}>{category.name}</span>
          <span className={cn(
            "text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-300",
            selectedCategory === category.id
              ? isDark ? "bg-blue-500/30 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-600"
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
    if (selectedCategory && doc.category?.id !== selectedCategory) {
      return false
    }
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
                  ? "bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-blue-500/30 backdrop-blur-md shadow-cyan-500/40 border border-blue-500/30" 
                  : "bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-100 shadow-blue-200/50"
              )}>
                <FileText className={cn("w-7 h-7", isDark ? "text-cyan-400" : "text-blue-500")} />
              </div>
              <div>
                <h1 className={cn(
                  "text-4xl lg:text-5xl font-bold",
                  isDark 
                    ? "bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent"
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
          <Button 
            onClick={() => setShowUploadModal(true)} 
            className={cn(
              "h-16 px-10 text-base font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0",
              isDark 
                ? isSpecialTheme 
                  ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `shadow-${gradientColors.accent}-500/30`, `hover:shadow-${gradientColors.accent}-500/50`)
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-blue-500/30 hover:shadow-blue-500/50"
                : "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-500 shadow-blue-500/30 hover:shadow-blue-500/50"
            )}
          >
            <Upload className="w-5 h-5 mr-2.5" />
            上传文档
          </Button>
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
                    ? cn("border-b", cardColors.border, "bg-gradient-to-r", `from-${gradientColors.accent}-900/40`, "to-transparent")
                    : "border-b border-slate-600/40 bg-gradient-to-r from-slate-700/60 to-transparent"
                  : "border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent"
              )}>
                <CardTitle className={cn("flex items-center gap-3 text-base font-semibold", isDark ? cardColors.text : "text-blue-600")}>
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    isDark 
                      ? isSpecialTheme
                        ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/30`, `to-${gradientColors.accent}-400/30`, `shadow-${gradientColors.accent}-500/20`)
                        : "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 shadow-cyan-500/20"
                      : "bg-gradient-to-br from-blue-100 to-cyan-100"
                  )}>
                    <FolderOpen className={cn("w-5 h-5", isDark ? `text-${gradientColors.accent}-400` : "text-blue-500")} />
                  </div>
                  分类管理
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-3 space-y-1">
                {/* 全部文档按钮 */}
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedTag(null)
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3",
                    !selectedCategory && !selectedTag
                      ? isDark 
                        ? 'bg-gradient-to-r from-blue-500/30 via-blue-600/20 to-indigo-500/20 text-blue-200 shadow-lg shadow-blue-500/15 border border-blue-500/20' 
                        : 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 text-blue-700 shadow-md shadow-blue-100/50 border border-blue-200/50'
                      : isDark 
                        ? 'hover:bg-slate-700/60 text-slate-300 hover:text-slate-100' 
                        : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                    !selectedCategory && !selectedTag
                      ? isDark ? "bg-blue-500/30" : "bg-blue-100"
                      : isDark ? "bg-slate-700/40" : "bg-gray-100"
                  )}>
                    <FolderOpen className={cn(
                      "w-4.5 h-4.5",
                      !selectedCategory && !selectedTag
                        ? isDark ? "text-blue-400" : "text-blue-500"
                        : isDark ? "text-slate-400" : "text-gray-500"
                    )} />
                  </div>
                  <span className="flex-1 text-sm font-medium">全部文档</span>
                  <span className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium",
                    !selectedCategory && !selectedTag
                      ? isDark ? "bg-blue-500/30 text-blue-300" : "bg-blue-100 text-blue-600"
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
                    ? cn("border-b", cardColors.border, "bg-gradient-to-r", `from-${gradientColors.accent}-900/40`, "to-transparent")
                    : "border-b border-slate-600/40 bg-gradient-to-r from-slate-700/60 to-transparent"
                  : "border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent"
              )}>
                <CardTitle className={cn("flex items-center gap-3 text-base font-semibold", isDark ? cardColors.text : "text-blue-600")}>
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    isDark 
                      ? isSpecialTheme
                        ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/30`, `to-${gradientColors.accent}-400/30`, `shadow-${gradientColors.accent}-500/20`)
                        : "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 shadow-cyan-500/20"
                      : "bg-gradient-to-br from-blue-100 to-cyan-100"
                  )}>
                    <Tag className={cn("w-5 h-5", isDark ? `text-${gradientColors.accent}-400` : "text-blue-500")} />
                  </div>
                  标签筛选
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => {
                    const tagCount = allDocuments.filter(doc => doc.tags?.some(t => t.id === tag.id)).length
                    const isSelected = selectedTag === tag.id
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          setSelectedTag(isSelected ? null : tag.id)
                          setSelectedCategory(null)
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                          isSelected
                            ? isDark 
                              ? 'bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-cyan-500/30 text-cyan-200 shadow-md shadow-cyan-500/15 border border-cyan-500/20' 
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
                            ? isDark ? "bg-purple-500/30 text-purple-300" : "bg-purple-100 text-purple-600"
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

          {/* 右侧内容区域 */}
          <div className="flex-1 space-y-6">
            {/* 搜索卡片 */}
            <Card className={cn(
              cardClass(isDark, '', currentTheme),
              "shadow-2xl overflow-hidden",
              isDark 
                ? isPolice 
                  ? "bg-gradient-to-br from-[#1a2f50]/90 via-[#0f1f3d]/85 to-[#1a2f50]/90 backdrop-blur-xl border border-cyan-500/30 shadow-cyan-500/20 shadow-black/40"
                  : "bg-slate-800/90 backdrop-blur-lg border border-slate-700/40 shadow-black/40"
                : "bg-white/95 backdrop-blur-lg border border-gray-100 shadow-gray-200/80"
            )}>
              <CardContent className="pt-6 px-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className={cn(
                    "flex-1 relative rounded-2xl overflow-hidden",
                    isDark ? "bg-slate-900/80 border border-slate-700/50 shadow-inner" : "bg-gray-50 border border-gray-200"
                  )}>
                    <Search className={cn(
                      "absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors",
                      isDark ? "text-cyan-400" : "text-blue-500"
                    )} />
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className={cn(
                        "pl-14 pr-20 py-4 h-15 text-base border-0 focus-visible:ring-2 focus-visible:ring-blue-500/50",
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
                          isDark ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
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
                        ? isPolice 
                          ? "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-400 shadow-cyan-500/30 hover:shadow-cyan-500/50" 
                          : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-blue-500/30 hover:shadow-blue-500/50"
                        : "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-500 shadow-blue-500/30 hover:shadow-blue-500/50"
                    )}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    搜索
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 文档卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                        : 'bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95 backdrop-blur-lg border border-slate-600/40 hover:border-cyan-400/50 shadow-xl shadow-black/40 hover:shadow-cyan-500/30'
                      : 'bg-white/95 backdrop-blur-md border border-gray-100 hover:border-cyan-200 shadow-lg shadow-gray-100/50 hover:shadow-cyan-100/40'
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
                        <CardTitle className={cn(
                          "text-lg font-bold truncate transition-all duration-300 line-clamp-2",
                          textClass('primary', isDark, currentTheme),
                          isDark ? "group-hover:text-blue-400" : "group-hover:text-blue-600"
                        )}>
                          {document.title}
                        </CardTitle>
                        <CardDescription className={cn("mt-2 line-clamp-2 text-sm", textClass('muted', isDark, currentTheme))}>
                          {document.content?.substring(0, 100) || document.description?.substring(0, 100) || '暂无内容'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0 px-5">
                    {/* 元信息 */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        {document.category && (
                          <span className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                            isDark 
                              ? "bg-blue-500/20 border border-blue-500/30" 
                              : "bg-blue-50 border border-blue-100"
                          )}>
                            <FolderOpen className={cn("w-3.5 h-3.5", isDark ? "text-blue-400" : "text-blue-500")} />
                            <span className={cn(isDark ? "text-blue-200" : "text-blue-700")}>{document.category.name}</span>
                          </span>
                        )}
                      </div>
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
                                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-200" 
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
                    
                    {/* 操作按钮 */}
                    <div className={cn(
                      "pt-5 pb-2 border-t flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300",
                      isDark ? "border-slate-700/40" : "border-gray-100"
                    )}>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(
                            "h-10 px-5 text-xs font-semibold rounded-xl border transition-all duration-300",
                            isDark 
                              ? "border-blue-500/40 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/60 hover:text-blue-200" 
                              : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditClick(document)
                          }}
                        >
                          <Edit3 className="w-4 h-4 mr-1.5" />
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className={cn(
                            "h-10 px-5 text-xs font-semibold rounded-xl transition-all duration-300",
                            isDark 
                              ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60" 
                              : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(document.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          删除
                        </Button>
                      </div>
                      <span className={cn("text-sm font-semibold flex items-center gap-1.5 transition-all duration-300", isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700")}>
                        查看详情
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 空状态 */}
            {filteredDocuments.length === 0 && (
              <Card className={cn(
                cardClass(isDark, '', currentTheme),
                "shadow-2xl",
                isDark ? "shadow-black/40 border border-slate-700/30" : "shadow-gray-200/80 border border-gray-100"
              )}>
                <CardContent className="text-center py-24">
                  <div className={cn(
                    "w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-500",
                    isDark ? "bg-gradient-to-br from-slate-800/80 to-slate-700/80" : "bg-gradient-to-br from-gray-50 to-gray-100"
                  )}>
                    <FileText className={cn("w-14 h-14", isDark ? "text-slate-600" : "text-gray-300")} />
                  </div>
                  <h3 className={cn("text-2xl font-bold mb-3", textClass('primary', isDark, currentTheme))}>暂无文档</h3>
                  <p className={cn("text-base mb-8", textClass('muted', isDark, currentTheme))}>点击右上角按钮上传您的第一个文档</p>
                  <Button 
                    onClick={() => setShowUploadModal(true)} 
                    className={cn(
                      "shadow-lg rounded-xl",
                      isDark 
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500" 
                        : "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"
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
            "w-full max-w-lg shadow-2xl overflow-hidden",
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
            <CardContent className="space-y-5">
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
                  rows={3}
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
                    return (
                      <Badge
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          "cursor-pointer transition-all duration-300",
                          isSelected
                            ? isDark
                              ? "bg-blue-500/30 text-blue-300 border-blue-500/50"
                              : "bg-blue-100 text-blue-600 border-blue-300"
                            : isDark
                              ? "bg-slate-700/50 text-slate-300 border-slate-600/30 hover:bg-slate-600/50"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        )}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              
              {/* 文件上传区域 */}
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>上传文件</label>
                <label
                  htmlFor="upload-file-input"
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
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
                    "text-sm font-medium",
                    uploadFiles.length > 0
                      ? isDark ? "text-blue-300" : "text-blue-600"
                      : textClass('secondary', isDark, currentTheme)
                  )}>
                    {uploadFiles.length > 0
                      ? `已选择 ${uploadFiles.length} 个文件`
                      : '点击或拖拽文件到此处上传'}
                  </p>
                  <p className={cn("text-xs mt-1", textClass('muted', isDark, currentTheme))}>
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
                {uploadFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className={cn(
                        "flex items-center gap-3 p-4 rounded-xl transition-all duration-200",
                        isDark ? "bg-slate-700/50" : "bg-gray-50"
                      )}>
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center",
                          file.type.includes('pdf') ? (isDark ? "bg-gradient-to-br from-red-600/30 to-red-700/30 text-red-400" : "bg-gradient-to-br from-red-100 to-red-200 text-red-600") :
                          file.type.includes('image') ? (isDark ? "bg-gradient-to-br from-purple-600/30 to-purple-700/30 text-purple-400" : "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600") :
                          file.type.includes('video') ? (isDark ? "bg-gradient-to-br from-pink-600/30 to-pink-700/30 text-pink-400" : "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600") :
                          file.type.includes('audio') ? (isDark ? "bg-gradient-to-br from-orange-600/30 to-orange-700/30 text-orange-400" : "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600") :
                          (isDark ? "bg-gradient-to-br from-slate-600/30 to-slate-700/30 text-slate-400" : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600")
                        )}>
                          <FileText className="w-5 h-5" />
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
                            "p-2.5 rounded-xl transition-all duration-200",
                            isDark ? "hover:bg-red-500/20 text-slate-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                          )}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className={cn("flex-1 h-12 rounded-xl", isDark ? "border-slate-600/50 hover:bg-slate-700/30" : "border-gray-300")}
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
            </CardContent>
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
                          return (
                            <Badge
                              key={tag.id}
                              onClick={() => toggleEditTag(tag.id)}
                              className={cn(
                                "cursor-pointer transition-all duration-300",
                                isSelected
                                  ? isDark
                                    ? "bg-blue-500/30 text-blue-300 border-blue-500/50"
                                    : "bg-blue-100 text-blue-600 border-blue-300"
                                  : isDark
                                    ? "bg-slate-700/50 text-slate-300 border-slate-600/30 hover:bg-slate-600/50"
                                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                              )}
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
                className={cn("flex-1 h-12 rounded-xl", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-gray-200" : "border-gray-300")}
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
