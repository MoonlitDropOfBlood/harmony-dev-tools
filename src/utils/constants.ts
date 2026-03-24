export const EXTENSION_ID = 'harmony-dev-tools';

export const CONFIG_FILES = {
  BUILD_PROFILE: 'build-profile.json5',
  OH_PACKAGE: 'oh-package.json5',
  MODULE_JSON: 'module.json5',
  APP_JSON: 'app.json5',
  HVIGOR_CONFIG: 'hvigor-config.json5',
} as const;

export const COMMANDS = {
  EXPORT_AI_CONTEXT: 'harmony.exportAiContext',
  CLEAN_ENTROPY: 'harmony.cleanEntropy',
  CREATE_PROJECT: 'harmony.createProject',
  OPEN_CONTROL_CENTER: 'harmony.openControlCenter',
  BUILD_HAP: 'harmony.buildHap',
  RUN_ON_DEVICE: 'harmony.runOnDevice',
  CLEAN: 'harmony.clean',
  VIEW_DEVICES: 'harmony.viewDevices',
  SELECT_DEVICE: 'harmony.selectDevice',
  USE_DEVICE: 'harmony.useDevice',
  INSTALL_HAP: 'harmony.installHap',
  VIEW_LOGS: 'harmony.viewLogs',
  PREVIEW_COMPONENT: 'harmony.previewComponent',
  ORGANIZE_IMPORTS: 'harmony.organizeImports',
  EXTRACT_COMPONENT: 'harmony.extractComponent',
  EXTRACT_BUILDER: 'harmony.extractBuilder',
  EXTRACT_STRING: 'harmony.extractString',
  MANAGE_DEPS: 'harmony.manageDeps',
  OPEN_WEBVIEW_DEVTOOLS: 'harmony.openWebViewDevTools',
  UI_INSPECTOR: 'harmony.uiInspector',
  TAKE_SCREENSHOT: 'harmony.takeScreenshot',
  BUILD_AND_RUN: 'harmony.buildAndRun',
  TERMINAL_BUILD_RUN: 'harmony.terminalBuildAndRun',
  STOP_APP: 'harmony.stopApp',
  DEBUG_APP: 'harmony.debugApp',
  MIGRATE_V1_TO_V2: 'harmony.migrateV1ToV2',
  MIGRATE_BUILD_PROFILE: 'harmony.migrateBuildProfile',
  DEVICE_MIRROR: 'harmony.openDeviceMirror',
  LAUNCH_EMULATOR: 'harmony.launchEmulator',
  STOP_EMULATOR: 'harmony.stopEmulator',
  CHECK_ENVIRONMENT: 'harmony.checkEnvironment',
} as const;

export const CONTEXT_KEYS = {
  IS_HARMONY_PROJECT: 'harmony.isHarmonyProject',
} as const;
