import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Tag, Plus, Edit2, Trash2, Tags as TagsIcon, X, GripVertical } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import { cardClass, textClass, inputClass } from '../lib/themeStyles'

const COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#ef4444', '#64748b', '#0ea5e9'
]

import { Dialog } from '../components/ui/Dialog'

export default function Tags() {
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
  const [tags, setTags] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [tagToDelete, setTagToDelete] = useState(null)
  const [editTag, setEditTag] = useState(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [draggedTag, setDraggedTag] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const dragCounter = useRef(0)

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    try {
      const response = await axios.get('/api/tags')
      setTags(response.data)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  async function handleAdd() {
    try {
      await axios.post('/api/tags', { name, color })
      setShowAddModal(false)
      setName('')
      setColor('#6366f1')
      fetchTags()
    } catch (error) {
      console.error('Add tag failed:', error)
    }
  }

  async function handleEdit(id) {
    try {
      await axios.put(`/api/tags/${id}`, { name: editTag.name, color: editTag.color })
      setEditTag(null)
      fetchTags()
    } catch (error) {
      console.error('Edit tag failed:', error)
    }
  }

  const handleDeleteClick = (id) => {
    setTagToDelete(id)
    setShowConfirmDialog(true)
  }

  async function handleDelete() {
    if (tagToDelete) {
      try {
        await axios.delete(`/api/tags/${tagToDelete}`)
        fetchTags()
      } catch (error) {
        console.error('Delete tag failed:', error)
      }
    }
  }

  const handleDragStart = (e, tag, index) => {
    setDraggedTag({ tag, index })
    e.dataTransfer.effectAllowed = 'move'
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedTag(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedTag && draggedTag.index !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    if (draggedTag && draggedTag.index !== targetIndex) {
      const newTags = [...tags]
      const [removed] = newTags.splice(draggedTag.index, 1)
      newTags.splice(targetIndex, 0, removed)
      setTags(newTags)
      saveTagOrder(newTags)
    }
    setDragOverIndex(null)
  }

  async function saveTagOrder(sortedTags) {
    try {
      const orderData = sortedTags.map((tag, index) => ({ id: parseInt(tag.id), order: index + 1 }))
      await axios.put('/api/tags/order', { order: orderData })
    } catch (error) {
      console.error('Failed to save tag order:', error)
    }
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
          <h1 className={cn("text-3xl font-bold bg-clip-text text-transparent",
            isDark && isSpecialTheme 
              ? cn("bg-gradient-to-r", `from-${gradientColors.accent}-400`, `via-${gradientColors.accent}-300`, `to-${gradientColors.accent}-400`)
              : "bg-gradient-to-r from-blue-600 to-indigo-600")}>
            标签管理
          </h1>
          <p className={cn("mt-1", textClass('muted', isDark))}>管理文档标签</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className={cn("shadow-lg",
          isDark && isSpecialTheme 
            ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `shadow-${gradientColors.accent}-500/30`)
            : "bg-blue-600 hover:bg-blue-700")}>
          <Plus className="w-5 h-5 mr-2" />
          添加标签
        </Button>
      </div>

      <Card className={cn(cardClass(isDark), isSpecialTheme ? cn("bg-gradient-to-br", cardColors.bgFrom, cardColors.bgTo, cardColors.border, cardColors.shadow) : "shadow-lg")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClass('primary', isDark))}>
            <TagsIcon className={cn("w-5 h-5", isDark ? isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-blue-400" : "text-blue-500")} />
            标签列表
          </CardTitle>
          <CardDescription className={textClass('muted', isDark)}>
            创建和管理您的文档标签
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <div className="text-center py-12">
              <Tag className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-slate-600" : "text-gray-300")} />
              <p className={textClass('muted', isDark)}>暂无标签，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 min-h-[60px]">
              {tags.map((tag, index) => (
                <Card
                  key={tag.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tag, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={cn(
                    "hover:shadow-md transition-all border-2 cursor-move",
                    cardClass(isDark),
                    isDark ? 'hover:border-blue-500/50' : 'hover:border-blue-300',
                    dragOverIndex === index ? 'ring-2 ring-blue-500 ring-opacity-50 scale-105' : ''
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className={cn("w-4 h-4 cursor-grab flex-shrink-0", isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600")} />
                      <div
                        className="w-4 h-4 rounded-full shadow-inner"
                        style={{ backgroundColor: tag.color || '#6366f1' }}
                      />
                      <Badge
                        variant="outline"
                        className="gap-2 px-4 py-2"
                        style={{ borderColor: tag.color || '#6366f1', color: tag.color || '#6366f1' }}
                      >
                        <Tag className="w-4 h-4" />
                        {editTag?.id === tag.id ? (
                          <>
                            <Input
                                type="text"
                                value={editTag.name}
                                onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
                                onBlur={() => handleEdit(tag.id)}
                                className={cn("w-20 h-8 px-2", inputClass(isDark))}
                                autoFocus
                              />
                            <div className="flex gap-1 ml-1">
                              {COLOR_OPTIONS.slice(0, 6).map(c => (
                                <button
                                  key={c}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditTag({ ...editTag, color: c })
                                  }}
                                  className={`w-4 h-4 rounded-full border-2 ${editTag.color === c ? 'border-gray-800' : 'border-gray-300'}`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                              <input
                                type="color"
                                value={editTag.color}
                                onChange={(e) => {
                                  setEditTag({ ...editTag, color: e.target.value })
                                }}
                                className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                              />
                            </div>
                          </>
                        ) : (
                          <span className="font-medium">{tag.name}</span>
                        )}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {editTag?.id === tag.id ? (
                          <Button size="sm" onClick={() => handleEdit(tag.id)}>
                            保存
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              "border-slate-500/50 hover:bg-slate-700/40",
                              isDark ? "text-slate-300 hover:text-slate-100" : "text-gray-600 hover:text-gray-900"
                            )}
                            onClick={() => setEditTag({ id: tag.id, name: tag.name, color: tag.color })}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(tag.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="确认删除"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDelete}
        danger
      >
        确定要删除这个标签吗？此操作无法撤销。
      </Dialog>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className={cn(cardClass(isDark), "w-full max-w-md shadow-2xl")}>
            <CardHeader>
              <CardTitle className={cn("flex items-center justify-between", textClass('primary', isDark))}>
                <span>添加标签</span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowAddModal(false)
                      setName('')
                      setColor('#6366f1')
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
              </CardTitle>
              <CardDescription className={textClass('muted', isDark)}>创建新的文档标签</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={textClass('secondary', isDark)} htmlFor="name">标签名称</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入标签名称"
                  className={inputClass(isDark)}
                />
              </div>
              <div className="space-y-2">
                <Label className={textClass('secondary', isDark)}>标签颜色</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className={textClass('secondary', isDark)}>自定义颜色</Label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className={cn("flex-1", isDark && "border-slate-600/50 hover:bg-slate-700/30")}
                  onClick={() => {
                    setShowAddModal(false)
                    setName('')
                    setColor('#6366f1')
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