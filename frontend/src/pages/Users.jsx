import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, UsersIcon, Mail, User, Calendar, Shield } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import axios from 'axios'
import { ConfirmDialog } from '../components/ConfirmDialog'

export default function UsersPage() {
  const { isDark } = useTheme()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [deleteUserId, setDeleteUserId] = useState(null)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/auth/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

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
      await axios.post('/api/auth/users', { username, email, password, roleId: roleId ? Number(roleId) : null })
      setShowAddModal(false)
      setUsername('')
      setEmail('')
      setPassword('')
      setRoleId('')
      fetchUsers()
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return
    try {
      await axios.put(`/api/auth/users/${selectedUser.id}/role`, { roleId: roleId ? Number(roleId) : null })
      setShowEditRoleModal(false)
      setSelectedUser(null)
      setRoleId('')
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteUserId) return
    try {
      await axios.delete(`/api/auth/users/${deleteUserId}`)
      setShowDeleteDialog(false)
      setDeleteUserId(null)
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const openEditRoleModal = (user) => {
    setSelectedUser(user)
    setRoleId(user.roleId?.toString() || '')
    setShowEditRoleModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UsersIcon className={cn("w-8 h-8", isDark ? "text-cyan-400" : "text-blue-600")} />
          <h1 className={cn("text-3xl font-bold",
            isDark ? "text-white" : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent")}>
            用户管理
          </h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className={cn(
          "shadow-lg rounded-xl",
          isDark ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" : "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"
        )}>
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map(user => (
          <Card key={user.id} className={cn(
            "transition-all duration-300 hover:shadow-xl",
            isDark ? "bg-slate-800/80 border-slate-700/50" : "bg-white"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isDark ? "bg-cyan-500/20" : "bg-blue-100"
                    )}>
                      <User className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-blue-600")} />
                    </div>
                    <div>
                      <h3 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                        {user.username}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Mail className={cn("w-3 h-3", isDark ? "text-slate-400" : "text-gray-400")} />
                        <span className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Shield className={cn("w-4 h-4", isDark ? "text-cyan-400" : "text-blue-500")} />
                      <span className={cn("text-sm", isDark ? "text-slate-300" : "text-gray-600")}>
                        角色: {user.role?.name || '未分配'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className={cn("w-4 h-4", isDark ? "text-cyan-400" : "text-blue-500")} />
                      <span className={cn("text-sm", isDark ? "text-slate-300" : "text-gray-600")}>
                        创建时间: {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditRoleModal(user)}
                    className={cn(isDark ? "border-slate-600/50 text-white hover:bg-slate-700/30" : "")}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={cn("text-red-500 hover:text-red-400", isDark ? "border-red-500/30 hover:bg-red-500/10" : "")}
                    onClick={() => { setDeleteUserId(user.id); setShowDeleteDialog(true); }}
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
          <Card className={cn("w-full max-w-md", isDark ? "bg-slate-800/95 border-slate-700/50" : "bg-white")}>
            <CardHeader className={cn(isDark ? "border-b border-slate-700/40" : "border-b border-gray-200")}>
              <CardTitle className={cn("text-lg", isDark ? "text-white" : "text-gray-900")}>添加用户</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>用户名</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>邮箱</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>密码</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>角色</Label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border",
                    isDark ? "bg-slate-700/50 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">未分配</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className={cn("flex-1", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "")}
                  onClick={() => {
                    setShowAddModal(false)
                    setUsername('')
                    setEmail('')
                    setPassword('')
                    setRoleId('')
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

      {showEditRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className={cn("w-full max-w-md", isDark ? "bg-slate-800/95 border-slate-700/50" : "bg-white")}>
            <CardHeader className={cn(isDark ? "border-b border-slate-700/40" : "border-b border-gray-200")}>
              <CardTitle className={cn("text-lg", isDark ? "text-white" : "text-gray-900")}>
                编辑用户角色 - {selectedUser.username}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>选择角色</Label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border",
                    isDark ? "bg-slate-700/50 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">未分配</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className={cn("flex-1", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "")}
                  onClick={() => {
                    setShowEditRoleModal(false)
                    setSelectedUser(null)
                    setRoleId('')
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleUpdateRole} className="flex-1">
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
        message="确定要删除这个用户吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        danger
      />
    </div>
  )
}
