# phdfit-admin 项目规范

## 通用规则

- 必须使用中文回复。英文专业名词可以在括号里标注
- 每次回复的开头必须称呼用户为「叫兽」
- 每次写完代码后必须更新 `../doc/VERSION_HISTORY.md`（标注 `[admin]`）和 `../doc/TODO.md`
- 代码审查使用 everything-claude-code 的 code-reviewer agent
- 数据库操作必须先告知叫兽并得到明确同意

## 技术栈

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase (同 webapp 共享数据库)
- Recharts (图表/数据可视化)

## 项目定位

这是**内部管理后台**，用于：
- 查看和管理教授数据（编辑 profile、查看 enrichment 状态）
- 查看候选人数据和匹配结果
- 监控系统状态（enrichment 进度、API 健康）
- 管理 shortlist 和搜索结果

## 与 webapp 的关系

- 共享同一个 Supabase 数据库
- 共享同一个 Pipeline FastAPI 后端
- 技术栈完全一致（Next.js + shadcn），但**不共享代码**
- admin 是只读为主 + 少量编辑操作，webapp 是用户端完整体验

## 编码规范

- 与 webapp 保持一致的代码风格和组件模式
- API route handler 必须验证用户身份
- 教授编辑操作需要确认对话框（防误操作）

## Next.js 注意事项

@AGENTS.md
