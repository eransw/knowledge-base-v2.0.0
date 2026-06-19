import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { 
  Search, 
  Database, 
  Key, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Settings,
  FileText,
  FolderOpen,
  ChevronRight,
  Eye,
  EyeOff,
  Mic,
  Globe,
  Cloud
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'

export default function SearchSettings() {
  const { isDark, currentTheme } = useTheme()
  const navigate = useNavigate()
  
  const isPolice = currentTheme === 'police'
  const isNight = currentTheme === 'night'
  const isCyber = currentTheme === 'cyber'
  const isPurple = currentTheme === 'purple'
  const isGreen = currentTheme === 'green'
  const isOrange = currentTheme === 'orange'
  const isPink = currentTheme === 'pink'
  const isSpecialTheme = isPolice || isNight || isCyber || isPurple || isGreen || isOrange || isPink

  const [activeTab, setActiveTab] = useState('config')
  const [searchStats, setSearchStats] = useState(null)
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [indexing, setIndexing] = useState(false)
  const [categories, setCategories] = useState([])
  
  // API Keys
  const [openaiKey, setOpenaiKey] = useState('')
  const [aliyunKey, setAliyunKey] = useState('')
  const [tencentKey, setTencentKey] = useState('')
  const [doubaoApiKey, setDoubaoApiKey] = useState('')
  const [doubaoAppId, setDoubaoAppId] = useState('')
  
  // Visibility states
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showAliyunKey, setShowAliyunKey] = useState(false)
  const [showTencentKey, setShowTencentKey] = useState(false)
  const [showDoubaoKey, setShowDoubaoKey] = useState(false)

  useEffect(() => {
    fetchSearchStats()
    fetchConfigs()
    fetchCategories()
  }, [])

  const fetchSearchStats = async () => {
    try {
      const response = await axios.get('/api/search/stats')
      setSearchStats(response.data)
    } catch (error) {
      console.error('Failed to fetch search stats:', error)
      setSearchStats({ status: 'not_connected' })
    }
  }

  const fetchConfigs = async () => {
    try {
      const response = await axios.get('/api/search/configs')
      setConfigs(response.data)
      
      response.data.forEach(config => {
        if (config.key === 'OPENAI_API_KEY') {
          setOpenaiKey(config.value)
        } else if (config.key === 'ALIYUN_ASR_KEY') {
          setAliyunKey(config.value)
        } else if (config.key === 'TENCENT_ASR_KEY') {
          setTencentKey(config.value)
        } else if (config.key === 'DOUBAO_API_KEY') {
          setDoubaoApiKey(config.value)
        } else if (config.key === 'DOUBAO_APP_ID') {
          setDoubaoAppId(config.value)
        }
      })
    } catch (error) {
      console.error('Failed to fetch configs:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/tree')
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const saveConfig = async (key, value, description) => {
    try {
      await axios.put('/api/search/config', { key, value, description })
      fetchConfigs()
      return true
    } catch (error) {
      console.error('Failed to save config:', error)
      return false
    }
  }

  const handleSaveAllConfigs = async () => {
    setLoading(true)
    try {
      await saveConfig('OPENAI_API_KEY', openaiKey, 'OpenAI API Key for Whisper audio transcription')
      await saveConfig('ALIYUN_ASR_KEY', aliyunKey, '阿里云语音识别 API Key')
      await saveConfig('TENCENT_ASR_KEY', tencentKey, '腾讯云语音识别 API Key')
      await saveConfig('DOUBAO_API_KEY', doubaoApiKey, '火山引擎 API Key for OCR')
      await saveConfig('DOUBAO_APP_ID', doubaoAppId, '火山引擎 App ID for OCR')
      alert('配置保存成功')
    } catch (error) {
      alert('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleIndexAll = async () => {
    if (!confirm('确定要重建全部索引吗？这可能需要一些时间。')) return
    
    setIndexing(true)
    try {
      const response = await axios.post('/api/search/index-all')
      alert(response.data.message)
      fetchSearchStats()
    } catch (error) {
      console.error('Failed to index all:', error)
      alert('索引失败')
    } finally {
      setIndexing(false)
    }
  }

  const handleIndexCategory = async (categoryId) => {
    if (!confirm('确定要重建该分类的索引吗？')) return
    
    setIndexing(true)
    try {
      const response = await axios.post(`/api/search/index-category/${categoryId}`)
      alert(response.data.message)
      fetchSearchStats()
    } catch (error) {
      console.error('Failed to index category:', error)
      alert('索引失败')
    } finally {
      setIndexing(false)
    }
  }

  const renderCategoryTree = (categories, level = 0) => {
    return categories.map(category => (
      <div key={category.id} style={{ marginLeft: level * 20 }}>
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg mb-2 border",
          isDark ? "bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50" : "bg-white/80 border-gray-200 hover:bg-gray-100"
        )}>
          <div className="flex items-center gap-3">
              <FolderOpen className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-500")} />
              <span className={cn(isDark ? "text-gray-100" : "text-gray-800")}>{category.name}</span>
              <Badge className={cn(
                "text-xs",
                isDark 
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                  : "bg-gray-100 text-gray-600"
              )}>
                {category.docCount || 0} 文档
              </Badge>
            </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleIndexCategory(category.id)}
            disabled={indexing}
            className={cn(
              "gap-1",
              isDark 
                ? "border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400" 
                : "border-gray-300 hover:bg-gray-100"
            )}
          >
            <Database className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-gray-600")} />
            建立索引
          </Button>
        </div>
        {category.children && category.children.length > 0 && renderCategoryTree(category.children, level + 1)}
      </div>
    ))
  }

  const getStatusBadge = () => {
    if (!searchStats) return <Badge variant="secondary">加载中</Badge>
    
    if (searchStats.status === 'connected') {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-4 h-4 mr-1" />
          已连接 ({searchStats.documentCount} 文档)
        </Badge>
      )
    }
    
    if (searchStats.status === 'not_connected') {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <AlertCircle className="w-4 h-4 mr-1" />
          未连接
        </Badge>
      )
    }
    
    return (
      <Badge variant="secondary">
        <AlertCircle className="w-4 h-4 mr-1" />
        错误
      </Badge>
    )
  }

  return (
    <div className={cn(
      "min-h-screen",
      isDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"
    )}>
      {/* 顶部导航 */}
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-lg border-b",
        isDark ? "bg-slate-900/80 border-slate-700/30" : "bg-white/80 border-gray-200"
      )}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/documents')}
              className={cn(
                "gap-2",
                isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              返回文档
            </Button>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl",
                isDark ? "bg-blue-500/20" : "bg-blue-100"
              )}>
                <Search className={cn("w-6 h-6", isDark ? "text-blue-400" : "text-blue-600")} />
              </div>
              <div>
                <h1 className={cn(
                  "text-xl font-bold",
                  isDark ? "text-gray-100" : "text-gray-900"
                )}>
                  检索系统配置
                </h1>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  配置 API Key 和管理索引库
                </p>
              </div>
            </div>
            <div className="ml-auto">
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Tab 导航 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('config')}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all",
              activeTab === 'config'
                ? isDark ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-blue-100 text-blue-600 border border-blue-200"
                : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API 配置
            </div>
          </button>
          <button
            onClick={() => setActiveTab('index')}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all",
              activeTab === 'index'
                ? isDark ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-blue-100 text-blue-600 border border-blue-200"
                : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              索引管理
            </div>
          </button>
        </div>

        {/* API 配置 */}
        {activeTab === 'config' && (
          <div className="grid gap-6">
            <Card className={cn(
              isDark ? "bg-slate-800/50 border-slate-700/30" : "bg-white/80 border-gray-200"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  isDark ? "text-gray-100" : "text-gray-900"
                )}>
                  <Mic className="w-5 h-5" />
                  语音识别配置
                </CardTitle>
                <CardDescription>
                  选择适合您的语音识别服务（至少配置一个即可）
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 阿里云语音识别 */}
                <div className={cn(
                  "p-4 rounded-lg border",
                  isDark ? "bg-slate-700/30 border-slate-600/30" : "bg-gray-50 border-gray-200"
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    <Cloud className="w-5 h-5 text-orange-500" />
                    <h4 className={cn("font-medium", isDark ? "text-gray-200" : "text-gray-800")}>
                      阿里云语音识别
                    </h4>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">推荐</Badge>
                  </div>
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      Access Key
                    </label>
                    <div className="relative">
                      <Input
                        type={showAliyunKey ? "text" : "password"}
                        value={aliyunKey}
                        onChange={(e) => setAliyunKey(e.target.value)}
                        placeholder="LTAI..."
                        className={cn(
                          "pr-20",
                          isDark 
                            ? "bg-slate-700/50 border-slate-600/30 text-gray-100 placeholder:text-gray-500" 
                            : "bg-white border-gray-300 text-gray-900"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAliyunKey(!showAliyunKey)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded",
                          isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        {showAliyunKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>
                      获取地址：https://www.aliyun.com/product/nls
                    </p>
                  </div>
                </div>

                {/* 腾讯云语音识别 */}
                <div className={cn(
                  "p-4 rounded-lg border",
                  isDark ? "bg-slate-700/30 border-slate-600/30" : "bg-gray-50 border-gray-200"
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    <h4 className={cn("font-medium", isDark ? "text-gray-200" : "text-gray-800")}>
                      腾讯云语音识别
                    </h4>
                  </div>
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      Secret Key
                    </label>
                    <div className="relative">
                      <Input
                        type={showTencentKey ? "text" : "password"}
                        value={tencentKey}
                        onChange={(e) => setTencentKey(e.target.value)}
                        placeholder="AKID..."
                        className={cn(
                          "pr-20",
                          isDark 
                            ? "bg-slate-700/50 border-slate-600/30 text-gray-100 placeholder:text-gray-500" 
                            : "bg-white border-gray-300 text-gray-900"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTencentKey(!showTencentKey)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded",
                          isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        {showTencentKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>
                      获取地址：https://cloud.tencent.com/product/asr
                    </p>
                  </div>
                </div>

                {/* OpenAI Whisper */}
                <div className={cn(
                  "p-4 rounded-lg border",
                  isDark ? "bg-slate-700/30 border-slate-600/30" : "bg-gray-50 border-gray-200"
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-green-500" />
                    <h4 className={cn("font-medium", isDark ? "text-gray-200" : "text-gray-800")}>
                      OpenAI Whisper（国际）
                    </h4>
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">需翻墙</Badge>
                  </div>
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      API Key
                    </label>
                    <div className="relative">
                      <Input
                        type={showOpenaiKey ? "text" : "password"}
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        placeholder="sk-..."
                        className={cn(
                          "pr-20",
                          isDark 
                            ? "bg-slate-700/50 border-slate-600/30 text-gray-100 placeholder:text-gray-500" 
                            : "bg-white border-gray-300 text-gray-900"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded",
                          isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>
                      获取地址：https://platform.openai.com/api-keys（需翻墙访问）
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OCR 配置 */}
            <Card className={cn(
              isDark ? "bg-slate-800/50 border-slate-700/30" : "bg-white/80 border-gray-200"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  isDark ? "text-gray-100" : "text-gray-900"
                )}>
                  <FileText className="w-5 h-5" />
                  OCR 文字识别配置
                </CardTitle>
                <CardDescription>
                  用于 PDF 等文档的图片文字识别
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 火山引擎 OCR */}
                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    火山引擎 API Key
                  </label>
                  <div className="relative">
                    <Input
                      type={showDoubaoKey ? "text" : "password"}
                      value={doubaoApiKey}
                      onChange={(e) => setDoubaoApiKey(e.target.value)}
                      placeholder="AKLT..."
                      className={cn(
                        "pr-20",
                        isDark 
                          ? "bg-slate-700/50 border-slate-600/30 text-gray-100 placeholder:text-gray-500" 
                          : "bg-white border-gray-300 text-gray-900"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDoubaoKey(!showDoubaoKey)}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded",
                        isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {showDoubaoKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>
                    获取地址：https://console.volcengine.com/
                  </p>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    火山引擎 App ID
                  </label>
                  <Input
                    type="text"
                    value={doubaoAppId}
                    onChange={(e) => setDoubaoAppId(e.target.value)}
                    placeholder="your-app-id"
                    className={cn(
                      isDark 
                        ? "bg-slate-700/50 border-slate-600/30 text-gray-100 placeholder:text-gray-500" 
                        : "bg-white border-gray-300 text-gray-900"
                    )}
                  />
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>
                    在火山引擎控制台创建应用后获取
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 保存按钮 */}
            <div className="pt-4">
              <Button
                onClick={handleSaveAllConfigs}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    保存配置
                  </>
                )}
              </Button>
            </div>

            {/* 功能说明 */}
            <Card className={cn(
              isDark ? "bg-slate-800/50 border-slate-700/30" : "bg-white/80 border-gray-200"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  isDark ? "text-gray-100" : "text-gray-900"
                )}>
                  <Settings className="w-5 h-5" />
                  功能说明
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-slate-700/30" : "bg-gray-50"
                  )}>
                    <h4 className={cn(
                      "font-medium mb-2",
                      isDark ? "text-gray-200" : "text-gray-800"
                    )}>
                      <Cloud className="w-4 h-4 inline mr-1 text-orange-500" />
                      阿里云 ASR
                    </h4>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                      国内语音识别服务，支持中文语音转文字，准确率较高
                    </p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-slate-700/30" : "bg-gray-50"
                  )}>
                    <h4 className={cn(
                      "font-medium mb-2",
                      isDark ? "text-gray-200" : "text-gray-800"
                    )}>
                      <Cloud className="w-4 h-4 inline mr-1 text-blue-500" />
                      腾讯云 ASR
                    </h4>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                      腾讯云语音识别服务，支持多种音频格式
                    </p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-slate-700/30" : "bg-gray-50"
                  )}>
                    <h4 className={cn(
                      "font-medium mb-2",
                      isDark ? "text-gray-200" : "text-gray-800"
                    )}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      火山引擎 OCR
                    </h4>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                      用于 PDF 等文档的图片文字识别，提取图片中的文字内容
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 索引管理 */}
        {activeTab === 'index' && (
          <div className="space-y-6">
            {/* 状态卡片 */}
            <div className={cn(
              "p-6 rounded-2xl border",
              isDark ? "bg-slate-800/50 border-slate-700/30" : "bg-white/80 border-gray-200"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={cn(
                    "text-lg font-semibold mb-2",
                    isDark ? "text-gray-100" : "text-gray-900"
                  )}>
                    索引库状态
                  </h3>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    当前索引库中共有 {searchStats?.documentCount || 0} 个文档
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={fetchSearchStats}
                    className={cn(
                      isDark ? "border-slate-600/30 hover:bg-slate-700/50" : "border-gray-300 hover:bg-gray-100"
                    )}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新状态
                  </Button>
                  <Button
                    onClick={handleIndexAll}
                    disabled={indexing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {indexing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        索引中...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        重建全部索引
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* 分类索引 */}
            <Card className={cn(
              isDark ? "bg-slate-800/50 border-slate-700/30" : "bg-white/80 border-gray-200"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  isDark ? "text-gray-100" : "text-gray-900"
                )}>
                  <FolderOpen className="w-5 h-5" />
                  按分类建立索引
                </CardTitle>
                <CardDescription>
                  选择分类只为该分类下的文档建立索引
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length > 0 ? (
                  renderCategoryTree(categories)
                ) : (
                  <div className={cn(
                    "text-center py-8",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    暂无分类
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}