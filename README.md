# @noedgeai/doc2x-cli-skills

Claude Code 技能插件，用于安装、配置和使用 **@noedgeai/doc2x-cli** —— 文档解析、翻译与批量处理工具。

## 安装

### 前置条件

为 `@noedgeai` 作用域配置 GitHub Packages registry（一次性操作）：

```bash
npm config set @noedgeai:registry=https://npm.pkg.github.com
```

> 本包托管在 GitHub Packages 上且公开访问，无需登录或配置 token。

### 通过 npx 一键安装

```bash
# 安装到个人作用域（所有项目生效）
npx @noedgeai/doc2x-cli-skills

# 安装到项目作用域（仅当前项目，可与协作者共享）
npx @noedgeai/doc2x-cli-skills --project
```

脚本会自动将技能文件复制到对应的 `~/.claude/skills/doc2x-cli` 或 `.claude/skills/doc2x-cli` 目录。

### 手动安装

```bash
npm i @noedgeai/doc2x-cli-skills
```

然后手动复制技能文件：

```bash
# 个人作用域
cp -r node_modules/@noedgeai/doc2x-cli-skills/skills/doc2x-cli ~/.claude/skills/doc2x-cli

# 项目作用域
cp -r node_modules/@noedgeai/doc2x-cli-skills/skills/doc2x-cli .claude/skills/doc2x-cli
```

### Codex CLI / 其他 Agent

```bash
# 用户作用域
cp -r node_modules/@noedgeai/doc2x-cli-skills/skills/doc2x-cli ~/.agents/skills/doc2x-cli

# 仓库作用域
cp -r node_modules/@noedgeai/doc2x-cli-skills/skills/doc2x-cli .agents/skills/doc2x-cli
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
| `doc2x-cli` | 将 PDF/图片解析为 Markdown、LaTeX、Word、HTML 或 PDF。支持文档翻译（10 种语言）、目录批量并行处理、翻译术语表管理。 |

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
- `@noedgeai/doc2x-cli` —— 通过 `npm i -g @noedgeai/doc2x-cli` 安装
- Doc2X 账号 —— [doc2x.noedgeai.com](https://doc2x.noedgeai.com/)

## 发布（维护者）

本包发布到 GitHub Packages，作用域为 `@noedgeai`。

```bash
# 登录 GitHub Packages（需要 write:packages 权限的 token）
npm login --scope=@noedgeai --auth-type=legacy --registry=https://npm.pkg.github.com

# 升版
npm version patch  # 或 minor / major

# 发布
npm publish
```

## 相关链接

- [Doc2X 官网](https://doc2x.noedgeai.com/)
- [Agent Skills 标准](https://agentskills.io)
