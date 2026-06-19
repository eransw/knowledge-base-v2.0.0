import { Play, FileText, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useMediaUrl } from '../hooks/useMediaUrl';
import { useState, useEffect, useCallback } from 'react';
import mammoth from 'mammoth';

export default function AttachmentPreview({ attachment, isDark, onEdit }) {
  const { url, loading } = useMediaUrl(attachment.id, attachment.fileType?.includes('pdf') ? 'preview' : 'download');
  const [docxContent, setDocxContent] = useState(null);
  const [docxLoading, setDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState(null);

  const loadDocxContent = useCallback(async () => {
    if (!attachment.fileType?.includes('docx')) return;
    
    setDocxLoading(true);
    setDocxError(null);
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocxContent(result.value);
    } catch (error) {
      console.error('Failed to parse DOCX:', error);
      setDocxError('无法解析DOCX文件');
    } finally {
      setDocxLoading(false);
    }
  }, [url, attachment.fileType]);

  useEffect(() => {
    if (attachment.fileType?.includes('docx')) {
      loadDocxContent();
    }
  }, [loadDocxContent]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 视频预览
  if (attachment.fileType?.includes('video')) {
    return (
      <div className="relative w-full max-h-88 bg-slate-900 rounded-xl overflow-hidden">
        <video
          controls
          className="w-full h-full"
          src={url}
          poster=""
          onPlay={(e) => {
            e.target.parentElement.querySelector('.video-overlay')?.classList.add('opacity-0');
            setTimeout(() => {
              e.target.parentElement.querySelector('.video-overlay')?.classList.add('pointer-events-none');
            }, 300);
          }}
          onPause={(e) => {
            e.target.parentElement.querySelector('.video-overlay')?.classList.remove('opacity-0', 'pointer-events-none');
          }}
        >
          您的浏览器不支持视频播放
        </video>
        <div
          className="video-overlay absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/50 via-black/20 to-transparent transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            const video = e.currentTarget.parentElement.querySelector('video');
            if (video) {
              video.play();
            }
          }}
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20">
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>
    );
  }

  // 音频预览
  if (attachment.fileType?.includes('audio')) {
    return (
      <div className="p-4">
        <audio
          controls
          className="w-full rounded-xl bg-slate-800/50"
          src={url}
        />
      </div>
    );
  }

  // 图片预览
  if (attachment.fileType?.includes('image')) {
    return (
      <div className="p-4">
        <img
          src={url}
          alt={attachment.originalFilename}
          className="max-w-full h-auto rounded-xl"
          style={{ maxHeight: '500px', objectFit: 'contain' }}
        />
      </div>
    );
  }

  // PDF预览
  if (attachment.fileType?.includes('pdf')) {
    return (
      <div className="p-4">
        <object
          data={url}
          type="application/pdf"
          className="w-full"
          style={{
            height: '765px',
            minHeight: '600px',
            maxHeight: '1000px',
            aspectRatio: '4/3'
          }}
        >
          <p className={cn("text-center py-8", isDark ? "text-slate-400" : "text-gray-400")}>您的浏览器不支持PDF预览，请点击下载按钮下载查看。</p>
        </object>
      </div>
    );
  }

  // DOCX预览
  if (attachment.fileType?.includes('docx')) {
    return (
      <div className="p-4">
        {docxLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : docxError ? (
          <div className={cn("p-8 text-center", isDark ? "text-slate-400" : "text-gray-400")}>
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{docxError}</p>
            <p className="text-sm mt-2">请点击下载按钮下载查看</p>
          </div>
        ) : (
          <div className={cn("rounded-xl p-6 max-h-[600px] overflow-auto", isDark ? "bg-slate-700/30" : "bg-gray-50")}>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: docxContent }} />
          </div>
        )}
        {onEdit && docxContent && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onEdit(docxContent)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isDark
                  ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
              )}
            >
              <Edit2 className="w-4 h-4" />
              编辑文档内容
            </button>
          </div>
        )}
      </div>
    );
  }

  // DOC预览（提示下载）
  if (attachment.fileType?.includes('doc') && !attachment.fileType?.includes('docx')) {
    return (
      <div className="p-8 text-center">
        <FileText className={cn("w-12 h-12 mx-auto mb-4", isDark ? "text-slate-500" : "text-gray-400")} />
        <p className={cn("mb-2", isDark ? "text-slate-300" : "text-gray-600")}>DOC格式文件不支持在线预览</p>
        <p className={cn("text-sm", isDark ? "text-slate-500" : "text-gray-400")}>请点击下载按钮下载后使用Office软件查看和编辑</p>
      </div>
    );
  }

  return null;
}