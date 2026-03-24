# Checklist

## LogViewer 修复验证

### 日志显示功能
- [x] 执行 "Open Device Logs" 命令后，WebView 正确打开
- [x] 设备日志正确显示在 WebView 中（修复了 shouldShowLog 过滤逻辑）
- [x] 日志格式正确（时间戳、级别、进程名/PID、标签、消息）
- [x] 无法解析的日志行也能显示（修复了 processLogLine）
- [ ] 大量日志时性能正常，不卡顿

### 日志过滤功能
- [x] 日志级别过滤正常工作（DEBUG/INFO/WARN/ERROR/All）
- [x] 进程名过滤正常工作（部分匹配，不区分大小写）
- [x] 关键字过滤正常工作（包含进程名检查，不区分大小写）
- [x] 正则过滤正常工作（添加了 i 标志）
- [x] 清除按钮能重置所有过滤条件
- [x] 默认显示所有日志（无过滤时）

### WebView 通信
- [x] 日志正确推送到 WebView
- [x] 过滤设置正确同步到 Extension
- [x] 自动进程过滤（bundleName）正常工作

## 模块检测和构建修复验证

### 模块检测
- [x] `detectProjectModule` 能从 `build-profile.json5` 正确读取模块（增强了解析逻辑）
- [x] 优先返回 entry 模块
- [x] 无 entry 时返回第一个模块
- [x] 文件不存在或解析失败时返回 undefined（添加了错误日志）

### 构建命令生成
- [x] 有模块时生成正确的命令格式（含 `--mode module -p module=name@default`）
- [x] 无模块时生成正确的命令格式（仅 `hvigorw.bat assembleHap --no-daemon`）
- [ ] Build HAP 功能正常工作
- [ ] Build & Run 功能正常工作

### 错误处理
- [x] 模块检测失败时有清晰的错误提示（添加了 console.warn）
- [ ] 构建失败时有清晰的错误信息
