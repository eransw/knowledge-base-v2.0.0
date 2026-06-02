import { useState, useEffect } from 'react';
import { Bot, Save, RefreshCw, CheckCircle, Globe, Zap, Cloud } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import axios from 'axios';

export default function AIConfig() {
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
    { id: 'openai-gpt4o-mini', name: 'OpenAI GPT-4o Mini', icon: Cloud, color: 'bg-gray-100 text-gray-700', desc: '国际领先，需要海外网络' },
  ];

  const getProviderInfo = (id) => providerOptions.find(p => p.id === id);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-3">
            <Bot className="w-6 h-6" />
            AI大模型配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 模型提供商选择 */}
          <div className="space-y-3">
            <Label>选择AI模型</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {providerOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = config.provider === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleProviderChange(option.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${option.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="font-medium text-sm">{option.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API密钥 */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API密钥</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="请输入API密钥"
                className="pr-24"
              />
              <button
                onClick={() => handleChange('apiKey', '')}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                清空
              </button>
            </div>
            <p className="text-xs text-gray-500">
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
              <Label htmlFor="apiSecret">API Secret (SecretKey)</Label>
              <div className="relative">
                <Input
                  id="apiSecret"
                  type="password"
                  value={config.apiSecret}
                  onChange={(e) => handleChange('apiSecret', e.target.value)}
                  placeholder="请输入SecretKey"
                  className="pr-24"
                />
                <button
                  onClick={() => handleChange('apiSecret', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  清空
                </button>
              </div>
              <p className="text-xs text-gray-500">
                火山方舟AK/SK认证需要配置SecretKey，与AccessKey配对使用
              </p>
            </div>
          )}

          {/* API地址 */}
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API地址</Label>
            <Input
              id="apiUrl"
              type="text"
              value={config.apiUrl}
              onChange={(e) => handleChange('apiUrl', e.target.value)}
              placeholder="API地址"
            />
            <p className="text-xs text-gray-500">
              当前选择的是 {getProviderInfo(config.provider)?.name} 的默认API地址
            </p>
          </div>

          {/* 模型名称 */}
          <div className="space-y-2">
            <Label htmlFor="model">模型名称</Label>
            <Input
              id="model"
              type="text"
              value={config.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="模型名称"
            />
          </div>

          {/* 温度参数 */}
          <div className="space-y-2">
            <Label htmlFor="temperature">温度 (Temperature)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={config.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              控制回答的随机性，0表示确定性最高，2表示最随机
            </p>
          </div>

          {/* 最大Token数 */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens">最大Token数</Label>
            <Input
              id="maxTokens"
              type="number"
              min="100"
              max="4096"
              value={config.maxTokens}
              onChange={(e) => handleChange('maxTokens', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              控制单次回答的最大长度，Token约等于单词数的1.33倍
            </p>
          </div>

          {/* 模拟模式开关 */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div>
              <div className="font-medium text-yellow-800">模拟模式</div>
              <p className="text-xs text-yellow-600">启用后不调用真实AI，用于测试功能</p>
            </div>
            <button
              onClick={() => handleChange('mockMode', !config.mockMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.mockMode ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  config.mockMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 保存按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={loadConfig}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重置
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !config.apiKey}
              className="flex-1 flex items-center gap-2"
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">使用说明</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• 配置完成后，AI问答功能将自动使用系统中的所有文档和笔记作为上下文</li>
              <li>• 推荐使用 <strong>豆包 Pro</strong>，国内访问稳定，响应速度快</li>
              <li>• 如需使用其他模型，请在上方选择对应的提供商并输入相应的API密钥</li>
              <li>• 温度参数越低，回答越准确；越高，回答越有创意</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}