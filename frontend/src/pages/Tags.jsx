import { useState, useEffect } from 'react'
import axios from 'axios'
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react'

export default function Tags() {
  const [tags, setTags] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTag, setEditTag] = useState(null)
  const [name, setName] = useState('')

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
      await axios.post('/api/tags', { name })
      setShowAddModal(false)
      setName('')
      fetchTags()
    } catch (error) {
      console.error('Add tag failed:', error)
    }
  }

  async function handleEdit(id) {
    try {
      await axios.put(`/api/tags/${id}`, { name: editTag.name })
      setEditTag(null)
      fetchTags()
    } catch (error) {
      console.error('Edit tag failed:', error)
    }
  }

  async function handleDelete(id) {
    if (confirm('确定要删除这个标签吗？')) {
      try {
        await axios.delete(`/api/tags/${id}`)
        fetchTags()
      } catch (error) {
        console.error('Delete tag failed:', error)
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">标签管理</h1>
          <p className="text-gray-500 mt-1">管理文档标签</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加标签
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-800">标签列表</h2>
        </div>
        <div className="p-4">
          {tags.length === 0 ? (
            <div className="text-center text-gray-500 py-8">暂无标签，点击上方按钮添加</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg group"
                >
                  <Tag className="w-4 h-4" />
                  {editTag?.id === tag.id ? (
                    <input
                      type="text"
                      value={editTag.name}
                      onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
                      className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span>{tag.name}</span>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editTag?.id === tag.id ? (
                      <button
                        onClick={() => handleEdit(tag.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditTag({ id: tag.id, name: tag.name })}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">添加标签</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入标签名称"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAddModal(false); setName(''); }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
