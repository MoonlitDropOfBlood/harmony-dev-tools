# 修复 LogViewer 日志显示和模块检测问题 Spec

## Why
用户报告了两个问题：
1. LogViewer 的 WebView 没有显示日志 - 日志过滤逻辑存在问题，导致日志无法正确显示在 WebView 中
2. Run and Build 报没有 module - 模块检测或命令生成存在问题，导致构建失败

## What Changes
- **FIXED**: 修复 `logViewer.ts` 中的日志过滤逻辑，确保日志能正确显示在 WebView 中
- **FIXED**: 修复 `shouldShowLog` 函数中的过滤条件判断
- **FIXED**: 修复 `buildHvigorCommand` 函数，确保在无模块时能正确生成命令
- **FIXED**: 修复 `detectProjectModule` 的错误处理，提供更清晰的错误信息

## Impact
- Affected code: `src/device/logViewer.ts`, `src/utils/hvigor.ts`, `src/utils/projectMetadata.ts`
- Affected feature: LogViewer, Build HAP, Build & Run

## ADDED Requirements

### Requirement: LogViewer 日志正确显示
The system SHALL correctly display logs in the WebView panel.

#### Scenario: Logs appear in WebView
- **GIVEN** 用户执行 "Open Device Logs" 命令并选择设备
- **WHEN** 设备开始发送日志数据
- **THEN** 日志 SHALL 正确显示在 WebView 中
- **AND** 日志格式 SHALL 保持正确（时间戳、级别、进程名/PID、标签、消息）

#### Scenario: Log filtering works correctly
- **GIVEN** WebView 日志面板已打开
- **WHEN** 用户设置过滤条件（日志级别、进程名、关键字）
- **THEN** 过滤 SHALL 正确生效
- **AND** 符合条件的日志 SHALL 显示

### Requirement: 模块检测和构建命令生成
The system SHALL correctly detect project modules and generate valid build commands.

#### Scenario: Build with detected module
- **GIVEN** 项目存在 `build-profile.json5` 且有模块配置
- **WHEN** 执行 Build HAP 或 Build & Run
- **THEN** 系统 SHALL 正确检测模块
- **AND** 生成的 hvigor 命令 SHALL 包含正确的模块参数

#### Scenario: Build without module detection
- **GIVEN** 模块检测失败或项目无模块配置
- **WHEN** 执行构建命令
- **THEN** 系统 SHALL 生成不带模块参数的命令
- **AND** 构建 SHALL 正常执行

## MODIFIED Requirements

### Requirement: 日志过滤逻辑
The system SHALL correctly filter logs based on user settings.

#### Scenario: Filter by log level
- **GIVEN** 用户设置了日志级别过滤
- **WHEN** 新日志到达
- **THEN** 只有匹配级别的日志 SHALL 显示
- **AND** 当 filterLevel 为 null 或 'All' 时，所有级别 SHALL 显示

#### Scenario: Filter by process name
- **GIVEN** 用户设置了进程名过滤
- **WHEN** 新日志到达
- **THEN** 只有进程名包含过滤值的日志 SHALL 显示（不区分大小写）
