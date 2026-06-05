import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useMediaUrl } from '../hooks/useMediaUrl'
import { ArrowLeft, FolderOpen, Tag, Calendar, FileText, Download, Share2, Clock, Play, Image, File, ChevronDown, ChevronRight, ChevronLeft, Filter, Layout, Save, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, CheckCircle, Code, TableIcon, Minus, Quote, ListTodo, Highlighter, Strikethrough, Undo, Redo, Link2, Type, Palette, ListChecks, Grid3X3, Info } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog } from '../components/ui/Dialog'
import { useEditor, EditorContent } from '@tiptap/react'
import AIChat from '../components/AIChat'
import AttachmentPreview from '../components/AttachmentPreview'
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
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'

export default function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { colors, isDark, currentTheme } = useTheme()
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
        paragraph: {
          HTMLAttributes: {
            class: isDark ? 'text-slate-200 leading-relaxed' : 'text-gray-800 leading-relaxed',
          },
        },
      }),
      TextStyle.configure({
        types: ['textStyle', 'heading', 'paragraph'],
      }),
      FontFamily,
      FontSize,
      Color.configure({
        types: ['textStyle', 'heading'],
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono',
        },
      }),
      TableExtension.configure({
        resizable: true,
        useTableHeader: true,
        HTMLAttributes: {
          class: 'border-collapse w-full',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none pl-0 space-y-1',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 group',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ 
        multicolor: true,
        types: ['textStyle'],
      }),
      CharacterCount,
    ],
    content: noteContent || '<p>开始编写笔记...</p>',
    onUpdate: ({ editor }) => {
      setNoteContent(editor.getHTML())
    },
    autofocus: false,
    injectCSS: false,
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
            className={cn(
              "w-full flex items-center h-8 px-3 rounded-lg text-left transition-all duration-200",
              activeFilter === cat.id 
                ? isDark ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-500/20 text-blue-600'
                : isDark ? 'hover:bg-slate-700/50 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
            )}
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
                    <ChevronDown className={cn(
                      "w-4 h-4",
                      isDark ? "text-gray-500" : "text-gray-400"
                    )} />
                  ) : (
                    <ChevronRight className={cn(
                      "w-4 h-4",
                      isDark ? "text-gray-500" : "text-gray-400"
                    )} />
                  )}
                </span>
              )}
              {!cat.children || cat.children.length === 0 && (
                <span className="w-4 flex-shrink-0" />
              )}
              <FolderOpen className={cn(
                "w-4 h-4 flex-shrink-0",
                isDark ? "text-gray-500" : "text-gray-400"
              )} />
              <span className={cn(
                "flex-1 text-sm whitespace-nowrap overflow-hidden text-ellipsis",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>{cat.name}</span>
            </div>
            {totalCount > 0 && (
              <Badge className={cn(
                "text-xs ml-2 flex-shrink-0 min-w-[20px] text-center",
                isDark 
                  ? "bg-slate-700/50 text-gray-300 border-slate-600/50" 
                  : "bg-gray-100 text-gray-600 border-gray-200"
              )}>
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
  const handleDownload = async (attachmentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/documents/download/${attachmentId}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // 获取文件名
      const contentDisposition = response.headers['content-disposition']
      let filename = 'download'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (match && match[1]) {
          filename = decodeURIComponent(match[1].replace(/['"]/g, ''))
        }
      }
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败')
    }
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
      const token = localStorage.getItem('token')
      axios.delete(`/api/documents/attachment/${attachmentToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(() => {
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
  const handleDownloadAll = async () => {
    if (!document?.attachments?.length) return
    
    const token = localStorage.getItem('token')
    
    for (let index = 0; index < document.attachments.length; index++) {
      const attachment = document.attachments[index]
      try {
        const response = await axios.get(`/api/documents/download/${attachment.id}`, {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // 获取文件名
        const contentDisposition = response.headers['content-disposition']
        let filename = 'download'
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (match && match[1]) {
            filename = decodeURIComponent(match[1].replace(/['"]/g, ''))
          }
        }
        
        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        // 延迟下载下一个文件
        if (index < document.attachments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      } catch (error) {
        console.error(`下载文件 ${attachment.id} 失败:`, error)
      }
    }
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
    if (!fileType) return 'bg-blue-600/30 text-blue-400'
    if (fileType.includes('video')) return 'bg-purple-600/30 text-purple-400'
    if (fileType.includes('audio')) return 'bg-green-600/30 text-green-400'
    if (fileType.includes('image')) return 'bg-pink-600/30 text-pink-400'
    return 'bg-blue-600/30 text-blue-400'
  }

  const fileTypeClass = document?.attachments?.length > 0 ? getFileIconClass(document.attachments[0].fileType) : 'bg-blue-600/30 text-blue-400'

  const toggleDocListExpand = () => {
    setDocListExpanded(!docListExpanded)
  }

  if (!document) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>
  }

  return (
    <div className={cn(
      "flex min-h-screen transition-colors duration-300",
      isDark 
        ? isSpecialTheme
          ? cn("bg-gradient-to-br", gradientColors.from, gradientColors.via, gradientColors.to)
          : "bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900"
        : "bg-gradient-to-br from-white via-gray-50 to-blue-50"
    )}>
      {/* 左侧边栏 - 两列布局 */}
      <div className="flex flex-shrink-0">
        {/*// 第一列：分类和标签管理 */}
        <aside className={cn(
          "w-72 backdrop-blur-xl border-r transition-colors",
          isDark 
            ? isSpecialTheme
              ? cn(cardColors.bgTo, cardColors.border)
              : "bg-slate-900/80 border-slate-700/30"
            : "bg-white/90 border-gray-200/50"
        )}>
          <div className="p-4 space-y-4">
            {/* 侧边栏标题 */}
            <div className={cn(
              "flex items-center gap-3 font-semibold",
              isDark ? isSpecialTheme ? cardColors.text : "text-gray-200" : "text-gray-800"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                isDark 
                  ? isSpecialTheme
                    ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/30`, `to-${gradientColors.accent}-400/30`)
                    : "bg-slate-700/50"
                  : "bg-blue-50"
              )}>
                <Layout className={cn("w-4 h-4", isDark && isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-blue-500")} />
              </div>
              文档导航
            </div>

            {/* 分类导航 */}
            <div className={cn(
              "rounded-2xl p-4 border transition-colors",
              isDark 
                ? isSpecialTheme
                  ? cn("bg-gradient-to-br", cardColors.bgFrom, cardColors.bgTo, cardColors.border)
                  : "bg-slate-800/50 border-slate-700/20"
                : "bg-gray-50 border-gray-200/50"
            )}>
              <div className={cn(
                "flex items-center gap-2 font-medium mb-4",
                isDark ? isSpecialTheme ? cardColors.text : "text-gray-200" : "text-gray-800"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center",
                  isDark 
                    ? isSpecialTheme 
                      ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/30`, `to-${gradientColors.accent}-400/20`)
                      : "bg-slate-700/40"
                    : "bg-blue-50"
                )}>
                  <FolderOpen className={cn("w-3.5 h-3.5", isDark && isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-blue-500")} />
                </div>
                分类管理
              </div>
              <div className="space-y-0.5">
                {renderCategoryTree(categories)}
              </div>
            </div>

            {/* 标签管理 */}
            <div className={cn(
              "rounded-2xl p-4 border transition-colors",
              isDark 
                ? isSpecialTheme 
                  ? cn("bg-gradient-to-br", cardColors.bgFrom, cardColors.bgTo, cardColors.border)
                  : "bg-slate-800/50 border-slate-700/20"
                : "bg-gray-50 border-gray-200/50"
            )}>
              <div className={cn(
                "flex items-center gap-2 font-medium mb-4",
                isDark ? isSpecialTheme ? cardColors.text : "text-gray-200" : "text-gray-800"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center",
                  isDark 
                    ? isSpecialTheme 
                      ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/30`, `to-${gradientColors.accent}-400/20`)
                      : "bg-slate-700/40"
                    : "bg-purple-50"
                )}>
                  <Tag className={cn("w-3.5 h-3.5", isDark && isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-purple-500")} />
                </div>
                标签管理
                <span className={cn(
                  "text-xs ml-auto",
                  isDark ? isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-gray-500" : "text-gray-500"
                )}>
                  {selectedTags.length > 0 ? `${selectedTags.length}个选中` : '支持多选'}
                </span>
              </div>
              <div className="space-y-1">
                {tags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id)
                  const tagColor = tag.color || '#6366f1'
                  const bgColor = tagColor + '15'
                  const textColor = tagColor
                  
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.id)}
                      className={`w-full flex items-center justify-start gap-2 h-8 px-3 rounded-xl transition-all duration-300`}
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
          className={`w-6 h-12 flex items-center justify-center cursor-pointer transition-all duration-300 ${
            secondColumnCollapsed 
              ? cn(
                  isDark ? "bg-slate-800/60 hover:bg-slate-700/60" : "bg-gray-100 hover:bg-gray-200",
                  "rounded-tr-xl rounded-br-xl"
                )
              : 'w-0 overflow-hidden opacity-0'
          }`}
          title={secondColumnCollapsed ? '展开第二列' : '收起第二列'}
        >
          <ChevronRight className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-gray-400")} />
        </button>

       {/* 第二列：可收缩/展开面板 */}
        <aside className={cn(
          "transition-all duration-300 relative backdrop-blur-xl",
          secondColumnCollapsed ? 'w-0 overflow-hidden' : 'w-52',
          isDark 
            ? isSpecialTheme 
              ? cn("bg-gradient-to-b", cardColors.bgTo, "via-[#1a2f50]/90", cardColors.bgTo)
              : "bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95" 
            : 'bg-gray-50/80'
        )}>
          {!secondColumnCollapsed && (
            <>
              {/* 文档列表 */}
              <div 
                className={cn(
                  "rounded-2xl border overflow-hidden transition-all duration-300",
                  isDark 
                    ? isSpecialTheme
                      ? cn("bg-gradient-to-b", cardColors.bgFrom, "to-[#0f1f3d]/50", cardColors.border, `shadow-xl shadow-${gradientColors.accent}-500/5`)
                      : "bg-gradient-to-b from-slate-800/60 to-slate-800/30 border-slate-700/30 shadow-xl shadow-black/10"
                    : "bg-white/90 border-gray-200/50 shadow-lg"
                )}
                style={{ marginTop: '16px' }}
              >
                <div 
                  className={cn(
                    "flex items-center gap-3 font-medium px-4 py-3.5 cursor-pointer transition-all duration-200",
                    isDark ? isSpecialTheme ? `${cardColors.text} hover:bg-${gradientColors.accent}-500/10` : "text-gray-100 hover:bg-white/5" : "text-gray-800 hover:bg-gray-50"
                  )}
                  onClick={toggleDocListExpand}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300",
                    isDark 
                      ? isSpecialTheme
                        ? cn("bg-gradient-to-br", `from-${gradientColors.accent}-500/30`, `to-${gradientColors.accent}-400/20`, "border", cardColors.border)
                      : "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20"
                      : "bg-gradient-to-br from-blue-50 to-blue-100"
                  )}>
                    <FileText className={cn(
                      "w-4 h-4",
                      isDark ? isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-blue-400" : "text-blue-500"
                    )} />
                  </div>
                  <span className={cn("text-sm font-medium", isDark ? isSpecialTheme ? cardColors.text : "text-gray-200" : "text-gray-800")}>文档列表</span>
                  <ChevronRight 
                    className={`w-4 h-4 ml-auto transition-all duration-300 ${docListExpanded ? 'rotate-90' : ''}`} 
                    style={{ color: isDark ? isSpecialTheme ? gradientColors.accent === 'cyan' ? '#22d3ee' : `var(--color-${gradientColors.accent}-400)` : '#64748b' : '#9ca3af' }}
                  />
                </div>
                {docListExpanded && (
                  <div className={cn(
                    "px-3 pb-4 space-y-1 max-h-64 overflow-auto",
                    isDark ? "scrollbar-thin scrollbar-thumb-slate-600/50" : ""
                  )}>
                    {relatedDocuments.length > 0 ? (
                      relatedDocuments.map((doc, index) => (
                        <button
                          key={doc.id}
                          onClick={() => navigate(`/documents/${doc.id}`)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                            document?.id === doc.id 
                              ? isDark 
                                ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 text-blue-300 border border-blue-500/30' 
                                : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200'
                              : isDark 
                                ? 'hover:bg-slate-700/40 text-gray-300 hover:text-gray-100' 
                                : 'hover:bg-gray-50 text-gray-700'
                          )}
                          style={{
                            animation: `fadeInLeft 0.3s ease-out ${index * 0.05}s both`
                          }}
                        >
                          {document?.id === doc.id && (
                            <div className={cn(
                              "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
                              isDark ? "bg-gradient-to-b from-blue-500 to-purple-500" : "bg-blue-500"
                            )} />
                          )}
                          <div className="flex items-start gap-3">
                            <FileText className={cn(
                              "w-4 h-4 transition-colors duration-200 mt-0.5",
                              document?.id === doc.id 
                                ? isDark ? 'text-blue-400' : 'text-blue-500'
                                : isDark ? 'text-gray-500 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-500'
                            )} />
                            <span className={cn("text-sm leading-tight", isDark ? "text-gray-300" : "text-gray-700")} style={{ wordBreak: 'break-all', maxWidth: '140px' }}>
                              {doc.title}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className={cn(
                        "text-center py-8",
                        isDark ? "text-gray-500" : "text-gray-400"
                      )}>
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无文档</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 当前文档信息 */}
              <div className={cn(
                "rounded-2xl border p-5 mt-4 transition-all duration-300",
                isDark 
                  ? "bg-gradient-to-br from-slate-800/70 to-slate-800/40 border-slate-700/30 shadow-xl shadow-black/10" 
                  : "bg-white/90 border-gray-200/50 shadow-lg"
              )}>
                <div className={cn(
                  "flex items-center gap-3 font-medium mb-4",
                  isDark ? "text-gray-100" : "text-gray-800"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    isDark 
                      ? "bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/20" 
                      : "bg-gradient-to-br from-amber-50 to-orange-50"
                  )}>
                    <Info className={cn(
                      "w-4 h-4",
                      isDark ? "text-amber-400" : "text-amber-500"
                    )} />
                  </div>
                  <span className={cn("text-sm font-medium", isDark ? isSpecialTheme ? cardColors.text : "text-gray-200" : "text-gray-800")}>文档信息</span>
                </div>
                <p className={cn(
                  "text-sm font-semibold mb-4 line-clamp-2 leading-relaxed",
                  isDark ? "text-gray-100" : "text-gray-800"
                )}>
                  {document?.title}
                </p>
                <div className="space-y-2">
                  {document?.category && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl",
                      isDark ? "bg-slate-700/30" : "bg-gray-50"
                    )}>
                      <FolderOpen className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isDark ? "text-blue-400" : "text-blue-500"
                      )} />
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-gray-300" : "text-gray-600"
                      )}>
                        {document.category.name}
                      </span>
                    </div>
                  )}
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl",
                    isDark ? "bg-slate-700/30" : "bg-gray-50"
                  )}>
                    <FileText className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isDark ? "text-purple-400" : "text-purple-500"
                    )} />
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-gray-300" : "text-gray-600"
                    )}>
                      {document?.attachments?.length || 0} 个附件
                    </span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl",
                    isDark ? "bg-slate-700/30" : "bg-gray-50"
                  )}>
                    <Calendar className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isDark ? "text-green-400" : "text-green-500"
                    )} />
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-gray-300" : "text-gray-600"
                    )}>
                      {new Date(document?.createdAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* 第二列收缩按钮（展开状态时显示）*/}
      <button
        onClick={() => setSecondColumnCollapsed(!secondColumnCollapsed)}
        className={`w-6 h-14 flex items-center justify-center cursor-pointer transition-all duration-300 flex-shrink-0 mt-[25px] ${
          !secondColumnCollapsed 
            ? cn(
                "rounded-tr-xl rounded-br-xl shadow-lg border-l-0 border-r z-50",
                isDark 
                  ? "bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm border-slate-600/30" 
                  : "bg-white/90 hover:bg-gray-100 backdrop-blur-sm border-gray-200"
              )
            : 'w-0 overflow-hidden opacity-0'
        }`}
        title="收起第二列"
      >
        <ChevronLeft className={cn(
          "w-4 h-4 transition-transform duration-200 hover:-translate-x-0.5",
          isDark ? "text-gray-400" : "text-gray-500"
        )} />
      </button>

     {/* 主内容区 */}
      <main className={cn(
        "flex-1 p-6 backdrop-blur-lg",
        isDark ? "bg-slate-900/60" : "bg-white/60"
      )}>
        {document && (
          <div>
            {/* 文档头部 */}
            <div className={cn(
              "rounded-2xl p-6 mb-6 border",
              isDark ? "bg-slate-800/50 border-slate-700/30" : "bg-white/80 border-gray-200"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${fileTypeClass}`}>
                    {getFileIcon(document.attachments?.[0]?.fileType)}
                  </div>
                  <div>
                    <h1 className={cn(
                      "text-2xl font-bold mb-2",
                      isDark ? "text-gray-100" : "text-gray-900"
                    )}>{document.title}</h1>
                    <div className={cn(
                      "flex items-center gap-4 text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      {document.category && (
                        <span className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-full",
                          isDark ? "bg-slate-700/50" : "bg-blue-50"
                        )}>
                          <FolderOpen className={cn(
                            "w-4 h-4",
                            isDark ? "text-blue-400" : "text-blue-500"
                          )} />
                          <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                            {document.category.name}
                          </span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className={cn(
                          "w-4 h-4",
                          isDark ? "text-gray-500" : "text-gray-400"
                        )} />
                        {new Date(document.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className={cn(
                          "w-4 h-4",
                          isDark ? "text-gray-500" : "text-gray-400"
                        )} />
                        {new Date(document.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className={cn(
                    "border transition-colors",
                    isDark ? "border-slate-600/50 text-gray-300 hover:bg-slate-700/40 hover:border-slate-500/50" : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  )}>
                    <Share2 className="w-4 h-4 mr-2" />
                    分享
                  </Button>
                  <Button className={cn(
                    "text-white",
                    isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-700 hover:bg-gray-600"
                  )}>
                    <Download className="w-4 h-4 mr-2" />
                    下载全部
                  </Button>
                </div>
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
                  <div 
                    key={attachment.id || `attachment-${index}`}
                    className={cn(
                      "rounded-2xl border overflow-hidden",
                      isDark ? "bg-slate-800/40 border-slate-700/25" : "bg-white/80 border-gray-200"
                    )}>

                    {/* 文件信息栏 */}
                    <div className={cn(
                      "px-6 py-3 flex items-center justify-between",
                      isDark ? "bg-slate-700/40" : "bg-gray-50"
                    )}>
                      <span className={cn(
                        "text-sm font-medium",
                        isDark ? "text-gray-200" : "text-gray-800"
                      )}>{attachment.originalFilename}</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className={cn(
                          isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        )} onClick={() => handleDownload(attachment.id)}>
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </Button>
                        <Button size="sm" variant="destructive" className="hover:bg-red-600/80" onClick={() => openDeleteDialog(attachment.id)}>
                          删除
                        </Button>
                      </div>
                    </div>

                    {/* 媒体预览 */}
                    {(attachment.fileType?.includes('video') || attachment.fileType?.includes('audio') || 
                      attachment.fileType?.includes('image') || attachment.fileType?.includes('pdf')) && (
                      <AttachmentPreview attachment={attachment} isDark={isDark} />
                    )}

                    {/* 文档内容预览 */}
                    {(!attachment.fileType?.includes('video') && !attachment.fileType?.includes('audio') && !attachment.fileType?.includes('image') && !attachment.fileType?.includes('pdf')) && document.content && index === 0 && (
                      <div className="p-6">
                        <pre className="whitespace-pre-wrap text-gray-200 font-sans leading-relaxed bg-slate-700/30 p-6 rounded-xl max-h-96 overflow-auto">
                          {document.content}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={cn("rounded-2xl border p-12 text-center", isDark ? "bg-slate-800/40 border-slate-700/25" : "bg-gray-50/50 border-gray-200")}>
                  <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4", isDark ? "bg-slate-700/40" : "bg-gray-100")}>
                    <File className={cn("w-8 h-8", isDark ? "text-slate-400" : "text-gray-400")} />
                  </div>
                  <p className={cn(isDark ? "text-slate-400" : "text-gray-400")}>暂无附件</p>
                </div>
              )}
            </div>

            {/* 文档描述 */}
            {document.description && (
              <div className={cn("mt-6 rounded-2xl border p-6", isDark ? "bg-slate-800/40 border-slate-700/25" : "bg-gray-50/50 border-gray-200")}>
                <h2 className={cn("text-lg font-semibold mb-3", isDark ? "text-slate-200" : "text-gray-800")}>文档描述</h2>
                <p className={cn("leading-relaxed", isDark ? "text-slate-300" : "text-gray-600")}>{document.description}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 第三列：AI问答和笔记 */}
      <aside className={cn(
        "w-[480px] flex flex-col backdrop-blur-lg border-l",
        isDark ? "bg-slate-900/70 border-slate-700/30" : "bg-white/80 border-gray-200"
      )}>
        {/* 返回按钮 */}
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/documents')}
            className={cn(
              "w-full justify-start gap-2 transition-all duration-200",
              isDark 
                ? "text-gray-400 hover:text-gray-200 hover:bg-slate-800/40" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            返回文档列表
          </Button>
        </div>
        
        {/* AI智能问答 - 放在顶部，一屏可见 */}
        <div className={cn(
          "border-b",
          isDark ? "border-slate-700/25" : "border-gray-200"
        )}>
          <AIChat documentId={id} isDark={isDark} />
        </div>
        
        {/* 笔记头部 */}
        <div className={cn(
          "px-4 py-3 flex items-center justify-between",
          isDark ? "bg-slate-800/40" : "bg-gray-50"
        )}>
          <div className={cn(
            "flex items-center gap-2 font-semibold",
            isDark ? "text-gray-200" : "text-gray-800"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center",
              isDark ? "bg-slate-700/40" : "bg-blue-50"
            )}>
              <FileText className={cn(
                "w-3.5 h-3.5",
                isDark ? "text-blue-400" : "text-blue-500"
              )} />
            </div>
            我的笔记
          </div>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className={cn(
                "text-sm flex items-center gap-1",
                isDark ? "text-green-400" : "text-green-600"
              )}>
                <CheckCircle className="w-4 h-4" />
                已保存
              </span>
            )}
            <Button 
              size="sm" 
              onClick={saveNote} 
              disabled={noteSaving}
              className={cn(
                "gap-1",
                isDark 
                  ? "bg-slate-700 hover:bg-slate-600 text-white" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              )}
            >
              <Save className="w-4 h-4" />
              {noteSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>

       {/* 笔记编辑器工具栏（柔和风格） */}
        <div className={cn(
          "sticky top-0 z-10",
          isDark ? "bg-slate-800/30" : "bg-gray-50/80"
        )}>
          <div className="px-4 py-2 flex flex-wrap items-center gap-1">
            {/* 撤销/重做 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor || !editor?.can().undo()}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-200",
                isDark 
                  ? "hover:bg-slate-700/40 text-gray-400 hover:text-gray-200" 
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              )}
              title="撤销"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor || !editor?.can().redo()}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-200",
                isDark 
                  ? "hover:bg-slate-700/40 text-gray-400 hover:text-gray-200" 
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              )}
              title="重做"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <div className={cn(
              "w-px h-5 mx-1",
              isDark ? "bg-slate-600/30" : "bg-gray-300"
            )}></div>
            
            {/* 字体选择 */}
            <select
              onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value || null).run()}
              disabled={!editor}
              className={cn(
                "h-8 px-2 text-sm border rounded-lg disabled:opacity-50 cursor-pointer transition-all duration-200",
                isDark 
                  ? "border-slate-600/30 bg-slate-700/50 text-gray-300 hover:border-slate-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30" 
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              )}
            >
              <option value="">默认字体</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Microsoft YaHei">微软雅黑</option>
              <option value="SimSun">宋体</option>
              <option value="KaiTi">楷体</option>
              <option value="PingFang SC">苹方</option>
            </select>
            {/* 字号选择 */}
            <select
              onChange={(e) => editor?.chain().focus().setFontSize(e.target.value || null).run()}
              disabled={!editor}
              className={cn(
                "h-8 px-2 text-sm border rounded-lg disabled:opacity-50 cursor-pointer transition-all duration-200",
                isDark 
                  ? "border-slate-600/30 bg-slate-700/50 text-gray-300 hover:border-slate-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30" 
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              )}
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
            <div className={cn(
              "w-px h-5 mx-1",
              isDark ? "bg-slate-600/30" : "bg-gray-300"
            )}></div>
            
            {/* 文字样式 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-200",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive('bold') ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive('bold') ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="粗体 (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-200",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive('italic') ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive('italic') ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="斜体 (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-200",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive('underline') ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive('underline') ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="下划线 (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-200",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive('strike') ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive('strike') ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="删除线"
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
            <div className={cn(
              "w-px h-5 mx-1",
              isDark ? "bg-slate-600/30" : "bg-gray-300"
            )}></div>
            
            {/* 颜色选择 */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                disabled={!editor}
                className={cn(
                  "h-8 w-8 flex items-center gap-0.5 transition-all duration-150",
                  isDark 
                    ? "hover:bg-slate-700/40 text-gray-400 hover:text-gray-200" 
                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                )}
                title="文字颜色"
              >
                <Type className="w-4 h-4" />
                <Palette className={cn(
                  "w-3 h-3",
                  isDark ? "text-gray-500" : "text-gray-400"
                )} />
              </Button>
              <div className={cn(
                "absolute top-full left-0 mt-1 p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-20",
                isDark ? "bg-slate-800/95 border border-slate-700/30" : "bg-white border border-gray-200 shadow-lg"
              )}>
                {['#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#9ca3af'].map(color => (
                  <Button
                    key={color}
                    variant="ghost"
                    size="icon"
                    onClick={() => editor?.chain().focus().setColor(color).run()}
                    className="h-6 w-6 p-0 rounded border hover:scale-110 transition-all duration-100"
                    style={{ 
                      backgroundColor: color,
                      borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(209, 213, 219, 0.5)'
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                disabled={!editor}
                className={cn(
                  "h-8 w-8 transition-all duration-150",
                  isDark 
                    ? "hover:bg-slate-700/40 text-gray-400 hover:text-gray-200" 
                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                )}
                title="背景高亮"
              >
                <Highlighter className="w-4 h-4" />
              </Button>
              <div className={cn(
                "absolute top-full left-0 mt-1 p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-20",
                isDark ? "bg-slate-800/95 border border-slate-700/30" : "bg-white border border-gray-200 shadow-lg"
              )}>
                {['#fef08a', '#fed7aa', '#bfdbfe', '#bbf7d0', '#fecaca', '#e9d5ff'].map(color => (
                  <Button
                    key={color}
                    variant="ghost"
                    size="icon"
                    onClick={() => editor?.chain().focus().toggleHighlight({ color }).run()}
                    className="h-6 w-6 p-0 rounded border hover:scale-110 transition-all duration-100"
                    style={{ 
                      backgroundColor: color,
                      borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(209, 213, 219, 0.5)'
                    }}
                  />
                ))}
              </div>
            </div>
            <div className={cn(
              "w-px h-5 mx-1",
              isDark ? "bg-slate-600/30" : "bg-gray-300"
            )}></div>
            
            {/* 标题 */}
            <select
              onChange={(e) => {
                const level = parseInt(e.target.value)
                if (level) {
                  editor?.chain().focus().toggleHeading({ level }).run()
                } else {
                  editor?.chain().focus().clearNodes().run()
                }
              }}
              value={editor?.isActive('heading', { level: 1 }) ? '1' : editor?.isActive('heading', { level: 2 }) ? '2' : editor?.isActive('heading', { level: 3 }) ? '3' : ''}
              disabled={!editor}
              className={cn(
                "h-8 px-2 text-sm border rounded-lg disabled:opacity-50 cursor-pointer transition-all duration-150",
                isDark 
                  ? "border-slate-600/30 bg-slate-700/50 text-gray-300 hover:border-slate-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30" 
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              )}
            >
              <option value="">正文</option>
              <option value="1">标题 1</option>
              <option value="2">标题 2</option>
              <option value="3">标题 3</option>
            </select>
            <div className={cn(
              "w-px h-5 mx-1",
              isDark ? "bg-slate-600/30" : "bg-gray-300"
            )}></div>
            
            {/* 列表 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive('bulletList') ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive('bulletList') ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="无序列表"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive('orderedList') ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive('orderedList') ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="有序列表"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().toggleTaskList().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive('taskList') ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive('taskList') ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="任务列表"
            >
              <ListChecks className="w-4 h-4" />
            </Button>
            <div className={cn(
              "w-px h-5 mx-1",
              isDark ? "bg-slate-600/30" : "bg-gray-300"
            )}></div>
            
            {/* 代码块和表格 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive('codeBlock') ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive('codeBlock') ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="代码块"
            >
              <Code className="w-4 h-4" />
            </Button>
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor?.chain().focus().insertTable().run()}
                disabled={!editor}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-150",
                  isDark 
                    ? "hover:bg-slate-700/40 text-gray-400 hover:text-gray-200" 
                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                )}
                title="表格"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <div className={cn(
                "absolute top-full left-0 mt-1 p-1 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-20 min-w-[140px]",
                isDark ? "bg-slate-800/95 border border-slate-700/30" : "bg-white border border-gray-200 shadow-lg"
              )}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().insertTable().run()}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1.5 transition-all duration-100",
                    isDark 
                      ? "hover:bg-slate-700/40 text-gray-300" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  插入表格
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().addColumnBefore().run()}
                  disabled={!editor || !editor?.can().addColumnBefore()}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1.5 transition-all duration-100 disabled:opacity-50",
                    isDark 
                      ? "hover:bg-slate-700/40 text-gray-300" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  在左侧插入列
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().addColumnAfter().run()}
                  disabled={!editor || !editor?.can().addColumnAfter()}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1.5 transition-all duration-100 disabled:opacity-50",
                    isDark 
                      ? "hover:bg-slate-700/40 text-gray-300" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  在右侧插入列
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().addRowBefore().run()}
                  disabled={!editor || !editor?.can().addRowBefore()}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1.5 transition-all duration-100 disabled:opacity-50",
                    isDark 
                      ? "hover:bg-slate-700/40 text-gray-300" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  在上方插入行
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().addRowAfter().run()}
                  disabled={!editor || !editor?.can().addRowAfter()}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1.5 transition-all duration-100 disabled:opacity-50",
                    isDark 
                      ? "hover:bg-slate-700/40 text-gray-300" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  在下方插入行
                </Button>
                <div className={cn(
                  "border-t my-1",
                  isDark ? "border-slate-700/30" : "border-gray-200"
                )}></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().deleteColumn().run()}
                  disabled={!editor || !editor?.can().deleteColumn()}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1.5 transition-all duration-100 disabled:opacity-50",
                    isDark 
                      ? "hover:bg-red-900/30 text-red-400" 
                      : "hover:bg-red-50 text-red-500"
                  )}
                >
                  删除列
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().deleteRow().run()}
                  disabled={!editor || !editor?.can().deleteRow()}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1.5 transition-all duration-100 disabled:opacity-50",
                    isDark 
                      ? "hover:bg-red-900/30 text-red-400" 
                      : "hover:bg-red-50 text-red-500"
                  )}
                >
                  删除行
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().deleteTable().run()}
                  disabled={!editor || !editor?.can().deleteTable()}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1.5 transition-all duration-100 disabled:opacity-50",
                    isDark 
                      ? "hover:bg-red-900/30 text-red-400" 
                      : "hover:bg-red-50 text-red-500"
                  )}
                >
                  删除表格
                </Button>
              </div>
            </div>
            <div className={cn(
              "w-px h-5 mx-1",
              isDark ? "bg-slate-600/30" : "bg-gray-300"
            )}></div>
            
            {/* 引用和分隔线 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive('blockquote') ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive('blockquote') ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="引用"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? "hover:bg-slate-700/40 text-gray-400 hover:text-gray-200" 
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              )}
              title="分隔线"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className={cn(
              "w-px h-5 mx-1",
              isDark ? "bg-slate-600/30" : "bg-gray-300"
            )}></div>
            
            {/* 对齐方式 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="左对齐"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="居中"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? `hover:bg-slate-700/40 text-gray-400 hover:text-gray-200 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-slate-700/50 text-gray-200' : ''}` 
                  : `hover:bg-gray-200 text-gray-500 hover:text-gray-700 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-gray-700' : ''}`
              )}
              title="右对齐"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <div className={cn(
              "w-px h-5 mx-1",
              isDark ? "bg-slate-600/30" : "bg-gray-300"
            )}></div>
            
            {/* 链接 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const url = window.prompt('请输入链接地址：')
                if (url) {
                  editor?.chain().focus().setLink({ href: url }).run()
                }
              }}
              disabled={!editor}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-150",
                isDark 
                  ? "hover:bg-slate-700/40 text-gray-400 hover:text-gray-200" 
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              )}
              title="插入链接 (Ctrl+K)"
            >
              <Link2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

       {/* 笔记编辑器内容区 */}
        <div className={cn(
          "flex-1 overflow-auto",
          isDark ? "bg-slate-800/20" : "bg-white/50"
        )}>
          <div className={cn(
            "min-h-[400px] border rounded-xl m-3",
            isDark ? "bg-slate-700/20 border-slate-700/20" : "bg-white border-gray-200"
          )}>
            <div className="prose prose-sm max-w-none p-4 focus:outline-none">
              <EditorContent 
                editor={editor} 
                className="min-h-[400px] focus:outline-none"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: '2',
                  fontSize: '15px',
                  color: isDark ? '#e2e8f0' : '#374151',
                  caretColor: isDark ? '#60a5fa' : '#3b82f6',
                }}
              />
            </div>
          </div>
          {/* 状态栏 */}
          <div className={cn(
            "px-4 py-2 flex items-center justify-between text-xs",
            isDark ? "bg-slate-800/40 text-gray-500" : "bg-gray-50 text-gray-500"
          )}>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                字数: {editor?.storage.characterCount?.characters() || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <List className="w-3.5 h-3.5" />
                段落: {editor?.state?.doc?.childCount || 0}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn(
                "flex items-center gap-1.5",
                isDark ? "text-green-500" : "text-green-600"
              )}>
                <CheckCircle className="w-3.5 h-3.5" />
                自动保存
              </span>
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                Markdown
              </span>
            </div>
          </div>
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