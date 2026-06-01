import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Search, Upload, FileText, FolderOpen, Tag, Trash2, Calendar, X, Plus, Filter, ChevronRight, ChevronDown, Edit3 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ConfirmDialog } from '../components/ConfirmDialog'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [allDocuments, setAllDocuments] = useState([]) // 保存完整的文档列表用于统计
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
    // 从URL参数读取筛选条件
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
    // 同步URL参数
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedTag) params.set('tag', selectedTag)
    setSearchParams(params)
  }, [selectedCategory, selectedTag, setSearchParams])

  async function fetchDocuments() {
    try {
      // 构建请求URL，包含筛选条件
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedTag) params.set('tag', selectedTag)
      
      const url = params.toString() ? `/api/documents?${params.toString()}` : '/api/documents'
      const response = await axios.get(url)
      setDocuments(response.data)
      // 获取完整文档列表用于统计
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
      // 按 order 字段排序
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
      
      // 添加新文件（与上传格式保持一致）
      const newFiles = editAttachments.filter(a => a.isNew && a.file)
      newFiles.forEach((fileItem) => {
        // 使用 Base64 编码文件名，与上传逻辑保持一致
        const encodedName = btoa(encodeURIComponent(fileItem.file.name))
        const newFile = new File([fileItem.file], encodedName, { type: fileItem.file.type })
        formData.append('files', newFile)
      })
      
      // 调试日志
      console.log('Edit formData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // 使用 POST 请求模拟 PUT，添加 _method 字段
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
      // 创建一个新的 File 对象，使用 Base64 编码的文件名
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
    console.log('Uploading with tags:', selectedTags);
    try {
      console.log('Starting upload...');
      const response = await axios.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Upload successful:', response.data);
      setShowUploadModal(false)
      setUploadFiles([])
      setUploadTitle('')
      setUploadDescription('')
      setSelectedTags([])
      console.log('Calling fetchDocuments...');
      await fetchDocuments();
      console.log('fetchDocuments completed');
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

  // 获取所有有子分类的分类ID，用于默认展开
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

  // 默认展开所有有子分类的分类
  useEffect(() => {
    if (categories.length > 0) {
      setExpandedCategories(getAllParentIds(categories))
    }
  }, [categories])

  // 获取分类及其所有子分类的ID
  const getCategoryIdsWithChildren = (category) => {
    let ids = [category.id]
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        ids = [...ids, ...getCategoryIdsWithChildren(child)]
      })
    }
    return ids
  }

  // 计算每个分类下的文档数量（包含子分类）
  const getDocumentCount = (categoryId) => {
    // 找到对应的分类
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
    
    // 获取所有相关分类ID
    const relatedIds = getCategoryIdsWithChildren(category)
    
    // 使用完整文档列表统计，不受筛选影响
    return allDocuments.filter(doc => relatedIds.includes(doc.category?.id)).length
  }



  // 渲染分类下拉选项（树形结构）
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
    // 按照 order 字段排序
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0))
    
    return sortedItems.map(category => (
      <div key={category.id}>
        <button
          onClick={() => {
            setSelectedCategory(selectedCategory === category.id ? null : category.id)
            setSelectedTag(null)
          }}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCategory === category.id
              ? 'bg-blue-50 text-blue-600'
              : 'hover:bg-gray-100 text-gray-700'
            }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          {category.children && category.children.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                toggleCategory(category.id)
              }}
              className="p-0.5 hover:bg-gray-200 rounded cursor-pointer"
            >
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {(!category.children || category.children.length === 0) && (
            <span className="w-4" />
          )}
          <FolderOpen className="w-4 h-4" />
          <span className="truncate">{category.name}</span>
          <span className="text-xs text-gray-400 ml-auto">{getDocumentCount(category.id)}</span>
        </button>
        {category.children && category.children.length > 0 && expandedCategories.includes(category.id) && (
          <div>{renderCategoryTreeWithCount(category.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  const filteredDocuments = documents.filter(doc => {
    // 分类筛选
    if (selectedCategory && doc.category?.id !== selectedCategory) {
      return false
    }
    // 标签筛选
    if (selectedTags.length > 0) {
      const docTagIds = doc.tags?.map(tag => tag.id) || []
      console.log('Document:', doc.title, 'Tags:', docTagIds, 'SelectedTags:', selectedTags)
      return selectedTags.some(tagId => docTagIds.includes(tagId))
    }
    return true
  })

  const fileIcon = (attachments) => {
    if (!attachments || attachments.length === 0) {
      return 'bg-gray-100 text-gray-600'
    }
    const fileType = attachments[0].fileType
    if (fileType?.includes('pdf')) return 'bg-red-100 text-red-600'
    if (fileType?.includes('word') || fileType?.includes('docx')) return 'bg-blue-100 text-blue-600'
    if (fileType?.includes('markdown') || fileType?.includes('text')) return 'bg-green-100 text-green-600'
    if (fileType?.includes('image') || fileType?.includes('jpg') || fileType?.includes('png') || fileType?.includes('gif')) return 'bg-purple-100 text-purple-600'
    if (fileType?.includes('audio') || fileType?.includes('mp3') || fileType?.includes('wav')) return 'bg-orange-100 text-orange-600'
    if (fileType?.includes('video') || fileType?.includes('mp4') || fileType?.includes('avi') || fileType?.includes('mov')) return 'bg-pink-100 text-pink-600'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            文档管理
          </h1>
          <p className="text-gray-500 mt-1">管理您的知识库文档</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="shadow-lg">
          <Upload className="w-5 h-5 mr-2" />
          上传文档
        </Button>
      </div>

      <div className="flex gap-6">
        {/* 左侧导航 */}
        <div className="w-56 flex-shrink-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="w-4 h-4" />
                分类管理
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setSelectedTag(null)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 mb-1 ${!selectedCategory && !selectedTag
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>全部文档</span>
                <span className="text-xs text-gray-400 ml-auto">{allDocuments.length}</span>
              </button>
              {renderCategoryTreeWithCount(categories)}
            </CardContent>
          </Card>

          {/* 标签筛选 */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-4 h-4" />
                标签管理
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {tags.map(tag => {
                    const tagCount = allDocuments.filter(doc => doc.tags?.some(t => t.id === tag.id)).length
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTag(selectedTag === tag.id ? null : tag.id)
                        setSelectedCategory(null)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedTag === tag.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color || '#6366f1' }}
                      />
                      <span className="truncate">{tag.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{tagCount}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                    placeholder="搜索文档..."
                  />
                </div>
                <Button onClick={handleSearch} variant="secondary">
                  <Search className="w-4 h-4 mr-2" />
                  搜索
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map(document => (
          <Card
            key={document.id}
            className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-300"
            onClick={() => navigate(`/documents/${document.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${fileIcon(document.attachments)}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate group-hover:text-blue-600 transition-colors">
                    {document.title}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {document.content.substring(0, 100) || '暂无内容'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {document.category && (
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-4 h-4" />
                    {document.category.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(document.createdAt).toLocaleDateString()}
                </span>
              </div>
              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {document.tags.slice(0, 3).map(tag => (
                    <Badge key={tag.id} variant="secondary" className="gap-1">
                      <Tag className="w-3 h-3" />
                      {tag.name}
                    </Badge>
                  ))}
                  {document.tags.length > 3 && (
                    <Badge variant="outline">+{document.tags.length - 3}</Badge>
                  )}
                </div>
              )}
            </CardContent>
            <div className="px-6 pb-4 flex gap-3">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditClick(document)
                }}
                size="sm"
                className="flex-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg font-medium shadow-sm hover:shadow-md"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                编辑
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClick(document.id)
                }}
                size="sm"
                className="flex-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg font-medium shadow-sm hover:shadow-md"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除
              </Button>
            </div>
          </Card>
        ))}
      </div>

          {filteredDocuments.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <CardTitle className="text-xl text-gray-500">暂无文档</CardTitle>
              <CardDescription className="mt-2">
                点击上方按钮上传您的第一个文档
              </CardDescription>
            </Card>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>上传文档</span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadFile(null)
                      setUploadTitle('')
                      setUploadDescription('')
                      setSelectedTags([])
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
              </CardTitle>
              <CardDescription>支持文档（PDF/DOC/DOCX/MD/TXT）、图片（JPG/PNG/GIF）、音频（MP3/WAV）、视频（MP4/AVI/MOV/WEBM）格式，可多选</CardDescription>
              {selectedCategory && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <FolderOpen className="w-4 h-4" />
                  文档将添加到选中的分类下
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">文档标题</label>
                <Input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="输入文档标题"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">文档描述</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="输入文档描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">选择分类</label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? +e.target.value : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">无分类</option>
                  {renderCategoryOptions(categories)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">选择标签</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      onClick={() => toggleTag(tag.id)}
                      className="cursor-pointer"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-gray-400 text-sm">暂无标签</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">选择文件（可多选）</label>
                <Input
                  type="file"
                  accept=".pdf,.docx,.doc,.md,.txt,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.wav,.avi,.mov,.webm"
                  multiple
                  onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                />
                {uploadFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">
                        <span className="font-medium">{file.name}</span>
                        <button
                          onClick={() => setUploadFiles(uploadFiles.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setUploadTitle('')
                    setUploadDescription('')
                    setSelectedTags([])
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleUpload} className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  上传
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="确认删除"
        message="确定要删除这个文档吗？"
      />

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>编辑文档</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingDocument(null)
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">文档标题</label>
                <Input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="输入文档标题"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">文档描述</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="输入文档描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">选择分类</label>
                <select
                  value={editCategoryId || ''}
                  onChange={(e) => setEditCategoryId(e.target.value ? +e.target.value : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">无分类</option>
                  {renderCategoryOptions(categories)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">选择标签</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={editTagIds.includes(tag.id) ? 'default' : 'outline'}
                      onClick={() => toggleEditTag(tag.id)}
                      className="cursor-pointer"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-sm text-gray-400">暂无标签，请先在标签管理中添加</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">附件</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleEditFileChange}
                    className="hidden"
                    id="edit-file-input"
                  />
                  <label htmlFor="edit-file-input" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">点击或拖拽上传文件</p>
                  </label>
                </div>
                {editAttachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {editAttachments.map((attachment, index) => (
                      <div 
                        key={attachment.id || `new-${index}`} 
                        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
                      >
                        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <span className="flex-1 text-gray-700 font-medium truncate">{attachment.name || attachment.originalFilename}</span>
                        <button
                          onClick={() => {
                            if (attachment.isNew) {
                              setEditAttachments(prev => prev.filter((_, i) => i !== index))
                            } else {
                              handleEditAttachmentRemove(attachment.id)
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <div className="flex gap-3 px-6 pb-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingDocument(null)
                }}
              >
                取消
              </Button>
              <Button onClick={handleEdit} className="flex-1">
                保存修改
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}