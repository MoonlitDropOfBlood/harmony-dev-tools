# Checklist

- [x] `detectProjectModule` 函数已实现，能从 build-profile.json5 正确读取模块信息
- [x] `detectProjectModule` 优先返回 entry 模块，其次是第一个模块
- [x] `buildHvigorCommand` 正确生成带模块前缀的命令格式 `:moduleName:task`
- [x] `buildHap` 函数在调用构建前自动检测并使用项目模块
- [x] 项目编译成功，无语法错误
- [x] 生成的 hvigor 命令格式正确（如 `hvigorw.bat :entry:assembleHap --no-daemon`）
