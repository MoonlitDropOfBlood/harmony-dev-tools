# logViewer WebView 重构 - Product Requirement Document

## Overview
- **Summary**: 将 logViewer 从 OutputChannel 实现改为 WebView 弹窗实现，将过滤条件从命令形式改为 WebView 界面内的直接操作。
- **Purpose**: 提供更好的用户体验，让过滤操作更直观，日志展示更灵活。
- **Target Users**: HarmonyOS 开发者使用 hilog 查看和过滤日志。

## Goals
- 将 logViewer 从 OutputChannel 迁移到 WebView
- 在 WebView 中提供直观的过滤 UI（日志级别、进程名、关键字/正则）
- 保持现有的日志解析、过滤和缓冲功能
- 保持自动进程过滤功能（从鸿蒙工程读取 bundleName）
- 保持性能优化（缓冲、行数限制）

## Non-Goals (Out of Scope)
- 不改变 hilog 的基础功能（设备连接、日志流读取）
- 不重新实现日志解析逻辑
- 不添加新的日志格式化选项

## Background & Context
当前 logViewer 使用 OutputChannel 在底部面板展示，过滤操作通过 VS Code 命令实现。项目中已有多个 WebView 使用示例（preview/panel.ts、device/mirrorPanel.ts、debug/inspectorPanel.ts），可以参考这些实现模式。

## Functional Requirements
- **FR-1**: 创建 WebView 面板展示日志
- **FR-2**: 在 WebView 顶部提供过滤控件（日志级别下拉框、进程名输入框、关键字输入框、正则开关、清除按钮）
- **FR-3**: WebView 与 extension 双向通信（过滤设置变更通知、日志流推送）
- **FR-4**: 保持日志缓冲和批量推送机制
- **FR-5**: 保持自动从鸿蒙工程读取 bundleName 作为默认进程过滤

## Non-Functional Requirements
- **NFR-1**: 日志显示性能与当前 OutputChannel 实现相当
- **NFR-2**: WebView 响应快速，过滤操作无明显延迟
- **NFR-3**: 遵循项目现有 WebView 代码风格

## Constraints
- **Technical**: 使用 VS Code WebView API，遵循现有代码结构
- **Dependencies**: 复用现有的 log 解析、过滤、缓冲逻辑

## Assumptions
- 现有 hilog 日志解析逻辑保持不变
- 现有过滤逻辑保持不变
- 现有性能优化（缓冲、行数限制）保持不变

## Acceptance Criteria

### AC-1: WebView 面板打开
- **Given**: 用户执行 "Open Device Logs" 命令
- **When**: 选择设备后
- **Then**: 打开 WebView 面板而不是 OutputChannel
- **Verification**: `programmatic`

### AC-2: 过滤 UI 显示
- **Given**: WebView 面板已打开
- **When**: 查看 WebView 顶部
- **Then**: 显示日志级别下拉框、进程名输入框、关键字输入框、正则开关、清除按钮
- **Verification**: `human-judgment`

### AC-3: 过滤功能正常工作
- **Given**: WebView 面板已打开，日志正在流
- **When**: 用户在 WebView 中更改过滤设置
- **Then**: 过滤立即生效，日志按新条件显示
- **Verification**: `human-judgment`

### AC-4: 自动进程过滤
- **Given**: 当前工作区是鸿蒙工程
- **When**: 打开 WebView 日志面板
- **Then**: 进程名输入框自动填充为工程的 bundleName
- **Verification**: `programmatic`

### AC-5: 日志显示正确
- **Given**: WebView 面板已打开
- **When**: 查看日志内容
- **Then**: 日志格式与之前保持一致（时间戳、级别、进程名/ PID、标签、消息）
- **Verification**: `human-judgment`

### AC-6: 缓冲机制正常
- **Given**: WebView 面板已打开
- **When**: 大量日志快速流
- **Then**: 日志批量显示，性能正常
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要添加日志滚动锁定功能？
- [ ] 是否需要添加日志搜索/高亮功能？
