# 环境配置设置指南

## 问题诊断
你的应用无法创建笔记和显示笔记的原因是：**缺少 Supabase 环境配置**。

应用正在使用模拟客户端，所以所有数据库操作都不会执行。

## 解决步骤

### 1. 创建 `.env.local` 文件
在项目根目录创建 `.env.local` 文件：

```bash
# 在终端中运行
touch .env.local
```

### 2. 添加 Supabase 配置
在 `.env.local` 文件中添加以下内容：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration (可选)
OPENAI_API_KEY=your-openai-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 获取 Supabase 配置信息
1. 登录你的 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - **Project URL** → 替换 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → 替换 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. 重启开发服务器
```bash
npm run dev
```

## 验证配置
重启后，打开浏览器控制台，你应该看到：
- ✅ Supabase 连接成功的信息
- ❌ 不再有 "Supabase not configured" 的警告

## 测试功能
配置完成后，你应该能够：
1. 看到之前的笔记
2. 创建新笔记
3. 使用所有功能

## 如果仍有问题
如果配置后仍有问题，请检查：
1. `.env.local` 文件是否在项目根目录
2. Supabase URL 和 Key 是否正确
3. 浏览器控制台中的错误信息

