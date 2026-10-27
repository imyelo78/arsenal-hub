# Arsenal Hub - 阿森纳比赛中心

非官方阿森纳球迷资讯站：赛程、实时比分、积分榜、一线队阵容与球员档案、传奇殿堂、正版观赛导航。中英双语，采用「比赛日之夜」（Matchday Night）深色视觉体系。

线上地址：https://arsenal-hub.pages.dev/

## 技术栈

- **框架**: Nuxt 3 (Vue 3 + Nitro)
- **样式**: Tailwind CSS + 自定义「比赛日之夜」设计体系（night #0A0A0E / red #EF0107 / gold #C9A24B，Oswald 数字字体）
- **国际化**: @nuxtjs/i18n（中英双语）
- **部署**: Cloudflare Pages
- **数据库**: Cloudflare D1（生产）/ better-sqlite3 本地文件（开发，`.data/arsenal.db`）
- **缓存**: Cloudflare KV
- **数据源**: API-Football（赛程/积分榜/射手榜）+ Fantasy Premier League（阵容/球员数据）

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
│   ├── index.vue             # 首页：下场赛事 + 比分（全宽沉浸布局）
│   ├── fixtures.vue          # 赛程页
│   ├── fixture/[id].vue      # 单场比赛详情
│   ├── standings.vue         # 积分榜（英超 + 欧冠）
│   ├── scorers.vue           # 射手榜
│   ├── squad.vue             # 一线队：核心焦点 / 数据榜 / 完整阵容
│   ├── player/[id].vue       # 球员个人页：赛季数据 / FPL 指数 / 近 5 场
│   ├── legends.vue           # 传奇殿堂：温格焦点 + 49 不败 + 群星网格
│   ├── legends/[id].vue      # 传奇个人页：荣誉墙 / 生涯大事记时间线
│   ├── stadium.vue           # 球场
│   ├── club.vue              # 俱乐部
│   ├── women.vue             # 女足
│   └── watch.vue             # 观赛指南
├── components/               # 组件
│   ├── AppNavbar.vue         # 导航栏
│   ├── AppFooter.vue         # 页脚
│   └── FixtureCard.vue       # 比赛卡片
├── layouts/
│   └── default.vue           # 默认布局（首页/阵容/传奇/详情页为全宽沉浸布局）
├── server/                   # Nitro 后端
│   ├── api/                  # API 路由
│   │   ├── fixtures.ts       # 赛程代理
│   │   ├── fixture/[id].ts   # 单场详情
│   │   ├── standings.ts      # 积分榜代理
│   │   ├── next-match.ts     # 下场赛事
│   │   ├── last-results.ts   # 最近结果
│   │   ├── scorers.ts        # 射手榜
│   │   ├── squad.ts          # 一线队阵容（FPL）
│   │   ├── player/[id].ts    # 球员详情（FPL + 近 5 场）
│   │   └── sync.ts           # 数据同步入口
│   └── utils/
│       ├── staticData.ts     # 俱乐部/传奇/球场/女足静态数据
│       ├── fpl.ts            # FPL 常量与工具
│       ├── sync.ts           # FPL 数据同步（写入 D1/SQLite）
│       ├── db.ts             # 数据库抽象（D1 / better-sqlite3）
│       └── mockData.ts       # Mock 数据
├── i18n/locales/             # 语言包
│   ├── zh-CN.json
│   └── en-US.json
├── public/images/            # 站点图片（支持同名覆盖，见下）
├── assets/css/
│   └── main.css              # 全局样式（shell-wide / btn-red / reveal 等）
├── nuxt.config.ts            # Nuxt 配置
├── tailwind.config.js        # Tailwind 配置
├── wrangler.toml             # Cloudflare 配置（D1 绑定）
└── package.json
```

## 站点图片自定义（零代码换图）

图片按约定路径加载，放一张同名图片即可替换，代码无需改动：

| 用途 | 路径 | 缺失时回退 |
|------|------|-----------|
| 球员焦点卡大图 | `/images/players/key/{球员FPL id}.jpg` | 位置示意图（kp-gk/kp-def/kp-mid/kp-forward.jpg） |
| 球员详情页 Hero | `/images/players/detail/{球员FPL id}.jpg` | 同上 |
| 传奇图 | `/images/legends/{传奇id}.jpg` | 首字母占位 |

球员 FPL id 可在 `/squad` 页面数据或 [fantasy.premierleague.com](https://fantasy.premierleague.com/) 接口中查询；传奇 id 见 `server/utils/staticData.ts`（如 `henry`、`wenger`）。

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

### 6. 创建 D1 数据库

FPL 球员与比赛数据存放在 D1（绑定变量名必须是 `DB`）：

```bash
wrangler d1 create arsenal-hub-db
```

把返回的 `database_id` 填入 `wrangler.toml`，首次访问会自动建表并同步数据。

### 7. 部署

推送代码到 GitHub，Cloudflare 自动构建部署。

## 双语切换

- 默认中文：`/`
- 英文版本：`/en`
- 导航栏右上角可切换语言
- 语言偏好存储在 Cookie 中

## 功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 首页 | 已完成 | 下场赛事倒计时 + 最近赛果（全宽沉浸布局） |
| 赛程 | 已完成 | 完整赛季赛程 + 联赛/月份筛选 + 单场详情 |
| 积分榜 | 已完成 | 英超实时积分 + 欧冠积分 + 阿森纳高亮 |
| 射手榜 | 已完成 | 英超射手榜前 20 |
| 一线队 | 已完成 | FPL 数据驱动：核心焦点 / 队内数据榜 / 完整阵容筛选 |
| 球员个人页 | 已完成 | 赛季数据 / FPL 三项指数 / 近 5 场表现 / 上一位·下一位导航 |
| 传奇殿堂 | 已完成 | 温格焦点 + 49 不败横带 + 群星网格（卡片可点击） |
| 传奇个人页 | 已完成 | 荣誉墙 + 生涯大事记时间线 + 传奇印记 + 循环导航 |
| 球场 / 俱乐部 / 女足 | 已完成 | 静态内容页 |
| 观赛指南 | 已完成 | 正版平台跳转（按语言分流） |
| 用户系统 | P2 | 计划中 |
| 评论 | P2 | 计划中 |

## 数据说明

- **Mock 模式**：未配置 API Key 时使用内置 Mock 数据，可用于开发演示
- **真实模式**：配置 API Key 后自动切换为真实数据
- **API-Football 缓存**（KV）：赛程 1 小时、积分榜 30 分钟、下场赛事 5 分钟
- **FPL 数据**：首次请求自动同步球员/比赛入库（D1），赛季进行中随请求增量刷新
- **静态数据**：俱乐部荣誉、传奇档案（含双语荣誉墙与生涯大事记）维护在 `server/utils/staticData.ts`

## 法律声明

本站为非官方球迷站，不关联阿森纳足球俱乐部、英超联盟或任何转播机构。不提供直播播放，只提供正版平台跳转链接。转播安排以各平台实际为准。

## License

MIT
