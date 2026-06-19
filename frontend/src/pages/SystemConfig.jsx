import { useState, useEffect, useMemo } from 'react'
import { Settings, Save, RotateCcw, CheckCircle, Palette, GripVertical, ArrowUp, ArrowDown, RefreshCw, Shield, Users, User } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useConfig } from '../context/ConfigContext'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import { cardClass, textClass, inputClass } from '../lib/themeStyles'
import { useAuth } from '../context/AuthContext'
import axios from '../api/axios'

export default function SystemConfig() {
  const { config, saveConfig } = useConfig()
  const { currentTheme, switchTheme, themes, isDark } = useTheme()
  const { user, refreshUser } = useAuth()
  const isPolice = currentTheme === 'police'
  const isNight = currentTheme === 'night'
  const isCyber = currentTheme === 'cyber'
  const isPurple = currentTheme === 'purple'
  const isGreen = currentTheme === 'green'
  const isOrange = currentTheme === 'orange'
  const isPink = currentTheme === 'pink'
  const isSpecialTheme = isPolice || isNight || isCyber || isPurple || isGreen || isOrange || isPink

  const allMenuItems = useMemo(() => [
    { id: 'documents', label: '文档管理' },
    { id: 'categories', label: '分类管理' },
    { id: 'tags', label: '标签管理' },
    { id: 'ai-config', label: 'AI模型配置' },
    { id: 'roles', label: '角色管理' },
    { id: 'users', label: '用户管理' },
    { id: 'logs', label: '系统日志' },
    { id: 'system-config', label: '系统配置' },
    { id: 'search-settings', label: '检索配置' },
  ], [])

  // 获取用户有权限访问的菜单
  const menuItems = useMemo(() => {
    console.log('SystemConfig - user:', user);
    console.log('SystemConfig - user?.role:', user?.role);
    if (!user?.role) return allMenuItems
    
    let permissions = user.role.permissions
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions)
      } catch (e) {
        return allMenuItems
      }
    }
    
    const userMenus = permissions?.menus
    if (!userMenus || !Array.isArray(userMenus)) return allMenuItems
    
    return allMenuItems.filter(item => userMenus.includes(item.id))
  }, [user, allMenuItems])

  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [menuOrder, setMenuOrder] = useState([])
  const [menuSaved, setMenuSaved] = useState(false)

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
    if (isPolice) return { bgFrom: 'from-[#1a2f50]/95', bgTo: 'to-[#0f1f3d]/90', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/20', text: 'text-cyan-300', btnFrom: 'from-cyan-600', btnVia: 'via-blue-600', btnTo: 'to-cyan-500', success: 'cyan' }
    if (isNight) return { bgFrom: 'from-[#1a1333]/95', bgTo: 'to-[#251d47]/90', border: 'border-violet-500/30', shadow: 'shadow-violet-500/20', text: 'text-violet-300', btnFrom: 'from-violet-600', btnVia: 'via-purple-600', btnTo: 'to-violet-500', success: 'violet' }
    if (isCyber) return { bgFrom: 'from-[#18181b]/95', bgTo: 'to-[#27272a]/90', border: 'border-red-500/30', shadow: 'shadow-red-500/20', text: 'text-red-300', btnFrom: 'from-red-600', btnVia: 'via-rose-600', btnTo: 'to-red-500', success: 'red' }
    if (isPurple) return { bgFrom: 'from-[#1e1b4b]/95', bgTo: 'to-[#0f172a]/90', border: 'border-purple-500/30', shadow: 'shadow-purple-500/20', text: 'text-purple-300', btnFrom: 'from-purple-600', btnVia: 'via-violet-600', btnTo: 'to-purple-500', success: 'purple' }
    if (isGreen) return { bgFrom: 'from-[#14532d]/95', bgTo: 'to-[#0f172a]/90', border: 'border-green-500/30', shadow: 'shadow-green-500/20', text: 'text-green-300', btnFrom: 'from-green-600', btnVia: 'via-emerald-600', btnTo: 'to-green-500', success: 'green' }
    if (isOrange) return { bgFrom: 'from-[#7c2d12]/95', bgTo: 'to-[#0f172a]/90', border: 'border-orange-500/30', shadow: 'shadow-orange-500/20', text: 'text-orange-300', btnFrom: 'from-orange-600', btnVia: 'via-amber-600', btnTo: 'to-orange-500', success: 'orange' }
    if (isPink) return { bgFrom: 'from-[#831843]/95', bgTo: 'to-[#0f172a]/90', border: 'border-pink-500/30', shadow: 'shadow-pink-500/20', text: 'text-pink-300', btnFrom: 'from-pink-600', btnVia: 'via-rose-600', btnTo: 'to-pink-500', success: 'pink' }
    return { bgFrom: 'from-slate-800/95', bgTo: 'to-slate-700/90', border: 'border-slate-600/40', shadow: 'shadow-black/40', text: 'text-slate-300', btnFrom: 'from-blue-600', btnVia: 'via-indigo-600', btnTo: 'to-purple-600', success: 'green' }
  }
  const cardColors = getCardColors()
  const [configs, setConfigs] = useState({
    loginTitle: '欢迎登录',
    loginSubtitle: '管理您的文档和知识',
    siteName: '知识库管理系统',
    copyright: '2026 知识库管理系统 版权所有 李大聪',
  })
  const [securityConfigs, setSecurityConfigs] = useState({
    maxFailedAttempts: '3',
    lockDuration: '24',
    lockDurationUnit: 'hours',
  })
  const [securitySaved, setSecuritySaved] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // 批量设置安全配置相关状态
  const [users, setUsers] = useState([])
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [showBatchSecurityConfigModal, setShowBatchSecurityConfigModal] = useState(false)
  const [batchMaxFailedAttempts, setBatchMaxFailedAttempts] = useState(3)
  const [batchLockDuration, setBatchLockDuration] = useState(2)
  const [batchLockDurationUnit, setBatchLockDurationUnit] = useState('hours')
  const [batchSaved, setBatchSaved] = useState(false)

  useEffect(() => {
    // 从 context 获取已保存的配置数据
    if (config) {
      setConfigs(prev => ({
        ...prev,
        loginTitle: config.loginTitle || prev.loginTitle,
        loginSubtitle: config.loginSubtitle || prev.loginSubtitle,
        siteName: config.siteName || prev.siteName,
        copyright: config.copyright || prev.copyright,
      }))
    }
  }, [config])

  useEffect(() => {
    // 从当前用户获取安全配置（优先使用用户级配置）
    if (user) {
      setSecurityConfigs(prev => ({
        ...prev,
        maxFailedAttempts: user.maxFailedAttempts?.toString() || prev.maxFailedAttempts,
        lockDuration: user.lockDuration?.toString() || prev.lockDuration,
        lockDurationUnit: user.lockDurationUnit || prev.lockDurationUnit,
      }))
    }
  }, [user])

  useEffect(() => {
    // 页面加载时自动获取用户列表
    fetchUsers()
  }, [])

  useEffect(() => {
    const savedOrder = user?.menuOrder
    if (savedOrder && Array.isArray(savedOrder)) {
      // 只保留用户有权限的菜单
      const filteredOrder = savedOrder.filter(id => menuItems.some(item => item.id === id))
      // 添加用户有权限但排序中没有的菜单
      const missingMenus = menuItems.filter(item => !filteredOrder.includes(item.id)).map(item => item.id)
      setMenuOrder([...filteredOrder, ...missingMenus])
    } else {
      setMenuOrder(menuItems.map(item => item.id))
    }
  }, [user, menuItems])

  const moveMenuUp = (index) => {
    if (index === 0) return
    const newOrder = [...menuOrder]
    ;[newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]
    setMenuOrder(newOrder)
    setMenuSaved(false)
  }

  const moveMenuDown = (index) => {
    if (index === menuOrder.length - 1) return
    const newOrder = [...menuOrder]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    setMenuOrder(newOrder)
    setMenuSaved(false)
  }

  const resetMenuOrder = () => {
    setMenuOrder(menuItems.map(item => item.id))
    setMenuSaved(false)
  }

  const saveMenuOrder = async () => {
    try {
      // 只保存用户有权限的菜单
      const filteredOrder = menuOrder.filter(menuId => menuItems.some(item => item.id === menuId))
      await axios.put('/api/auth/menu-order', { menuOrder: filteredOrder })
      // 直接更新本地用户状态的 menuOrder，不调用 refreshUser 避免覆盖 role 信息
      if (user) {
        const updatedUser = { ...user, menuOrder: filteredOrder }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        // 强制更新用户状态
        const event = new CustomEvent('user-menu-order-update', { detail: { menuOrder: filteredOrder } })
        window.dispatchEvent(event)
      }
      setMenuSaved(true)
      setTimeout(() => setMenuSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save menu order:', error)
    }
  }

  const handleChange = (key, value) => {
    setConfigs(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      await saveConfig(configs)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save configs:', error)
    }
  }

  const handleReset = () => {
    setConfigs({
      loginTitle: '欢迎登录',
      loginSubtitle: '管理您的文档和知识',
      siteName: '知识库管理系统',
    })
    setSaved(false)
  }

  const handleSecurityChange = (key, value) => {
    setSecurityConfigs(prev => ({ ...prev, [key]: value }))
    setSecuritySaved(false)
  }

  const handleSecuritySave = async () => {
    try {
      const newMaxFailedAttempts = parseInt(securityConfigs.maxFailedAttempts) || 3
      const newLockDuration = parseInt(securityConfigs.lockDuration) || 2
      const newLockDurationUnit = securityConfigs.lockDurationUnit || 'hours'
      
      await axios.put('/api/auth/security-config', { 
        maxFailedAttempts: newMaxFailedAttempts,
        lockDuration: newLockDuration,
        lockDurationUnit: newLockDurationUnit
      })
      
      // 刷新用户信息，确保安全配置更新
      await refreshUser()
      
      setSecuritySaved(true)
      setTimeout(() => setSecuritySaved(false), 3000)
    } catch (error) {
      console.error('Failed to save security configs:', error)
    }
  }

  // 获取用户列表（用于批量设置）
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/auth/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  // 切换用户选择
  const toggleSelectUser = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // 全选用户
  const selectAllUsers = () => {
    setSelectedUserIds(users.map(user => user.id))
  }

  // 取消全选
  const deselectAllUsers = () => {
    setSelectedUserIds([])
  }

  // 打开批量设置模态框
  const openBatchSecurityConfigModal = () => {
    setShowBatchSecurityConfigModal(true)
  }

  // 处理批量设置安全配置
  const handleBatchSecurityConfig = async () => {
    try {
      await axios.put('/api/auth/users/security-config', {
        userIds: selectedUserIds,
        maxFailedAttempts: batchMaxFailedAttempts,
        lockDuration: batchLockDuration,
        lockDurationUnit: batchLockDurationUnit
      })
      setShowBatchSecurityConfigModal(false)
      setSelectedUserIds([])
      setBatchSaved(true)
      setTimeout(() => setBatchSaved(false), 3000)
    } catch (error) {
      console.error('Failed to update batch security config:', error)
    }
  }

  const configFields = [
    { key: 'siteName', label: '网站名称', placeholder: '请输入网站名称' },
    { key: 'loginTitle', label: '登录页面标题', placeholder: '请输入登录页面标题' },
    { key: 'loginSubtitle', label: '登录页面副标题', placeholder: '请输入登录页面副标题' },
    { key: 'copyright', label: '版权信息', placeholder: '请输入版权信息，如：2024 知识库管理系统 版权所有' },
  ]

  return (
    <div className={cn("p-6 space-y-6 min-h-screen", 
      isDark 
        ? isSpecialTheme
          ? cn("bg-gradient-to-br", gradientColors.from, gradientColors.via, gradientColors.to)
          : "bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900"
        : "bg-gradient-to-br from-white via-gray-50 to-blue-50")}>
      <div className="flex items-center">
        <div>
          <h1 className={cn("text-3xl font-bold",
            isDark && isSpecialTheme 
              ? cn(`text-${gradientColors.accent}-300`, `drop-shadow-[0_0_10px_rgba(${gradientColors.glow},0.5)]`)
              : isDark 
                ? "text-white"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent")}>
            系统配置
          </h1>
          <p className={cn("mt-1", textClass('muted', isDark, currentTheme))}>管理系统的各项配置</p>
        </div>
      </div>

      <Card className={cn(cardClass(isDark, '', currentTheme), isSpecialTheme ? cardColors.shadow : "shadow-lg",
        isDark && isSpecialTheme && cn("bg-gradient-to-br", cardColors.bgFrom, cardColors.bgTo, cardColors.border))}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClass('primary', isDark, currentTheme))}>
            <Settings className={cn("w-5 h-5", isDark ? isSpecialTheme ? `text-${gradientColors.accent}-400` : "text-blue-400" : "text-blue-500")} />
            基本设置
          </CardTitle>
          <CardDescription className={textClass('muted', isDark, currentTheme)}>配置系统的基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {configFields.map(field => (
            <div key={field.key} className="space-y-2">
              <Label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>
                {field.label}
              </Label>
              <Input
                value={configs[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={cn(inputClass(isDark, '', currentTheme), "h-12 text-base")}
              />
            </div>
          ))}
          {saved && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg",
              isDark 
                ? isSpecialTheme
                  ? cn("bg", `-${cardColors.success}-500/15`, "border", cardColors.border)
                : "bg-green-500/15 border border-green-500/30"
              : "bg-green-50 border border-green-200"
            )}>
              <CheckCircle className={cn(
                "w-5 h-5",
                isDark ? isSpecialTheme ? `text-${cardColors.success}-400` : "text-green-400" : "text-green-500"
              )} />
              <span className={cn(
                isDark ? isSpecialTheme ? `text-${cardColors.success}-300` : "text-green-300" : "text-green-700"
              )}>基本设置已保存成功！</span>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className={cn(
                "flex items-center gap-2",
                isDark && isSpecialTheme ? cn(cardColors.border, `text-${gradientColors.accent}-400`) : isDark && "border-slate-600/50 hover:bg-slate-700/30 text-gray-200"
              )}
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </Button>
            <Button onClick={handleSave} className={cn("shadow-lg",
              isDark && isSpecialTheme 
                ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `shadow-${gradientColors.accent}-500/30`)
                : "bg-blue-600 hover:bg-blue-700")}>
              <Save className="w-4 h-4 mr-2" />
              保存基本设置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(cardClass(isDark, '', currentTheme), "shadow-lg")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClass('primary', isDark, currentTheme))}>
            <Palette className={cn("w-5 h-5", isDark ? "text-purple-400" : "text-purple-500")} />
            主题设置
          </CardTitle>
          <CardDescription className={textClass('muted', isDark, currentTheme)}>
            选择您喜欢的主题皮肤
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const isActive = currentTheme === theme.id
              const colorKeys = Object.keys(theme.colors.primary).slice(0, 6)
              const primaryColors = colorKeys.map(key => theme.colors.primary[key])
              
              const getBorderColor = () => {
                switch(theme.id) {
                  case 'purple': return isActive ? 'border-purple-500' : isDark ? 'border-slate-600 hover:border-purple-500/50' : 'border-gray-200 hover:border-purple-300'
                  case 'green': return isActive ? 'border-green-500' : isDark ? 'border-slate-600 hover:border-green-500/50' : 'border-gray-200 hover:border-green-300'
                  case 'orange': return isActive ? 'border-orange-500' : isDark ? 'border-slate-600 hover:border-orange-500/50' : 'border-gray-200 hover:border-orange-300'
                  case 'pink': return isActive ? 'border-pink-500' : isDark ? 'border-slate-600 hover:border-pink-500/50' : 'border-gray-200 hover:border-pink-300'
                  case 'police': return isActive ? 'border-blue-500' : isDark ? 'border-slate-600 hover:border-cyan-400/50' : 'border-gray-200 hover:border-blue-300'
                  case 'night': return isActive ? 'border-violet-500' : isDark ? 'border-slate-600 hover:border-violet-500/50' : 'border-gray-200 hover:border-violet-300'
                  case 'cyber': return isActive ? 'border-red-500' : isDark ? 'border-slate-600 hover:border-red-400/50' : 'border-gray-200 hover:border-red-300'
                  default: return isActive ? 'border-blue-500' : isDark ? 'border-slate-600 hover:border-blue-500/50' : 'border-gray-200 hover:border-blue-300'
                }
              }

              const getActiveBg = () => {
                switch(theme.id) {
                  case 'purple': return 'bg-purple-500'
                  case 'green': return 'bg-green-500'
                  case 'orange': return 'bg-orange-500'
                  case 'pink': return 'bg-pink-500'
                  case 'police': return 'bg-gradient-to-r from-blue-600 to-cyan-500'
                  case 'night': return 'bg-gradient-to-r from-violet-600 to-purple-500'
                  case 'cyber': return 'bg-gradient-to-r from-red-600 to-rose-500'
                  default: return 'bg-blue-500'
                }
              }
              
              return (
                <button
                  key={theme.id}
                  onClick={() => switchTheme(theme.id)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg",
                    getBorderColor(),
                    isActive && "shadow-lg scale-105",
                    isDark && !isActive && "bg-slate-700/30"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-semibold",
                        textClass('secondary', isDark, currentTheme)
                      )}>
                        {theme.name}
                      </span>
                      {isActive && (
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          getActiveBg()
                        )}>
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {primaryColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-lg shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          <p className={cn("text-sm mt-4", textClass('muted', isDark, currentTheme))}>
            提示：选择主题后，系统界面将立即切换到对应的主题风格
          </p>
        </CardContent>
      </Card>

      <Card className={cn(cardClass(isDark, '', currentTheme), "shadow-lg")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClass('primary', isDark, currentTheme))}>
            <GripVertical className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-blue-500")} />
            菜单排序
          </CardTitle>
          <CardDescription className={textClass('muted', isDark, currentTheme)}>
            拖拽或点击调整顶部菜单的显示顺序（仅对当前用户生效）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {menuOrder.filter(menuId => menuItems.some(item => item.id === menuId)).map((menuId, index) => {
              const menu = menuItems.find(item => item.id === menuId)
              if (!menu) return null
              return (
                <div
                  key={menuId}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIndex(index)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => {
                    setDraggedIndex(null)
                    setDragOverIndex(null)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    setDragOverIndex(index)
                  }}
                  onDrop={() => {
                    if (draggedIndex !== null && draggedIndex !== index) {
                      const newOrder = [...menuOrder]
                      const [draggedItem] = newOrder.splice(draggedIndex, 1)
                      newOrder.splice(index, 0, draggedItem)
                      setMenuOrder(newOrder)
                      setMenuSaved(false)
                    }
                    setDraggedIndex(null)
                    setDragOverIndex(null)
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-grab active:cursor-grabbing",
                    isDark 
                      ? isPolice ? "bg-slate-700/30 border-cyan-500/30 hover:border-cyan-400/50"
                      : isCyber ? "bg-slate-700/30 border-red-500/30 hover:border-red-400/50"
                      : isNight ? "bg-slate-700/30 border-violet-500/30 hover:border-violet-400/50"
                      : isPurple ? "bg-slate-700/30 border-purple-500/30 hover:border-purple-400/50"
                      : isGreen ? "bg-slate-700/30 border-green-500/30 hover:border-green-400/50"
                      : isOrange ? "bg-slate-700/30 border-orange-500/30 hover:border-orange-400/50"
                      : isPink ? "bg-slate-700/30 border-pink-500/30 hover:border-pink-400/50"
                      : "bg-slate-700/30 border-slate-600/50 hover:border-blue-400/50"
                      : "bg-gray-50 border-gray-200 hover:border-blue-300",
                    draggedIndex === index && "opacity-50 scale-95",
                    dragOverIndex === index && draggedIndex !== index && (
                      isDark 
                        ? isPolice ? "border-cyan-500 bg-cyan-500/10"
                        : isCyber ? "border-red-500 bg-red-500/10"
                        : isNight ? "border-violet-500 bg-violet-500/10"
                        : isPurple ? "border-purple-500 bg-purple-500/10"
                        : isGreen ? "border-green-500 bg-green-500/10"
                        : isOrange ? "border-orange-500 bg-orange-500/10"
                        : isPink ? "border-pink-500 bg-pink-500/10"
                        : "border-blue-500 bg-blue-500/10"
                        : "border-blue-500 bg-blue-50"
                    )
                  )}
                >
                  <GripVertical className={cn("w-5 h-5 flex-shrink-0", 
                    isDark 
                      ? isPolice ? "text-cyan-400"
                      : isCyber ? "text-red-400"
                      : isNight ? "text-violet-400"
                      : isPurple ? "text-purple-400"
                      : isGreen ? "text-green-400"
                      : isOrange ? "text-orange-400"
                      : isPink ? "text-pink-400"
                      : "text-slate-400"
                      : "text-gray-400")} />
                  <span className={cn("flex-1 font-medium", textClass('secondary', isDark, currentTheme))}>
                    {menu.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveMenuUp(index)}
                      disabled={index === 0}
                      className={cn(
                        "h-8 w-8 rounded-lg",
                        index === 0 ? "opacity-30 cursor-not-allowed" : "",
                        isDark 
                          ? isPolice
                            ? "text-cyan-400 hover:bg-cyan-500/20"
                          : isCyber
                            ? "text-red-400 hover:bg-red-500/20"
                          : isNight
                            ? "text-violet-400 hover:bg-violet-500/20"
                          : isPurple
                            ? "text-purple-400 hover:bg-purple-500/20"
                          : isGreen
                            ? "text-green-400 hover:bg-green-500/20"
                          : isOrange
                            ? "text-orange-400 hover:bg-orange-500/20"
                          : isPink
                            ? "text-pink-400 hover:bg-pink-500/20"
                          : "text-slate-300 hover:bg-slate-600/50"
                          : "text-gray-600 hover:bg-blue-100"
                      )}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveMenuDown(index)}
                      disabled={index === menuOrder.length - 1}
                      className={cn(
                        "h-8 w-8 rounded-lg",
                        index === menuOrder.length - 1 ? "opacity-30 cursor-not-allowed" : "",
                        isDark 
                          ? isPolice
                            ? "text-cyan-400 hover:bg-cyan-500/20"
                          : isCyber
                            ? "text-red-400 hover:bg-red-500/20"
                          : isNight
                            ? "text-violet-400 hover:bg-violet-500/20"
                          : isPurple
                            ? "text-purple-400 hover:bg-purple-500/20"
                          : isGreen
                            ? "text-green-400 hover:bg-green-500/20"
                          : isOrange
                            ? "text-orange-400 hover:bg-orange-500/20"
                          : isPink
                            ? "text-pink-400 hover:bg-pink-500/20"
                          : "text-slate-300 hover:bg-slate-600/50"
                          : "text-gray-600 hover:bg-blue-100"
                      )}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          
          {menuSaved && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg mb-4",
              isDark 
                ? isSpecialTheme
                  ? cn("bg", `-${cardColors.success}-500/15`, "border", cardColors.border)
                  : "bg-green-500/15 border border-green-500/30"
                : "bg-green-50 border border-green-200"
            )}>
              <CheckCircle className={cn(
                "w-5 h-5",
                isDark ? isSpecialTheme ? `text-${cardColors.success}-400` : "text-green-400" : "text-green-500"
              )} />
              <span className={cn(
                isDark ? isSpecialTheme ? `text-${cardColors.success}-300` : "text-green-300" : "text-green-700"
              )}>菜单排序已保存成功！</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={resetMenuOrder}
              className={cn(
                "flex items-center gap-2",
                isDark && isSpecialTheme ? cn(cardColors.border, `text-${gradientColors.accent}-400`) : isDark && "border-slate-600/50 hover:bg-slate-700/30 text-gray-200"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              重置排序
            </Button>
            <Button
              onClick={saveMenuOrder}
              className={cn("shadow-lg",
                isDark && isSpecialTheme 
                  ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `shadow-${gradientColors.accent}-500/30`)
                  : "bg-blue-600 hover:bg-blue-700")}
            >
              <Save className="w-4 h-4 mr-2" />
              保存排序
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(cardClass(isDark, '', currentTheme), "shadow-lg")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClass('primary', isDark, currentTheme))}>
            <Shield className={cn("w-5 h-5", isDark ? "text-amber-400" : "text-amber-500")} />
            用户安全管理
          </CardTitle>
          <CardDescription className={textClass('muted', isDark, currentTheme)}>
            配置用户登录安全相关的设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>
              密码错误次数限制
            </Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={securityConfigs.maxFailedAttempts || ''}
              onChange={(e) => handleSecurityChange('maxFailedAttempts', e.target.value)}
              placeholder="请输入密码错误次数限制"
              className={cn(inputClass(isDark, '', currentTheme), "h-12 text-base w-32")}
            />
            <p className={cn("text-sm", textClass('muted', isDark, currentTheme))}>
              用户登录时密码错误超过此次数将自动锁定账户，默认值为 3 次
            </p>
          </div>
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", textClass('secondary', isDark, currentTheme))}>
              自动解锁时间
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                max={securityConfigs.lockDurationUnit === 'hours' ? 168 : securityConfigs.lockDurationUnit === 'minutes' ? 10080 : 604800}
                value={securityConfigs.lockDuration || ''}
                onChange={(e) => handleSecurityChange('lockDuration', e.target.value)}
                placeholder="请输入自动解锁时间"
                className={cn(inputClass(isDark, '', currentTheme), "h-12 text-base w-32")}
              />
              <select
                value={securityConfigs.lockDurationUnit || 'hours'}
                onChange={(e) => handleSecurityChange('lockDurationUnit', e.target.value)}
                className={cn(
                  "h-12 px-3 rounded-md border text-base appearance-none cursor-pointer outline-none",
                  isDark 
                    ? "bg-slate-800/80 border-slate-600/40 text-white focus:border-cyan-500/50"
                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-400"
                )}
              >
                <option value="hours">小时</option>
                <option value="minutes">分钟</option>
                <option value="seconds">秒</option>
              </select>
            </div>
            <p className={cn("text-sm", textClass('muted', isDark, currentTheme))}>
              用户被自动锁定后，经过此时间将自动解锁，默认值为 24 小时
            </p>
          </div>
          {securitySaved && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg",
              isDark 
                ? isSpecialTheme
                  ? cn("bg", `-${cardColors.success}-500/15`, "border", cardColors.border)
                : "bg-green-500/15 border border-green-500/30"
              : "bg-green-50 border border-green-200"
            )}>
              <CheckCircle className={cn(
                "w-5 h-5",
                isDark ? isSpecialTheme ? `text-${cardColors.success}-400` : "text-green-400" : "text-green-500"
              )} />
              <span className={cn(
                isDark ? isSpecialTheme ? `text-${cardColors.success}-300` : "text-green-300" : "text-green-700"
              )}>安全配置已保存成功！</span>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={handleSecuritySave}
              className={cn("shadow-lg",
                isDark && isSpecialTheme 
                  ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `shadow-${gradientColors.accent}-500/30`)
                  : "bg-blue-600 hover:bg-blue-700")}
            >
              <Save className="w-4 h-4 mr-2" />
              保存安全配置
            </Button>
          </div>
          
          {/* 批量设置安全配置 - 仅管理员可见 */}
          {user?.role?.name === '系统管理员' && (
          <div className={cn("border-t pt-6", isDark ? "border-slate-700/40" : "border-gray-200")}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-blue-500")} />
                <h3 className={cn("font-semibold", textClass('secondary', isDark, currentTheme))}>
                  批量设置用户安全配置
                </h3>
              </div>
              <Button
                variant="outline"
                onClick={() => { fetchUsers(); setSelectedUserIds([]); }}
                className={cn(
                  "flex items-center gap-2",
                  isDark && isSpecialTheme ? cn(cardColors.border, `text-${gradientColors.accent}-400`) : isDark && "border-slate-600/50 hover:bg-slate-700/30 text-gray-200"
                )}
              >
                <RefreshCw className="w-4 h-4" />
                刷新用户列表
              </Button>
            </div>
            
            {users.length > 0 && (
              <div className="space-y-3">
                {/* 全选按钮 */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={selectedUserIds.length === users.length ? deselectAllUsers : selectAllUsers}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium cursor-pointer",
                      isDark ? "text-cyan-400 hover:text-cyan-300" : "text-blue-600 hover:text-blue-700"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length === users.length && users.length > 0}
                      onChange={(e) => e.target.checked ? selectAllUsers() : deselectAllUsers()}
                      className={cn(
                        "w-4 h-4 rounded border-2 cursor-pointer",
                        isDark ? "border-slate-500 bg-slate-700" : "border-gray-300"
                      )}
                    />
                    {selectedUserIds.length === users.length ? '取消全选' : '全选'}
                  </button>
                  <span className={cn("text-sm", textClass('muted', isDark, currentTheme))}>
                    已选择 {selectedUserIds.length} / {users.length} 个用户
                  </span>
                </div>
                
                {/* 用户列表 */}
                <div className={cn(
                  "max-h-64 overflow-y-auto rounded-lg border",
                  isDark ? "border-slate-700/40 bg-slate-800/30" : "border-gray-200 bg-gray-50"
                )}>
                  {users.map(user => (
                    <div
                      key={user.id}
                      onClick={() => toggleSelectUser(user.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                        selectedUserIds.includes(user.id)
                          ? isDark ? "bg-cyan-500/10 border-l-2 border-cyan-500" : "bg-blue-50 border-l-2 border-blue-500"
                          : isDark ? "hover:bg-slate-700/30" : "hover:bg-gray-100",
                        "border-b last:border-b-0",
                        isDark ? "border-slate-700/40" : "border-gray-200"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => { e.stopPropagation(); toggleSelectUser(user.id); }}
                        className={cn(
                          "w-4 h-4 rounded border-2 cursor-pointer",
                          isDark ? "border-slate-500 bg-slate-700" : "border-gray-300"
                        )}
                      />
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isDark ? "bg-cyan-500/20" : "bg-blue-100"
                      )}>
                        <User className={cn("w-4 h-4", isDark ? "text-cyan-400" : "text-blue-600")} />
                      </div>
                      <div className="flex-1">
                        <div className={cn("font-medium", textClass('secondary', isDark, currentTheme))}>
                          {user.username}
                        </div>
                        <div className={cn("text-xs", textClass('muted', isDark, currentTheme))}>
                          {user.email} | 角色: {user.role?.name || '未分配'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {batchSaved && (
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg mt-3",
                    isDark 
                      ? isSpecialTheme
                        ? cn("bg", `-${cardColors.success}-500/15`, "border", cardColors.border)
                      : "bg-green-500/15 border border-green-500/30"
                      : "bg-green-50 border border-green-200"
                  )}>
                    <CheckCircle className={cn(
                      "w-5 h-5",
                      isDark ? isSpecialTheme ? `text-${cardColors.success}-400` : "text-green-400" : "text-green-500"
                    )} />
                    <span className={cn(
                      isDark ? isSpecialTheme ? `text-${cardColors.success}-300` : "text-green-300" : "text-green-700"
                    )}>批量安全配置设置成功！</span>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    onClick={openBatchSecurityConfigModal}
                    disabled={selectedUserIds.length === 0}
                    className={cn(
                      "shadow-lg",
                      selectedUserIds.length === 0 && "opacity-50 cursor-not-allowed",
                      isDark && isSpecialTheme 
                        ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `shadow-${gradientColors.accent}-500/30`)
                        : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    批量设置安全配置
                  </Button>
                </div>
              </div>
            )}
          </div>
          )}
        </CardContent>
      </Card>

      {/* 批量设置安全配置模态框 - 仅管理员可见 */}
      {user?.role?.name === '系统管理员' && showBatchSecurityConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={cn(
            "bg-white rounded-xl p-6 w-full max-w-md",
            isDark ? "bg-slate-800" : ""
          )}>
            <h3 className={cn("text-xl font-semibold mb-6", isDark ? "text-white" : "text-gray-900")}>
              批量设置安全配置
            </h3>
            <p className={cn("text-sm mb-4", isDark ? "text-slate-400" : "text-gray-500")}>
              将为选中的 {selectedUserIds.length} 个用户设置以下安全配置：
            </p>
            
            <div className="space-y-4">
              {/* 密码错误次数限制 */}
              <div className="flex items-center justify-between">
                <label className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-gray-700")}>
                  密码错误次数限制
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={batchMaxFailedAttempts}
                    onChange={(e) => setBatchMaxFailedAttempts(parseInt(e.target.value) || 3)}
                    className={cn(
                      "w-24 h-10 px-3 rounded-md border text-base outline-none",
                      isDark 
                        ? "bg-slate-700 border-slate-600 text-white focus:border-cyan-500"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-400"
                    )}
                  />
                  <span className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>次</span>
                </div>
              </div>

              {/* 自动解锁时间 */}
              <div className="flex items-center justify-between">
                <label className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-gray-700")}>
                  自动解锁时间
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={batchLockDurationUnit === 'hours' ? 168 : batchLockDurationUnit === 'minutes' ? 10080 : 604800}
                    value={batchLockDuration}
                    onChange={(e) => setBatchLockDuration(parseInt(e.target.value) || 2)}
                    className={cn(
                      "w-24 h-10 px-3 rounded-md border text-base outline-none",
                      isDark 
                        ? "bg-slate-700 border-slate-600 text-white focus:border-cyan-500"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-400"
                    )}
                  />
                  <select
                    value={batchLockDurationUnit}
                    onChange={(e) => setBatchLockDurationUnit(e.target.value)}
                    className={cn(
                      "h-10 px-3 rounded-md border text-sm appearance-none cursor-pointer outline-none",
                      isDark 
                        ? "bg-slate-700 border-slate-600 text-white focus:border-cyan-500"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-400"
                    )}
                  >
                    <option value="hours">小时</option>
                    <option value="minutes">分钟</option>
                    <option value="seconds">秒</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowBatchSecurityConfigModal(false)}
                className={cn(isDark ? "border-slate-600 text-slate-300" : "")}
              >
                取消
              </Button>
              <Button
                onClick={handleBatchSecurityConfig}
                className={cn(
                  "shadow-md",
                  isDark 
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600" 
                    : "bg-gradient-to-r from-cyan-500 to-blue-500"
                )}
              >
                确认设置
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}