export interface HvigorCommandOptions {
  task: string;
  module?: string;
  platform?: NodeJS.Platform;
}

export function getHvigorExecutable(platform: NodeJS.Platform = process.platform): string {
  return platform === 'win32' ? 'hvigorw.bat' : './hvigorw';
}

export function buildHvigorCommand(options: HvigorCommandOptions): string {
  const platform = options.platform ?? process.platform;
  const executable = getHvigorExecutable(platform);

  // Build command using DevEco Studio format: --mode module -p module=entry@default
  const parts: string[] = [executable];

  if (options.module) {
    parts.push('--mode', 'module', '-p', `module=${options.module}@default`);
  }

  parts.push(options.task, '--no-daemon');

  const command = parts.join(' ');

  if (platform === 'win32') {
    return command;
  }

  return `chmod +x ./hvigorw 2>/dev/null && ${command}`;
}
