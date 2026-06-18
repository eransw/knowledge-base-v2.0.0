# 知识库管理系统 (Knowledge Base) - Code Wiki

## 项目概述

本项目是一个功能完善的知识库管理系统，采用前后端分离架构。前端使用 React + Vite + TailwindCSS 构建现代化用户界面，后端使用 NestJS 框架提供 RESTful API 服务。

**技术栈：**
- **前端**：React 19, Vite 6, TailwindCSS 3, TipTap (富文本编辑器), dnd-kit (拖拽), React Router 7
- **后端**：NestJS 11, TypeORM, SQLite (better-sqlite3), JWT 认证
- **AI集成**：支持多种国产大模型（豆包、文心一言、讯飞星火、通义千问、DeepSeek等）

---

## 目录结构

```
knowledge-base-v2.0.0/
├── backend/                    # 后端 NestJS 应用
│   ├── src/
│   │   ├── common/            # 公共模块
│   │   │   └── filters/       # 异常过滤器
│   │   │       └── http-exception.filter.ts
│   │   ├── modules/           # 功能模块
│   │   │   ├── auth/         # 认证模块
│   │   │   ├── document/     # 文档管理模块
│   │   │   ├── category/     # 分类管理模块
│   │   │   ├── tag/          # 标签管理模块
│   │   │   ├── note/         # 笔记模块
│   │   │   ├── role/         # 角色权限模块
│   │   │   ├── log/          # 日志模块
│   │   │   ├── config/       # 系统配置模块
│   │   │   └── ai/           # AI智能模块
│   │   ├── app.module.ts     # 根模块
│   │   └── main.ts           # 应用入口
│   └── package.json
│
├── frontend/                   # 前端 React 应用
│   ├── src/
│   │   ├── api/              # API 请求封装
│   │   │   └── axios.js
│   │   ├── components/        # 公共组件
│   │   │   ├── ui/           # UI基础组件
│   │   │   ├── Layout.jsx    # 页面布局组件
│   │   │   ├── AIChat.jsx    # AI聊天组件
│   │   │   └── ...
│   │   ├── context/           # React Context
│   │   │   ├── AuthContext.jsx    # 认证上下文
│   │   │   ├── ConfigContext.jsx # 配置上下文
│   │   │   └── ThemeContext.jsx   # 主题上下文
│   │   ├── hooks/            # 自定义Hooks
│   │   ├── lib/              # 工具库
│   │   ├── pages/            # 页面组件
│   │   │   ├── Login.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── Categories.jsx
│   │   │   └── ...
│   │   ├── config/           # 配置文件
│   │   │   └── themes.js     # 主题配置
│   │   ├── App.jsx           # 根组件
│   │   └── main.jsx          # 入口文件
│   └── package.json
│
└── document/                   # 项目文档
    └── framework.md
```

---

## 后端架构

### 核心模块

#### 1. AuthModule - 认证模块

**文件位置**：[backend/src/modules/auth/](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/auth/)

**模块组成**：
- [auth.module.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/auth/auth.module.ts) - 模块定义
- [auth.service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/auth/auth.service.ts) - 业务逻辑
- [auth.controller.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/auth/auth.controller.ts) - API接口
- [jwt.strategy.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/auth/jwt.strategy.ts) - JWT策略
- [user.entity.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/auth/user.entity.ts) - 用户实体
- [scheduled-tasks.service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/auth/scheduled-tasks.service.ts) - 定时任务

**主要功能**：
- 用户注册与登录
- JWT Token 生成与验证
- 密码加密存储 (bcrypt)
- 账户锁定机制（连续密码错误自动锁定）
- 用户权限管理
- 菜单排序自定义

**核心类说明**：

```typescript
// AuthService 关键方法
class AuthService {
  // 用户注册
  async register(registerDto: RegisterDto): Promise<any>

  // 用户登录（支持失败计数和账户锁定）
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{access_token, user}>

  // 更新用户主题
  async updateTheme(userId: number, theme: string): Promise<{success, message}>

  // 更新安全配置（锁定策略）
  async updateSecurityConfig(userId: number, config: SecurityConfig): Promise<any>

  // 获取所有用户
  async getAllUsers(): Promise<User[]>

  // 删除用户及其所有关联数据
  async deleteUser(userId: number): Promise<{success}>
}
```

```typescript
// User Entity
@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number
  @Column({ unique: true }) username: string
  @Column({ unique: true }) email: string
  @Column() password: string
  @Column({ default: 'police' }) theme: string

  // 安全配置
  @Column({ default: 3 }) maxFailedAttempts: number  // 最大失败次数
  @Column({ default: 2 }) lockDuration: number       // 锁定时长
  @Column({ default: 'hours' }) lockDurationUnit: string  // 锁定时长单位

  // 锁定状态
  @Column({ default: false }) isLocked: boolean
  @Column({ type: 'datetime', nullable: true }) lockedAt: Date
  @Column({ type: 'datetime', nullable: true }) lockExpireTime: Date
  @Column({ default: 0 }) failedAttempts: number
  @Column({ type: 'datetime', nullable: true }) lastFailedAttempt: Date

  @Column({ nullable: true }) roleId: number
  @ManyToOne(() => Role) role: Role
  @Column({ type: 'text', nullable: true }) menuOrder: string  // JSON格式的菜单排序
}
```

---

#### 2. DocumentModule - 文档管理模块

**文件位置**：[backend/src/modules/document/](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/document/)

**模块组成**：
- [document.module.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/document/document.module.ts)
- [document.service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/document/document.service.ts)
- [document.controller.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/document/document.controller.ts)
- [document.entity.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/document/document.entity.ts)
- [file-attachment.entity.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/document/file-attachment.entity.ts)

**主要功能**：
- 文档 CRUD 操作
- 文件上传与管理（支持 PDF、DOCX、MD、TXT 等格式）
- 分类和标签关联
- 批量上传（自动创建分类结构）
- 文件内容解析（PDF、DOCX 文本提取）
- 文档搜索

**Document Entity**：
```typescript
@Entity()
export class Document {
  @PrimaryGeneratedColumn() id: number
  @Column() title: string
  @Column('text', { nullable: true }) content: string
  @Column({ nullable: true }) description: string

  @ManyToOne(() => Category) category: Category
  @ManyToMany(() => Tag) @JoinTable() tags: Tag[]
  @ManyToOne(() => User) user: User
  @Column() userId: number

  @OneToMany(() => FileAttachment, { cascade: true }) attachments: FileAttachment[]

  @CreateDateColumn() createdAt: Date
  @UpdateDateColumn() updatedAt: Date
}
```

**FileAttachment Entity**：
```typescript
@Entity()
export class FileAttachment {
  @PrimaryGeneratedColumn() id: number
  @Column() filename: string           // 存储文件名
  @Column() originalFilename: string  // 原始文件名
  @Column() filePath: string
  @Column() fileType: string          // MIME类型
  @Column() fileSize: number

  @ManyToOne(() => Document) document: Document
  @Column() documentId: number
}
```

**DocumentService 核心方法**：
```typescript
class DocumentService {
  // 获取文档列表（支持分类和标签筛选）
  async findAll(userId: number, categoryId?: number, tagIds?: string): Promise<Document[]>

  // 获取单个文档
  async findOne(userId: number, id: number): Promise<Document>

  // 搜索文档
  async search(userId: number, keyword: string): Promise<Document[]>

  // 创建文档
  async create(document: Partial<Document>): Promise<Document>

  // 更新文档
  async update(userId: number, id: number, document: Partial<Document>): Promise<Document>

  // 添加附件
  async addAttachments(userId: number, documentId: number, files: any[]): Promise<void>

  // 批量上传（支持文件夹结构和自动分类）
  async batchUpload(userId: number, files: any[], paths: string[], parentCategory: Category): Promise<any>

  // 解析文件内容（支持 PDF、DOCX、MD、TXT）
  async parseFile(filePath: string, fileType: string): Promise<string>

  // 删除文档（级联删除附件）
  async remove(userId: number, id: number): Promise<void>
}
```

---

#### 3. CategoryModule - 分类管理模块

**文件位置**：[backend/src/modules/category/](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/category/)

**模块组成**：
- [category.module.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/category/category.module.ts)
- [category.service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/category/category.service.ts)
- [category.controller.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/category/category.controller.ts)
- [category.entity.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/category/category.entity.ts)

**主要功能**：
- 分类的 CRUD 操作
- 树形结构分类管理（支持多级分类）
- 分类排序
- 分类下文档统计

**Category Entity**：
```typescript
@Entity()
export class Category {
  @PrimaryGeneratedColumn() id: number
  @Column() name: string
  @Column({ nullable: true }) parentId: number

  // 自关联：支持无限层级分类
  @ManyToOne(() => Category, (category) => category.children)
  parent: Category

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[]

  @OneToMany(() => Document, (document) => document.category)
  documents: Document[]

  @Column() userId: number
  @ManyToOne(() => User) user: User

  @Column({ type: 'float', default: 0 }) order: number  // 排序顺序
}
```

---

#### 4. TagModule - 标签管理模块

**文件位置**：[backend/src/modules/tag/](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/tag/)

**模块组成**：
- [tag.module.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/tag/tag.module.ts)
- [tag.service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/tag/tag.service.ts)
- [tag.controller.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/tag/tag.controller.ts)
- [tag.entity.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/tag/tag.entity.ts)

**主要功能**：
- 标签 CRUD 操作
- 自定义标签颜色
- 标签排序

**Tag Entity**：
```typescript
@Entity()
export class Tag {
  @PrimaryGeneratedColumn() id: number
  @Column() name: string
  @Column({ default: '#6366f1' }) color: string  // 标签颜色（十六进制）
  @Column({ default: 0 }) order: number
  @Column() userId: number
  @ManyToOne(() => User) user: User
}
```

---

#### 5. NoteModule - 笔记模块

**文件位置**：[backend/src/modules/note/](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/note/)

**模块组成**：
- [note.module.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/note/note.module.ts)
- [note.service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/note/note.service.ts)
- [note.controller.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/note/note.controller.ts)
- [note.entity.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/note/note.entity.ts)

**主要功能**：
- 文档笔记管理
- 笔记内容存储

**Note Entity**：
```typescript
@Entity()
export class Note {
  @PrimaryGeneratedColumn() id: number
  @Column({ type: 'text', nullable: true }) content: string
  @Column() documentId: number
  @ManyToOne(() => Document) document: Document
}
```

---

#### 6. RoleModule - 角色权限模块

**文件位置**：[backend/src/modules/role/](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/role/)

**模块组成**：
- [role.module.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/role/role.module.ts)
- [role.service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/role/role.service.ts)
- [role.controller.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/role/role.controller.ts)
- [role.entity.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/role/role.entity.ts)

**主要功能**：
- 角色 CRUD
- 权限配置（菜单权限、编辑权限、删除权限）
- 角色关联用户管理

**Role Entity**：
```typescript
@Entity()
export class Role {
  @PrimaryGeneratedColumn() id: number
  @Column({ unique: true }) name: string
  @Column({ nullable: true }) description: string

  // 权限配置（JSON字符串格式）
  @Column({ type: 'text', default: '{"menus": [], "edit": false, "delete": false}' })
  permissions: string

  @Column({ default: true }) isActive: boolean
  @OneToMany(() => User, (user) => user.role)
  users: User[]

  // 权限配置方法
  getPermissions(): PermissionConfig {
    return JSON.parse(this.permissions)
  }

  setPermissions(config: PermissionConfig): void {
    this.permissions = JSON.stringify(config)
  }
}

interface PermissionConfig {
  menus: string[]      // 可访问的菜单列表
  edit: boolean        // 编辑权限
  delete: boolean      // 删除权限
}
```

---

#### 7. LogModule - 日志模块

**文件位置**：[backend/src/modules/log/](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/log/)

**模块组成**：
- [log.module.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/log/log.module.ts)
- [log.service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/log/log.service.ts)
- [log.controller.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/log/log.controller.ts)
- [log.entity.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/log/log.entity.ts)

**主要功能**：
- 用户操作日志记录
- 日志查询与筛选
- 日志统计分析

**Log Entity**：
```typescript
@Entity()
export class Log {
  @PrimaryGeneratedColumn() id: number
  @Column() userId: number
  @ManyToOne(() => User) user: User
  @Column() username: string
  @Column() action: string        // 操作类型：login, logout, create, update, delete, lock, unlock
  @Column() module: string         // 模块名称：认证, 用户管理, 文档管理等
  @Column({ type: 'text', nullable: true }) description: string
  @Column({ type: 'text', nullable: true }) details: string  // 详细信息（JSON格式）
  @Column({ nullable: true }) ipAddress: string
  @Column({ nullable: true }) userAgent: string
  @CreateDateColumn() createdAt: Date
}
```

---

#### 8. ConfigModule - 系统配置模块

**文件位置**：[backend/src/modules/config/](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/config/)

**模块组成**：
- [module.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/config/module.ts)
- [service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/config/service.ts)
- [controller.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/config/controller.ts)
- [entity.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/config/entity.ts)

**主要功能**：
- 系统配置管理
- 可配置的选项：站点名称、登录标题、版权信息等

**Config Entity**：
```typescript
@Entity()
export class Config {
  @PrimaryGeneratedColumn() id: number
  @Column() key: string   // 配置键
  @Column({ type: 'text', nullable: true }) value: string  // 配置值
  @Column() userId: number
  @ManyToOne(() => User) user: User
}
```

---

#### 9. AiModule - AI智能模块

**文件位置**：[backend/src/modules/ai/](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/ai/)

**模块组成**：
- [ai.module.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/ai/ai.module.ts)
- [ai.service.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/ai/ai.service.ts)
- [ai.controller.ts](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/backend/src/modules/ai/ai.controller.ts)

**主要功能**：
- 支持多种国产大模型 API 集成
- 基于文档和笔记的智能问答
- 模拟模式（用于测试）

**支持的AI模型**：
```typescript
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
    authType: 'volc-aksk',  // 火山AK/SK认证
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
}
```

**认证类型说明**：
- `bearer`: 标准 Bearer Token 认证
- `volc-aksk`: 火山引擎 AK/SK HMAC-SHA256 签名认证
- `api-key`: 特殊 API Key 认证（如文心一言）

**AiService 核心方法**：
```typescript
class AiService {
  // 获取AI配置和预设模型列表
  async getConfig(): Promise<AiConfig>

  // 更新AI配置
  async updateConfig(newConfig: Partial<AiConfig>): Promise<AiConfig>

  // 获取系统数据（文档和笔记）用于上下文
  async getAllSystemData(userId: number): Promise<string>

  // 智能问答
  async chat(userId: number, question: string, documentId?: string): Promise<{success, answer}>
}
```

---

### 后端入口文件

**main.ts** - 应用入口
```typescript
// 文件位置：backend/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 启用 CORS
  app.enableCors();

  // 设置全局路由前缀
  app.setGlobalPrefix('api');

  // 配置请求体大小限制（支持大文件上传）
  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));

  // 监听端口
  await app.listen(3000);
}
```

**app.module.ts** - 根模块
```typescript
// 文件位置：backend/src/app.module.ts
@Module({
  imports: [
    // 数据库配置：使用 SQLite
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: path.join(__dirname, '..', 'database.sqlite'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,  // 开发环境自动同步表结构
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 功能模块
    AuthModule,
    DocumentModule,
    CategoryModule,
    TagModule,
    ConfigModule,
    NoteModule,
    AiModule,
    RoleModule,
    LogModule,
  ],
})
export class AppModule {}
```

---

## 前端架构

### 目录结构

```
frontend/src/
├── api/
│   └── axios.js              # Axios 实例配置（请求/响应拦截器）
├── components/
│   ├── ui/                   # 基础UI组件
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── card.jsx
│   │   ├── badge.jsx
│   │   ├── label.jsx
│   │   └── dialog.jsx
│   ├── Layout.jsx            # 主布局组件
│   ├── AIChat.jsx            # AI聊天组件
│   ├── AttachmentPreview.jsx  # 附件预览组件
│   └── ConfirmDialog.jsx      # 确认对话框
├── context/
│   ├── AuthContext.jsx       # 认证上下文（用户状态）
│   ├── ConfigContext.jsx      # 系统配置上下文
│   └── ThemeContext.jsx       # 主题上下文
├── hooks/
│   ├── useMediaUrl.js        # 媒体URL处理Hook
│   └── useThemeColors.js     # 主题颜色Hook
├── lib/
│   ├── utils.js              # 工具函数
│   └── themeStyles.js        # 主题样式工具
├── pages/                    # 页面组件
│   ├── Login.jsx             # 登录页
│   ├── Register.jsx          # 注册页
│   ├── Documents.jsx         # 文档列表页
│   ├── DocumentDetail.jsx     # 文档详情页
│   ├── Categories.jsx         # 分类管理页
│   ├── Tags.jsx              # 标签管理页
│   ├── AIConfig.jsx          # AI配置页
│   ├── Roles.jsx             # 角色管理页
│   ├── Users.jsx             # 用户管理页
│   ├── Logs.jsx              # 日志查看页
│   └── SystemConfig.jsx      # 系统配置页
├── config/
│   └── themes.js             # 主题配置文件
├── App.jsx                   # 根组件
└── main.jsx                  # 入口文件
```

---

### 核心组件说明

#### 1. API 请求封装

**文件位置**：[frontend/src/api/axios.js](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/api/axios.js)

```javascript
// Axios 实例配置
const api = axios.create({
  // 不设置 baseURL，请求路径中已包含 /api
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // 防止GET请求缓存
  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() };
  }
  return config;
});

// 响应拦截器：处理401未授权
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

#### 2. Context 上下文

**AuthContext** - [frontend/src/context/AuthContext.jsx](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/context/AuthContext.jsx)

用户认证状态管理：
- `user`: 当前用户信息
- `login(username, password)`: 登录
- `register(username, email, password)`: 注册
- `logout()`: 登出
- `refreshUser()`: 刷新用户信息

**ThemeContext** - [frontend/src/context/ThemeContext.jsx](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/context/ThemeContext.jsx)

主题状态管理，支持以下主题：
- `light`: 清新白
- `dark`: 深邃蓝
- `police`: 公安蓝
- `night`: 暗夜紫
- `cyber`: 极客黑
- `purple`: 优雅紫
- `green`: 自然绿
- `orange`: 活力橙
- `pink`: 浪漫粉

**ConfigContext** - [frontend/src/context/ConfigContext.jsx](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/context/ConfigContext.jsx)

系统配置管理，包括站点名称、登录标题、版权信息等。

---

#### 3. 路由配置

**文件位置**：[frontend/src/App.jsx](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/App.jsx)

```jsx
// 路由结构
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/" element={<Layout />}>
    <Route index element={<Documents />} />
    <Route path="documents" element={<Documents />} />
    <Route path="documents/:id" element={<DocumentDetail />} />
    <Route path="categories" element={<Categories />} />
    <Route path="tags" element={<Tags />} />
    <Route path="ai-config" element={<AIConfig />} />
    <Route path="roles" element={<Roles />} />
    <Route path="users" element={<Users />} />
    <Route path="logs" element={<Logs />} />
    <Route path="system-config" element={<SystemConfig />} />
  </Route>
</Routes>
```

---

#### 4. 主要页面组件

**Documents.jsx** - [frontend/src/pages/Documents.jsx](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/pages/Documents.jsx)

文档管理核心页面：
- 文档列表展示（网格/列表视图切换）
- 分类树形导航
- 标签筛选
- 搜索功能
- 单个文档上传
- 批量上传（支持文件夹结构）
- 文档编辑/删除

**Login.jsx** - [frontend/src/pages/Login.jsx](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/pages/Login.jsx)

登录页面，支持：
- 用户名/密码登录
- 错误提示
- 注册链接跳转

**Layout.jsx** - [frontend/src/components/Layout.jsx](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/components/Layout.jsx)

主布局组件：
- 顶部导航栏
- 侧边菜单（根据权限动态显示）
- 用户信息显示与编辑
- 退出登录
- 底部版权信息
- 主题特效渲染

---

### 主题系统

**文件位置**：[frontend/src/config/themes.js](file:///Users/ouluwangji/Desktop/knowledge-base-v2.0.0/frontend/src/config/themes.js)

支持 9 种预设主题，每种主题包含：
- 背景颜色配置
- 文字颜色配置
- 边框颜色配置
- 按钮样式配置
- 渐变背景配置
- 发光效果配置
- 网格背景配置（特殊主题）

---

## 依赖关系

### 后端依赖 (package.json)

```json
{
  // 核心框架
  "@nestjs/common": "^11.1.24",
  "@nestjs/core": "^11.1.24",
  "@nestjs/platform-express": "^11.1.24",

  // ORM与数据库
  "@nestjs/typeorm": "^11.0.1",
  "typeorm": "^1.0.0",
  "better-sqlite3": "^12.10.0",

  // 认证
  "@nestjs/jwt": "^11.0.2",
  "@nestjs/passport": "^11.0.5",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "bcryptjs": "^3.0.3",

  // 定时任务
  "@nestjs/schedule": "^6.1.3",

  // 文件处理
  "mammoth": "^1.12.0",        // DOCX解析
  "pdf-parse": "^2.4.5",       // PDF解析

  // 数据验证
  "class-transformer": "^0.5.1",
  "class-validator": "^0.15.1"
}
```

### 前端依赖 (package.json)

```json
{
  // React 生态
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.16.0",

  // 构建工具
  "vite": "^6.3.5",

  // UI框架
  "tailwindcss": "^3.4.14",
  "lucide-react": "^1.17.0",

  // 富文本编辑器
  "@tiptap/react": "^3.24.0",
  "@tiptap/starter-kit": "^3.24.0",

  // 拖拽功能
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",

  // HTTP请求
  "axios": "^1.16.1"
}
```

---

## 项目运行方式

### 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 开发模式启动（热重载）
npm run start:dev

# 生产模式构建并启动
npm run build
npm run start:prod

# 直接启动
npm start
```

**后端配置**：
- 端口：3000
- API前缀：/api
- 数据库：SQLite (database.sqlite)
- JWT密钥：knowledge_base_secret_key

### 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式启动
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

**前端配置**：
- 开发服务器端口：默认 5173
- API代理：需配置 Vite 代理指向后端 3000 端口

### 初始数据

首次运行需要创建：
1. 至少一个角色（Role）
2. 至少一个用户（User）

---

## API 接口文档

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/users | 获取所有用户 |
| GET | /api/auth/users/me | 获取当前用户 |
| PUT | /api/auth/users/:id | 更新用户信息 |
| DELETE | /api/auth/users/:id | 删除用户 |
| PUT | /api/auth/users/:id/role | 更新用户角色 |
| PUT | /api/auth/theme | 更新用户主题 |
| PUT | /api/auth/users/:id/lock | 锁定用户 |
| PUT | /api/auth/users/:id/unlock | 解锁用户 |
| PUT | /api/auth/users/:id/reset-password | 重置密码 |
| PUT | /api/auth/users/batch-security | 批量更新安全配置 |

### 文档接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/documents | 获取文档列表 |
| GET | /api/documents/search | 搜索文档 |
| GET | /api/documents/:id | 获取单个文档 |
| POST | /api/documents | 创建文档 |
| POST | /api/documents/upload | 上传文档（支持附件） |
| POST | /api/documents/batch-upload | 批量上传 |
| PUT | /api/documents/:id | 更新文档 |
| DELETE | /api/documents/:id | 删除文档 |
| GET | /api/documents/:id/attachments/:aid | 下载附件 |

### 分类接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/categories | 获取所有分类 |
| GET | /api/categories/tree | 获取分类树形结构 |
| GET | /api/categories/:id | 获取单个分类 |
| POST | /api/categories | 创建分类 |
| PUT | /api/categories/:id | 更新分类 |
| DELETE | /api/categories/:id | 删除分类 |

### 标签接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/tags | 获取所有标签 |
| POST | /api/tags | 创建标签 |
| PUT | /api/tags/:id | 更新标签 |
| DELETE | /api/tags/:id | 删除标签 |

### 笔记接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/notes | 获取所有笔记 |
| GET | /api/notes/:id | 获取单个笔记 |
| POST | /api/notes | 创建笔记 |
| PUT | /api/notes/:id | 更新笔记 |
| DELETE | /api/notes/:id | 删除笔记 |

### 角色接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/roles | 获取所有角色 |
| GET | /api/roles/:id | 获取单个角色 |
| POST | /api/roles | 创建角色 |
| PUT | /api/roles/:id | 更新角色 |
| DELETE | /api/roles/:id | 删除角色 |

### 日志接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/logs | 获取日志列表 |
| GET | /api/logs/stats | 获取日志统计 |

### 配置接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/config | 获取配置 |
| PUT | /api/config | 更新配置 |

### AI接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/ai/config | 获取AI配置 |
| PUT | /api/ai/config | 更新AI配置 |
| POST | /api/ai/chat | 智能问答 |

---

## 数据库设计

### ER 关系图

```
┌─────────┐       ┌─────────────┐       ┌────────────┐
│   User  │──────<│  Document   │>──────│    Tag     │
└─────────┘       └─────────────┘       └────────────┘
     │                   │
     │                   │
     │                   ├─────────────┐
     │                   │  FileAttach │
     │                   └─────────────┘
     │
     │                   ┌─────────────┐
     ├──────────────────>│   Note      │
     │                   └─────────────┘
     │
     ├──────────────────>┌─────────────┐
     │                  │  Category   │
     │                  └─────────────┘
     │
     ├──────────────────>┌─────────────┐
     │                  │   Config    │
     │                  └─────────────┘
     │
     ├──────────────────>┌─────────────┐
     │                  │    Log      │
     │                  └─────────────┘
     │
     │
┌─────────┐
│   Role  │──────<│    User     │
└─────────┘       └─────────────┘
```

### 表结构说明

1. **User** - 用户表
2. **Document** - 文档表
3. **FileAttachment** - 文件附件表
4. **Category** - 分类表（自关联树形结构）
5. **Tag** - 标签表
6. **Note** - 笔记表
7. **Role** - 角色表
8. **Log** - 操作日志表
9. **Config** - 系统配置表

---

## 安全机制

### JWT 认证流程

1. 用户登录成功 → 后端生成 JWT Token
2. 前端存储 Token（localStorage）
3. 请求时在 Header 携带 Token
4. 后端验证 Token 有效性

### 账户锁定机制

- 默认配置：连续 3 次密码错误，锁定 2 小时
- 锁定时长单位可选：秒、分钟、小时
- 支持管理员手动解锁
- 锁定时间过期自动解锁

### 权限控制

- 基于角色的权限控制（RBAC）
- 权限结构：
  - `menus`: 可访问的菜单列表
  - `edit`: 编辑权限
  - `delete`: 删除权限

---

## 扩展功能

### 文件解析支持

| 格式 | 解析库 | 说明 |
|------|--------|------|
| PDF | pdf-parse | 提取文本内容 |
| DOCX | mammoth | 提取原始文本 |
| MD | - | 直接读取 |
| TXT | - | 直接读取 |

### AI 认证方式

| 认证类型 | 说明 | 使用模型 |
|----------|------|----------|
| bearer | 标准 Bearer Token | 大多数模型 |
| volc-aksk | HMAC-SHA256 签名 | 火山方舟 |
| api-key | 特殊 API Key | 文心一言 |

---

## 注意事项

1. **数据库同步**：开发环境下 TypeORM 的 `synchronize: true` 会自动同步表结构，生产环境建议使用迁移
2. **JWT 密钥**：当前硬编码为 `knowledge_base_secret_key`，生产环境应使用环境变量
3. **文件上传**：默认上传目录为项目根目录下的 `uploads` 文件夹
4. **CORS**：已启用，允许所有来源访问
5. **请求体大小**：已配置为 500MB，支持大文件上传

---

*文档生成时间：2026-06-11*
