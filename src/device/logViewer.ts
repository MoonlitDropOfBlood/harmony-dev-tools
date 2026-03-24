import * as vscode from 'vscode';
import { buildHdcTargetArgs, spawnHdc } from '../utils/hdc';
import { extractDeviceIdFromCommandArg } from './commandArgs';
import { ensureConnectedDevice } from './devices';
import { readBundleName } from '../utils/projectMetadata';

let logProcess: Awaited<ReturnType<typeof spawnHdc>> | null = null;
let webviewPanel: vscode.WebviewPanel | undefined;
let panelDisposables: vscode.Disposable[] = [];

interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  pid: string;
  tid: string;
  tag: string;
  processName: string;
  message: string;
}

let filterLevel: string | null = null;
let filterKeyword: string = '';
let useRegex: boolean = false;
let filterProcessName: string = '';

const MAX_LOG_LINES = 10000;
const FLUSH_INTERVAL = 100;
let logBuffer: string[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let totalLines = 0;

export async function viewLogs(deviceArg?: unknown): Promise<void> {
  if (logProcess) {
    logProcess.kill();
    logProcess = null;
  }

  stopFlushTimer();
  logBuffer = [];
  totalLines = 0;

  try {
    const device = await ensureConnectedDevice({
      placeHolder: 'Select a device to stream hilog from',
      preferredId: extractDeviceIdFromCommandArg(deviceArg),
    });
    if (!device) {
      return;
    }

    if (webviewPanel) {
      webviewPanel.reveal(vscode.ViewColumn.Beside);
      webviewPanel.title = `HarmonyOS Logs: ${device.id}`;
    } else {
      webviewPanel = vscode.window.createWebviewPanel(
        'harmonyLogViewer',
        `HarmonyOS Logs: ${device.id}`,
        vscode.ViewColumn.Beside,
        { enableScripts: true, retainContextWhenHidden: true }
      );

      webviewPanel.iconPath = new vscode.ThemeIcon('output');

      webviewPanel.onDidDispose(() => {
        webviewPanel = undefined;
        panelDisposables.forEach(d => d.dispose());
        panelDisposables = [];
        if (logProcess) {
          logProcess.kill();
          logProcess = null;
        }
        stopFlushTimer();
      });

      webviewPanel.webview.onDidReceiveMessage((message) => {
        if (message.command === 'updateFilters') {
          filterLevel = message.filterLevel;
          filterProcessName = message.filterProcessName;
          filterKeyword = message.filterKeyword;
          useRegex = message.useRegex;
        } else if (message.command === 'clearFilters') {
          filterLevel = null;
          filterProcessName = '';
          filterKeyword = '';
          useRegex = false;
        }
      });

      webviewPanel.webview.html = getLogViewerHtml();

      sendFilterStateToWebview();
    }

    await autoSetProcessFilter();

    const proc = await spawnHdc([...buildHdcTargetArgs(device.id), 'hilog'], { stdio: ['ignore', 'pipe', 'pipe'] });
    logProcess = proc;

    startFlushTimer();

    proc.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          processLogLine(line.trim());
        }
      }
    });

    proc.stderr?.on('data', (data: Buffer) => {
      const errorLines = data.toString().split('\n');
      for (const line of errorLines) {
        if (line.trim()) {
          bufferLog(`[ERROR] ${line}`);
        }
      }
    });

    proc.on('close', () => {
      stopFlushTimer();
      flushBuffer();
      if (logProcess === proc) {
        logProcess = null;
      }
    });

  } catch (err) {
    vscode.window.showErrorMessage(`Failed to start log viewer: ${err}`);
  }
}

function getLogViewerHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif, monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Toolbar styles */
    .toolbar {
      background: #2d2d2d;
      border-bottom: 1px solid #444;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    .toolbar label {
      font-size: 12px;
      color: #888;
      margin-right: 4px;
    }

    .toolbar select,
    .toolbar input[type="text"] {
      background: #3c3c3c;
      color: #ccc;
      border: 1px solid #555;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .toolbar select {
      min-width: 100px;
    }

    .toolbar input[type="text"] {
      min-width: 150px;
    }

    .toolbar .checkbox-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .toolbar input[type="checkbox"] {
      width: 14px;
      height: 14px;
      cursor: pointer;
    }

    .toolbar button {
      background: #3c3c3c;
      color: #ccc;
      border: 1px solid #555;
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .toolbar button:hover {
      background: #4c4c4c;
    }

    .toolbar .sep {
      width: 1px;
      height: 20px;
      background: #444;
      margin: 0 4px;
    }

    .toolbar .log-count {
      font-size: 12px;
      color: #888;
      margin-left: auto;
      padding: 4px 8px;
      background: #3c3c3c;
      border-radius: 4px;
    }

    .toolbar .log-count.warning {
      color: #dcdcaa;
      background: #4a4a2a;
    }

    /* Log area styles */
    .log-container {
      flex: 1;
      overflow: auto;
      padding: 8px 12px;
    }

    .log-list {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
    }

    .log-line {
      padding: 2px 0;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .log-line:hover {
      background: #2a2d2e;
    }

    /* Log level colors */
    .level-DEBUG { color: #569cd6; }
    .level-INFO { color: #4ec9b0; }
    .level-WARN { color: #dcdcaa; }
    .level-ERROR { color: #f44747; }

    .placeholder {
      color: #666;
      text-align: center;
      padding: 60px 20px;
    }

    .placeholder .icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .placeholder .message {
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <label for="levelSelect">Level:</label>
    <select id="levelSelect">
      <option value="All">All</option>
      <option value="DEBUG">DEBUG</option>
      <option value="INFO">INFO</option>
      <option value="WARN">WARN</option>
      <option value="ERROR">ERROR</option>
    </select>

    <div class="sep"></div>

    <label for="processInput">Process:</label>
    <input type="text" id="processInput" placeholder="Process name">

    <div class="sep"></div>

    <label for="keywordInput">Keyword:</label>
    <input type="text" id="keywordInput" placeholder="Search keyword">

    <div class="checkbox-group">
      <input type="checkbox" id="regexCheckbox">
      <label for="regexCheckbox">正则</label>
    </div>

    <div class="sep"></div>

    <button onclick="clearFilters()">清除</button>

    <div class="sep"></div>

    <span class="log-count" id="logCount">0 / 10000</span>
  </div>

  <div class="log-container">
    <div class="log-list" id="logList">
      <div class="placeholder">
        <div class="icon">📋</div>
        <div class="message">Logs will appear here</div>
      </div>
    </div>
  </div>

  <script>
    const vscodeApi = acquireVsCodeApi();
    const logList = document.getElementById('logList');
    const levelSelect = document.getElementById('levelSelect');
    const processInput = document.getElementById('processInput');
    const keywordInput = document.getElementById('keywordInput');
    const regexCheckbox = document.getElementById('regexCheckbox');
    const logCount = document.getElementById('logCount');

    // Constants
    const MAX_LOG_LINES = 10000;

    // Store logs
    let allLogs = [];
    let filterLevel = 'All';
    let filterProcessName = '';
    let filterKeyword = '';
    let useRegex = false;

    // Helper function to trim old logs
    function trimOldLogs() {
      if (allLogs.length > MAX_LOG_LINES) {
        allLogs = allLogs.slice(allLogs.length - MAX_LOG_LINES);
      }
    }

    // Helper function to update log count display
    function updateLogCount() {
      if (logCount) {
        logCount.textContent = allLogs.length + ' / ' + MAX_LOG_LINES;
        if (allLogs.length >= MAX_LOG_LINES) {
          logCount.classList.add('warning');
        } else {
          logCount.classList.remove('warning');
        }
      }
    }

    // Filter controls
    levelSelect.addEventListener('change', (e) => {
      filterLevel = e.target.value;
      updateExtensionFilters();
      applyFilters();
    });

    processInput.addEventListener('input', (e) => {
      filterProcessName = e.target.value;
      updateExtensionFilters();
      applyFilters();
    });

    keywordInput.addEventListener('input', (e) => {
      filterKeyword = e.target.value;
      updateExtensionFilters();
      applyFilters();
    });

    regexCheckbox.addEventListener('change', (e) => {
      useRegex = e.target.checked;
      updateExtensionFilters();
      applyFilters();
    });

    function updateExtensionFilters() {
      vscodeApi.postMessage({
        command: 'updateFilters',
        filterLevel: filterLevel,
        filterProcessName: filterProcessName,
        filterKeyword: filterKeyword,
        useRegex: useRegex
      });
    }

    function clearFilters() {
      filterLevel = 'All';
      filterProcessName = '';
      filterKeyword = '';
      useRegex = false;
      levelSelect.value = 'All';
      processInput.value = '';
      keywordInput.value = '';
      regexCheckbox.checked = false;
      vscodeApi.postMessage({
        command: 'clearFilters'
      });
      applyFilters();
    }

    function applyFilters() {
      const filtered = allLogs.filter(log => {
        if (filterLevel !== 'All') {
          const levelPattern = '\\[' + filterLevel + '\\]';
          const regex = new RegExp(levelPattern);
          if (!regex.test(log)) {
            return false;
          }
        }
        if (filterProcessName && !log.toLowerCase().includes(filterProcessName.toLowerCase())) {
          return false;
        }
        if (filterKeyword) {
          const content = log;
          if (useRegex) {
            try {
              const regex = new RegExp(filterKeyword, 'i');
              if (!regex.test(content)) return false;
            } catch (e) {
              return false;
            }
          } else {
            if (!content.toLowerCase().includes(filterKeyword.toLowerCase())) return false;
          }
        }
        return true;
      });

      renderLogs(filtered);
    }

    function renderLogs(logs) {
      if (logs.length === 0) {
        logList.innerHTML = '<div class="placeholder"><div class="icon">📋</div><div class="message">No logs to display</div></div>';
        return;
      }

      logList.innerHTML = logs.map(log => {
        let levelClass = '';
        if (log.includes('[DEBUG]')) levelClass = 'level-DEBUG';
        else if (log.includes('[INFO]')) levelClass = 'level-INFO';
        else if (log.includes('[WARN]')) levelClass = 'level-WARN';
        else if (log.includes('[ERROR]')) levelClass = 'level-ERROR';
        
        return '<div class="log-line ' + levelClass + '">' + escapeHtml(log) + '</div>';
      }).join('');

      logList.scrollTop = logList.scrollHeight;
    }

    function escapeHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Handle messages from extension
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.command === 'addLog') {
        allLogs.push(msg.line);
        trimOldLogs();
        updateLogCount();
        applyFilters();
      } else if (msg.command === 'addLogs') {
        allLogs.push(...msg.lines);
        trimOldLogs();
        updateLogCount();
        applyFilters();
      } else if (msg.command === 'clearLogs') {
        allLogs = [];
        updateLogCount();
        renderLogs(allLogs);
      } else if (msg.command === 'setFilterState') {
        filterLevel = msg.filterLevel;
        filterProcessName = msg.filterProcessName;
        filterKeyword = msg.filterKeyword;
        useRegex = msg.useRegex;

        levelSelect.value = filterLevel;
        processInput.value = filterProcessName;
        keywordInput.value = filterKeyword;
        regexCheckbox.checked = useRegex;

        applyFilters();
      } else if (msg.command === 'setProcessName') {
        filterProcessName = msg.processName;
        processInput.value = msg.processName;
        applyFilters();
        updateExtensionFilters();
      }
    });
  </script>
</body>
</html>`;
}

function sendFilterStateToWebview(): void {
  if (!webviewPanel) {
    return;
  }
  webviewPanel.webview.postMessage({
    command: 'setFilterState',
    filterLevel: filterLevel || 'All',
    filterProcessName: filterProcessName,
    filterKeyword: filterKeyword,
    useRegex: useRegex
  });
}

function bufferLog(line: string): void {
  // Remove the hard limit - let WebView handle the 10000 line limit
  logBuffer.push(line);
  
  if (logBuffer.length >= FLUSH_INTERVAL) {
    flushBuffer();
  }
}

function flushBuffer(): void {
  if (logBuffer.length === 0) {
    return;
  }
  
  if (webviewPanel) {
    webviewPanel.webview.postMessage({
      command: 'addLogs',
      lines: logBuffer
    });
  }
  
  logBuffer = [];
}

function startFlushTimer(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
  }
  flushTimer = setInterval(() => {
    flushBuffer();
  }, 200);
}

function stopFlushTimer(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

async function autoSetProcessFilter(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return;
  }

  const rootUri = workspaceFolders[0].uri;
  const bundleName = await readBundleName(rootUri);
  
  if (bundleName) {
    filterProcessName = bundleName;
    if (webviewPanel) {
      webviewPanel.webview.postMessage({
        command: 'setProcessName',
        processName: bundleName
      });
    }
  }
}

function processLogLine(line: string): void {
  const logEntry = parseLogLine(line);

  if (!logEntry) {
    // For unparsable lines, check keyword filter only (include processName in check)
    if (shouldShowLog('INFO', line, '')) {
      bufferLog(line);
    }
    return;
  }

  if (!shouldShowLog(logEntry.level, logEntry.message, logEntry.processName)) {
    return;
  }

  const processInfo = logEntry.processName
    ? `${logEntry.processName}(${logEntry.pid})`
    : logEntry.pid;
  const formatted = `${logEntry.timestamp} [${logEntry.level}] ${processInfo}/${logEntry.tid} [${logEntry.tag}] ${logEntry.message}`;
  bufferLog(formatted);
}

function parseLogLine(line: string): LogEntry | null {
  const regex1 = /\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\]\s+\[(DEBUG|INFO|WARN|ERROR)\]\s+\[(\d+)\/(\d+)\]\s+\[(.*?)\]\s+(.*)/;
  let match = line.match(regex1);
  
  if (match) {
    return {
      timestamp: match[1],
      level: match[2] as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
      pid: match[3],
      tid: match[4],
      tag: match[5],
      processName: '',
      message: match[6]
    };
  }
  
  const regex2 = /(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+(.*?):\s+(.*)/;
  match = line.match(regex2);
  if (match) {
    const levelMap: { [key: string]: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' } = {
      'V': 'DEBUG', 'D': 'DEBUG', 'I': 'INFO', 'W': 'WARN', 'E': 'ERROR', 'F': 'ERROR'
    };
    return {
      timestamp: match[1],
      level: levelMap[match[4]] || 'INFO',
      pid: match[2],
      tid: match[3],
      tag: match[5],
      processName: '',
      message: match[6]
    };
  }

  const regex3 = /^(\S+)\s+\((\d+)\)\s+\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\]\s+\[(DEBUG|INFO|WARN|ERROR)\]\s+\[(\d+)\/(\d+)\]\s+\[(.*?)\]\s+(.*)/;
  match = line.match(regex3);
  if (match) {
    return {
      timestamp: match[3],
      level: match[4] as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
      pid: match[5],
      tid: match[6],
      tag: match[7],
      processName: match[1],
      message: match[8]
    };
  }

  const regex4 = /(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s+(\S+)\s+\((\d+)\)\s+([VDIWEF])\s+(.*?):\s+(.*)/;
  match = line.match(regex4);
  if (match) {
    const levelMap: { [key: string]: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' } = {
      'V': 'DEBUG', 'D': 'DEBUG', 'I': 'INFO', 'W': 'WARN', 'E': 'ERROR', 'F': 'ERROR'
    };
    return {
      timestamp: match[1],
      level: levelMap[match[4]] || 'INFO',
      pid: match[3],
      tid: '0',
      tag: match[5],
      processName: match[2],
      message: match[6]
    };
  }
  
  const regex5 = /^(DEBUG|INFO|WARN|ERROR)\s*[:\-]?\s*(.*)/i;
  match = line.match(regex5);
  if (match) {
    return {
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      level: match[1].toUpperCase() as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
      pid: '',
      tid: '',
      tag: 'App',
      processName: '',
      message: match[2]
    };
  }
  
  return null;
}

function shouldShowLog(level: string, message: string, processName: string): boolean {
  // Filter by log level - filterLevel can be null, 'All', or a specific level
  if (filterLevel && filterLevel !== 'All' && level !== filterLevel) {
    return false;
  }

  // Filter by process name - if processName is empty, only show if no filter is set
  if (filterProcessName) {
    const processNameLower = processName.toLowerCase();
    const filterLower = filterProcessName.toLowerCase();
    if (!processNameLower.includes(filterLower)) {
      return false;
    }
  }

  // Filter by keyword
  if (filterKeyword) {
    const content = (level + ' ' + message + ' ' + processName).toLowerCase();
    const keywordLower = filterKeyword.toLowerCase();
    if (useRegex) {
      try {
        const regex = new RegExp(filterKeyword, 'i');
        return regex.test(content);
      } catch (e) {
        return false;
      }
    } else {
      return content.includes(keywordLower);
    }
  }

  return true;
}


