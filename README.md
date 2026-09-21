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

以下行为已按 npm 稳定版 `@noedgeai-org/doc2x-cli@0.1.9`（2026-09-21）核对：

```bash
npm i -g @noedgeai-org/doc2x-cli@latest
doc2x login
doc2x models list --auth-mode oauth
doc2x translate ./paper.pdf --auth-mode oauth --translate-type pdf --target-language zh --pdf-font-strategy page-optimal --out ./output
```

`login` 不会把默认认证模式从 `client` 改成 `oauth`，后续命令需带 `--auth-mode oauth`，或通过 `--config` 指定 `authMode: oauth`。浏览器应在运行 CLI 的电脑上完成授权；`--no-browser` 只是打印登录地址，仍需回调本机随机端口。

保留排版翻译用 `--translate-type pdf`，导出原文在左、译文在右的双语对照 PDF，保留各自页面排版。当前 CLI 的 `--convert-trans` 不影响这条导出路径，也没有切换左右/上下排布、反转原译文或仅译文 PDF 的选择开关。默认翻译模型为免费模型 `10001`。

需要可编辑的译文 Word 时，使用 `--translate-type md --convert-trans translate --to docx`，输出会重新排版。网页端的保留排版 Word/WPS、MathType、Typst、表格 Excel 等导出，以及图片翻译编辑，不能直接套用为 CLI 参数。当前 CLI 接收 PDF 和指定图片格式；Word/PPT 输入需先转 PDF。详见[命令参考](skills/doc2x-cli/references/command-reference.md#translation-and-export-modes)。

## 包含内容

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
    └── troubleshooting.md     # 错误信息与调试指南
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
