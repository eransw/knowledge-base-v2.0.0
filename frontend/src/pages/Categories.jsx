import { useState, useEffect } from 'react'
import axios from 'axios'
import { FolderOpen, Plus, Edit2, Trash2, ChevronRight } from 'lucide-react'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const response = await axios.get('/api/categories/tree')
      setCategories(response.data)
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
    if (confirm('确定要删除这个分类吗？')) {
      try {
        await axios.delete(`/api/categories/${id}`)
        fetchCategories()
      } catch (error) {
        console.error('Delete category failed:', error)
      }
    }
  }

  const renderTree = (items, level = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg group">
          <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center gap-2 flex-1">
            {item.children && item.children.length > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <FolderOpen className="w-5 h-5 text-blue-600" />
            {editCategory?.id === item.id ? (
              <input
                type="text"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <span className="flex-1">{item.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {editCategory?.id === item.id ? (
              <button
                onClick={() => handleEdit(item.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setEditCategory({ id: item.id, name: item.name })}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {item.children && item.children.length > 0 && renderTree(item.children, level + 1)}
      </div>
    ))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">分类管理</h1>
          <p className="text-gray-500 mt-1">管理文档分类结构</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加分类
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-800">分类结构</h2>
        </div>
        <div className="p-4">
          {categories.length === 0 ? (
            <div className="text-center text-gray-500 py-8">暂无分类，点击上方按钮添加</div>
          ) : (
            renderTree(categories)
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">添加分类</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入分类名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">上级分类（可选）</label>
                <select
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value ? +e.target.value : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">无上级分类</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAddModal(false); setName(''); setParentId(null); }}
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
