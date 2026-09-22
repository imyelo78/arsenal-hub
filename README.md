# Arsenal Hub - 阿森纳比赛中心

非官方阿森纳球迷资讯站，提供赛程、实时比分、积分榜和正版观赛导航。

## 技术栈

- **框架**: Nuxt 3 (Vue 3 + Nitro)
- **样式**: Tailwind CSS
- **国际化**: @nuxtjs/i18n (中英双语)
- **部署**: Cloudflare Pages
- **数据源**: API-Football (免费版)
- **缓存**: Cloudflare KV

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式运行

无需 API Key，内置 Mock 数据可直接运行：

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 配置真实 API（可选）

复制 `.env.example` 为 `.env`，填入你的 API-Football Key：

```bash
cp .env.example .env
```

```env
API_FOOTBALL_KEY=your-api-key-here
```

去 [api-football.com](https://www.api-football.com/) 免费注册获取 Key。

## 项目结构

```
arsenal-hub/
├── pages/                    # 页面路由
│   ├── index.vue             # 首页：下场赛事 + 比分
│   ├── fixtures.vue          # 赛程页
│   ├── standings.vue         # 积分榜
│   └── watch.vue             # 观赛指南
├── components/               # 组件
│   ├── AppNavbar.vue         # 导航栏
│   ├── AppFooter.vue         # 页脚
│   └── FixtureCard.vue       # 比赛卡片
├── layouts/
│   └── default.vue           # 默认布局
├── server/                   # Nitro 后端
│   ├── api/                  # API 路由
│   │   ├── fixtures.ts       # 赛程代理
│   │   ├── standings.ts      # 积分榜代理
│   │   ├── next-match.ts     # 下场赛事
│   │   └── last-results.ts   # 最近结果
│   └── utils/
│       └── mockData.ts       # Mock 数据
├── i18n/locales/             # 语言包
│   ├── zh-CN.json
│   └── en-US.json
├── assets/css/
│   └── main.css              # 全局样式
├── nuxt.config.ts            # Nuxt 配置
├── tailwind.config.js         # Tailwind 配置
├── wrangler.toml             # Cloudflare 配置
└── package.json
```

## 部署到 Cloudflare Pages

### 1. 创建 GitHub 仓库

将项目推送到 GitHub。

### 2. 连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → Create application → Pages → Connect to Git
3. 选择你的 GitHub 仓库

### 3. 构建配置

| 配置项 | 值 |
|-------|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `arsenal-hub` (如果在 monorepo 中) |

### 4. 环境变量

在 Settings → Environment Variables 中添加：

| 变量名 | 值 |
|--------|---|
| `API_FOOTBALL_KEY` | 你的 API-Football Key |

### 5. 创建 KV 命名空间

1. Workers & Pages → KV → Create namespace
2. 名称填 `ARSENAL_KV`
3. 在 Pages 项目的 Settings → Functions → KV namespace bindings 中绑定
4. Variable name 填 `ARSENAL_KV`

### 6. 部署

推送代码到 GitHub，Cloudflare 自动构建部署。

## 双语切换

- 默认中文：`/`
- 英文版本：`/en`
- 导航栏右上角可切换语言
- 语言偏好存储在 Cookie 中

## 功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 首页 | 已完成 | 下场赛事倒计时 + 最近 5 场赛果 |
| 赛程 | 已完成 | 完整赛季赛程 + 联赛/月份筛选 |
| 积分榜 | 已完成 | 英超实时积分 + 阿森纳高亮 |
| 观赛指南 | 已完成 | 正版平台跳转（按语言分流） |
| 球员名单 | P1 | 计划中 |
| 用户系统 | P2 | 计划中 |
| 评论 | P2 | 计划中 |

## 数据说明

- **Mock 模式**：未配置 API Key 时使用内置 Mock 数据，可用于开发演示
- **真实模式**：配置 API Key 后自动切换为真实数据，带 KV 缓存
- **缓存策略**：赛程 1 小时、积分榜 30 分钟、下场赛事 5 分钟

## 法律声明

本站为非官方球迷站，不关联阿森纳足球俱乐部、英超联盟或任何转播机构。不提供直播播放，只提供正版平台跳转链接。转播安排以各平台实际为准。

## License

MIT
