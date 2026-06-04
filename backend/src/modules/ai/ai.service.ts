import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentService } from '../document/document.service';
import { Note } from '../note/note.entity';

// 国内AI模型预设配置
const MODEL_PRESETS = {
  'openai-gpt4o-mini': {
    name: 'OpenAI GPT-4o Mini',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    authType: 'bearer',
  },
  'doubao-pro': {
    name: '豆包 Pro',
    apiUrl: 'https://api.doubao.com/v1/chat/completions',
    model: 'Doubao-Pro',
    authType: 'bearer',
  },
  'ark-doubao-seed': {
    name: '火山方舟-豆包 Seed',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-seed-1-8-251228',
    authType: 'volc-aksk', // 火山AK/SK认证
  },
  'ernie-4.0': {
    name: '文心一言 4.0',
    apiUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro',
    model: 'ERNIE-4.0',
    authType: 'api-key',
  },
  'xinghuo-v3': {
    name: '讯飞星火 V3',
    apiUrl: 'https://spark-api.xf-yun.com/v3.5/chat/completions',
    model: 'generalv3.5',
    authType: 'bearer',
  },
  'qwen-max': {
    name: '通义千问 Max',
    apiUrl: 'https://dashscope.aliyuncs.com/api/text/v1/chat/completions',
    model: 'qwen-max',
    authType: 'bearer',
  },
  'deepseek-chat': {
    name: 'DeepSeek Chat',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    authType: 'bearer',
  },
};

@Injectable()
export class AiService {
  private config = {
    apiKey: '',
    apiSecret: '', // 火山AK/SK认证需要的SecretKey
    apiUrl: 'https://api.doubao.com/v1/chat/completions',
    model: 'Doubao-Pro',
    temperature: 0.7,
    maxTokens: 2000,
    provider: 'doubao-pro',
    authType: 'bearer',
    mockMode: false, // 模拟模式，用于测试
  };

  constructor(
    private readonly documentService: DocumentService,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async getConfig() {
    return { ...this.config, presets: MODEL_PRESETS };
  }

  async updateConfig(newConfig: any) {
    // 如果选择了预设模型，应用预设配置
    if (newConfig.provider && MODEL_PRESETS[newConfig.provider]) {
      const preset = MODEL_PRESETS[newConfig.provider];
      this.config = {
        ...this.config,
        ...preset,
        apiKey: newConfig.apiKey || this.config.apiKey,
        apiSecret: newConfig.apiSecret || this.config.apiSecret, // 保存SecretKey
        temperature: newConfig.temperature !== undefined ? newConfig.temperature : this.config.temperature,
        maxTokens: newConfig.maxTokens !== undefined ? newConfig.maxTokens : this.config.maxTokens,
        provider: newConfig.provider,
        mockMode: newConfig.mockMode !== undefined ? newConfig.mockMode : this.config.mockMode,
      };
    } else {
      this.config = { ...this.config, ...newConfig };
    }
    return this.config;
  }

  async getAllSystemData() {
    const documents = await this.documentService.findAll();
    const notes = await this.noteRepository.find();

    let context = '';

    if (documents.length > 0) {
      context += '系统文档内容：\n';
      documents.forEach(doc => {
        context += `标题: ${doc.title}\n描述: ${doc.description || '无'}\n\n`;
      });
    }

    if (notes.length > 0) {
      context += '\n系统笔记内容：\n';
      notes.forEach(note => {
        context += `笔记ID: ${note.documentId}\n内容摘要: ${note.content?.substring(0, 500) || '无'}\n\n`;
      });
    }

    return context;
  }

  async chat(question: string, documentId?: string) {
    const systemData = await this.getAllSystemData();

    const messages = [
      {
        role: 'system',
        content: `你是一个智能助手，基于以下系统数据回答问题：\n\n${systemData}\n\n请根据以上数据回答用户问题，如果数据中没有相关信息，请明确说明。`,
      },
      {
        role: 'user',
        content: question,
      },
    ];

    try {
      // 模拟模式：返回预设回复用于测试
      if (this.config.mockMode) {
        const mockAnswers = [
          `这是一个模拟回答。您问的是："${question}"\n\n系统已成功收集到以下数据：\n- 文档数量: ${(await this.documentService.findAll()).length}\n- 笔记数量: ${(await this.noteRepository.find()).length}\n\n如果配置了真实的AI模型，这里将显示基于系统数据的智能回答。`,
          `模拟模式已启用。您的问题 "${question}" 已收到。\n\n在实际使用中，系统会：\n1. 收集所有文档和笔记数据\n2. 将数据作为上下文发送给AI模型\n3. 返回基于系统数据的精准回答\n\n请在AI配置页面关闭模拟模式并配置真实的API密钥。`,
          `测试回复：您的问题是 "${question}"\n\n系统数据已准备就绪，包含文档和笔记信息。启用真实AI模型后，将为您提供智能问答服务。`,
        ];
        const randomIndex = Math.floor(Math.random() * mockAnswers.length);
        return {
          success: true,
          answer: mockAnswers[randomIndex],
        };
      }

      if (!this.config.apiKey) {
        return {
          success: false,
          message: '请先配置AI大模型API密钥',
        };
      }

      // 构建请求体
      let body: Record<string, any> = {
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // 根据认证类型设置请求头
      if (this.config.authType === 'bearer') {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      } else if (this.config.authType === 'volc-aksk') {
        // 火山AK/SK认证：使用HMAC-SHA256签名
        const urlObj = new URL(this.config.apiUrl);
        const host = urlObj.hostname;
        const path = urlObj.pathname;
        const now = new Date();
        const xDate = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
        
        // 构造待签名字符串
        const stringToSign = `POST\n${path}\n${xDate}\n${host}\n${JSON.stringify(body)}`;
        
        // 使用HMAC-SHA256签名
        const crypto = require('crypto');
        const signature = crypto
          .createHmac('sha256', this.config.apiSecret)
          .update(stringToSign, 'utf8')
          .digest('base64');
        
        headers['Authorization'] = `HMAC-SHA256 Credential=${this.config.apiKey}, SignedHeaders=host;x-date, Signature=${signature}`;
        headers['X-Date'] = xDate;
      }

      // 文心一言特殊处理
      if (this.config.provider === 'ernie-4.0') {
        body = {
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          api_key: this.config.apiKey,
        };
      }

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        let answer = '';
        // 处理不同API的返回格式
        if (data.choices && data.choices[0]?.message?.content) {
          answer = data.choices[0].message.content;
        } else if (data.result) {
          answer = data.result;
        } else if (data.response) {
          answer = data.response;
        } else {
          answer = JSON.stringify(data);
        }
        return {
          success: true,
          answer,
        };
      } else {
        return {
          success: false,
          message: data.error?.message || data.msg || 'AI服务调用失败',
        };
      }
    } catch (error: any) {
      let errorMessage = error.message || '网络请求失败';
      // 提供更明确的错误提示
      if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
        errorMessage = '无法连接到AI服务，请检查网络连接或尝试切换网络';
      } else if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'AI服务拒绝连接，请稍后重试';
      } else if (errorMessage.includes('ETIMEDOUT')) {
        errorMessage = '连接超时，请检查网络或稍后重试';
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // 火山AK/SK签名生成函数
  private generateVolcSignature(
    accessKey: string,
    secretKey: string,
    url: string,
    body: string,
  ): { authorization: string; xDate: string } {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname;
    const now = new Date();
    const xDate = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
    
    // 火山方舟签名格式：按UTF-8编码计算HMAC-SHA256
    // 签名串格式: HTTPMethod + "\n" + URI + "\n" + Date + "\n" + Host + "\n" + Body
    const stringToSign = `POST\n${path}\n${xDate}\n${host}\n${body}`;
    
    // 使用HMAC-SHA256签名
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(stringToSign, 'utf8')
      .digest('base64');
    
    const authorization = `HMAC-SHA256 Credential=${accessKey}, SignedHeaders=host;x-date, Signature=${signature}`;
    
    return { authorization, xDate };
  }
}