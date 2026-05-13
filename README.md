# @noedgeai/doc2x-cli-skills

Claude Code 技能插件，用于安装、配置和使用 **@noedgeai/doc2x-cli** —— 文档解析、翻译与批量处理工具。

## 安装

### 通过 npx 一键安装（推荐）

直接从 GitHub 拉取，无需配置 registry：

```bash
# 安装到个人作用域（所有项目生效）
npx github:noedgeai/doc2x-cli-skills

# 安装到项目作用域（仅当前项目，可与协作者共享）
npx github:noedgeai/doc2x-cli-skills --project
```

脚本会自动将技能文件复制到对应的 `~/.claude/skills/doc2x-cli` 或 `.claude/skills/doc2x-cli` 目录。

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

## 包含内容

| 技能 | 说明 |
|------|------|
| `doc2x-cli` | 将 PDF/图片解析为 Markdown、LaTeX、Word、HTML 或 PDF。支持文档翻译（10 种语言）、批量处理、翻译术语表管理。 |

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
- `@noedgeai/doc2x-cli` —— 安装前需先配置 registry：`npm config set @noedgeai:registry=https://npm.pkg.github.com`，然后 `npm i -g @noedgeai/doc2x-cli`
- Doc2X 账号 —— [doc2x.noedgeai.com](https://doc2x.noedgeai.com/)

> **注意：** 技能插件（本仓库）通过 GitHub 仓库直接安装，无需 registry 配置。但 CLI 工具本身托管在 GitHub Packages，安装时仍需要上述 registry 配置。技能在使用时会自动检查并引导完成这些前置步骤。

## 相关链接

- [Doc2X 官网](https://doc2x.noedgeai.com/)
- [Agent Skills 标准](https://agentskills.io)
