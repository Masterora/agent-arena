# Vercel（前端）+ Render（后端）部署指南

从「在托管上配置环境变量」开始，按顺序做即可。

---

## 一、Render 后端

### 1. 创建 Web Service

1. 登录 [Render](https://render.com) → **Dashboard** → **New +** → **Web Service**。
2. 连接你的 GitHub 仓库（包含本项目的仓库）。
3. 填写：
   - **Name**：例如 `agent-arena-api`
   - **Region**：选离你近的
   - **Root Directory**：填 **`backend`**（重要）
   - **Runtime**：**Docker** 或 **Python** 二选一（见下方）

### 2. 选择运行时并设置构建/启动命令

**方式 A：用 Docker（推荐，与本地 Dockerfile 一致）**

- **Runtime** 选 **Docker**。
- 不填 Build Command / Start Command（用仓库里 `backend/Dockerfile`）。
- Render 会注入环境变量 **`PORT`**，但当前 Dockerfile 写死了 9000，需要改一次（见下文「3. 环境变量」之后）。

**方式 B：用 Python（不用 Docker）**

- **Runtime** 选 **Python**。
- **Build Command**：
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**（必须用 `$PORT`，Render 会注入）：
  ```bash
  sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
  ```

### 3. 环境变量（Environment Variables）

在 Render 的该 Web Service 里 → **Environment** → **Add Environment Variable**，逐条添加：

| Key | Value | 说明 |
|-----|--------|------|
| `DATABASE_URL` | （见下方） | 生产必须用 PostgreSQL，Render 可免费创建 |
| `CORS_ORIGINS` | `["https://你的前端.vercel.app"]` | 换成你真实的 Vercel 域名，可多写几个用逗号隔开 |
| `SECRET_KEY` | 自己生成一长串随机字符串 | 生产环境必改，不要用默认值 |
| `ENV` | `production` | 可选，标识生产 |
| `DEBUG` | `false` | 可选 |

**获取 DATABASE_URL（Render 免费 PostgreSQL）：**

1. Render Dashboard → **New +** → **PostgreSQL**。
2. 创建后进入该数据库 → **Info** → **Internal Database URL**（同一服务用 Internal，免费）。
3. 复制整段，形如：`postgresql://user:pass@hostname/dbname`，粘贴到上面 **Value** 的 `DATABASE_URL`。

**CORS_ORIGINS 格式说明：**

- 必须是一个 **JSON 数组字符串**。
- 只一个域名示例：`["https://agent-arena.vercel.app"]`
- 多个域名示例：`["https://agent-arena.vercel.app","https://www.你的域名.com"]`
- 不要有多余空格或换行，否则可能解析失败。

### 4. 若用 Docker：让后端监听 Render 的 PORT

Render 会分配端口并注入 `PORT`，Docker 方式需要让 uvicorn 使用该端口。在仓库里改一次即可：

- 打开 **backend/Dockerfile**，把最后一行改成用环境变量端口，例如：
  ```dockerfile
  CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-9000}"]
  ```
- 提交并推送，Render 会重新构建并生效。

### 5. 部署与拿到后端地址

- 保存 Environment 后，Render 会自动部署（或手动 **Manual Deploy**）。
- 部署成功后，在 Web Service 页面顶部会看到 **URL**，例如：`https://agent-arena-api.onrender.com`。
- **复制这个地址**，后面在 Vercel 里当 API 根地址用（不要加 `/api`）。

---

## 二、Vercel 前端

### 1. 环境变量

1. 打开 [Vercel](https://vercel.com) → 你的项目 → **Settings** → **Environment Variables**。
2. 新增一条：
   - **Key**：`VITE_API_URL`
   - **Value**：上一步复制的 Render 后端地址，例如 `https://agent-arena-api.onrender.com`
   - **Environment**：勾选 **Production**（以及 Preview 若需要预览环境也用同一后端）。
3. 保存。

### 2. 重新部署

- 修改环境变量后，需要重新构建才会生效：**Deployments** → 最新一次部署右侧 **⋯** → **Redeploy**。
- 或推送一次代码触发新部署。

---

## 三、检查清单

- [ ] Render 后端 **Root Directory** = `backend`
- [ ] Render 已配置 **DATABASE_URL**（PostgreSQL）、**CORS_ORIGINS**（含 Vercel 域名）、**SECRET_KEY**
- [ ] Render 若用 Docker，已改 Dockerfile 使用 `$PORT` 并重新部署
- [ ] Vercel 已配置 **VITE_API_URL** = Render 的 HTTPS 地址（无末尾斜杠、无 `/api`）
- [ ] Vercel 已重新部署一次

前端请求会发到 `VITE_API_URL`，例如：`https://xxx.onrender.com/api/strategies`。后端 CORS 里包含的 Vercel 域名要和浏览器里打开的站点一致（含 `https://`）。

---

## 四、常见问题

**1. 前端打开后接口 404 / 报错**  
- 确认 Vercel 的 `VITE_API_URL` 和 Render 服务 URL 完全一致（复制粘贴）。  
- 确认已 **Redeploy** 前端，而不是只改了环境变量不部署。

**2. CORS 报错**  
- 检查 Render 的 `CORS_ORIGINS` 是否为合法 JSON 数组，且包含当前访问前端的完整域名（如 `https://xxx.vercel.app`）。

**3. Render 启动失败 / 数据库连接失败**  
- 若是 Python 方式，确认 Start Command 里有 `alembic upgrade head` 且 **DATABASE_URL** 已填。  
- 若先建了 Web Service 再建 PostgreSQL，要在 Web Service 的 Environment 里再保存一次，触发重新部署。

**4. 后端 503 / 表结构过期**  
- Render 每次部署会重新跑 `alembic upgrade head`；若之前数据库是空的，第一次部署后表会建好。若仍报错，可在 Render **Shell** 里进容器/环境执行一次 `alembic upgrade head` 排查。
