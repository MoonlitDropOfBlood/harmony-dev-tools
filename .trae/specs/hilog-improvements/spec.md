# Hilog 展示功能改进 - 产品需求文档

## Overview
- **Summary**: 改进 HarmonyOS Dev Tools 中的 hilog 展示功能，添加多种过滤能力、颜色区分和性能优化，提升开发者调试体验。
- **Purpose**: 解决当前 hilog 展示存在的功能不足和性能问题，使开发者能够更高效地分析和定位设备日志。
- **Target Users**: HarmonyOS 应用开发者、调试人员、测试人员。

## Goals
- 添加日志级别过滤功能（DEBUG/INFO/WARN/ERROR）
- 添加进程过滤功能
- 添加关键字过滤功能（支持正则表达式）
- 添加日志颜色区分，提高可读性
- 优化性能，解决快速大量日志时的崩溃问题
- 保持与现有功能的兼容性

## Non-Goals (Out of Scope)
- 不修改 hilog 命令本身的行为
- 不添加日志持久化存储功能
- 不改变现有的命令注册和调用方式

## Background & Context
当前 hilog 展示功能使用简单的 OutputChannel 实现，直接将设备日志流式输出到 VS Code 面板。这种实现方式存在以下问题：
1. 无过滤能力，无法快速定位关键信息
2. 无颜色区分，日志内容难以快速识别
3. 性能问题，大量日志时容易崩溃
4. 缺少高级搜索和过滤功能

## Functional Requirements
- **FR-1**: 日志级别过滤
  - 支持按 DEBUG、INFO、WARN、ERROR 级别过滤
  - 提供可视化的级别选择界面
  - 实时应用过滤条件

- **FR-2**: 进程过滤
  - 支持按进程名或进程 ID 过滤
  - 提供进程列表供选择
  - 支持多个进程同时过滤

- **FR-3**: 关键字过滤
  - 支持按关键字搜索（包含/排除）
  - 支持正则表达式搜索
  - 实时应用搜索条件

- **FR-4**: 颜色区分
  - 不同日志级别使用不同颜色
  - 关键字匹配结果高亮显示
  - 进程名和时间戳使用不同颜色

- **FR-5**: 性能优化
  - 实现日志缓冲区机制
  - 优化渲染性能
  - 避免快速大量日志导致的崩溃

## Non-Functional Requirements
- **NFR-1**: 性能
  - 能够处理每秒 1000+ 条日志而不卡顿
  - 内存使用不超过 100MB
  - 启动时间不超过 2 秒

- **NFR-2**: 可用性
  - 过滤界面直观易用
  - 操作响应时间不超过 100ms
  - 支持键盘快捷键操作

- **NFR-3**: 兼容性
  - 与现有 VS Code 版本兼容
  - 与 HarmonyOS 不同版本的 hilog 输出格式兼容

## Constraints
- **Technical**: 
  - VS Code 扩展 API 限制
  - Node.js 子进程性能限制
  - 内存和 CPU 资源限制

- **Dependencies**: 
  - HDC 工具
  - VS Code 扩展 API

## Assumptions
- hilog 输出格式保持稳定
- 设备连接状态正常
- 用户具有基本的正则表达式知识（用于高级搜索）

## Acceptance Criteria

### AC-1: 日志级别过滤
- **Given**: 用户打开 hilog 视图
- **When**: 用户选择特定的日志级别（如 ERROR）
- **Then**: 只显示对应级别的日志
- **Verification**: `human-judgment`

### AC-2: 进程过滤
- **Given**: 设备上运行多个进程
- **When**: 用户选择特定进程
- **Then**: 只显示该进程的日志
- **Verification**: `human-judgment`

### AC-3: 关键字过滤
- **Given**: 日志中包含多种内容
- **When**: 用户输入关键字或正则表达式
- **Then**: 只显示包含该关键字的日志
- **Verification**: `human-judgment`

### AC-4: 颜色区分
- **Given**: 不同级别的日志
- **When**: 查看日志
- **Then**: 不同级别的日志显示不同颜色
- **Verification**: `human-judgment`

### AC-5: 性能优化
- **Given**: 设备产生大量日志（每秒 1000+ 条）
- **When**: 打开 hilog 视图
- **Then**: 界面不卡顿，不崩溃
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要支持日志导出功能？
- [ ] 是否需要添加日志统计功能？
- [ ] 如何处理 hilog 格式的变化？