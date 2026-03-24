import * as vscode from 'vscode';
import * as path from 'path';
import { buildHdcTargetArgs, spawnHdc } from '../utils/hdc';
import { extractDeviceIdFromCommandArg } from './commandArgs';
import { ensureConnectedDevice } from './devices';

let logProcess: Awaited<ReturnType<typeof spawnHdc>> | null = null;
let logWebViewPanel: vscode.WebviewPanel | null = null;
let logBuffer: string[] = [];
let isProcessing: boolean = false;

interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  pid: string;
  tid: string;
  tag: string;
  message: string;
  process?: string;
}

interface FilterOptions {
  levels: Set<string>;
  processes: Set<string>;
  keyword: string;
  useRegex: boolean;
}

let currentFilters: FilterOptions = {
  levels: new Set(['DEBUG', 'INFO', 'WARN', 'ERROR']),
  processes: new Set(),
  keyword: '',
  useRegex: false
};

function processLogBuffer() {
  if (isProcessing || !logBuffer.length || !logWebViewPanel) return;
  
  isProcessing = true;
  
  // Process in batches
  const batchSize = 100;
  const batch = logBuffer.splice(0, batchSize);
  const parsedLogs = batch.map(parseLogLine).filter((log): log is LogEntry => log !== null);
  
  if (parsedLogs.length > 0) {
    logWebViewPanel.webview.postMessage({ type: 'logs', logs: parsedLogs });
  }
  
  setTimeout(() => {
    isProcessing = false;
    if (logBuffer.length > 0) {
      processLogBuffer();
    }
  }, 10);
}

function parseLogLine(line: string): LogEntry | null {
  // Hilog format: [timestamp] [level] [pid/tid] [tag] message
  const regex = /\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\] \[(DEBUG|INFO|WARN|ERROR)\] \[(\d+)\/(\d+)\] \[(.*?)\] (.*)/;
  const match = line.match(regex);
  
  if (match) {
    return {
      timestamp: match[1],
      level: match[2] as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
      pid: match[3],
      tid: match[4],
      tag: match[5],
      message: match[6]
    };
  }
  
  // Fallback for error lines
  if (line.startsWith('[ERROR]')) {
    return {
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      level: 'ERROR',
      pid: '',
      tid: '',
      tag: 'System',
      message: line.substring(7)
    };
  }
  
  return null;
}

export async function viewLogs(deviceArg?: unknown): Promise<void> {
  if (logProcess) {
    logProcess.kill();
    logProcess = null;
  }

  try {
    const device = await ensureConnectedDevice({
      placeHolder: 'Select a device to stream hilog from',
      preferredId: extractDeviceIdFromCommandArg(deviceArg),
    });
    if (!device) {
      return;
    }

    if (!logWebViewPanel) {
      createLogWebViewPanel();
    } else {
      logWebViewPanel.reveal();
    }

    logBuffer = [];
    const proc = await spawnHdc([...buildHdcTargetArgs(device.id), 'hilog'], { stdio: ['ignore', 'pipe', 'pipe'] });
    logProcess = proc;

    proc.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      logBuffer.push(...lines);
      processLogBuffer();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      const errorLines = data.toString().split('\n').filter(line => line.trim());
      errorLines.forEach(line => {
        logBuffer.push(`[ERROR] ${line}`);
      });
      processLogBuffer();
    });

    proc.on('close', () => {
      if (logWebViewPanel) {
        logWebViewPanel.webview.postMessage({ type: 'log-ended' });
      }
      if (logProcess === proc) {
        logProcess = null;
      }
    });
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to start log viewer: ${err}`);
  }
}

function createLogWebViewPanel() {
  logWebViewPanel = vscode.window.createWebviewPanel(
    'harmonyHilog',
    'HarmonyOS Logs',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(__dirname, '..', '..', 'webview'))]
    }
  );

  const webview = logWebViewPanel.webview;
  webview.html = getWebViewHtml(webview);

  webview.onDidReceiveMessage((message) => {
    switch (message.type) {
      case 'update-filters':
        currentFilters = message.filters;
        break;
      case 'clear-logs':
        logBuffer = [];
        webview.postMessage({ type: 'clear-logs' });
        break;
    }
  });

  logWebViewPanel.onDidDispose(() => {
    if (logProcess) {
      logProcess.kill();
      logProcess = null;
    }
    logWebViewPanel = null;
    logBuffer = [];
  });
}

function getWebViewHtml(webview: vscode.Webview): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HarmonyOS Logs</title>
  <style>
    body { font-family: monospace; margin: 0; padding: 10px; background-color: #1e1e1e; color: #d4d4d4; }
    .filter-bar { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; gap: 5px; }
    .filter-group label { font-size: 12px; color: #999; }
    .filter-group input, .filter-group select, .filter-group button { padding: 5px; background-color: #252526; border: 1px solid #3e3e42; color: #d4d4d4; border-radius: 3px; }
    .filter-group button { cursor: pointer; }
    .filter-group button:hover { background-color: #2d2d30; }
    .log-container { height: calc(100vh - 120px); overflow-y: auto; border: 1px solid #3e3e42; border-radius: 3px; }
    .log-entry { padding: 2px 10px; border-bottom: 1px solid #252526; }
    .log-entry:hover { background-color: #252526; }
    .log-debug { color: #6a9955; }
    .log-info { color: #d4d4d4; }
    .log-warn { color: #d7ba7d; }
    .log-error { color: #f48771; }
    .log-timestamp { color: #858585; font-size: 12px; margin-right: 10px; }
    .log-pid { color: #9cdcfe; font-size: 12px; margin-right: 10px; }
    .log-tag { color: #d16969; font-size: 12px; margin-right: 10px; }
    .log-message { word-break: break-all; }
    .highlight { background-color: rgba(255, 255, 0, 0.3); }
  </style>
</head>
<body>
  <div class="filter-bar">
    <div class="filter-group">
      <label>Log Levels</label>
      <div style="display: flex; gap: 5px;">
        <label><input type="checkbox" class="level-filter" value="DEBUG" checked> DEBUG</label>
        <label><input type="checkbox" class="level-filter" value="INFO" checked> INFO</label>
        <label><input type="checkbox" class="level-filter" value="WARN" checked> WARN</label>
        <label><input type="checkbox" class="level-filter" value="ERROR" checked> ERROR</label>
      </div>
    </div>
    <div class="filter-group">
      <label>Processes</label>
      <select class="process-filter" multiple style="min-width: 150px;"></select>
    </div>
    <div class="filter-group">
      <label>Keyword</label>
      <div style="display: flex; gap: 5px;">
        <input type="text" class="keyword-filter" placeholder="Search...">
        <label><input type="checkbox" class="regex-toggle"> Regex</label>
      </div>
    </div>
    <div class="filter-group">
      <label style="visibility: hidden;">Actions</label>
      <button class="clear-btn">Clear</button>
    </div>
  </div>
  <div class="log-container" id="log-container"></div>

  <script>
    const vscode = acquireVsCodeApi();
    
    let logs = [];
    let filters = {
      levels: new Set(['DEBUG', 'INFO', 'WARN', 'ERROR']),
      processes: new Set(),
      keyword: '',
      useRegex: false
    };
    
    // Event listeners for filters
    document.querySelectorAll('.level-filter').forEach(checkbox => {
      checkbox.addEventListener('change', updateFilters);
    });
    
    document.querySelector('.keyword-filter').addEventListener('input', updateFilters);
    document.querySelector('.regex-toggle').addEventListener('change', updateFilters);
    document.querySelector('.clear-btn').addEventListener('click', () => {
      vscode.postMessage({ type: 'clear-logs' });
      logs = [];
      renderLogs();
    });
    
    function updateFilters() {
      // Update levels
      filters.levels = new Set();
      document.querySelectorAll('.level-filter:checked').forEach(checkbox => {
        filters.levels.add(checkbox.value);
      });
      
      // Update keyword
      filters.keyword = document.querySelector('.keyword-filter').value;
      filters.useRegex = document.querySelector('.regex-toggle').checked;
      
      vscode.postMessage({ type: 'update-filters', filters });
      renderLogs();
    }
    
    function renderLogs() {
      const container = document.getElementById('log-container');
      const filteredLogs = logs.filter(log => {
        // Filter by level
        if (!filters.levels.has(log.level)) return false;
        
        // Filter by keyword
        if (filters.keyword) {
          const content = log.timestamp + ' ' + log.pid + ' ' + log.tag + ' ' + log.message;
          if (filters.useRegex) {
            try {
              const regex = new RegExp(filters.keyword);
              if (!regex.test(content)) return false;
            } catch (e) {
              // Invalid regex, skip
            }
          } else {
            if (!content.includes(filters.keyword)) return false;
          }
        }
        
        return true;
      });
      
      container.innerHTML = filteredLogs.map(log => {
        let message = log.message;
        if (filters.keyword) {
          if (filters.useRegex) {
            try {
              const regex = new RegExp(filters.keyword, 'g');
              message = message.replace(regex, '<span class="highlight">$&</span>');
            } catch (e) {}
          } else {
            message = message.replace(new RegExp(filters.keyword, 'g'), '<span class="highlight">$&</span>');
          }
        }
        
        return '<div class="log-entry log-' + log.level.toLowerCase() + '">' +
          '<span class="log-timestamp">' + log.timestamp + '</span>' +
          '<span class="log-pid">' + log.pid + '</span>' +
          '<span class="log-tag">' + log.tag + '</span>' +
          '<span class="log-message">' + message + '</span>' +
          '</div>';
      }).join('');
      
      // Auto scroll to bottom
      container.scrollTop = container.scrollHeight;
    }
    
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'logs':
          logs.push(...message.logs);
          // Limit log count to prevent memory issues
          if (logs.length > 10000) {
            logs = logs.slice(logs.length - 10000);
          }
          renderLogs();
          break;
        case 'log-ended':
          logs.push({ timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '), level: 'INFO', pid: '', tag: 'System', message: 'Log stream ended' });
          renderLogs();
          break;
        case 'clear-logs':
          logs = [];
          renderLogs();
          break;
      }
    });
  </script>
</body>
</html>
`;
}