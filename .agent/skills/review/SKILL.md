---
name: review
description: 创建不同周期的复盘文档
---

# 创建复盘文档

当用户说"要复盘了"或"帮我创建复盘"时，按以下步骤处理：

## 步骤

1. **确认复盘类型**
   询问用户需要哪种复盘：
   - 每日复盘 → `reviews/daily/`
   - 每周复盘 → `reviews/weekly/`
   - 每月复盘 → `reviews/monthly/`
   - 项目复盘 → `projects/[项目名]/review.md`

2. **扫描素材暂存区**
   - 检查 `inbox/resources/` 下是否存在与当前复盘周期或项目相关的文件夹。
   - 如果存在图片或录音转录，主动提出将其作为复盘依据。

3. **读取对应模板**
   - 每日：`templates/daily-review.md`
   - 每周：`templates/weekly-review.md`
   - 每月：`templates/monthly-review.md`
   - 项目：`templates/project-review.md`

4. **替换模板变量**
   - `{{DATE}}` → 当前日期 (YYYY-MM-DD)
   - `{{YEAR}}` → 当前年份
   - `{{MONTH}}` → 当前月份
   - `{{WEEK}}` → 当前周数
   - `{{START_DATE}}` → 周一日期
   - `{{END_DATE}}` → 周日日期
   - `{{TIMESTAMP}}` → 完整时间戳
   - `{{PROJECT_NAME}}` → 项目名称

5. **回顾上期 (新增环节)**
   - 自动读取上一个周期的复盘文件（如昨日复盘、上周复盘）
   - 提取其中的"明日调整"或"下周重点"
   - 询问用户："上期计划的xxx完成了吗？"

6. **规划下期 (新增环节)**
   - 询问用户："明日/下周有什么明确的计划或重点？"

7. **生成复盘配图**
   - **确定画面内容**: 根据今日的记录、复盘内容，提炼 1-2 个核心意象。
   - **构建提示词 (Prompt)**:
     - 固定风格: `Modern editorial design, infographic poster style, typography driven, clean vector layout, structured information hierarchy, minimalist swiss style, data visualization aesthetic, high contrast, professional business summary. IMPORTANT: All text, titles, and data labels in the image MUST be in Simplified Chinese.`
     - 动态内容: `A visual layout summarizing [核心意象/主题], incorporating symbolic icons and text blocks to represent [具体内容关键词]`
   - **生成图片**: 使用 `generate_image` 工具生成图片。
   - **保存**: 图片名格式 `YYYY-MM-DD-cover`。

8. **生成文件**
   文件名格式：
   - 每日：`YYYY-MM-DD.md`
   - 每周：`YYYY-W周.md`
   - 每月：`YYYY-MM.md`
   - **注意**: 在文档开头（H1标题下方）插入生成的配图链接 `![Cover](assets/images/reviews/YYYY-MM-DD-cover.png)`

8. **引导填写**
   告知用户文件已创建，并询问是否需要帮助填写内容

## 自动汇总（可选）

如果用户有当周/当月的记录，可以：

- 读取 `reviews/daily/` 下本周的所有日记录
- 汇总到周复盘中
- 读取 `areas/` 下本月的记录作为月复盘参考
