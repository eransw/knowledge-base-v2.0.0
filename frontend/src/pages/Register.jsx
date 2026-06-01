import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2, Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('密码长度至少为6位')
      setIsLoading(false)
      return
    }

    const success = await register(username, email, password)
    if (success) {
      setSuccess(true)
      setTimeout(() => {
        navigate('/documents')
      }, 1500)
    } else {
      setError('注册失败，请重试')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 动态背景 - 公安蓝主色 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#004080] to-[#0055aa]" />
      
      {/* 网格背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* 光晕效果 - 公安蓝 */}
      <div className="absolute -top-48 -left-48 w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[300px] h-[300px] bg-blue-400/25 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* 装饰线条 */}
      <div className="absolute top-20 left-10 w-px h-40 bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent animate-pulse" />
      <div className="absolute top-40 right-20 w-px h-60 bg-gradient-to-b from-transparent via-blue-400/60 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-20 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      {/* 粒子效果 - 公安蓝 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-400/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* 注册卡片 */}
      <div className="w-full max-w-md relative z-10">
        {/* 发光边框 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/40 via-blue-400/40 to-cyan-400/40 blur-xl" />
        
        {/* 主卡片 */}
        <div className="relative rounded-2xl bg-[#003366]/95 backdrop-blur-xl shadow-2xl shadow-blue-600/25 overflow-hidden">
          {/* Logo */}
          <div className="flex justify-center pt-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-xl flex items-center justify-center shadow-xl shadow-blue-600/40">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-xl blur-lg opacity-60 animate-pulse" />
            </div>
          </div>
          
          {/* 标题 */}
          <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,255,0.6)] mt-6 mb-3">
            创建账号
          </h2>
          <p className="text-center text-base text-cyan-100/85 mb-6">
            加入我们的知识库系统
          </p>
          
          {/* 安全标识 */}
          <div className="flex items-center justify-center gap-2 mb-6 text-cyan-300/70 text-xs">
            <Shield className="w-4 h-4" />
            <span>安全加密注册</span>
          </div>

          {/* 表单内容 */}
          <div className="px-6 pb-6">
            {/* 错误提示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/40 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            )}

            {/* 成功提示 */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-400/40 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                <span className="text-green-200 text-sm">注册成功！正在跳转...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 用户名 */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-cyan-100">
                  用户名
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 h-11 text-base bg-white/10 border border-cyan-400/30 text-gray-100 placeholder:text-cyan-300/50 focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/40 focus:bg-white/15 transition-all duration-300"
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>

              {/* 邮箱 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-cyan-100">
                  邮箱
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-11 text-base bg-white/10 border border-cyan-400/30 text-gray-100 placeholder:text-cyan-300/50 focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/40 focus:bg-white/15 transition-all duration-300"
                    placeholder="请输入邮箱"
                    required
                  />
                </div>
              </div>

              {/* 密码 */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-cyan-100">
                  密码
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-11 text-base bg-white/10 border border-cyan-400/30 text-gray-100 placeholder:text-cyan-300/50 focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/40 focus:bg-white/15 transition-all duration-300"
                    placeholder="请输入密码（至少6位）"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70 hover:text-cyan-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 确认密码 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-cyan-100">
                  确认密码
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 h-11 text-base bg-white/10 border border-cyan-400/30 text-gray-100 placeholder:text-cyan-300/50 focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/40 focus:bg-white/15 transition-all duration-300"
                    placeholder="请再次输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70 hover:text-cyan-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 注册按钮 */}
              <Button 
                type="submit" 
                disabled={success || isLoading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 hover:from-blue-400 hover:via-blue-300 hover:to-cyan-300 shadow-xl shadow-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>注册中...</span>
                  </div>
                ) : (
                  <>                  <UserPlus className="w-5 h-5 mr-2" />                  {success ? '注册成功' : '注册'}                </>
                )}
              </Button>
            </form>

            {/* 分隔线 */}
            <div className="relative w-full my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-cyan-400/25" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-3 text-cyan-300/70">或者</span>
              </div>
            </div>

            {/* 登录链接 */}
            <p className="text-center text-cyan-200/75 text-sm">
              已有账号？{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors underline underline-offset-4 decoration-cyan-300/40 hover:decoration-cyan-300"
              >
                立即登录
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}