# Tasks

## [x] Task 1: 移除 Extension 端的日志数量限制
- **Description**: 修改 `bufferLog` 函数，移除 `totalLines >= MAX_LOG_LINES` 的硬限制，让日志可以继续推送到 WebView
- **Files**: `src/device/logViewer.ts`
- **Changes**:
  1. 移除 `totalLines` 计数器的限制检查
  2. 保持缓冲机制正常工作

## [x] Task 2: 优化 WebView 端的滚动缓冲区逻辑
- **Description**: 修改 WebView 端的 `addLog` 和 `addLogs` 消息处理，确保高效地维护 10000 条限制
- **Files**: `src/device/logViewer.ts` (WebView HTML 中的 script 部分)
- **Changes**:
  1. 优化 `allLogs` 数组的 trim 逻辑，使用 `slice` 保留最新的日志
  2. 确保在批量添加日志时只进行一次 trim 操作
  3. 保持过滤和显示逻辑正常工作

## [x] Task 3: 添加日志计数显示（可选）
- **Description**: 在 WebView 工具栏显示当前日志数量，帮助用户了解缓冲区状态
- **Files**: `src/device/logViewer.ts`
- **Changes**:
  1. 在工具栏添加日志计数显示
  2. 当日志数量达到限制时给出视觉提示

## [x] Task 4: 测试和验证
- **Description**: 验证滚动缓冲区功能正常工作
- **Acceptance Criteria**:
  1. 日志可以持续接收，不会因为达到 10000 条而停止
  2. 当超过 10000 条时，最旧的日志被正确移除
  3. 新日志正确显示在 WebView 中
  4. 过滤功能在日志滚动后仍然正常工作
  5. 性能良好，不会因为频繁 trim 而卡顿

# Task Dependencies
- Task 2 depends on Task 1
- Task 4 depends on Task 2
