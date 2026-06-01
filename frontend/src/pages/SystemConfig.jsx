import { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useConfig } from '../context/ConfigContext'

export default function SystemConfig() {
  const { config, saveConfig } = useConfig()
  const [configs, setConfigs] = useState({
    loginTitle: '欢迎登录',
    loginSubtitle: '管理您的文档和知识',
    siteName: '知识库管理系统',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConfigs({
      siteName: config.siteName || '知识库管理系统',
      loginTitle: config.loginTitle || '欢迎登录',
      loginSubtitle: config.loginSubtitle || '管理您的文档和知识',
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
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            系统配置
          </h1>
          <p className="text-gray-500 mt-1">管理系统的各项配置</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave} className="shadow-lg">
            <Save className="w-4 h-4 mr-2" />
            保存配置
          </Button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700">配置已保存成功！</span>
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            基本设置
          </CardTitle>
          <CardDescription>配置系统的基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {configFields.map(field => (
            <div key={field.key} className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {field.label}
              </Label>
              <Input
                value={configs[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="h-12 text-base"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}