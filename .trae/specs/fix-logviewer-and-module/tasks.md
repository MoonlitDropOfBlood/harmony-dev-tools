# Tasks

## [x] Task 1: 修复 LogViewer 日志显示问题
- **Description**: 修复 `logViewer.ts` 中的日志过滤和显示逻辑，确保日志能正确显示在 WebView 中
- **Files**: `src/device/logViewer.ts`
- **Issues to fix**:
  1. `shouldShowLog` 函数中的 `filterLevel` 判断逻辑问题 - 当 `filterLevel` 为 null 时应显示所有级别
  2. `processLogLine` 中的过滤调用逻辑 - 确保原始日志行也能正确显示
  3. 验证 WebView 消息推送机制正常工作

### [x] SubTask 1.1: 修复 shouldShowLog 函数
- 修复级别过滤逻辑：当 `filterLevel` 为 null 或空字符串时，显示所有级别
- 修复进程名过滤：正确处理空进程名的情况

### [x] SubTask 1.2: 修复 processLogLine 函数
- 确保无法解析的日志行也能正确显示
- 验证过滤调用参数正确

### [x] SubTask 1.3: 验证 WebView 通信
- 确保 `postMessage` 正确发送日志到 WebView
- 验证 WebView 端的 `addLogs` 消息处理正确

## [x] Task 2: 修复模块检测和构建命令问题
- **Description**: 修复模块检测逻辑和 hvigor 命令生成，确保构建命令正确
- **Files**: `src/utils/projectMetadata.ts`, `src/utils/hvigor.ts`, `src/build/buildAndRun.ts`, `src/build/runner.ts`
- **Issues to fix**:
  1. `detectProjectModule` 的解析逻辑可能不够健壮
  2. `buildHvigorCommand` 在无模块时的命令格式
  3. 错误处理和用户提示

### [x] SubTask 2.1: 增强 detectProjectModule 函数
- 改进 `build-profile.json5` 解析逻辑
- 添加更好的错误处理和日志
- 处理不同的 JSON5 格式变体

### SubTask 2.2: 修复 buildHvigorCommand 函数
- 确保无模块时生成正确的命令格式
- 验证命令格式符合 DevEco Studio 要求

### SubTask 2.3: 添加构建错误处理
- 当模块检测失败时，提供清晰的错误信息
- 允许用户手动选择或输入模块名

## Task 3: 测试和验证
- **Description**: 验证修复后的功能正常工作
- **Acceptance Criteria**:
  1. LogViewer WebView 能正确显示日志
  2. 日志过滤功能正常工作
  3. Build HAP 和 Build & Run 能正确检测模块并执行
  4. 无模块时能正确生成命令

# Task Dependencies
- Task 3 depends on Task 1 and Task 2
