import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Users, Settings, Shield, Check, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import axios from 'axios'
import { ConfirmDialog } from '../components/ConfirmDialog'

const MENU_ITEMS = [
  { id: 'documents', label: '文档管理' },
  { id: 'categories', label: '分类管理' },
  { id: 'tags', label: '标签管理' },
  { id: 'system-config', label: '系统配置' },
  { id: 'ai-config', label: 'AI配置' },
  { id: 'roles', label: '角色管理' },
  { id: 'users', label: '用户管理' },
  { id: 'logs', label: '系统日志' },
]

export default function Roles() {
  const { isDark } = useTheme()
  const { refreshUser } = useAuth()
  const [roles, setRoles] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState({ menus: [], edit: false, delete: false })
  const [deleteRoleId, setDeleteRoleId] = useState(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles')
      setRoles(response.data)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  const handleAdd = async () => {
    try {
      await axios.post('/api/roles', { name, description, permissions })
      setShowAddModal(false)
      setName('')
      setDescription('')
      setPermissions({ menus: [], edit: false, delete: false })
      fetchRoles()
    } catch (error) {
      console.error('Failed to create role:', error)
    }
  }

  const handleEdit = async () => {
    if (!selectedRole) return
    try {
      await axios.put(`/api/roles/${selectedRole.id}`, { name, description, permissions })
      setShowEditModal(false)
      setSelectedRole(null)
      setName('')
      setDescription('')
      setPermissions({ menus: [], edit: false, delete: false })
      fetchRoles()
      await refreshUser()
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteRoleId) return
    try {
      await axios.delete(`/api/roles/${deleteRoleId}`)
      setShowDeleteDialog(false)
      setDeleteRoleId(null)
      fetchRoles()
    } catch (error) {
      console.error('Failed to delete role:', error)
    }
  }

  const openEditModal = (role) => {
    setSelectedRole(role)
    setName(role.name)
    setDescription(role.description || '')
    setPermissions(role.permissions)
    setShowEditModal(true)
  }

  const toggleMenuPermission = (menuId) => {
    setPermissions(prev => ({
      ...prev,
      menus: prev.menus.includes(menuId)
        ? prev.menus.filter(m => m !== menuId)
        : [...prev.menus, menuId]
    }))
  }

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className={cn("w-8 h-8", isDark ? "text-cyan-400" : "text-blue-600")} />
          <h1 className={cn("text-3xl font-bold",
            isDark ? "text-white" : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent")}>
            角色管理
          </h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className={cn(
          "shadow-lg rounded-xl",
          isDark ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" : "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"
        )}>
          <Plus className="w-4 h-4 mr-2" />
          添加角色
        </Button>
      </div>

      <div className="grid gap-4">
        {roles.map(role => (
          <Card key={role.id} className={cn(
            "transition-all duration-300 hover:shadow-xl",
            isDark ? "bg-slate-800/80 border-slate-700/50" : "bg-white"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {role.name}
                    </h3>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      role.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {role.isActive ? '启用' : '禁用'}
                    </span>
                  </div>
                  {role.description && (
                    <p className={cn("text-sm mb-4", isDark ? "text-slate-400" : "text-gray-500")}>
                      {role.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Users className={cn("w-4 h-4", isDark ? "text-cyan-400" : "text-blue-500")} />
                      <span className={cn("text-sm", isDark ? "text-slate-300" : "text-gray-600")}>
                        {role.users?.length || 0} 个用户
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className={cn("w-4 h-4", isDark ? "text-cyan-400" : "text-blue-500")} />
                      <span className={cn("text-sm", isDark ? "text-slate-300" : "text-gray-600")}>
                        菜单权限: {role.permissions.menus.length} 项
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit2 className={cn("w-4 h-4", role.permissions.edit ? "text-green-500" : "text-gray-400")} />
                      <span className={cn("text-sm", role.permissions.edit ? "text-green-600" : "text-gray-400")}>
                        {role.permissions.edit ? '可编辑' : '不可编辑'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trash2 className={cn("w-4 h-4", role.permissions.delete ? "text-red-500" : "text-gray-400")} />
                      <span className={cn("text-sm", role.permissions.delete ? "text-red-600" : "text-gray-400")}>
                        {role.permissions.delete ? '可删除' : '不可删除'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditModal(role)}
                    className={cn(isDark ? "border-slate-600/50 text-white hover:bg-slate-700/30" : "")}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={cn("text-red-500 hover:text-red-400", isDark ? "border-red-500/30 hover:bg-red-500/10" : "")}
                    onClick={() => { setDeleteRoleId(role.id); setShowDeleteDialog(true); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className={cn("w-full max-w-lg", isDark ? "bg-slate-800/95 border-slate-700/50" : "bg-white")}>
            <CardHeader className={cn(isDark ? "border-b border-slate-700/40" : "border-b border-gray-200")}>
              <CardTitle className={cn("text-lg", isDark ? "text-white" : "text-gray-900")}>添加角色</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>角色名称</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入角色名称"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>角色描述</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请输入角色描述"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-3">
                <Label className={cn("text-base font-semibold", isDark ? "text-slate-200" : "text-gray-800")}>
                  权限配置
                </Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className={isDark ? "text-slate-300" : "text-gray-600"}>菜单权限</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {MENU_ITEMS.map(menu => (
                        <label 
                          key={menu.id}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                            permissions.menus.includes(menu.id)
                              ? isDark 
                                ? "bg-cyan-500/20 border border-cyan-500/50" 
                                : "bg-blue-50 border border-blue-200"
                              : isDark
                                ? "bg-slate-700/50 hover:bg-slate-600/50"
                                : "bg-gray-50 hover:bg-gray-100"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={permissions.menus.includes(menu.id)}
                            onChange={() => toggleMenuPermission(menu.id)}
                            className={cn(
                              "w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500",
                              isDark ? "bg-slate-600 border-slate-500" : ""
                            )}
                          />
                          <span className={cn(isDark ? "text-slate-200" : "text-gray-700")}>
                            {menu.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label 
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors flex-1",
                        permissions.edit
                          ? isDark 
                            ? "bg-green-500/20 border border-green-500/50" 
                            : "bg-green-50 border border-green-200"
                          : isDark
                            ? "bg-slate-700/50 hover:bg-slate-600/50"
                            : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={permissions.edit}
                        onChange={() => togglePermission('edit')}
                        className={cn(
                          "w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-green-500",
                          isDark ? "bg-slate-600 border-slate-500" : ""
                        )}
                      />
                      <span className={cn(isDark ? "text-slate-200" : "text-gray-700")}>编辑权限</span>
                    </label>
                    <label 
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors flex-1",
                        permissions.delete
                          ? isDark 
                            ? "bg-red-500/20 border border-red-500/50" 
                            : "bg-red-50 border border-red-200"
                          : isDark
                            ? "bg-slate-700/50 hover:bg-slate-600/50"
                            : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={permissions.delete}
                        onChange={() => togglePermission('delete')}
                        className={cn(
                          "w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-red-500",
                          isDark ? "bg-slate-600 border-slate-500" : ""
                        )}
                      />
                      <span className={cn(isDark ? "text-slate-200" : "text-gray-700")}>删除权限</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className={cn("flex-1", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "")}
                  onClick={() => {
                    setShowAddModal(false)
                    setName('')
                    setDescription('')
                    setPermissions({ menus: [], edit: false, delete: false })
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

      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className={cn("w-full max-w-lg", isDark ? "bg-slate-800/95 border-slate-700/50" : "bg-white")}>
            <CardHeader className={cn(isDark ? "border-b border-slate-700/40" : "border-b border-gray-200")}>
              <CardTitle className={cn("text-lg", isDark ? "text-white" : "text-gray-900")}>编辑角色</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>角色名称</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入角色名称"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>角色描述</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请输入角色描述"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-3">
                <Label className={cn("text-base font-semibold", isDark ? "text-slate-200" : "text-gray-800")}>
                  权限配置
                </Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className={isDark ? "text-slate-300" : "text-gray-600"}>菜单权限</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {MENU_ITEMS.map(menu => (
                        <label 
                          key={menu.id}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                            permissions.menus.includes(menu.id)
                              ? isDark 
                                ? "bg-cyan-500/20 border border-cyan-500/50" 
                                : "bg-blue-50 border border-blue-200"
                              : isDark
                                ? "bg-slate-700/50 hover:bg-slate-600/50"
                                : "bg-gray-50 hover:bg-gray-100"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={permissions.menus.includes(menu.id)}
                            onChange={() => toggleMenuPermission(menu.id)}
                            className={cn(
                              "w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500",
                              isDark ? "bg-slate-600 border-slate-500" : ""
                            )}
                          />
                          <span className={cn(isDark ? "text-slate-200" : "text-gray-700")}>
                            {menu.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label 
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors flex-1",
                        permissions.edit
                          ? isDark 
                            ? "bg-green-500/20 border border-green-500/50" 
                            : "bg-green-50 border border-green-200"
                          : isDark
                            ? "bg-slate-700/50 hover:bg-slate-600/50"
                            : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={permissions.edit}
                        onChange={() => togglePermission('edit')}
                        className={cn(
                          "w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-green-500",
                          isDark ? "bg-slate-600 border-slate-500" : ""
                        )}
                      />
                      <span className={cn(isDark ? "text-slate-200" : "text-gray-700")}>编辑权限</span>
                    </label>
                    <label 
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors flex-1",
                        permissions.delete
                          ? isDark 
                            ? "bg-red-500/20 border border-red-500/50" 
                            : "bg-red-50 border border-red-200"
                          : isDark
                            ? "bg-slate-700/50 hover:bg-slate-600/50"
                            : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={permissions.delete}
                        onChange={() => togglePermission('delete')}
                        className={cn(
                          "w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-red-500",
                          isDark ? "bg-slate-600 border-slate-500" : ""
                        )}
                      />
                      <span className={cn(isDark ? "text-slate-200" : "text-gray-700")}>删除权限</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className={cn("flex-1", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "")}
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedRole(null)
                    setName('')
                    setDescription('')
                    setPermissions({ menus: [], edit: false, delete: false })
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleEdit} className="flex-1">
                  <Edit2 className="w-4 h-4 mr-2" />
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="确认删除"
        message="确定要删除这个角色吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        danger
      />
    </div>
  )
}
