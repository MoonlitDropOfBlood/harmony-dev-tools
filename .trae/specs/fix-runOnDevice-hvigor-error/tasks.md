# Tasks

- [x] Task 1: 添加模块检测函数到 projectMetadata.ts
  - [x] 实现 `detectProjectModule` 函数，从 build-profile.json5 读取 modules 字段
  - [x] 优先返回 name 为 entry 的模块
  - [x] 如果没有 entry，返回第一个模块的 name
  - [x] 添加错误处理，当文件不存在或解析失败时返回 undefined

- [x] Task 2: 修改 hvigor.ts 中的 buildHvigorCommand 函数
  - [x] 确保 module 参数正确拼接到命令中
  - [x] 格式为 `:moduleName:task` 或 `task`（无模块时）

- [x] Task 3: 修改 runner.ts 中的 buildHap 函数
  - [x] 调用 buildHvigorCommand 前，先检测项目模块
  - [x] 将检测到的模块传递给 buildHvigorCommand

- [x] Task 4: 验证修复
  - [x] 编译项目确保无语法错误
  - [x] 检查生成的命令格式是否正确
