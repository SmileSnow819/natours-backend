# 🏔️ Natours - 旅游平台后端API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

一个功能完整的旅游平台后端API，使用现代Node.js技术栈构建，提供用户认证、旅游路线管理、评论系统和权限控制等功能。

## ✨ 特性

### 🔐 安全认证

- **JWT认证**: 基于令牌的身份验证
- **密码加密**: 使用bcryptjs进行密码哈希
- **密码重置**: 通过邮件发送重置令牌
- **多角色权限**: user, guide, lead-guide, admin

### 🗺️ 旅游管理

- **CRUD操作**: 完整的旅游路线增删改查
- **高级过滤**: 价格、难度、评分等多维度筛选
- **统计分析**: 旅游数据聚合统计
- **月度计划**: 按月份统计旅游安排

### 💬 评论系统

- **用户评论**: 支持用户对旅游路线进行评价
- **自动评分**: 实时计算平均评分
- **虚拟填充**: 使用Mongoose虚拟属性关联数据

### 🛡️ 安全防护

- **数据验证**: 输入数据严格验证
- **SQL注入防护**: 使用express-mongo-sanitize
- **XSS攻击防护**: 使用xss-clean清理HTML
- **速率限制**: 防止API滥用攻击
- **CORS支持**: 跨域资源共享配置

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MongoDB 5+
- npm 或 yarn

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/SmileSnow819/natours-backend
cd natours-backend
```

2. **安装依赖**

```bash
npm install
```

3. **环境配置**
   创建 `config.env` 文件：

```env
NODE_ENV=development
PORT=8000
DATABASE_LOCAL=mongodb://localhost:27017/natours
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=90

# 邮件配置 (可选，用于密码重置)
EMAIL_USERNAME=your-email-username
EMAIL_PASSWORD=your-email-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

4. **导入示例数据** (可选)

```bash
# 进入dev-data目录导入数据
cd dev-data/data
node import-dev-data.js --import
```

5. **启动服务**

```bash
# 开发模式
npm start

# 生产模式
npm run start:prod

# 调试模式
npm run debug
```

服务将在 http://localhost:8000 启动

## 📚 API文档

### 认证接口

#### 用户注册

```http
POST /api/v1/users/signup
Content-Type: application/json

{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

#### 用户登录

```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

### 旅游路线接口

#### 获取所有旅游路线

```http
GET /api/v1/tours?page=1&limit=10&sort=price,-ratingsAverage
```

#### 高级查询示例

```http
GET /api/v1/tours?difficulty=easy&price[lt]=1000&ratingsAverage[gte]=4.5&fields=name,price,duration
```

#### 获取单个旅游路线

```http
GET /api/v1/tours/:id
```

### 评论接口

#### 创建评论

```http
POST /api/v1/reviews
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "review": "非常棒的旅游体验！",
  "rating": 5,
  "tour": "tour-id"
}
```

## 🏗️ 项目架构

### 目录结构

```
natours-backend/
├── controllers/          # 控制器层
│   ├── authController.js    # 认证控制器
│   ├── tourController.js    # 旅游控制器
│   ├── userController.js    # 用户控制器
│   └── handlerFactory.js    # 通用处理器工厂
├── models/              # 数据模型
│   ├── tourModel.js        # 旅游模型
│   ├── userModel.js        # 用户模型
│   └── reviewModel.js      # 评论模型
├── routes/              # 路由层
│   ├── tourRoutes.js       # 旅游路由
│   ├── userRoutes.js       # 用户路由
│   └── reviewRoutes.js     # 评论路由
├── utils/               # 工具类
│   ├── APIFeatures.js      # API特性类
│   ├── AppError.js         # 错误处理
│   └── CatchAsync.js       # 异步错误捕获
├── public/              # 静态资源
└── dev-data/            # 开发数据
```

### 数据模型

#### 旅游模型 (Tour)

- 基本信息: 名称、时长、价格、难度
- 地理位置: 起点位置、路线点
- 媒体资源: 封面图片、详情图片
- 统计信息: 平均评分、评分数量
- 关联数据: 导游信息、评论

#### 用户模型 (User)

- 个人信息: 姓名、邮箱、头像
- 认证信息: 密码、角色、激活状态
- 安全信息: 密码重置令牌、密码修改时间

#### 评论模型 (Review)

- 评论内容: 评论文本、评分
- 关联信息: 用户ID、旅游ID
- 时间信息: 创建时间

## 🔧 技术栈

### 后端框架

- **Node.js** - JavaScript运行时环境
- **Express.js** - Web应用框架
- **Mongoose** - MongoDB对象建模工具

### 安全防护

- **Helmet** - 安全HTTP头设置
- **express-rate-limit** - API速率限制
- **express-mongo-sanitize** - NoSQL注入防护
- **xss-clean** - XSS攻击防护
- **hpp** - HTTP参数污染防护

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Nodemon** - 开发热重载
- **Morgan** - HTTP请求日志

### 数据验证

- **Validator** - 数据验证库
- **Mongoose内置验证** - 模型层验证

## 🛠️ 开发指南

### 代码规范

项目使用ESLint和Prettier进行代码规范检查：

```bash
# 检查代码规范
npm run lint

# 自动修复代码规范问题
npm run lint:fix
```

### 环境变量配置

所有敏感配置都通过环境变量管理：

- 数据库连接字符串
- JWT密钥和过期时间
- 邮件服务配置
- 服务器端口

### 错误处理

项目采用统一的错误处理机制：

- 开发环境显示详细错误信息
- 生产环境返回用户友好的错误信息
- 全局异常捕获和未处理Promise拒绝处理

## 📊 API特性

### 高级查询功能

- **过滤**: `?difficulty=easy&price[lt]=1000`
- **排序**: `?sort=price,-ratingsAverage`
- **字段选择**: `?fields=name,price,duration`
- **分页**: `?page=2&limit=5`

### 操作符支持

- `gt` - 大于
- `gte` - 大于等于
- `lt` - 小于
- `lte` - 小于等于

### 聚合管道

- 旅游统计数据分析
- 月度计划聚合
- 评分自动计算

## 🤝 贡献指南

我们欢迎任何形式的贡献！请遵循以下步骤：

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 开发规范

- 遵循现有的代码风格
- 添加适当的测试用例
- 更新相关文档
- 确保所有测试通过

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如果您在使用过程中遇到问题：

1. 查看 [API文档](API_DOCUMENTATION.md) 获取详细接口说明
2. 检查项目 Issues 是否已有相关讨论
3. 创建新的 Issue 描述您的问题

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**注意**: 这是一个学习项目，生产环境使用前请确保：

- 使用强密码和安全的JWT密钥
- 配置适当的安全头
- 设置正确的CORS策略
- 启用HTTPS
- 定期更新依赖包
