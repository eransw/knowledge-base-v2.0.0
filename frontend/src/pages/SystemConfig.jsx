import { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw, CheckCircle, Palette } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useConfig } from '../context/ConfigContext'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import { cardClass, textClass, inputClass } from '../lib/themeStyles'

export default function SystemConfig() {
  const { config, saveConfig } = useConfig()
  const { currentTheme, switchTheme, themes, isDark } = useTheme()
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
    copyright: '2024 知识库管理系统 版权所有',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConfigs({
      siteName: config.siteName || '知识库管理系统',
      loginTitle: config.loginTitle || '欢迎登录',
      loginSubtitle: config.loginSubtitle || '管理您的文档和知识',
      copyright: config.copyright || '2024 知识库管理系统 版权所有',
    })
  }, [config])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("text-3xl font-bold bg-clip-text text-transparent",
            isDark && isSpecialTheme 
              ? cn("bg-gradient-to-r", `from-${gradientColors.accent}-400`, `via-${gradientColors.accent}-300`, `to-${gradientColors.accent}-400`)
              : "bg-gradient-to-r from-blue-600 to-indigo-600")}>
            系统配置
          </h1>
          <p className={cn("mt-1", textClass('muted', isDark, currentTheme))}>管理系统的各项配置</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className={cn(isDark && isSpecialTheme ? cn(cardColors.border, `text-${gradientColors.accent}-400`) : isDark && "border-slate-600/50 hover:bg-slate-700/30 text-gray-200")}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave} className={cn("shadow-lg",
            isDark && isSpecialTheme 
              ? cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `shadow-${gradientColors.accent}-500/30`)
              : "bg-blue-600 hover:bg-blue-700")}>
            <Save className="w-4 h-4 mr-2" />
            保存配置
          </Button>
        </div>
      </div>

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
          )}>配置已保存成功！</span>
        </div>
      )}

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
    </div>
  )
}