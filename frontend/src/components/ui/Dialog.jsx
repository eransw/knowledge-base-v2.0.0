import { X } from 'lucide-react'
import { Button } from './button'
import { useTheme } from '../../context/ThemeContext'

export function Dialog({ open, onClose, title, children, confirmText = '确定', cancelText = '取消', onConfirm, danger = false }) {
  const { isDark } = useTheme()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={cn(
        "relative rounded-2xl shadow-2xl w-full max-w-md transform transition-all",
        isDark 
          ? "bg-slate-800 border border-slate-700/50" 
          : "bg-white border border-gray-100"
      )}>
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          isDark ? "border-slate-700/50" : "border-gray-100"
        )}>
          <h3 className={cn("text-lg font-semibold", isDark ? "text-slate-100" : "text-gray-900")}>{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn("h-8 w-8 -mr-2", isDark ? "text-slate-400 hover:text-slate-200" : "")}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="px-6 py-5">
          <p className={cn(isDark ? "text-slate-300" : "text-gray-600")}>{children}</p>
        </div>
        <div className={cn(
          "flex items-center justify-end gap-3 px-6 py-4 border-t",
          isDark ? "border-slate-700/50" : "border-gray-100"
        )}>
          <Button variant="outline" onClick={onClose} className={isDark ? "border-slate-600/50 text-white hover:bg-slate-700/50" : ""}>
            {cancelText}
          </Button>
          <Button 
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cn(
              danger ? 'bg-red-600 hover:bg-red-700 text-white' : '',
              !danger && isDark && "bg-slate-700 hover:bg-slate-600 text-white"
            )}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}