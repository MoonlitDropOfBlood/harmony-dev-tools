# 修复 runOnDevice hvigor 构建错误 Spec

## Why
调用 `runOnDevice` 方法时，如果项目未构建，会触发 `harmony.buildAndRun` 命令。但构建命令使用 `hvigorw.bat assembleHap --no-daemon` 时，出现配置错误 `00303149 Configuration Error - Path not found`，提示检查 `modules` 字段。这表明构建命令缺少必要的模块参数。

## What Changes
- **MODIFIED**: 修改 `buildHvigorCommand` 函数，确保在没有指定模块时使用正确的默认行为
- **MODIFIED**: 修改 `buildHap` 函数，尝试自动检测项目模块并传递给 hvigor 命令
- **ADDED**: 添加模块检测逻辑，从 `build-profile.json5` 中读取模块信息

## Impact
- Affected code: `src/build/runner.ts`, `src/utils/hvigor.ts`, `src/utils/projectMetadata.ts`
- Affected feature: Build HAP, Build & Run, Run on Device

## MODIFIED Requirements

### Requirement: Hvigor 构建命令生成
The system SHALL generate valid hvigor build commands that work with projects having multiple modules.

#### Scenario: Build without explicit module
- **GIVEN** 用户执行 Build HAP 或 Build & Run
- **WHEN** 项目有多个模块或未指定模块
- **THEN** 系统 SHALL 自动检测默认模块（entry 模块或第一个模块）
- **AND** 生成的命令格式为 `hvigorw.bat :entry:assembleHap --no-daemon`

#### Scenario: Build with explicit module
- **GIVEN** 用户指定了特定模块
- **WHEN** 执行构建命令
- **THEN** 系统 SHALL 使用指定模块生成命令 `:moduleName:assembleHap`

## ADDED Requirements

### Requirement: 模块自动检测
The system SHALL detect project modules from build-profile.json5.

#### Scenario: Detect modules from build-profile
- **GIVEN** 项目根目录存在 `build-profile.json5`
- **WHEN** 需要执行 hvigor 构建任务
- **THEN** 系统 SHALL 解析 `modules` 字段
- **AND** 优先返回 `name` 为 `entry` 的模块
- **AND** 如果没有 entry 模块，返回第一个模块的 `name`
