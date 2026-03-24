import * as vscode from 'vscode';
import { buildHvigorCommand } from '../utils/hvigor';
import { getPreferredWorkspaceFolder } from '../utils/workspace';
import { detectProjectModule } from '../utils/projectMetadata';

export async function buildHap(): Promise<void> {
  const folder = getPreferredWorkspaceFolder();
  if (!folder) {
    vscode.window.showErrorMessage('No workspace folder open.');
    return;
  }

  const moduleName = await detectProjectModule(folder.uri);

  const task = new vscode.Task(
    { type: 'hvigor', task: 'assembleHap' },
    folder,
    'Build HAP',
    'hvigor',
    new vscode.ShellExecution(buildHvigorCommand({ task: 'assembleHap', module: moduleName }), { cwd: folder.uri.fsPath })
  );
  await vscode.tasks.executeTask(task);
}

export async function cleanBuild(): Promise<void> {
  const folder = getPreferredWorkspaceFolder();
  if (!folder) {
    vscode.window.showErrorMessage('No workspace folder open.');
    return;
  }

  const task = new vscode.Task(
    { type: 'hvigor', task: 'clean' },
    folder,
    'Clean',
    'hvigor',
    new vscode.ShellExecution(buildHvigorCommand({ task: 'clean' }), { cwd: folder.uri.fsPath })
  );
  await vscode.tasks.executeTask(task);
}
