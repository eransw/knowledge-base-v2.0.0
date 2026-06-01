// /Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/components/ConfirmDialog.jsx
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{message}</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
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
