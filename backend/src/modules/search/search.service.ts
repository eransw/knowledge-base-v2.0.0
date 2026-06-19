import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './system-config.entity';
import * as fs from 'fs';
import * as mammoth from 'mammoth';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse: any = require('pdf-parse');
import OpenAI from 'openai';

export interface DocumentIndex {
  id: string;
  title: string;
  content: string;
  description: string;
  categoryId: number;
  categoryName: string;
  tags: string[];
  attachments: AttachmentIndex[];
  noteContent: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface AttachmentIndex {
  id: number;
  filename: string;
  originalFilename: string;
  fileType: string;
  content: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  description: string;
  categoryName: string;
  tags: string[];
  score: number;
  highlights: {
    title?: string[];
    content?: string[];
    noteContent?: string[];
  };
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private esClient: Client | null = null;
  private readonly indexName = 'knowledge_base_documents';

  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async onModuleInit() {
    await this.initElasticsearch();
  }

  private async initElasticsearch() {
    try {
      this.esClient = new Client({
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      });

      const health = await this.esClient.cluster.health();
      this.logger.log(`Elasticsearch connected: ${health.cluster_name}`);

      await this.createIndexIfNotExists();
    } catch (error) {
      this.logger.warn('Elasticsearch not available, search features disabled');
      this.logger.error('Elasticsearch init error:', error instanceof Error ? error.message : String(error));
      this.esClient = null;
    }
  }

  private async createIndexIfNotExists() {
    if (!this.esClient) return;

    const exists = await this.esClient.indices.exists({ index: this.indexName });
    
    if (!exists) {
      await this.esClient.indices.create({
        index: this.indexName,
        settings: {
          analysis: {
            analyzer: {
              chinese_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'cjk_width'],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { 
              type: 'text', 
              analyzer: 'standard',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            content: { type: 'text', analyzer: 'standard' },
            description: { type: 'text', analyzer: 'standard' },
            categoryId: { type: 'integer' },
            categoryName: { type: 'keyword' },
            tags: { type: 'keyword' },
            attachments: {
              type: 'nested',
              properties: {
                id: { type: 'integer' },
                filename: { type: 'keyword' },
                originalFilename: { type: 'text' },
                fileType: { type: 'keyword' },
                content: { type: 'text', analyzer: 'standard' },
              },
            },
            noteContent: { type: 'text', analyzer: 'standard' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            userId: { type: 'integer' },
          },
        },
      });
      this.logger.log('Elasticsearch index created');
    }
  }

  async indexDocument(document: DocumentIndex): Promise<void> {
    if (!this.esClient) {
      this.logger.warn('Elasticsearch not available, skipping indexing');
      return;
    }

    try {
      await this.esClient.index({
        index: this.indexName,
        id: document.id,
        document: document,
      });
      this.logger.log(`Document indexed: ${document.id}`);
    } catch (error) {
      this.logger.error(`Failed to index document ${document.id}:`, error);
      throw error;
    }
  }

  async removeDocument(documentId: string): Promise<void> {
    if (!this.esClient) return;

    try {
      await this.esClient.delete({
        index: this.indexName,
        id: documentId,
      });
    } catch (error) {
      this.logger.warn(`Failed to remove document ${documentId} from index`);
    }
  }

  async search(userId: number, keyword: string, categoryId?: number): Promise<SearchResult[]> {
    if (!this.esClient) {
      this.logger.warn('Elasticsearch not available');
      return [];
    }

    const must: any[] = [
      { term: { userId: userId } },
    ];

    if (categoryId) {
      must.push({ term: { categoryId: categoryId } });
    }

    try {
      const result = await this.esClient.search({
        index: this.indexName,
        query: {
          bool: {
            must: must,
            should: [
              {
                multi_match: {
                  query: keyword,
                  fields: ['title^3', 'content^2', 'description', 'noteContent', 'tags^2'],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                },
              },
              {
                nested: {
                  path: 'attachments',
                  query: {
                    match: {
                      'attachments.content': keyword,
                    },
                  },
                  inner_hits: {
                    highlight: {
                      pre_tags: ['<span class="search-highlight">'],
                      post_tags: ['</span>'],
                      fields: {
                        'attachments.content': {},
                      },
                    },
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
        highlight: {
          pre_tags: ['<span class="search-highlight">'],
          post_tags: ['</span>'],
          fields: {
            title: {},
            content: {},
            description: {},
            noteContent: {},
          },
        },
        size: 50,
      });

      return result.hits.hits.map((hit: any) => {
        // 提取附件高亮片段和文件名
        const attachmentHighlights: Array<{ name: string; highlight: string }> = [];
        if (hit.inner_hits?.attachments?.hits?.hits) {
          for (const innerHit of hit.inner_hits.attachments.hits.hits) {
            if (innerHit.highlight?.['attachments.content']) {
              attachmentHighlights.push({
                name: innerHit._source?.originalFilename || innerHit._source?.filename || '未知文件',
                highlight: innerHit.highlight['attachments.content'][0],
              });
            }
          }
        }

        return {
          id: hit._source.id,
          title: hit._source.title,
          content: hit._source.content,
          description: hit._source.description,
          categoryName: hit._source.categoryName,
          tags: hit._source.tags || [],
          score: hit._score,
          highlights: {
            title: hit.highlight?.title,
            content: hit.highlight?.content,
            description: hit.highlight?.description,
            noteContent: hit.highlight?.noteContent,
            attachments: attachmentHighlights,
          },
        };
      });
    } catch (error) {
      this.logger.error('Search failed:', error);
      return [];
    }
  }

  async extractTextFromAttachment(filePath: string, fileType: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      return '';
    }

    try {
      const fileTypeLower = fileType.toLowerCase();

      if (fileTypeLower.includes('pdf')) {
        return await this.extractTextFromPDF(filePath);
      }

      if (fileTypeLower.includes('docx') || fileTypeLower.includes('doc')) {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || '';
      }

      if (fileTypeLower.includes('txt') || fileTypeLower.includes('md') || fileTypeLower.includes('markdown')) {
        return fs.readFileSync(filePath, 'utf-8');
      }

      if (fileTypeLower.includes('html') || fileTypeLower.includes('htm')) {
        return fs.readFileSync(filePath, 'utf-8');
      }

      if (fileTypeLower.includes('mp3') || fileTypeLower.includes('mp4') || 
          fileTypeLower.includes('wav') || fileTypeLower.includes('m4a') ||
          fileTypeLower.includes('wma') || fileTypeLower.includes('aac')) {
        return await this.transcribeAudio(filePath);
      }

      return '';
    } catch (error) {
      this.logger.error(`Failed to extract text from ${filePath}:`, error);
      return '';
    }
  }

  private async transcribeAudio(filePath: string): Promise<string> {
    // 尝试国内语音识别服务
    const aliyunKey = await this.getConfig('ALIYUN_ASR_KEY');
    if (aliyunKey) {
      try {
        return await this.transcribeWithAliyun(filePath, aliyunKey);
      } catch (error) {
        this.logger.warn('Aliyun ASR failed, trying other providers');
      }
    }

    const tencentKey = await this.getConfig('TENCENT_ASR_KEY');
    if (tencentKey) {
      try {
        return await this.transcribeWithTencent(filePath, tencentKey);
      } catch (error) {
        this.logger.warn('Tencent ASR failed, trying other providers');
      }
    }

    // 尝试 OpenAI Whisper
    const openaiKey = await this.getConfig('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(filePath),
          model: 'whisper-1',
          language: 'zh',
        });
        return transcription.text || '';
      } catch (error) {
        this.logger.error('OpenAI Whisper transcription failed:', error);
      }
    }

    this.logger.warn('No speech recognition service configured');
    return '';
  }

  private async transcribeWithAliyun(filePath: string, apiKey: string): Promise<string> {
    try {
      // 阿里云语音识别 API
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      
      const response = await fetch('https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/asr', {
        method: 'POST',
        headers: {
          'X-NLS-Token': apiKey,
          ...form.getHeaders(),
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Aliyun ASR API error: ${response.status}`);
      }

      const data = await response.json();
      return data.result || '';
    } catch (error) {
      this.logger.error('Aliyun ASR failed:', error);
      throw error;
    }
  }

  private async transcribeWithTencent(filePath: string, apiKey: string): Promise<string> {
    try {
      // 腾讯云语音识别 API
      const FormData = require('form-data');
      const form = new FormData();
      form.append('EngineModelType', '16k_zh');
      form.append('VoiceFile', fs.createReadStream(filePath));
      
      const response = await fetch('https://asr.tencentcloudapi.com/?Action=SentenceRecognition', {
        method: 'POST',
        headers: {
          'Authorization': `TC3-HMAC-SHA256 ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EngineModelType: '16k_zh',
          VoiceFile: fs.readFileSync(filePath).toString('base64'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Tencent ASR API error: ${response.status}`);
      }

      const data = await response.json();
      return data.Response?.Result || '';
    } catch (error) {
      this.logger.error('Tencent ASR failed:', error);
      throw error;
    }
  }

  async extractTextFromPDF(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      return '';
    }

    try {
      const doubaoApiKey = await this.getConfig('DOUBAO_API_KEY');
      const doubaoAppId = await this.getConfig('DOUBAO_APP_ID');

      if (doubaoApiKey && doubaoAppId) {
        return await this.extractTextWithDoubaoOCR(filePath, doubaoApiKey, doubaoAppId);
      }

      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text || '';
    } catch (error) {
      this.logger.error('PDF extraction failed:', error);
      return '';
    }
  }

  private async extractTextWithDoubaoOCR(filePath: string, apiKey: string, appId: string): Promise<string> {
    try {
      const response = await fetch('https://visual.volcengine.com/api/v1/ocr/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Access-Key': apiKey,
        },
        body: JSON.stringify({
          image_base64: fs.readFileSync(filePath).toString('base64'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Doubao OCR API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.data && data.data.text_regions) {
        return data.data.text_regions.map((r: any) => r.text).join('\n');
      }

      return '';
    } catch (error) {
      this.logger.error('Doubao OCR failed:', error);
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text || '';
    }
  }

  async getConfig(key: string): Promise<string | null> {
    const config = await this.systemConfigRepository.findOne({ where: { key } });
    return config?.value || process.env[key] || null;
  }

  async setConfig(key: string, value: string, description?: string): Promise<void> {
    let config = await this.systemConfigRepository.findOne({ where: { key } });
    
    if (config) {
      config.value = value;
      if (description) config.description = description;
    } else {
      config = this.systemConfigRepository.create({ key, value, description });
    }
    
    await this.systemConfigRepository.save(config);
  }

  async getAllConfigs(): Promise<SystemConfig[]> {
    return this.systemConfigRepository.find({
      where: [
        { key: 'OPENAI_API_KEY' },
        { key: 'ALIYUN_ASR_KEY' },
        { key: 'TENCENT_ASR_KEY' },
        { key: 'DOUBAO_API_KEY' },
        { key: 'DOUBAO_APP_ID' },
        { key: 'ELASTICSEARCH_URL' },
      ],
    });
  }

  async getIndexStats(): Promise<any> {
    if (!this.esClient) {
      return { status: 'not_connected' };
    }

    try {
      const count = await this.esClient.count({ index: this.indexName });
      return {
        status: 'connected',
        documentCount: count.count,
        indexName: this.indexName,
      };
    } catch (error) {
      return { status: 'error', error: (error as Error).message };
    }
  }
}