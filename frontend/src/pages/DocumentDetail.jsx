import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, FolderOpen, Tag, Calendar, FileText } from 'lucide-react'

export default function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)

  useEffect(() => {
    fetchDocument()
  }, [id])

  async function fetchDocument() {
    try {
      const response = await axios.get(`/api/documents/${id}`)
      setDocument(response.data)
    } catch (error) {
      console.error('Failed to fetch document:', error)
    }
  }

  if (!document) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  const fileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-600'
    if (fileType.includes('word') || fileType.includes('docx')) return 'bg-blue-100 text-blue-600'
    if (fileType.includes('markdown') || fileType.includes('text')) return 'bg-green-100 text-green-600'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/documents')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        返回文档列表
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${fileIcon(document.fileType)}`}>
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{document.title}</h1>
              <p className="text-gray-500 mt-1">{document.originalFilename}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            {document.category && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                <FolderOpen className="w-4 h-4" />
                {document.category.name}
              </span>
            )}
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 rounded-full">
              <Calendar className="w-4 h-4" />
              {new Date(document.createdAt).toLocaleString()}
            </span>
          </div>

          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {document.tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm"
                >
                  <Tag className="w-4 h-4" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">文档内容</h2>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
              {document.content || '文档内容为空'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
