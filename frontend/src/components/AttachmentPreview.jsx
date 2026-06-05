import { Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { useMediaUrl } from '../hooks/useMediaUrl';

export default function AttachmentPreview({ attachment, isDark }) {
  const { url, loading } = useMediaUrl(attachment.id, attachment.fileType?.includes('pdf') ? 'preview' : 'download');

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

  return null;
}