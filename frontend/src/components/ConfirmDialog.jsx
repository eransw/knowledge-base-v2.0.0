// /Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/components/ConfirmDialog.jsx
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  const { isDark } = useTheme()
  
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={cn("w-full max-w-sm shadow-2xl", isDark ? "bg-slate-800/95 border-slate-700/50" : "bg-white")}>
        <CardHeader className={cn(isDark ? "border-b border-slate-700/40" : "border-b border-gray-200")}>
          <CardTitle className={cn("text-lg", isDark ? "text-slate-100" : "text-gray-900")}>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p 
            className={cn("mb-4", isDark ? "text-slate-300" : "text-gray-600")}
            dangerouslySetInnerHTML={{ __html: message }}
          />
          <div className="flex gap-3">
            <Button variant="outline" className={cn("flex-1", isDark ? "border-slate-600/50 hover:bg-slate-700/30 text-white" : "")} onClick={onClose}>
              取消
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleConfirm}>
              确认
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
