import { useState, useEffect } from 'react'
import { FileText, Trash2, Download, Search, Filter, Calendar, User, Activity, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import axios from 'axios'
import { ConfirmDialog } from '../components/ConfirmDialog'

export default function LogsPage() {
  const { isDark } = useTheme()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)

  // 筛选条件
  const [username, setUsername] = useState('')
  const [action, setAction] = useState('')
  const [module, setModule] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // 删除确认
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLogId, setDeleteLogId] = useState(null)
  const [showClearDialog, setShowClearDialog] = useState(false)

  // 选中的日志
  const [selectedLogs, setSelectedLogs] = useState([])

  useEffect(() => {
    fetchLogs()
  }, [page, pageSize])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('pageSize', pageSize.toString())
      if (username) params.append('username', username)
      if (action) params.append('action', action)
      if (module) params.append('module', module)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await axios.get(`/api/logs?${params.toString()}`)
      setLogs(response.data.logs)
      setTotal(response.data.total)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchLogs()
  }

  const handleReset = () => {
    setUsername('')
    setAction('')
    setModule('')
    setStartDate('')
    setEndDate('')
    setPage(1)
    setTimeout(() => fetchLogs(), 100)
  }

  const handleDelete = async () => {
    if (!deleteLogId) return
    try {
      await axios.delete(`/api/logs/${deleteLogId}`)
      setShowDeleteDialog(false)
      setDeleteLogId(null)
      fetchLogs()
    } catch (error) {
      console.error('Failed to delete log:', error)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedLogs.length === 0) return
    try {
      await axios.post('/api/logs/batch-delete', { ids: selectedLogs })
      setSelectedLogs([])
      fetchLogs()
    } catch (error) {
      console.error('Failed to batch delete logs:', error)
    }
  }

  const handleClearAll = async () => {
    try {
      await axios.delete('/api/logs/clear')
      setShowClearDialog(false)
      fetchLogs()
    } catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (username) params.append('username', username)
      if (action) params.append('action', action)
      if (module) params.append('module', module)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await axios.get(`/api/logs/export?${params.toString()}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `logs_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export logs:', error)
    }
  }

  const toggleSelectLog = (logId) => {
    if (selectedLogs.includes(logId)) {
      setSelectedLogs(selectedLogs.filter(id => id !== logId))
    } else {
      setSelectedLogs([...selectedLogs, logId])
    }
  }

  const toggleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([])
    } else {
      setSelectedLogs(logs.map(log => log.id))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionColor = (action) => {
    const colors = {
      login: isDark ? 'text-green-400' : 'text-green-600',
      logout: isDark ? 'text-yellow-400' : 'text-yellow-600',
      create: isDark ? 'text-blue-400' : 'text-blue-600',
      update: isDark ? 'text-purple-400' : 'text-purple-600',
      delete: isDark ? 'text-red-400' : 'text-red-600',
      register: isDark ? 'text-cyan-400' : 'text-cyan-600',
    }
    return colors[action] || (isDark ? 'text-gray-400' : 'text-gray-600')
  }

  const getModuleColor = (module) => {
    const colors = {
      '认证': isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
      '用户管理': isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700',
      '文档管理': isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
      '分类管理': isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      '标签管理': isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700',
      '角色管理': isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700',
      '系统配置': isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700',
    }
    return colors[module] || (isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className={cn("w-8 h-8", isDark ? "text-cyan-400" : "text-blue-600")} />
          <h1 className={cn("text-3xl font-bold",
            isDark ? "text-white" : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent")}>
            系统日志
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            className={cn(
              "shadow-lg rounded-xl",
              isDark ? "border-slate-700 hover:bg-slate-800" : "border-gray-200 hover:bg-gray-50"
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            导出日志
          </Button>
          <Button
            onClick={() => setShowClearDialog(true)}
            variant="outline"
            className={cn(
              "shadow-lg rounded-xl text-red-500",
              isDark ? "border-red-700 hover:bg-red-900/20" : "border-red-200 hover:bg-red-50"
            )}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空日志
          </Button>
        </div>
      </div>

      {/* 筛选区域 */}
      <Card className={cn(
        "transition-all duration-300",
        isDark ? "bg-slate-800/80 border-slate-700/50" : "bg-white"
      )}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "text-gray-900")}>
            <Filter className="w-5 h-5" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : "text-gray-700"}>用户名</Label>
              <Input
                placeholder="输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn(
                  isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-200"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : "text-gray-700"}>操作类型</Label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border",
                  isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-200"
                )}
              >
                <option value="">全部</option>
                <option value="login">登录</option>
                <option value="logout">登出</option>
                <option value="register">注册</option>
                <option value="create">创建</option>
                <option value="update">更新</option>
                <option value="delete">删除</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : "text-gray-700"}>模块</Label>
              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border",
                  isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-200"
                )}
              >
                <option value="">全部</option>
                <option value="认证">认证</option>
                <option value="用户管理">用户管理</option>
                <option value="文档管理">文档管理</option>
                <option value="分类管理">分类管理</option>
                <option value="标签管理">标签管理</option>
                <option value="角色管理">角色管理</option>
                <option value="系统配置">系统配置</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : "text-gray-700"}>开始日期</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(
                  isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-200"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : "text-gray-700"}>结束日期</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={cn(
                  isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-200"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : "text-gray-700"}>&nbsp;</Label>
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  className={cn(
                    "flex-1 shadow-lg rounded-xl",
                    isDark ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" : "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"
                  )}
                >
                  <Search className="w-4 h-4 mr-2" />
                  搜索
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className={cn(
                    "shadow-lg rounded-xl",
                    isDark ? "border-slate-700 hover:bg-slate-800" : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 日志列表 */}
      <Card className={cn(
        "transition-all duration-300",
        isDark ? "bg-slate-800/80 border-slate-700/50" : "bg-white"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "text-gray-900")}>
              <Activity className="w-5 h-5" />
              日志列表
              <span className={cn(
                "text-sm font-normal ml-2",
                isDark ? "text-slate-400" : "text-gray-500"
              )}>
                共 {total} 条记录
              </span>
            </CardTitle>
            {selectedLogs.length > 0 && (
              <Button
                onClick={handleBatchDelete}
                variant="outline"
                className={cn(
                  "shadow-lg rounded-xl text-red-500",
                  isDark ? "border-red-700 hover:bg-red-900/20" : "border-red-200 hover:bg-red-50"
                )}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除选中 ({selectedLogs.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className={cn("text-lg", isDark ? "text-slate-400" : "text-gray-500")}>
                加载中...
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <div className={cn("text-lg", isDark ? "text-slate-400" : "text-gray-500")}>
                暂无日志记录
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 表头 */}
              <div className={cn(
                "grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium border-b",
                isDark ? "text-slate-400 border-slate-700" : "text-gray-500 border-gray-200"
              )}>
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLogs.length === logs.length && logs.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </div>
                <div className="col-span-2">用户</div>
                <div className="col-span-1">操作</div>
                <div className="col-span-1">模块</div>
                <div className="col-span-4">描述</div>
                <div className="col-span-2">时间</div>
                <div className="col-span-1">操作</div>
              </div>

              {/* 日志项 */}
              {logs.map(log => (
                <div
                  key={log.id}
                  className={cn(
                    "grid grid-cols-12 gap-4 px-4 py-3 rounded-lg transition-colors",
                    isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-50"
                  )}
                >
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLogs.includes(log.id)}
                      onChange={() => toggleSelectLog(log.id)}
                      className="rounded"
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isDark ? "bg-cyan-500/20" : "bg-blue-100"
                    )}>
                      <User className={cn("w-4 h-4", isDark ? "text-cyan-400" : "text-blue-600")} />
                    </div>
                    <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                      {log.username}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className={cn("font-medium", getActionColor(log.action))}>
                      {log.action}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getModuleColor(log.module))}>
                      {log.module}
                    </span>
                  </div>
                  <div className={cn("col-span-4 flex items-center", isDark ? "text-slate-300" : "text-gray-700")}>
                    {log.description}
                  </div>
                  <div className={cn("col-span-2 flex items-center text-sm", isDark ? "text-slate-400" : "text-gray-500")}>
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(log.createdAt)}
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Button
                      onClick={() => {
                        setDeleteLogId(log.id)
                        setShowDeleteDialog(true)
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>
                第 {page} 页，共 {totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                  className={cn(
                    "rounded-lg",
                    isDark ? "border-slate-700 hover:bg-slate-800" : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  上一页
                </Button>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                  className={cn(
                    "rounded-lg",
                    isDark ? "border-slate-700 hover:bg-slate-800" : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeleteLogId(null)
        }}
        onConfirm={handleDelete}
        title="删除日志"
        message="确定要删除这条日志吗？此操作不可撤销。"
      />

      {/* 清空确认对话框 */}
      <ConfirmDialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAll}
        title="清空日志"
        message="确定要清空所有日志吗？此操作不可撤销。"
      />
    </div>
  )
}