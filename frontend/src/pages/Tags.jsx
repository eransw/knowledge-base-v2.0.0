import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Tag, Plus, Edit2, Trash2, Tags as TagsIcon, X, GripVertical } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

// 预设颜色选项
const COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#ef4444', '#64748b', '#0ea5e9'
]

import { Dialog } from '../components/ui/Dialog'

export default function Tags() {
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
      console.log('Saving tag order:', orderData)
      await axios.put('/api/tags/order', { order: orderData })
    } catch (error) {
      console.error('Failed to save tag order:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            标签管理
          </h1>
          <p className="text-gray-500 mt-1">管理文档标签</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="shadow-lg">
          <Plus className="w-5 h-5 mr-2" />
          添加标签
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TagsIcon className="w-5 h-5" />
            标签列表
          </CardTitle>
          <CardDescription>
            创建和管理您的文档标签
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无标签，点击上方按钮添加</p>
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
                  className={`hover:shadow-md transition-all border-2 hover:border-blue-300 cursor-move ${dragOverIndex === index ? 'ring-2 ring-blue-500 ring-opacity-50 scale-105' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab hover:text-gray-600 flex-shrink-0" />
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
                                className="w-20 h-8 px-2"
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
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
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
              <CardDescription>创建新的文档标签</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">标签名称</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入标签名称"
                />
              </div>
              <div className="space-y-2">
                <Label>标签颜色</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-800 scale-110' : 'border-gray-300'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="w-24">自定义颜色</Label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        const val = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                          setColor(val)
                        }
                      }}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
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