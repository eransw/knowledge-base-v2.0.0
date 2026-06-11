import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, AtSign, Hash, Image, Settings, RefreshCw, Zap, FileText, Quote, Code, ExternalLink, Copy, Check, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import axios from '../api/axios';
import { useTheme } from '../context/ThemeContext';

export default function AIChat({ documentId }) {
  const { isDark, currentTheme } = useTheme();
  const isPolice = currentTheme === 'police';
  const isNight = currentTheme === 'night';
  const isCyber = currentTheme === 'cyber';
  const isPurple = currentTheme === 'purple';
  const isGreen = currentTheme === 'green';
  const isOrange = currentTheme === 'orange';
  const isPink = currentTheme === 'pink';
  const isSpecialTheme = isPolice || isNight || isCyber || isPurple || isGreen || isOrange || isPink;

  // 获取主题特定的主色调用于渐变和装饰
  const getGradientColors = () => {
    if (isPolice) return { from: 'from-[#0a1628]', via: 'via-[#0f1f3d]', to: 'to-[#0a1628]', accent: 'cyan', glow: '0,255,255' }
    if (isNight) return { from: 'from-[#0f0a1e]', via: 'via-[#1a1333]', to: 'to-[#251d47]', accent: 'violet', glow: '167,139,250' }
    if (isCyber) return { from: 'from-[#09090b]', via: 'via-[#18181b]', to: 'to-[#27272a]', accent: 'red', glow: '239,68,68' }
    if (isPurple) return { from: 'from-[#0f172a]', via: 'via-[#1e1b4b]', to: 'to-[#1e1b4b]', accent: 'purple', glow: '168,85,247' }
    if (isGreen) return { from: 'from-[#0f172a]', via: 'via-[#14532d]', to: 'to-[#14532d]', accent: 'green', glow: '34,197,94' }
    if (isOrange) return { from: 'from-[#0f172a]', via: 'via-[#7c2d12]', to: 'to-[#7c2d12]', accent: 'orange', glow: '249,115,22' }
    if (isPink) return { from: 'from-[#0f172a]', via: 'via-[#831843]', to: 'to-[#831843]', accent: 'pink', glow: '236,72,153' }
    return { from: 'from-slate-900', via: 'via-slate-800/50', to: 'to-indigo-950/50', accent: 'blue', glow: '59,130,246' }
  }
  const gradientColors = getGradientColors();

  // 获取主题特定的卡片样式
  const getCardColors = () => {
    if (isPolice) return { bgFrom: 'from-[#1a2f50]/95', bgTo: 'to-[#0f1f3d]/90', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/20', text: 'text-cyan-300', btnFrom: 'from-cyan-600', btnVia: 'via-blue-600', btnTo: 'to-cyan-500' }
    if (isNight) return { bgFrom: 'from-[#1a1333]/95', bgTo: 'to-[#251d47]/90', border: 'border-violet-500/30', shadow: 'shadow-violet-500/20', text: 'text-violet-300', btnFrom: 'from-violet-600', btnVia: 'via-purple-600', btnTo: 'to-violet-500' }
    if (isCyber) return { bgFrom: 'from-[#18181b]/95', bgTo: 'to-[#27272a]/90', border: 'border-red-500/30', shadow: 'shadow-red-500/20', text: 'text-red-300', btnFrom: 'from-red-600', btnVia: 'via-rose-600', btnTo: 'to-red-500' }
    if (isPurple) return { bgFrom: 'from-[#1e1b4b]/95', bgTo: 'to-[#0f172a]/90', border: 'border-purple-500/30', shadow: 'shadow-purple-500/20', text: 'text-purple-300', btnFrom: 'from-purple-600', btnVia: 'via-violet-600', btnTo: 'to-purple-500' }
    if (isGreen) return { bgFrom: 'from-[#14532d]/95', bgTo: 'to-[#0f172a]/90', border: 'border-green-500/30', shadow: 'shadow-green-500/20', text: 'text-green-300', btnFrom: 'from-green-600', btnVia: 'via-emerald-600', btnTo: 'to-green-500' }
    if (isOrange) return { bgFrom: 'from-[#7c2d12]/95', bgTo: 'to-[#0f172a]/90', border: 'border-orange-500/30', shadow: 'shadow-orange-500/20', text: 'text-orange-300', btnFrom: 'from-orange-600', btnVia: 'via-amber-600', btnTo: 'to-orange-500' }
    if (isPink) return { bgFrom: 'from-[#831843]/95', bgTo: 'to-[#0f172a]/90', border: 'border-pink-500/30', shadow: 'shadow-pink-500/20', text: 'text-pink-300', btnFrom: 'from-pink-600', btnVia: 'via-rose-600', btnTo: 'to-pink-500' }
    return { bgFrom: 'from-slate-800/95', bgTo: 'to-slate-700/90', border: 'border-slate-600/40', shadow: 'shadow-black/40', text: 'text-slate-300', btnFrom: 'from-blue-600', btnVia: 'via-indigo-600', btnTo: 'to-purple-600' }
  }
  const cardColors = getCardColors();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const scrollContainerRef = useRef(null);

  // 预设问题
  const presetQuestions = [
    '系统中有哪些文档？',
    '帮我总结一下这份文档',
    '有哪些相关的笔记？',
    '搜索与学习相关的内容',
    '分析文档中的关键信息',
    '提取文档中的重要数据',
  ];

  useEffect(() => {
    if (scrollContainerRef.current && messages.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        question: question.trim(),
        documentId,
      });

      const data = response.data;

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.success ? data.answer : `❌ ${data.message}`,
        thinking: data.thinking || null,
        sources: data.sources || [],
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ ${error.response?.data?.message || error.message || '网络请求失败'}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePresetQuestion = (preset) => {
    setQuestion(preset);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const renderMessageContent = (content) => {
    // 简单的Markdown渲染
    let htmlContent = content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/- (\[ \] [^\n]+)/g, '<div class="flex items-start gap-2"><span class="w-4 h-4 border-2 border-gray-500 rounded mt-0.5 flex-shrink-0"></span><span>$1</span></div>')
      .replace(/- (\[x\] [^\n]+)/g, '<div class="flex items-start gap-2"><span class="w-4 h-4 border-2 border-green-500 rounded mt-0.5 flex-shrink-0 bg-green-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></span><span>$1</span></div>')
      .replace(/&gt;&gt; ([^\n]+)/g, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-400">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      .replace(/\n/g, '<br>');
    
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  return (
    <div className={cn(
      "flex flex-col h-[500px] rounded-xl shadow-lg overflow-hidden border",
      isDark 
        ? isPolice
          ? "bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#0a1628] border-cyan-500/30 shadow-cyan-500/15"
          : "bg-gray-900 border-gray-700" 
        : "bg-white border-gray-200"
    )}>
      {/* 头部 */}
      <div className={cn(
        "px-4 py-3 border-b",
        isDark 
          ? isPolice
            ? "bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border-cyan-500/30"
            : "bg-gray-800 border-gray-700" 
          : "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shadow-md",
              isDark && isPolice
                ? "bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/40"
                : "bg-gradient-to-br from-blue-500 to-purple-600"
            )}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className={cn(
                "font-semibold",
                isDark ? "text-white" : "text-gray-800"
              )}>AI智能助手</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className={cn(
                  "text-xs",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>基于系统数据</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-all",
                isDark 
                  ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
              onClick={handleClearChat}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-all",
                isDark 
                  ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 预设问题 */}
      <div className={cn(
        "px-4 py-2 border-b",
        isDark 
          ? isPolice
            ? "bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-cyan-500/20"
            : "bg-gray-800/50 border-gray-700" 
          : "bg-gray-50/50 border-gray-200"
      )}>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetQuestion(preset)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1",
                isDark 
                  ? isPolice
                    ? "text-cyan-200 bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/30 hover:border-cyan-400/50"
                    : "text-gray-300 bg-gray-700/50 hover:bg-gray-700 border-gray-600 hover:border-gray-500" 
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-gray-400"
              )}
            >
              <Sparkles className="w-3 h-3" />
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 聊天记录 */}
      <div ref={scrollContainerRef} className={cn(
        "flex-1 overflow-y-auto p-4 space-y-4",
        isDark 
          ? isPolice
            ? "bg-gradient-to-br from-[#0a1628]/80 to-[#0f1f3d]/80"
            : "bg-gray-900" 
          : "bg-white"
      )}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-4 border",
              isDark && isPolice
                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 shadow-cyan-500/20"
                : "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30"
            )}>
              <Bot className={cn(
                "w-10 h-10",
                isDark && isPolice ? "text-cyan-400" : "text-blue-400"
              )} />
            </div>
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              isDark ? "text-white" : "text-gray-800"
            )}>您好！我是您的AI智能助手</h3>
            <p className={cn(
              "text-sm text-center max-w-[80%]",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              我可以基于系统中的文档和笔记为您解答问题。
              点击上方快捷问题，或输入您想了解的内容。
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <Zap className="w-4 h-4" />
              <span>支持智能问答、文档总结、内容搜索</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              style={{
                animation: 'fadeInUp 0.3s ease-out',
              }}
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
                msg.role === 'user'
                  ? isPolice
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-cyan-500/30'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                  : isPolice
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/30'
                    : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
              )}>
                {msg.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div
                className={`max-w-[85%] ${
                  msg.role === 'user'
                    ? 'flex flex-col items-end'
                    : 'flex flex-col items-start'
                }`}
              >
                <div className={cn(
                  "text-xs mb-1",
                  isDark ? isPolice ? "text-cyan-400/70" : "text-gray-500" : "text-gray-400"
                )}>
                  {msg.role === 'user' ? '我' : 'AI助手'}
                </div>
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user'
                      ? isPolice
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-md shadow-lg shadow-cyan-500/25'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-md shadow-md'
                      : isDark 
                        ? isPolice
                          ? 'bg-gradient-to-br from-[#1a2f50]/90 to-[#0f1f3d]/90 text-cyan-100 rounded-tl-md border border-cyan-500/20'
                          : 'bg-gray-800 text-gray-100 rounded-tl-md border border-gray-700'
                        : 'bg-gray-50 text-gray-800 rounded-tl-md border border-gray-200'
                  )}
                >
                  {renderMessageContent(msg.content)}
                </div>
                
                {/* 思考过程 */}
                {msg.thinking && (
                  <div className={cn(
                    "mt-2 p-3 rounded-lg border-l-2",
                    isDark 
                      ? "bg-gray-800/50 border-yellow-500" 
                      : "bg-yellow-50 border-yellow-400"
                  )}>
                    <div className={cn(
                      "flex items-center gap-2 text-xs mb-1",
                      isDark ? "text-yellow-400" : "text-yellow-600"
                    )}>
                      <MessageSquare className="w-3 h-3" />
                      <span>思考过程</span>
                    </div>
                    <p className={cn(
                      "text-xs",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>{msg.thinking}</p>
                  </div>
                )}
                
                {/* 来源引用 */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.sources.slice(0, 3).map((source, idx) => (
                      <div key={idx} className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-xs",
                        isDark 
                          ? "bg-gray-700/50 text-gray-400" 
                          : "bg-gray-100 text-gray-500"
                      )}>
                        <FileText className="w-3 h-3" />
                        <span className="max-w-[120px] truncate" title={source}>{source}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl",
            isDark ? "bg-gray-800" : "bg-gray-50"
          )}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className={cn(
                "text-xs",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>正在思考...</span>
            </div>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className={cn(
        "p-4 border-t",
        isDark 
          ? isPolice
            ? "bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border-cyan-500/30"
            : "bg-gray-800 border-gray-700" 
          : "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-end gap-3">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-9 h-9 transition-all",
                isDark 
                  ? isPolice
                    ? "text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              <AtSign className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-9 h-9 transition-all",
                isDark 
                  ? isPolice
                    ? "text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              <Hash className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-9 h-9 transition-all",
                isDark 
                  ? isPolice
                    ? "text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              <Image className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 relative">
            <Input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题..."
              disabled={isLoading}
              className={cn(
                "h-11 border placeholder focus:ring-2",
                isDark 
                  ? isPolice
                    ? "bg-[#1a2f50]/80 border-cyan-500/30 text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:ring-cyan-500/30"
                    : "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className={cn(
                "text-xs",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>Shift+Enter换行</span>
            </div>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !question.trim()}
            className="w-11 h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        {/* 功能提示 */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              支持代码块
            </span>
            <span className="flex items-center gap-1">
              <Quote className="w-3 h-3" />
              支持引用
            </span>
            <span className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              支持链接
            </span>
          </div>
          <span>智能问答基于系统文档</span>
        </div>
      </form>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .bg-gray-850 {
          background-color: rgb(30 30 30);
        }
        .bg-gray-750 {
          background-color: rgb(40 40 40);
        }
      `}</style>
    </div>
  );
}
