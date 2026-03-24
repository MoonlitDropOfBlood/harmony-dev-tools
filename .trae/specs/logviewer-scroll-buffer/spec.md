# LogViewer 滚动缓冲区优化 Spec

## Why
当前 LogViewer 的实现中，当日志达到 10000 条限制时，Extension 端会停止接收新日志（`totalLines >= MAX_LOG_LINES` 时直接返回）。这导致用户无法看到最新的日志。用户希望在 WebView 上始终显示最多 10000 条日志，当新日志到达时，自动移除最旧的日志，保持滚动更新。

## What Changes
- **MODIFIED**: 修改 Extension 端的日志缓冲逻辑，移除 `totalLines` 的硬限制
- **MODIFIED**: 优化 WebView 端的日志存储逻辑，确保始终保留最新的 10000 条
- **ADDED**: 添加日志滚动通知机制，当删除旧日志时通知 WebView 更新显示

## Impact
- Affected code: `src/device/logViewer.ts`
- Affected feature: LogViewer WebView 日志显示

## MODIFIED Requirements

### Requirement: 日志滚动缓冲区
The system SHALL maintain a rolling buffer of maximum 10000 log entries in the WebView.

#### Scenario: New log arrives when buffer is full
- **GIVEN** WebView 中已有 10000 条日志
- **WHEN** 新日志到达
- **THEN** 最旧的日志 SHALL 被移除
- **AND** 新日志 SHALL 被添加到末尾
- **AND** 显示 SHALL 自动更新

#### Scenario: Continuous log streaming
- **GIVEN** 设备正在持续发送日志
- **WHEN** 日志数量超过 10000 条
- **THEN** 系统 SHALL 继续接收新日志
- **AND** 自动移除最旧的日志以保持 10000 条限制

## ADDED Requirements

### Requirement: 性能优化
The system SHALL efficiently handle log buffer trimming to avoid performance issues.

#### Scenario: Batch log processing
- **GIVEN** 大量日志同时到达
- **WHEN** 需要批量添加到缓冲区
- **THEN** 系统 SHALL 使用高效的数组操作
- **AND** 避免频繁的 DOM 更新
