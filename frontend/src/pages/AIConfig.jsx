import { useState, useEffect } from 'react';
import { Bot, Save, RefreshCw, CheckCircle, Globe, Zap, Cloud } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { cardClass, textClass, inputClass } from '../lib/themeStyles';
import axios from 'axios';

export default function AIConfig() {
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
  
  const [config, setConfig] = useState({
    apiKey: '',
    apiSecret: '', // 火山AK/SK认证需要的SecretKey
    apiUrl: 'https://api.doubao.com/v1/chat/completions',
    model: 'Doubao-Pro',
    temperature: 0.7,
    maxTokens: 2000,
    provider: 'doubao-pro',
    mockMode: false,
  });
  const [presets, setPresets] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await axios.get('/api/ai/config');
      const data = response.data;
      setPresets(data.presets || {});
      delete data.presets;
      setConfig(data);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await axios.put('/api/ai/config', config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('保存配置失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = (provider) => {
    const preset = presets[provider];
    if (preset) {
      setConfig(prev => ({
        ...prev,
        provider,
        apiUrl: preset.apiUrl,
        model: preset.model,
      }));
    }
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: key === 'temperature' ? parseFloat(value) : key === 'maxTokens' ? parseInt(value) : key === 'mockMode' ? Boolean(value) : value,
    }));
  };

  const providerOptions = [
    { id: 'doubao-pro', name: '豆包 Pro', icon: Globe, color: 'bg-green-100 text-green-700', desc: '字节跳动出品，国内访问稳定' },
    { id: 'ark-doubao-seed', name: '火山方舟-豆包 Seed', icon: Zap, color: 'bg-red-100 text-red-700', desc: '火山方舟平台，支持多种模型' },
    { id: 'ernie-4.0', name: '文心一言 4.0', icon: Cloud, color: 'bg-blue-100 text-blue-700', desc: '百度出品，中文理解优秀' },
    { id: 'xinghuo-v3', name: '讯飞星火 V3', icon: Globe, color: 'bg-orange-100 text-orange-700', desc: '科大讯飞出品，语音能力强' },
    { id: 'qwen-max', name: '通义千问 Max', icon: Zap, color: 'bg-purple-100 text-purple-700', desc: '阿里巴巴出品，多模态能力' },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', icon: Globe, color: 'bg-indigo-100 text-indigo-700', desc: '深度求索，开源模型领先' },
    { id: 'openai-gpt4o-mini', name: 'OpenAI GPT-4o Mini', icon: Cloud, color: { dark: 'bg-slate-700 text-slate-300', light: 'bg-gray-100 text-gray-700' }, desc: '国际领先，需要海外网络' },
  ];

  const getProviderInfo = (id) => providerOptions.find(p => p.id === id);

  return (
    <div className={cn("max-w-2xl mx-auto", 
      isDark 
        ? isSpecialTheme
          ? cn("bg-gradient-to-br", gradientColors.from, gradientColors.via, gradientColors.to, "min-h-screen p-6")
          : "bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900 min-h-screen p-6" 
        : "bg-gradient-to-br from-white via-gray-50 to-blue-50 min-h-screen p-6")}>
      <Card className={cn(cardClass(isDark), isSpecialTheme ? cardColors.shadow : "shadow-lg")}>
        <CardHeader className={cn(
          "transition-colors",
          isDark 
            ? isSpecialTheme
              ? cn("bg-gradient-to-r", `from-${gradientColors.accent}-900/80`, `to-${gradientColors.accent}-800/80`, "text-slate-100")
              : "bg-gradient-to-r from-blue-900/80 to-indigo-900/80 text-slate-100" 
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
        )}>
          <CardTitle className="flex items-center gap-3">
            <Bot className="w-6 h-6" />
            AI大模型配置
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("space-y-6", isSpecialTheme && cn("bg-gradient-to-br", cardColors.bgFrom, cardColors.bgTo))}>
          {/* 模型提供商选择 */}
          <div className="space-y-3">
            <Label className={textClass('secondary', isDark)}>选择AI模型</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {providerOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = config.provider === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleProviderChange(option.id)}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-left",
                      isSelected
                        ? isDark 
                          ? isSpecialTheme
                            ? cn('border', cardColors.border, `bg-${gradientColors.accent}-500/15`, `shadow-${gradientColors.accent}-500/20`)
                            : 'border-blue-500 bg-blue-500/15 shadow-md' 
                          : 'border-blue-500 bg-blue-50 shadow-md'
                        : isDark
                          ? 'border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-700/30' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                      typeof option.color === 'object' 
                        ? (isDark ? option.color.dark : option.color.light)
                        : option.color
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className={cn("font-medium text-sm", textClass('secondary', isDark))}>{option.name}</div>
                    <div className={cn("text-xs mt-1", textClass('muted', isDark))}>{option.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API密钥 */}
          <div className="space-y-2">
            <Label className={textClass('secondary', isDark)} htmlFor="apiKey">API密钥</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="请输入API密钥"
                className={cn("pr-24", inputClass(isDark))}
              />
              <button
                onClick={() => handleChange('apiKey', '')}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs transition-colors",
                  isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"
                )}
              >
                清空
              </button>
            </div>
            <p className={cn("text-xs", textClass('muted', isDark))}>
              {config.provider === 'doubao-pro' && '获取地址：https://www.doubao.com/'}
              {config.provider === 'ark-doubao-seed' && '获取地址：https://console.bytedance.net/ark'}
              {config.provider === 'ernie-4.0' && '获取地址：https://console.bce.baidu.com/qianfan/'}
              {config.provider === 'xinghuo-v3' && '获取地址：https://console.xfyun.cn/services/bm35'}
              {config.provider === 'qwen-max' && '获取地址：https://dashscope.aliyun.com/'}
              {config.provider === 'openai-gpt4o-mini' && '获取地址：https://platform.openai.com/api-keys'}
            </p>
          </div>

          {/* API Secret (火山AK/SK认证需要) */}
          {config.provider === 'ark-doubao-seed' && (
            <div className="space-y-2">
              <Label className={textClass('secondary', isDark)} htmlFor="apiSecret">API Secret (SecretKey)</Label>
              <div className="relative">
                <Input
                  id="apiSecret"
                  type="password"
                  value={config.apiSecret}
                  onChange={(e) => handleChange('apiSecret', e.target.value)}
                  placeholder="请输入SecretKey"
                  className={cn("pr-24", inputClass(isDark))}
                />
                <button
                  onClick={() => handleChange('apiSecret', '')}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs transition-colors",
                    isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  清空
                </button>
              </div>
              <p className={cn("text-xs", textClass('muted', isDark))}>
                火山方舟AK/SK认证需要配置SecretKey，与AccessKey配对使用
              </p>
            </div>
          )}

          {/* API地址 */}
          <div className="space-y-2">
            <Label className={textClass('secondary', isDark)} htmlFor="apiUrl">API地址</Label>
            <Input
              id="apiUrl"
              type="text"
              value={config.apiUrl}
              onChange={(e) => handleChange('apiUrl', e.target.value)}
              placeholder="API地址"
              className={inputClass(isDark)}
            />
            <p className={cn("text-xs", textClass('muted', isDark))}>
              当前选择的是 {getProviderInfo(config.provider)?.name} 的默认API地址
            </p>
          </div>

          {/* 模型名称 */}
          <div className="space-y-2">
            <Label className={textClass('secondary', isDark)} htmlFor="model">模型名称</Label>
            <Input
              id="model"
              type="text"
              value={config.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="模型名称"
              className={inputClass(isDark)}
            />
          </div>

          {/* 温度参数 */}
          <div className="space-y-2">
            <Label className={textClass('secondary', isDark)} htmlFor="temperature">温度 (Temperature)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={config.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
              className={inputClass(isDark)}
            />
            <p className={cn("text-xs", textClass('muted', isDark))}>
              控制回答的随机性，0表示确定性最高，2表示最随机
            </p>
          </div>

          {/* 最大Token数 */}
          <div className="space-y-2">
            <Label className={textClass('secondary', isDark)} htmlFor="maxTokens">最大Token数</Label>
            <Input
              id="maxTokens"
              type="number"
              min="100"
              max="4096"
              value={config.maxTokens}
              onChange={(e) => handleChange('maxTokens', e.target.value)}
              className={inputClass(isDark)}
            />
            <p className={cn("text-xs", textClass('muted', isDark))}>
              控制单次回答的最大长度，Token约等于单词数的1.33倍
            </p>
          </div>

          {/* 模拟模式开关 */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            isDark 
              ? "bg-amber-500/10 border border-amber-500/20" 
              : "bg-yellow-50"
          )}>
            <div>
              <div className={cn("font-medium", isDark ? "text-amber-300" : "text-yellow-800")}>模拟模式</div>
              <p className={cn("text-xs", isDark ? "text-amber-400/70" : "text-yellow-600")}>启用后不调用真实AI，用于测试功能</p>
            </div>
            <button
              onClick={() => handleChange('mockMode', !config.mockMode)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                config.mockMode 
                  ? isDark ? 'bg-amber-500' : 'bg-yellow-500'
                  : isDark ? 'bg-slate-600' : 'bg-gray-300'
              )}
            >
              <div
                className="w-5 h-5 bg-white rounded-full shadow transition-transform absolute top-0.5"
                style={{
                  transform: config.mockMode ? 'translateX(24px)' : 'translateX(2px)'
                }}
              />
            </button>
          </div>

          {/* 保存按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={loadConfig}
              variant="outline"
              className={cn("flex items-center gap-2", 
                isDark 
                  ? isSpecialTheme
                    ? cn(cardColors.border, `hover:bg-${gradientColors.accent}-500/10`, `text-${gradientColors.accent}-400`)
                    : "border-slate-600/50 hover:bg-slate-700/30 text-gray-200"
                  : "")}
            >
              <RefreshCw className="w-4 h-4" />
              重置
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !config.apiKey}
              className={cn("flex-1 flex items-center gap-2", 
                isDark && isSpecialTheme && 
                  cn("bg-gradient-to-r", cardColors.btnFrom, cardColors.btnVia, cardColors.btnTo, `shadow-lg shadow-${gradientColors.accent}-500/30`))}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  保存成功
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isLoading ? '保存中...' : '保存配置'}
                </>
              )}
            </Button>
          </div>

          {/* 使用说明 */}
          <div className={cn(
            "mt-6 p-4 rounded-lg",
            isDark 
              ? "bg-blue-500/10 border border-blue-500/20" 
              : "bg-blue-50"
          )}>
            <h3 className={cn("font-semibold mb-2", isDark ? "text-blue-300" : "text-blue-800")}>使用说明</h3>
            <ul className={cn("text-sm space-y-2", isDark ? "text-blue-400/80" : "text-blue-700")}>
              <li>• 配置完成后，AI问答功能将自动使用系统中的所有文档和笔记作为上下文</li>
              <li>• 推荐使用 <strong>{cn(isDark ? "text-blue-300" : "")}</strong>豆包 Pro{cn(isDark ? "</strong>" : "")}，国内访问稳定，响应速度快</li>
              <li>• 如需使用其他模型，请在上方选择对应的提供商并输入相应的API密钥</li>
              <li>• 温度参数越低，回答越准确；越高，回答越有创意</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}