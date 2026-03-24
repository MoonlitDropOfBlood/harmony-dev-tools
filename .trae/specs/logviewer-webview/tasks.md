# logViewer WebView 重构 - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 创建 WebView 面板基础结构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 参考现有的 WebView 实现（preview/panel.ts、mirrorPanel.ts、inspectorPanel.ts）
  - 在 logViewer.ts 中创建 WebView 面板
  - 实现面板的打开、关闭、重用逻辑
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: 执行 "Open Device Logs" 命令后打开 WebView 而非 OutputChannel
  - `human-judgement` TR-1.2: WebView 面板标题正确显示
- **Notes**: 使用 `vscode.window.createWebviewPanel`，设置 `enableScripts: true` 和 `retainContextWhenHidden: true`

## [ ] Task 2: 实现 WebView UI（包括过滤控件）
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建 WebView HTML 结构
  - 顶部工具栏：日志级别下拉框（DEBUG/INFO/WARN/ERROR/All）、进程名输入框、关键字输入框、正则开关、清除按钮
  - 日志显示区域：可滚动的日志列表
  - 深色主题样式，与 VS Code 一致
- **Acceptance Criteria Addressed**: [AC-2, AC-5]
- **Test Requirements**:
  - `human-judgement` TR-2.1: WebView 顶部显示所有过滤控件
  - `human-judgement` TR-2.2: 日志格式正确显示（时间戳、级别、进程名/PID、标签、消息）
  - `human-judgement` TR-2.3: 样式与 VS Code 深色主题一致
- **Notes**: 参考 mirrorPanel.ts 和 inspectorPanel.ts 的样式实现

## [ ] Task 3: 实现 WebView 与 Extension 双向通信
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - Extension → WebView: 推送日志数据、推送过滤状态更新
  - WebView → Extension: 过滤设置变更通知
  - 实现 `onDidReceiveMessage` 处理来自 WebView 的消息
  - 实现 `postMessage` 向 WebView 发送消息
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: WebView 中的过滤变更能正确通知到 Extension
  - `programmatic` TR-3.2: Extension 能正确推送日志到 WebView
- **Notes**: 消息格式设计要清晰，包含 command 字段

## [ ] Task 4: 集成现有日志逻辑（解析、过滤、缓冲）
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 保留现有的 `parseLogLine` 函数
  - 保留现有的 `shouldShowLog` 过滤逻辑
  - 保留现有的缓冲机制（`logBuffer`、`flushBuffer`、`startFlushTimer`）
  - 修改日志推送逻辑：将日志推送到 WebView 而非 OutputChannel
  - 保留自动进程过滤功能（从鸿蒙工程读取 bundleName）
- **Acceptance Criteria Addressed**: [AC-3, AC-4, AC-6]
- **Test Requirements**:
  - `programmatic` TR-4.1: 自动进程过滤功能正常工作
  - `human-judgement` TR-4.2: 过滤功能正常工作
  - `human-judgement` TR-4.3: 大量日志时缓冲机制正常
- **Notes**: 尽量复用现有代码，只修改输出部分

## [ ] Task 5: 清理旧代码和命令
- **Priority**: P1
- **Depends On**: Task 4
- **Description**: 
  - 移除不再需要的 OutputChannel 相关代码
  - 移除过滤命令（setLogLevelFilter、setLogProcessFilter、setLogKeywordFilter、clearLogFilters）
  - 从 package.json 中移除这些命令的定义
  - 从 extension.ts 中移除这些命令的注册
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-5.1: 旧的过滤命令不再出现在命令面板
  - `programmatic` TR-5.2: 代码中无 OutputChannel 引用

## [ ] Task 6: 测试和调试
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 全面测试所有功能
  - 验证性能（大量日志时的表现）
  - 修复发现的问题
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5, AC-6]
- **Test Requirements**:
  - `human-judgement` TR-6.1: 所有功能正常工作
  - `human-judgement` TR-6.2: 性能符合预期
