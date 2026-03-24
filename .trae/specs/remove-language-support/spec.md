# HarmonyOS Dev Tools - 语言支持删除计划

## Overview
- **Summary**: 从 HarmonyOS Dev Tools 项目中完全删除语言支持功能，包括所有与 ArkTS 和 Cangjie 语言相关的代码和配置
- **Purpose**: 简化项目结构，移除不需要的语言支持功能
- **Target Users**: 项目维护者

## Goals
- 完全删除 `src/language/` 目录及其所有文件
- 从 `extension.ts` 中移除所有语言支持相关的注册代码
- 从 `package.json` 中移除语言相关的贡献点
- 清理其他文件中对语言模块的引用
- 确保项目在删除语言支持后仍能正常构建和运行

## Non-Goals (Out of Scope)
- 修改其他功能模块的代码
- 更改项目的核心架构
- 删除与语言支持无关的文件

## Background & Context
- 项目当前包含完整的语言支持功能，包括语法高亮、代码补全、诊断等
- 语言支持功能主要集中在 `src/language/` 目录
- 语言支持相关的注册代码在 `extension.ts` 中
- 语言相关的贡献点在 `package.json` 中定义

## Functional Requirements
- **FR-1**: 删除 `src/language/` 目录及其所有文件
- **FR-2**: 从 `extension.ts` 中移除语言支持相关的注册代码
- **FR-3**: 从 `package.json` 中移除语言相关的贡献点
- **FR-4**: 清理其他文件中对语言模块的引用
- **FR-5**: 验证项目在删除语言支持后仍能正常构建和运行

## Non-Functional Requirements
- **NFR-1**: 确保删除过程不影响其他功能模块
- **NFR-2**: 确保项目代码的语法正确性
- **NFR-3**: 确保项目能够正常构建

## Constraints
- **Technical**: 需要确保删除语言支持后，其他功能模块仍然能够正常工作
- **Dependencies**: 某些功能模块可能依赖于语言支持模块，需要确保这些依赖被正确处理

## Assumptions
- 语言支持功能是独立的，删除后不会影响其他核心功能
- 项目的构建系统能够适应语言支持的删除

## Acceptance Criteria

### AC-1: 删除语言目录
- **Given**: 项目结构中存在 `src/language/` 目录
- **When**: 删除 `src/language/` 目录及其所有文件
- **Then**: `src/language/` 目录不再存在
- **Verification**: `programmatic`

### AC-2: 移除语言支持注册代码
- **Given**: `extension.ts` 中包含语言支持相关的注册代码
- **When**: 从 `extension.ts` 中移除所有语言支持相关的注册代码
- **Then**: `extension.ts` 中不再包含语言支持相关的代码
- **Verification**: `human-judgment`

### AC-3: 移除语言相关贡献点
- **Given**: `package.json` 中包含语言相关的贡献点
- **When**: 从 `package.json` 中移除语言相关的贡献点
- **Then**: `package.json` 中不再包含语言相关的贡献点
- **Verification**: `human-judgment`

### AC-4: 清理语言模块引用
- **Given**: 其他文件中存在对语言模块的引用
- **When**: 清理其他文件中对语言模块的引用
- **Then**: 其他文件中不再包含对语言模块的引用
- **Verification**: `programmatic`

### AC-5: 验证构建和运行
- **Given**: 语言支持已被删除
- **When**: 运行构建命令
- **Then**: 项目能够成功构建
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要保留与语言支持相关的配置选项？
- [ ] 是否需要更新项目文档以反映语言支持的删除？