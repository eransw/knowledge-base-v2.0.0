import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, UsersIcon, Mail, User, Calendar, Shield, UserCog, RotateCcw, Lock, Unlock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import axios from '../api/axios'
import { ConfirmDialog } from '../components/ConfirmDialog'

export default function UsersPage() {
  const { isDark } = useTheme()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editConfirmPassword, setEditConfirmPassword] = useState('')
  const [editCurrentPassword, setEditCurrentPassword] = useState('')
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [resetPasswordUserId, setResetPasswordUserId] = useState(null)
  const [resetPasswordUsername, setResetPasswordUsername] = useState('')
  const [showLockDialog, setShowLockDialog] = useState(false)
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUsername, setCurrentUsername] = useState('')
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

  const handleUpdateUserInfo = async () => {
    if (!selectedUser) return
    
    // 验证新密码
    if (editPassword && editPassword !== editConfirmPassword) {
      alert('两次输入的新密码不一致')
      return
    }
    
    try {
      const updateData = {}
      if (editEmail) updateData.email = editEmail
      if (editPassword) {
        if (!editCurrentPassword) {
          alert('请输入原密码')
          return
        }
        updateData.password = editPassword
        updateData.currentPassword = editCurrentPassword
      }
      
      const response = await axios.put(`/api/auth/users/${selectedUser.id}`, updateData)
      
      if (response.data.error) {
        alert(response.data.error)
        return
      }
      
      setShowEditUserModal(false)
      setSelectedUser(null)
      setEditEmail('')
      setEditPassword('')
      setEditConfirmPassword('')
      setEditCurrentPassword('')
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user:', error)
      alert(error.response?.data?.error || '更新失败')
    }
  }

  const openResetPasswordDialog = (user) => {
    setResetPasswordUserId(user.id)
    setResetPasswordUsername(user.username)
    setShowResetPasswordDialog(true)
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUserId) return
    try {
      await axios.post(`/api/auth/users/${resetPasswordUserId}/reset-password`)
      setShowResetPasswordDialog(false)
      setResetPasswordUserId(null)
      setResetPasswordUsername('')
      fetchUsers()
      alert('密码已重置为 123456')
    } catch (error) {
      console.error('Failed to reset password:', error)
      alert(error.response?.data?.error || '重置密码失败')
    }
  }

  const openLockDialog = (user) => {
    setCurrentUserId(user.id)
    setCurrentUsername(user.username)
    setShowLockDialog(true)
  }

  const handleLockUser = async () => {
    if (!currentUserId) return
    try {
      await axios.post(`/api/auth/users/${currentUserId}/lock`)
      fetchUsers()
      setShowLockDialog(false)
      setCurrentUserId(null)
      setCurrentUsername('')
    } catch (error) {
      console.error('Failed to lock user:', error)
      alert(error.response?.data?.error || '锁定用户失败')
    }
  }

  const openUnlockDialog = (user) => {
    setCurrentUserId(user.id)
    setCurrentUsername(user.username)
    setShowUnlockDialog(true)
  }

  const handleUnlockUser = async () => {
    if (!currentUserId) return
    try {
      await axios.post(`/api/auth/users/${currentUserId}/unlock`)
      fetchUsers()
      setShowUnlockDialog(false)
      setCurrentUserId(null)
      setCurrentUsername('')
    } catch (error) {
      console.error('Failed to unlock user:', error)
      alert(error.response?.data?.error || '解锁用户失败')
    }
  }

  const openEditUserModal = (user) => {
    console.log('Opening edit modal for user:', user)
    setSelectedUser(user)
    setEditEmail(user.email)
    setEditPassword('')
    setEditConfirmPassword('')
    setEditCurrentPassword('')
    setShowEditUserModal(true)
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
                  <div className={cn(
                      "flex items-center gap-3 mb-2 cursor-pointer",
                      "hover:opacity-80 transition-opacity"
                    )} onClick={() => openEditUserModal(user)}>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isDark ? "bg-cyan-500/20" : "bg-blue-100"
                    )}>
                      <User className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-blue-600")} />
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-xl font-semibold",
                        isDark ? "text-white" : "text-gray-900",
                        "underline underline-offset-4 decoration-transparent hover:decoration-current"
                      )}>
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
                    onClick={() => openEditUserModal(user)}
                    className={cn(isDark ? "border-slate-600/50 text-white hover:bg-slate-700/30" : "")}
                    title="编辑用户信息"
                  >
                    <UserCog className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditRoleModal(user)}
                    className={cn(isDark ? "border-slate-600/50 text-white hover:bg-slate-700/30" : "")}
                    title="编辑角色"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={cn("text-amber-500 hover:text-amber-400", isDark ? "border-amber-500/30 hover:bg-amber-500/10" : "")}
                    onClick={() => openResetPasswordDialog(user)}
                    title="重置密码"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  {user.isLocked ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("text-green-500 hover:text-green-400", isDark ? "border-green-500/30 hover:bg-green-500/10" : "")}
                      onClick={() => openUnlockDialog(user)}
                      title="解锁用户"
                    >
                      <Unlock className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("text-red-500 hover:text-red-400", isDark ? "border-red-500/30 hover:bg-red-500/10" : "")}
                      onClick={() => openLockDialog(user)}
                      title="锁定用户"
                    >
                      <Lock className="w-4 h-4" />
                    </Button>
                  )}
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

      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className={cn("w-full max-w-md", isDark ? "bg-slate-800/95 border-slate-700/50" : "bg-white")}>
            <CardHeader className={cn(isDark ? "border-b border-slate-700/40" : "border-b border-gray-200")}>
              <CardTitle className={cn("text-lg", isDark ? "text-white" : "text-gray-900")}>
                编辑用户信息 - {selectedUser.username}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>邮箱</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>原密码（修改密码时需要）</Label>
                <Input
                  type="password"
                  value={editCurrentPassword}
                  onChange={(e) => setEditCurrentPassword(e.target.value)}
                  placeholder="请输入原密码"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>新密码（留空则不修改）</Label>
                <Input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="请输入新密码"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : "text-gray-700"}>确认新密码</Label>
                <Input
                  type="password"
                  value={editConfirmPassword}
                  onChange={(e) => setEditConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  className={cn(isDark ? "bg-slate-700/50 border-slate-600 text-white" : "")}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className={cn("flex-1", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "")}
                  onClick={() => {
                    setShowEditUserModal(false)
                    setSelectedUser(null)
                    setEditEmail('')
                    setEditPassword('')
                    setEditConfirmPassword('')
                    setEditCurrentPassword('')
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleUpdateUserInfo} className="flex-1">
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

      <ConfirmDialog
        isOpen={showResetPasswordDialog}
        onClose={() => setShowResetPasswordDialog(false)}
        onConfirm={handleResetPassword}
        title="确认重置密码"
        message={`确定要将用户 "${resetPasswordUsername}" 的密码重置为 "123456" 吗？用户登录后应立即修改密码。`}
        confirmText="重置"
        cancelText="取消"
        danger
      />

      <ConfirmDialog
        isOpen={showLockDialog}
        onClose={() => setShowLockDialog(false)}
        onConfirm={handleLockUser}
        title="确认锁定用户"
        message={`确定要锁定用户 "${currentUsername}" 吗？锁定后该用户将无法登录系统。`}
        confirmText="锁定"
        cancelText="取消"
        danger
      />

      <ConfirmDialog
        isOpen={showUnlockDialog}
        onClose={() => setShowUnlockDialog(false)}
        onConfirm={handleUnlockUser}
        title="确认解锁用户"
        message={`确定要解锁用户 "${currentUsername}" 吗？解锁后该用户将可以正常登录系统。`}
        confirmText="解锁"
        cancelText="取消"
      />
    </div>
  )
}
