# HarmonyOS Dev Tools - 语言支持删除实施计划

## [ ] Task 1: 删除 src/language/ 目录及其所有文件
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 删除 `src/language/` 目录及其所有文件
  - 确保目录完全被移除
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 确认 `src/language/` 目录不存在
- **Notes**: 这是最基础的任务，需要首先完成

## [ ] Task 2: 从 extension.ts 中移除语言支持注册代码
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 移除 `registerLazyLanguageFeatures` 函数
  - 移除 `registerDxEnhancements` 函数中与语言支持相关的代码
  - 移除对语言模块的所有引用
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 确认 `extension.ts` 中不再包含语言支持相关的代码
  - `programmatic` TR-2.2: 确认 `extension.ts` 代码语法正确
- **Notes**: 需要仔细检查 `extension.ts` 文件，确保所有语言支持相关的代码都被移除

## [ ] Task 3: 从 package.json 中移除语言相关贡献点
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 移除 `contributes.languages` 中的 ArkTS 和 Cangjie 语言定义
  - 移除 `contributes.grammars` 中的语法定义
  - 移除 `contributes.snippets` 中的代码片段定义
  - 移除 `categories` 中的 `"Linters"` 分类
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 确认 `package.json` 中不再包含语言相关的贡献点
  - `programmatic` TR-3.2: 确认 `package.json` 格式正确
- **Notes**: 需要保持 `package.json` 的其他部分不变

## [ ] Task 4: 清理其他文件中对语言模块的引用
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 查找并清理其他文件中对语言模块的引用
  - 特别关注 `src/tools/apiCompatChecker.ts` 等可能引用语言模块的文件
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 确认没有文件引用已删除的语言模块
  - `programmatic` TR-4.2: 确认所有文件语法正确
- **Notes**: 使用 grep 等工具查找对语言模块的引用

## [x] Task 5: 验证项目构建和运行
- **Priority**: P0
- **Depends On**: Task 2, Task 3, Task 4
- **Description**: 
  - 运行构建命令验证项目能够成功构建
  - 检查是否有任何构建错误
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 项目能够成功构建
  - `programmatic` TR-5.2: 构建过程中没有错误
- **Notes**: 运行 `npm run build` 命令验证构建，构建成功

## [x] Task 6: 清理相关配置和文档
- **Priority**: P2
- **Depends On**: Task 5
- **Description**: 
  - 清理与语言支持相关的配置选项
  - 更新项目文档以反映语言支持的删除
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment` TR-6.1: 确认配置选项已清理
  - `human-judgment` TR-6.2: 确认文档已更新
- **Notes**: 这是可选任务，根据实际情况决定是否需要

**清理内容**:
- 移除了与语言支持相关的配置选项：`autoFormatOnSave`, `enableCodeLens`, `enableResourceValidation`, `enableDiagnostics`, `enablePerfLens`
- 移除了 debuggers 中对 arkts 语言的引用