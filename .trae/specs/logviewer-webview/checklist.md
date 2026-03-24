# logViewer WebView 重构 - Verification Checklist

## 基础功能验证
- [ ] 执行 "Open Device Logs" 命令后打开 WebView 而非 OutputChannel
- [ ] WebView 面板标题正确显示（如 "HarmonyOS Logs"）
- [ ] WebView 可以正常关闭和重新打开

## UI 验证
- [ ] WebView 顶部显示日志级别下拉框（DEBUG/INFO/WARN/ERROR/All）
- [ ] WebView 顶部显示进程名输入框
- [ ] WebView 顶部显示关键字输入框
- [ ] WebView 顶部显示正则开关（复选框）
- [ ] WebView 顶部显示清除按钮
- [ ] 日志显示区域可滚动
- [ ] 样式与 VS Code 深色主题一致

## 过滤功能验证
- [ ] 日志级别过滤正常工作
- [ ] 进程名过滤正常工作（部分匹配）
- [ ] 关键字过滤正常工作
- [ ] 正则过滤正常工作
- [ ] 清除按钮可以清除所有过滤
- [ ] 过滤变更立即生效

## 日志显示验证
- [ ] 日志格式正确显示（时间戳、级别、进程名/PID、标签、消息）
- [ ] 新日志正确追加到列表
- [ ] 大量日志时性能正常

## 自动进程过滤验证
- [ ] 在鸿蒙工程中打开日志面板时，进程名输入框自动填充 bundleName
- [ ] 非鸿蒙工程中不自动填充

## 代码质量验证
- [ ] 复用了现有的日志解析逻辑
- [ ] 复用了现有的过滤逻辑
- [ ] 保留了缓冲机制
- [ ] 移除了旧的 OutputChannel 代码
- [ ] 移除了旧的过滤命令
- [ ] 代码风格与项目现有 WebView 实现一致
