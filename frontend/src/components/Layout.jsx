import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useConfig } from '../context/ConfigContext'
import { useTheme } from '../context/ThemeContext'
import { Copyright } from 'lucide-react'
import { 
  BookOpen, 
  FolderOpen, 
  Tag, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronDown,
  Settings,
  Bot,
  Shield,
  Users
} from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

export default function Layout() {
  const { user, logout } = useAuth()
  const { config } = useConfig()
  const { colors, isDark, currentTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { icon: BookOpen, label: '文档管理', path: '/documents', menuId: 'documents' },
    { icon: FolderOpen, label: '分类管理', path: '/categories', menuId: 'categories' },
    { icon: Tag, label: '标签管理', path: '/tags', menuId: 'tags' },
    { icon: Bot, label: 'AI模型配置', path: '/ai-config', menuId: 'ai-config' },
    { icon: Shield, label: '角色管理', path: '/roles', menuId: 'roles' },
    { icon: Users, label: '用户管理', path: '/users', menuId: 'users' },
    { icon: Settings, label: '系统配置', path: '/system-config', menuId: 'system-config' },
  ]

  const isActive = (path) => location.pathname === path

  const filteredNavItems = () => {
    if (!user?.role) {
      console.warn('No user or role found, showing all menus')
      return navItems
    }
    
    let permissions = user.role.permissions
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions)
      } catch (e) {
        console.error('Failed to parse permissions:', e)
        return navItems
      }
    }
    
    const userMenus = permissions?.menus
    if (!userMenus || !Array.isArray(userMenus)) {
      console.warn('No menus found in permissions, showing all menus')
      return navItems
    }
    
    return navItems.filter(item => userMenus.includes(item.menuId))
  }
  const isPolice = currentTheme === 'police'
  const isNight = currentTheme === 'night'
  const isCyber = currentTheme === 'cyber'

  // 根据主题选择合适的背景和文字颜色
  const headerBg = isPolice ? 'bg-[#003366]/95' : isNight ? 'bg-[#1a1333]/95' : isCyber ? 'bg-[#18181b]/95' : (isDark ? 'bg-slate-900/95' : 'bg-white/90')
  const headerBorder = isPolice ? 'border-blue-500/50' : isNight ? 'border-violet-600/50' : isCyber ? 'border-red-600/50' : (isDark ? colors.border.primary : 'border-gray-200/50')
  const textColor = isPolice ? 'text-slate-100' : isNight ? 'text-slate-100' : isCyber ? 'text-zinc-100' : (isDark ? colors.text.primary : 'text-gray-800')
  const navTextColor = isPolice ? 'text-cyan-300' : isNight ? 'text-violet-300' : isCyber ? 'text-red-300' : (isDark ? colors.text.muted : 'text-gray-600')
  const navBgHover = isPolice ? 'hover:bg-blue-800/40' : isNight ? 'hover:bg-violet-800/40' : isCyber ? 'hover:bg-red-800/40' : (isDark ? colors.button.ghost : 'hover:bg-blue-50')

  // 获取主题特定的主色调用于高亮
  const getPrimaryColor = () => {
    switch(currentTheme) {
      case 'purple': return 'text-purple-400 hover:text-purple-300'
      case 'green': return 'text-green-400 hover:text-green-300'
      case 'orange': return 'text-orange-400 hover:text-orange-300'
      case 'pink': return 'text-pink-400 hover:text-pink-300'
      case 'police': return 'text-cyan-300 hover:text-cyan-200'
      case 'night': return 'text-violet-300 hover:text-violet-200'
      case 'cyber': return 'text-red-300 hover:text-red-200'
      default: return 'text-blue-400 hover:text-blue-300'
    }
  }

  const navHoverColor = getPrimaryColor()

  // 获取活动状态的背景色
  const getActiveBg = () => {
    switch(currentTheme) {
      case 'purple': return 'bg-purple-600 text-white'
      case 'green': return 'bg-green-600 text-white'
      case 'orange': return 'bg-orange-600 text-white'
      case 'pink': return 'bg-pink-600 text-white'
      case 'police': return 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/30'
      case 'night': return 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-600/30'
      case 'cyber': return 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-600/30'
      default: return isDark ? 'bg-blue-600 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
    }
  }

  // 获取主题特定的渐变背景
  const getGradientBg = () => {
    switch(currentTheme) {
      case 'police': return 'from-[#003366] via-[#004080] to-[#0055aa]'
      case 'night': return 'from-[#0f0a1e] via-[#1a1333] to-[#251d47]'
      case 'cyber': return 'from-[#09090b] via-[#18181b] to-[#27272a]'
      default: return colors.gradient.primary
    }
  }

  // 获取主题特定的Logo背景
  const getLogoBg = () => {
    switch(currentTheme) {
      case 'police': return 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 shadow-blue-600/40'
      case 'night': return 'bg-gradient-to-br from-violet-600 via-violet-500 to-purple-400 shadow-violet-600/40'
      case 'cyber': return 'bg-gradient-to-br from-red-600 via-red-500 to-rose-400 shadow-red-600/40'
      default: return 'bg-gradient-to-br from-blue-500 to-indigo-600'
    }
  }

  // 获取主题特定的用户头像背景
  const getAvatarBg = () => {
    switch(currentTheme) {
      case 'police': return 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-blue-600/40'
      case 'night': return 'bg-gradient-to-br from-violet-600 via-violet-500 to-purple-500 shadow-violet-600/40'
      case 'cyber': return 'bg-gradient-to-br from-red-600 via-red-500 to-rose-500 shadow-red-600/40'
      default: return 'bg-gradient-to-br from-blue-500 to-indigo-600'
    }
  }

  // 获取主题特殊效果
  const renderThemeEffects = () => {
    if (isPolice) {
      return (
        <>
          {/* 网格背景 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-full bg-[linear-gradient(rgba(0,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.4)_1px,transparent_1px)] [background-size:50px_50px]" />
          </div>
          {/* 光晕效果 */}
          <div className="absolute -top-48 -left-48 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-48 -right-48 w-[300px] h-[300px] bg-blue-400/15 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          {/* 装饰线条 */}
          <div className="absolute top-20 left-10 w-px h-40 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent animate-pulse pointer-events-none" />
          <div className="absolute top-40 right-20 w-px h-60 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }} />
        </>
      );
    }
    
    if (isNight) {
      return (
        <>
          {/* 网格背景 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-full bg-[linear-gradient(rgba(167,139,250,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.3)_1px,transparent_1px)] [background-size:50px_50px]" />
          </div>
          {/* 光晕效果 */}
          <div className="absolute -top-48 -left-48 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-48 -right-48 w-[300px] h-[300px] bg-purple-400/15 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          {/* 装饰线条 */}
          <div className="absolute top-20 left-10 w-px h-40 bg-gradient-to-b from-transparent via-violet-400/40 to-transparent animate-pulse pointer-events-none" />
          <div className="absolute top-40 right-20 w-px h-60 bg-gradient-to-b from-transparent via-purple-400/40 to-transparent animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }} />
        </>
      );
    }
    
    if (isCyber) {
      return (
        <>
          {/* 网格背景 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-full bg-[linear-gradient(rgba(239,68,68,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.3)_1px,transparent_1px)] [background-size:50px_50px]" />
          </div>
          {/* 光晕效果 */}
          <div className="absolute -top-48 -left-48 w-[400px] h-[400px] bg-red-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-48 -right-48 w-[300px] h-[300px] bg-rose-400/15 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          {/* 装饰线条 */}
          <div className="absolute top-20 left-10 w-px h-40 bg-gradient-to-b from-transparent via-red-400/40 to-transparent animate-pulse pointer-events-none" />
          <div className="absolute top-40 right-20 w-px h-60 bg-gradient-to-b from-transparent via-rose-400/40 to-transparent animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }} />
        </>
      );
    }
    
    return null;
  }

  return (
    <div className={cn(
      "h-screen flex flex-col transition-all duration-500 relative overflow-hidden bg-gradient-to-br",
      getGradientBg()
    )}>
      {/* 主题特殊效果 */}
      {renderThemeEffects()}

      <header className={cn(
        headerBg,
        "backdrop-blur-xl border-b shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        headerBorder
      )}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => navigate('/documents')}
                className="flex items-center gap-3 group flex-shrink-0"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200",
                  getLogoBg()
                )}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className={cn(
                  "text-xl font-bold transition-colors",
                  isPolice || isNight || isCyber ? "text-slate-100" : (isDark ? "text-gray-100" : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent")
                )}>
                  {config.siteName || '知识库'}
                </span>
              </button>

              <nav className="hidden md:flex items-center gap-1 ml-4 overflow-x-auto scrollbar-hide flex-1">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  {filteredNavItems().map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 flex-shrink-0",
                        isActive(item.path)
                          ? cn(getActiveBg(), "shadow-lg")
                          : cn(navTextColor, navBgHover, navHoverColor)
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right mr-2">
                    <p className={cn("text-sm font-semibold", textColor)}>
                      {user.username}
                    </p>
                    <p className={cn("text-xs", navTextColor)}>
                      {user.email}
                    </p>
                  </div>
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center",
                    getAvatarBg()
                  )}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className={cn(
                  "hidden sm:flex items-center gap-2 transition-colors",
                  isPolice ? "border-blue-500/50 text-cyan-100 hover:bg-blue-800/40" : 
                  isNight ? "border-violet-500/50 text-violet-100 hover:bg-violet-800/40" : 
                  isCyber ? "border-red-500/50 text-red-100 hover:bg-red-800/40" : 
                  (isDark ? "border-slate-600 text-gray-300 hover:bg-slate-800" : "")
                )}
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </Button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "md:hidden p-2 rounded-lg transition-colors",
                  isPolice ? "hover:bg-blue-800/40" : isNight ? "hover:bg-violet-800/40" : isCyber ? "hover:bg-red-800/40" : (isDark ? "hover:bg-slate-800" : "hover:bg-gray-100")
                )}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={cn(
            "md:hidden border-t shadow-lg backdrop-blur-xl",
            isPolice ? "border-blue-500/50 bg-[#003366]/95" : 
            isNight ? "border-violet-500/50 bg-[#1a1333]/95" : 
            isCyber ? "border-red-500/50 bg-[#18181b]/95" : 
            (isDark ? cn(colors.border.primary, "bg-slate-900/95") : "border-gray-200/50 bg-white")
          )}>
            <nav className="px-4 py-4 space-y-2">
              {filteredNavItems().map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setMobileMenuOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                    isActive(item.path)
                      ? cn(getActiveBg(), "shadow-lg")
                      : cn(navTextColor, navBgHover, navHoverColor)
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <div className={cn("border-t pt-4 mt-2", headerBorder)}>
                {user && (
                  <div className="flex items-center gap-3 mb-4 px-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      getAvatarBg()
                    )}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", textColor)}>
                        {user.username}
                      </p>
                      <p className={cn("text-xs", navTextColor)}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="ml-2">退出登录</span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* 主内容区域 - 可滚动 */}
      <main className="flex-1 overflow-auto relative z-10 pt-20 pb-20">
        <div className="min-h-full px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* 底部版权信息 - 固定在底部 */}
      <footer className={cn(
        "fixed bottom-0 left-0 right-0 z-40 py-4 border-t backdrop-blur-xl",
        isPolice ? "border-blue-500/30 bg-[#003366]/90" :
        isNight ? "border-violet-500/30 bg-[#1a1333]/90" :
        isCyber ? "border-red-500/30 bg-[#18181b]/90" :
        (isDark ? "border-slate-700/30 bg-slate-900/90" : "border-gray-200/50 bg-white/90")
      )}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <Copyright className={cn("w-4 h-4", isDark ? "text-slate-500" : "text-gray-400")} />
            <span className={cn("text-sm", isDark ? "text-slate-500" : "text-gray-500")}>
              {config.copyright || '2024 知识库管理系统 版权所有'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}