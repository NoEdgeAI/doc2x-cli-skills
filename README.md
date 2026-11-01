# @noedgeai/doc2x-cli-skills

Claude Code 技能插件，用于安装、配置和使用 **@noedgeai-org/doc2x-cli** —— 文档解析、翻译与批量处理工具。

## 安装

### 通过 npx 一键安装（推荐）

直接从公开 GitHub 仓库拉取 skill 插件本身：

```bash
# 安装到个人作用域（所有项目生效）
npx github:noedgeai/doc2x-cli-skills

# 安装到项目作用域（仅当前项目，可与协作者共享）
npx github:noedgeai/doc2x-cli-skills --project
```

脚本会自动将技能文件复制到对应的 `~/.claude/skills/doc2x-cli` 或 `.claude/skills/doc2x-cli` 目录。

这一步只安装本仓库的 skill 插件，不会安装 `@noedgeai-org/doc2x-cli`。

### 手动安装

```bash
git clone https://github.com/noedgeai/doc2x-cli-skills.git
cd doc2x-cli-skills

# 个人作用域
cp -r skills/doc2x-cli ~/.claude/skills/doc2x-cli

# 项目作用域
cp -r skills/doc2x-cli .claude/skills/doc2x-cli
```

### Codex CLI / 其他 Agent

```bash
git clone https://github.com/noedgeai/doc2x-cli-skills.git
cd doc2x-cli-skills

# 用户作用域
cp -r skills/doc2x-cli ~/.agents/skills/doc2x-cli

# 仓库作用域
cp -r skills/doc2x-cli .agents/skills/doc2x-cli
```

### 验证

在 Claude Code 中输入 `/doc2x-cli`，应能在自动补全中看到该技能。

## 使用

```
/doc2x-cli
/doc2x-cli 如何将 PDF 解析为 Markdown
/doc2x-cli 批量处理配置
```

### 无客户端登录与保留排版翻译

以下行为已按 `@noedgeai-org/doc2x-cli@0.1.11`（2026-09-21）核对：

```bash
npm i -g @noedgeai-org/doc2x-cli@latest
doc2x login
doc2x models list --auth-mode oauth
doc2x translate ./paper.pdf --auth-mode oauth --translate-type pdf --target-language zh --pdf-font-strategy page-optimal --out ./output
```

从 0.1.11 起，默认自动使用 `login` 保存的 CLI 登录，没有 CLI 登录时才使用桌面账号；显式 `--auth-mode client/oauth` 和配置文件选择优先，OAuth 刷新失败不会切到另一账号。0.1.9 仍需带 `--auth-mode oauth`。浏览器应在运行 CLI 的电脑上完成授权；`--no-browser` 只是打印登录地址，仍需回调本机随机端口。

保留排版翻译用 `--translate-type pdf`，默认导出 PDF，原文在左、译文在右，保留各自页面排版。0.1.11 会在上传前拒绝不支持的 `--to docx/md/html/tex` 或 `--convert-trans origin/translate` 组合；0.1.9 会静默忽略这些参数。没有切换左右/上下排布、反转原译文或仅译文 PDF 的开关。默认翻译模型为免费模型 `10001`。

需要可编辑的译文 Word 时，使用 `--translate-type md --convert-trans translate --to docx`，输出会重新排版。网页端的保留排版 Word/WPS、MathType、Typst、表格 Excel 等导出，以及图片翻译编辑，不能直接套用为 CLI 参数。当前 CLI 接收 PDF 和指定图片格式；Word/PPT 输入需先转 PDF。详见[命令参考](skills/doc2x-cli/references/command-reference.md#translation-and-export-modes)。

## 包含内容

CLI 0.3.0 功能构建增加“一次处理，多格式导出”。先检查 `doc2x export --help`；Skill 版本不代表 npm 已发布对应 CLI。若最新稳定版仍是 0.2.0，保留回执并等待支持该命令的 CLI，不要重复解析或翻译来模拟复用。

```bash
doc2x parse ./paper.pdf --to none --receipt ./parsed.json
doc2x export --receipt ./parsed.json --to md,docx,html --out ./exports

doc2x translate ./paper.pdf --translate-type md --target-language en --to none --receipt ./translated.json
doc2x export --receipt ./translated.json --to md,docx,html --out ./translated-exports

doc2x parse ./paper.pdf --reuse ./parsed.json --to tex --out ./more-exports
```

已有回执时直接导出，省略第一次处理。复用命令不新建解析或翻译任务；每种格式存入独立子目录。`--reuse` 按上传内容的 SHA-256 校验文件，普通 `parse/translate` 不会自动查缓存。固定排版翻译仍只支持 PDF。过期（自原任务起满 30 天）、删除、账号不可访问或下载失败时，不会自动重新扣额度处理。应在过期前保存本地文件和图片资源。详见[结果复用与过期处理](skills/doc2x-cli/references/result-reuse.md)。

CLI 0.2.0 增加账户/额度/订阅查询、任务回执与结果历史、单任务已报告用量、模型详情和 Zotero manifest。消费账单历史不开放；Zotero manifest 只为外部工具准备文件和元数据，不直接写文献库。

```bash
doc2x account status --json
doc2x translate ./paper.pdf --translate-type pdf --receipt ./run.json --json
doc2x records list --kind translate --limit 20 --json
doc2x usage show --translate-id ot_example --json
doc2x models show 10001 --json
doc2x zotero manifest --receipt ./run.json --library-id 1 --item-key ABCD1234 --out ./import.json --json
```

请用回执中的真实任务 ID 和 Zotero 工具提供的真实条目 key 替换示例。详见[账户与回执](skills/doc2x-cli/references/account-and-receipts.md)和[Zotero 工作流](skills/doc2x-cli/references/zotero-workflow.md)。

| 技能 | 说明 |
|------|------|
| `doc2x-cli` | 将 PDF/图片解析为 Markdown、LaTeX、Word、HTML 或 PDF。支持文档翻译（11 种语言）、批量处理、翻译术语表管理。 |

```
skills/doc2x-cli/
├── SKILL.md                   # 入口与快速参考
├── agents/
│   └── agent.yaml             # Agent 接口配置
└── references/
    ├── command-reference.md    # 完整命令与选项参考
    ├── config-and-auth.md     # 认证、配置模式、退出码
    ├── troubleshooting.md     # 错误信息与调试指南
    ├── account-and-receipts.md # 账户、任务回执与结果查询
    ├── result-reuse.md         # 同一结果多格式导出、文件校验与过期处理
    └── zotero-workflow.md     # 外部 Zotero 工具导入流程
```

## 卸载

```bash
# Claude Code
rm -rf ~/.claude/skills/doc2x-cli    # 个人作用域
rm -rf .claude/skills/doc2x-cli      # 项目作用域

# Codex / Agents 标准
rm -rf ~/.agents/skills/doc2x-cli    # 用户作用域
rm -rf .agents/skills/doc2x-cli      # 仓库作用域
```

## 环境要求

技能插件本身无运行时依赖。它所服务的 CLI 工具需要：

- Node.js >= 22
- `@noedgeai-org/doc2x-cli`

  ```bash
  npm i -g @noedgeai-org/doc2x-cli@latest
  ```

- Doc2X 账号 —— [doc2x.noedgeai.com](https://doc2x.noedgeai.com/)

## 相关链接

- [Doc2X 官网](https://doc2x.noedgeai.com/)
- [Agent Skills 标准](https://agentskills.io)
