import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, FolderOpen, Tag, Calendar, FileText, Download, Share2, Clock, Play, Image, File, ChevronDown, ChevronRight, ChevronLeft, Filter, Layout, Save, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, CheckCircle, Code, TableIcon, Minus, Quote, ListTodo, Highlighter, Strikethrough, Undo, Redo, Link2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog } from '../components/ui/Dialog'
import { useEditor, EditorContent } from '@tiptap/react'
import AIChat from '../components/AIChat'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, FontFamily, FontSize } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import CodeBlock from '@tiptap/extension-code-block'
import { Table as TableExtension } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'

export default function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [expandedCategories, setExpandedCategories] = useState({})
  const [selectedTags, setSelectedTags] = useState([])
  const [activeFilter, setActiveFilter] = useState(null)
  const [relatedDocuments, setRelatedDocuments] = useState([])
  const [secondColumnCollapsed, setSecondColumnCollapsed] = useState(false)
  const [docListExpanded, setDocListExpanded] = useState(true)
  const [categoryDocCount, setCategoryDocCount] = useState({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [attachmentToDelete, setAttachmentToDelete] = useState(null)
  const [noteContent, setNoteContent] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 默认展开所有分类并获取文档统计
  useEffect(() => {
    const expandAll = (cats) => {
      cats.forEach(cat => {
        setExpandedCategories(prev => ({ ...prev, [cat.id]: true }))
        if (cat.children && cat.children.length > 0) {
          expandAll(cat.children)
        }
      })
    }
    
    // 获取分类树
    axios.get('/api/categories/tree').then(res => {
      setCategories(res.data)
      expandAll(res.data)
    })
    
    // 获取分类文档统计
    axios.get('/api/categories/doc-count').then(res => {
      const countMap = {}
      res.data.forEach(item => {
        countMap[item.categoryId] = item.count
      })
      setCategoryDocCount(countMap)
    })
  }, [])

  // 获取标签列表
  useEffect(() => {
    axios.get('/api/tags').then(res => {
      setTags(res.data)
    })
  }, [])

  // 获取文档详情和笔记
  useEffect(() => {
    axios.get(`/api/documents/${id}`).then(res => {
      setDocument(res.data)
      // 设置当前文档的分类为激活状态
      if (res.data.category && res.data.category.id) {
        setActiveFilter(res.data.category.id)
      }
    })
    
    // 获取笔记（与当前文档关联）
    axios.get(`/api/notes/${id}`).then(res => {
      setNoteContent(res.data.content || '')
    }).catch(() => {
      // 如果笔记不存在，清空内容
      setNoteContent('')
    })
  }, [id])

  // 初始化编辑器（语雀风格）
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      TextStyle.configure({
        types: ['textStyle'],
      }),
      FontFamily,
      FontSize,
      Color,
      CodeBlock,
      TableExtension.configure({
        resizable: true,
        useTableHeader: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: true }),
      CharacterCount,
    ],
    content: noteContent || '<p>开始编写笔记...</p>',
    onUpdate: ({ editor }) => {
      setNoteContent(editor.getHTML())
    },
  })

  // 当noteContent变化时更新编辑器内容（支持清空）
  useEffect(() => {
    // 使用严格的null检查
    if (!editor || editor === null || typeof editor !== 'object') return
    
    let commands = null
    try {
      // commands可能是一个getter，内部可能抛出异常
      commands = editor.commands
    } catch {
      // 编辑器初始化过程中状态可能不稳定，静默忽略
      return
    }
    
    if (!commands) return
    
    try {
      commands.setContent(noteContent || '')
    } catch {
      // 内容设置失败，静默忽略
    }
  }, [noteContent, editor])

  // 保存笔记
  const saveNote = useCallback(async () => {
    if (!editor || !id || !document) {
      console.error('保存笔记失败: 编辑器未就绪或文档不存在')
      return
    }
    const content = editor.getHTML()
    setNoteSaving(true)
    setSaveSuccess(false)
    try {
      const response = await axios.post(`/api/notes/${id}`, { content })
      console.log('笔记保存成功:', response.data)
      setNoteContent(content)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('保存笔记失败:', error.response?.data || error.message)
    } finally {
      setNoteSaving(false)
    }
  }, [editor, id, document])

  // 获取相关文档
  useEffect(() => {
    let url = '/api/documents'
    if (selectedTags.length > 0) {
      url += `?tagIds=${selectedTags.join(',')}`
    } else if (activeFilter) {
      url += `?categoryId=${activeFilter}`
    }
    axios.get(url).then(res => {
      setRelatedDocuments(res.data)
    })
  }, [selectedTags, activeFilter])

  // 处理分类点击
  const handleCategoryClick = (categoryId) => {
    setActiveFilter(categoryId)
    setSelectedTags([])
  }

  // 处理标签点击（支持多选）
  const handleTagClick = (tagId) => {
    setActiveFilter(null)
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  // 计算分类及其子分类的文档总数
  const getTotalDocCount = (cat) => {
    let count = categoryDocCount[cat.id] || 0
    if (cat.children && cat.children.length > 0) {
      cat.children.forEach(child => {
        count += getTotalDocCount(child)
      })
    }
    return count
  }

  // 渲染分类树
  const renderCategoryTree = (cats, level = 0) => {
    return cats.map(cat => {
      const totalCount = getTotalDocCount(cat)
      return (
        <div key={cat.id}>
          <button
            onClick={() => handleCategoryClick(cat.id)}
            className={`w-full flex items-center h-8 px-3 rounded-lg text-left transition-colors ${activeFilter === cat.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {cat.children && cat.children.length > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedCategories(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))
                  }}
                  className="p-0 cursor-pointer flex-shrink-0"
                >
                  {expandedCategories[cat.id] ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </span>
              )}
              {!cat.children || cat.children.length === 0 && (
                <span className="w-4 flex-shrink-0" />
              )}
              <FolderOpen className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="flex-1 text-gray-700">{cat.name}</span>
            </div>
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0 min-w-[20px] text-center">
                {totalCount}
              </Badge>
            )}
          </button>
          {cat.children && cat.children.length > 0 && expandedCategories[cat.id] && (
            <div className="mt-1">
              {renderCategoryTree(cat.children, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  // 处理下载
  const handleDownload = (attachmentId) => {
    window.open(`/api/documents/download/${attachmentId}`, '_blank')
  }

  // 打开删除确认对话框
  const openDeleteDialog = (attachmentId) => {
    setAttachmentToDelete(attachmentId)
    setDeleteDialogOpen(true)
  }

  // 关闭删除确认对话框
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setAttachmentToDelete(null)
  }

  // 处理删除附件
  const handleDeleteAttachment = () => {
    if (attachmentToDelete) {
      axios.delete(`/api/documents/attachment/${attachmentToDelete}`).then(() => {
        // 刷新文档详情
        axios.get(`/api/documents/${id}`).then(res => {
          setDocument(res.data)
        })
        closeDeleteDialog()
      }).catch(err => {
        console.error('删除附件失败:', err)
        alert('删除附件失败')
        closeDeleteDialog()
      })
    }
  }

  // 处理下载全部
  const handleDownloadAll = () => {
    document?.attachments?.forEach((attachment, index) => {
      setTimeout(() => {
        window.open(`/api/documents/download/${attachment.id}`, '_blank')
      }, index * 500)
    })
  }

  // 处理分享
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/documents/${id}`)
    alert('链接已复制到剪贴板')
  }

  // 获取文件图标
  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText className="w-10 h-10" />
    if (fileType.includes('video')) return <Play className="w-10 h-10" />
    if (fileType.includes('audio')) return <Play className="w-10 h-10" />
    if (fileType.includes('image')) return <Image className="w-10 h-10" />
    return <FileText className="w-10 h-10" />
  }

  // 获取文件图标样式类
  const getFileIconClass = (fileType) => {
    if (!fileType) return 'bg-blue-100 text-blue-600'
    if (fileType.includes('video')) return 'bg-purple-100 text-purple-600'
    if (fileType.includes('audio')) return 'bg-green-100 text-green-600'
    if (fileType.includes('image')) return 'bg-pink-100 text-pink-600'
    return 'bg-blue-100 text-blue-600'
  }

  const fileTypeClass = document?.attachments?.length > 0 ? getFileIconClass(document.attachments[0].fileType) : 'bg-blue-100 text-blue-600'

  const toggleDocListExpand = () => {
    setDocListExpanded(!docListExpanded)
  }

  if (!document) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>
  }

  return (
    <div className="flex">
      {/* 左侧边栏 - 两列布局 */}
      <div className="flex flex-shrink-0 border-r border-gray-200">
        {/* 第一列：分类和标签管理 */}
        <aside className="w-72 bg-gray-50 border-r border-gray-200">
          <div className="p-4 space-y-4">
            {/* 侧边栏标题 */}
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Layout className="w-5 h-5" />
              文档导航
            </div>

            {/* 分类导航 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-700 font-medium mb-4">
                <FolderOpen className="w-4 h-4" />
                分类管理
              </div>
              <div className="space-y-1">
                {renderCategoryTree(categories)}
              </div>
            </div>

            {/* 标签管理 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-700 font-medium mb-4">
                <Tag className="w-4 h-4" />
                标签管理
                <span className="text-xs text-gray-400 ml-auto">{selectedTags.length > 0 ? `${selectedTags.length}个选中` : '支持多选'}</span>
              </div>
              <div className="space-y-1">
                {tags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id)
                  const tagColor = tag.color || '#6366f1'
                  const bgColor = tagColor + '20'
                  const textColor = tagColor
                  
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.id)}
                      className={`w-full flex items-center justify-start gap-2 h-8 px-3 rounded-lg transition-colors`}
                      style={isSelected 
                        ? { backgroundColor: tagColor, color: '#fff' }
                        : { backgroundColor: bgColor, color: textColor }
                      }
                    >
                      <Tag className="w-3 h-3" />
                      <span className="truncate">{tag.name}</span>
                      {isSelected && (
                        <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* 第二列收缩/展开按钮（收缩状态时显示）*/}
        <button
          onClick={() => setSecondColumnCollapsed(!secondColumnCollapsed)}
          className={`w-6 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 border-y border-r border-gray-200 rounded-tr-lg rounded-br-lg ${
            secondColumnCollapsed 
              ? 'bg-gray-100 hover:bg-blue-50' 
              : 'w-0 overflow-hidden opacity-0'
          }`}
          title={secondColumnCollapsed ? '展开第二列' : '收起第二列'}
        >
          <ChevronRight className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" />
        </button>

        {/* 第二列：可收缩/展开面板 */}
        <aside className={`bg-gray-50 pr-6 transition-all duration-300 relative ${secondColumnCollapsed ? 'w-0 overflow-hidden' : 'w-56'}`}>
          {!secondColumnCollapsed && (
            <>
              {/* 收缩按钮（显示在第二列右侧） */}
              <button
                onClick={() => setSecondColumnCollapsed(!secondColumnCollapsed)}
                className="w-6 h-12 bg-gray-50 hover:bg-blue-50 flex items-center justify-center cursor-pointer transition-all duration-200 border-y border-l border-gray-200 hover:shadow-sm absolute right-0 top-6 rounded-tl-lg rounded-bl-lg"
                title="收起第二列"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" />
              </button>

              {/* 文档列表 */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div 
                  className="flex items-center gap-2 text-gray-700 font-medium px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={toggleDocListExpand}
                >
                  <FileText className="w-4 h-4" />
                  文档列表
                  <ChevronRight 
                    className={`w-4 h-4 ml-auto transition-transform duration-200 ${docListExpanded ? 'rotate-90' : ''}`} 
                  />
                </div>
                {docListExpanded && (
                  <div className="px-4 pb-4 space-y-1 max-h-64 overflow-auto">
                    {relatedDocuments.length > 0 ? (
                      relatedDocuments.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => navigate(`/documents/${doc.id}`)}
                          className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                            <span className="text-sm text-gray-700 group-hover:text-blue-600">
                              {doc.title}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 text-sm py-4">
                        暂无文档
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 当前文档信息 */}
              <div className="bg-white rounded-xl p-4 shadow-sm mt-4">
                <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                  <FileText className="w-4 h-4" />
                  当前文档
                </div>
                <p className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                  {document?.title}
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  {document?.category && (
                    <div className="flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      {document.category.name}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {document?.attachments?.length || 0} 个附件
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* 主内容区 */}
      <main className="flex-1 p-6">
        {document && (
          <div>
            {/* 文档头部 */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${fileTypeClass}`}>
                  {getFileIcon(document.attachments?.[0]?.fileType)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{document.title}</h1>
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
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(document.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
                <Button onClick={handleDownloadAll}>
                  <Download className="w-4 h-4 mr-2" />
                  下载全部
                </Button>
              </div>
            </div>

            {/* 文档附件 */}
            <div className="space-y-4">
              {document.attachments && document.attachments.length > 0 ? (
                [...document.attachments].sort((a, b) => {
                  const priority = {
                    video: 0,
                    audio: 1,
                    pdf: 2,
                    docx: 3,
                    doc: 4,
                    image: 5,
                  }
                  const getPriority = (fileType) => {
                    const lowerType = fileType?.toLowerCase() || ''
                    if (lowerType.includes('video')) return priority.video
                    if (lowerType.includes('audio')) return priority.audio
                    if (lowerType.includes('pdf')) return priority.pdf
                    if (lowerType.includes('docx')) return priority.docx
                    if (lowerType.includes('doc') && !lowerType.includes('docx')) return priority.doc
                    if (lowerType.includes('image')) return priority.image
                    return 6
                  }
                  return getPriority(a.fileType) - getPriority(b.fileType)
                }).map((attachment, index) => (
                  <div key={attachment.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* 文件信息栏 */}
                    <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{attachment.originalFilename}</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleDownload(attachment.id)}>
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(attachment.id)}>
                          删除
                        </Button>
                      </div>
                    </div>

                    {/* 视频预览 */}
                    {attachment.fileType?.includes('video') && (
                      <video
                        controls
                        className="w-full max-h-96 bg-gray-900 rounded-lg"
                        src={`/api/documents/download/${attachment.id}`}
                      >
                        您的浏览器不支持视频播放
                      </video>
                    )}

                    {/* 音频预览 */}
                    {attachment.fileType?.includes('audio') && (
                      <audio
                        controls
                        className="w-full"
                        src={`/api/documents/download/${attachment.id}`}
                      />
                    )}

                    {/* 图片预览 */}
                    {attachment.fileType?.includes('image') && (
                      <img
                        src={`/api/documents/download/${attachment.id}`}
                        alt={attachment.originalFilename}
                        className="max-w-full h-auto rounded-lg shadow-md"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                      />
                    )}

                    {/* PDF预览 */}
                    {attachment.fileType?.includes('pdf') && (
                      <div className="p-4">
                        <object
                          data={`/api/documents/preview/${attachment.id}`}
                          type="application/pdf"
                          className="w-full"
                          style={{ 
                            height: '600px',
                            minHeight: '500px',
                            maxHeight: '800px',
                            aspectRatio: '16/9'
                          }}
                        >
                          <p>您的浏览器不支持PDF预览，请点击下载按钮下载查看。</p>
                        </object>
                      </div>
                    )}

                    {/* 文档内容预览 */}
                    {(!attachment.fileType?.includes('video') && !attachment.fileType?.includes('audio') && !attachment.fileType?.includes('image') && !attachment.fileType?.includes('pdf')) && document.content && index === 0 && (
                      <div className="p-6">
                        <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed bg-gray-50 p-6 rounded-lg max-h-96 overflow-auto">
                          {document.content}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无附件</p>
                </div>
              )}
            </div>

            {/* 文档描述 */}
            {document.description && (
              <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">文档描述</h2>
                <p className="text-gray-600">{document.description}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 第三列：AI问答和笔记 */}
      <aside className="w-[500px] bg-gray-50 border-l border-gray-200 flex flex-col">
        {/* 返回按钮 */}
        <div className="px-4 py-3 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => navigate('/documents')}
            className="w-full justify-start gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4" />
            返回文档列表
          </Button>
        </div>
        
        {/* AI智能问答 - 放在顶部，一屏可见 */}
        <div className="border-b border-gray-200 bg-white">
          <AIChat documentId={id} />
        </div>
        
        {/* 笔记头部 */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FileText className="w-4 h-4" />
            我的笔记
          </div>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-green-600 text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                已保存
              </span>
            )}
            <Button 
              size="sm" 
              onClick={saveNote} 
              disabled={noteSaving}
              className="gap-1"
            >
              <Save className="w-4 h-4" />
              {noteSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>

        {/* 笔记编辑器工具栏（语雀风格） */}
        <div className="px-4 py-2 border-b border-gray-200 flex flex-wrap gap-1">
         {/* 撤销/重做 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor || (() => { try { return !editor.can().undo(); } catch { return true; } })()}
            className="h-7 w-7"
            title="撤销"
          >
            <Undo className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor || (() => { try { return !editor.can().redo(); } catch { return true; } })()}
            className="h-7 w-7"
            title="重做"
          >
            <Redo className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* 字体选择 */}
          <select
            onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value || null).run()}
            disabled={!editor}
            className="h-7 px-2 text-xs border border-gray-200 rounded bg-white disabled:opacity-50 cursor-pointer"
          >
            <option value="">字体</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Microsoft YaHei">微软雅黑</option>
            <option value="SimSun">宋体</option>
            <option value="KaiTi">楷体</option>
          </select>
          {/* 字号选择 */}
          <select
            onChange={(e) => editor?.chain().focus().setFontSize(e.target.value || null).run()}
            disabled={!editor}
            className="h-7 px-2 text-xs border border-gray-200 rounded bg-white disabled:opacity-50 cursor-pointer"
          >
            <option value="">字号</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
          </select>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* 文字样式 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="粗体"
          >
            <Bold className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="斜体"
          >
            <Italic className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="下划线"
          >
            <Underline className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="删除线"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="高亮"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* 标题 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            disabled={!editor}
            className="h-7 w-7"
            title="标题1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={!editor}
            className="h-7 w-7"
            title="标题2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            disabled={!editor}
            className="h-7 w-7"
            title="标题3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* 列表 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="无序列表"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="有序列表"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="任务列表"
          >
            <ListTodo className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* 代码块和表格 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="代码块"
          >
            <Code className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().insertTable().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="插入表格"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* 引用和分隔线 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="引用"
          >
            <Quote className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            disabled={!editor}
            className="h-7 w-7"
            title="分隔线"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* 对齐方式 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            disabled={!editor}
            className="h-7 w-7"
            title="左对齐"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            disabled={!editor}
            className="h-7 w-7"
            title="居中"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            disabled={!editor}
            className="h-7 w-7"
            title="右对齐"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* 链接 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const url = window.prompt('请输入链接地址：')
              if (url) {
                editor?.chain().focus().setLink({ href: url }).run()
              }
            }}
            disabled={!editor}
            className="h-7 w-7"
            title="插入链接"
          >
            <Link2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* 笔记编辑器内容区 */}
        <div className="flex-1 overflow-auto">
          <EditorContent 
            editor={editor} 
            className="p-4 min-h-full prose max-w-none"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>
      </aside>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        title="确认删除"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDeleteAttachment}
        danger={true}
      >
        确定要删除这个附件吗？
      </Dialog>
    </div>
  )
}