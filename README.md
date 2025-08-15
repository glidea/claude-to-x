把各家（Gemini，OpenAI）的模型 API 转换成 Claude 格式提供服务

## 特性

- 🚀 一键部署到 Cloudflare Workers
- 🔄 兼容 Claude Code。配合 [One-Balance](https://github.com/glidea/one-balance) 低成本，0 费用使用 Claude Code
- 📡 支持流式和非流式响应
- 🛠️ 支持工具调用
- 🎯 零配置，开箱即用

## 快速部署

```bash
git clone https://github.com/glidea/claude-worker-proxy
cd claude-worker-proxy
npm install
wrangler login # 如果尚未安装：npm i -g wrangler@latest
npm run deploycf
```

## 使用方法

```bash
# 例子：以 Claude 格式请求 Gemini 后端
curl -X POST https://claude-worker-proxy.xxxx.workers.dev/gemini/https://generativelanguage.googleapis.com/v1beta/v1/messages \
  -H "x-api-key: YOUR_GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

### 参数说明

- URL 格式：`{worker_url}/{type}/{provider_url_with_version}/v1/messages`
- `type`: 目标厂商类型，目前支持 `gemini`, `openai`
- `provider_url_with_version`: 目标厂商 API 基础地址
- `x-api-key`: 目标厂商的 API Key

### 在 Claude Code 中使用

```bash
# 编辑 ~/.claude/settings.json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://claude-worker-proxy.xxxx.workers.dev/gemini/https://xxx.com/v1beta", # https://xxx.com/v1beta： 注意带版本号；需要支持函数调用！
    "ANTHROPIC_MODEL": "gemini-2.5-pro", # 大模型，按需修改
    "ANTHROPIC_SMALL_FAST_MODEL": "gemini-2.5-flash", # 小模型。也许你并不需要 ccr 那么强大的 route
    "ANTHROPIC_CUSTOM_HEADERS": "x-api-key:你的 gemini api key",
    "API_TIMEOUT_MS": "600000"
  }
}

claude
```
