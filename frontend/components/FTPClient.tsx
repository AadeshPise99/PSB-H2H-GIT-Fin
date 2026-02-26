import React from 'react';
import {
  Server,
  ArrowRightLeft,
  Activity,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Trash2,
  ArrowRight,
  Folder,
  File as FileIcon,
  Network,
  RefreshCw,
} from 'lucide-react';
import { StoredFile } from '../types';
import { styles } from '../styles';

interface FTPConfig {
  protocol: string;
  host: string;
  user: string;
  port: string;
}

interface FTPClientProps {
  isSimulationMode: boolean;
  ftpConfig: FTPConfig;
  ftpConnected: boolean;
  ftpLoading: boolean;
  ftpLogs: string[];
  ftpLogsExpanded: boolean;
  setFtpLogsExpanded: (expanded: boolean) => void;
  currentRemotePath: string;
  setCurrentRemotePath: (path: string) => void;
  localFiles: StoredFile[];
  remoteFiles: StoredFile[];
  selectedLocalFile: string | null;
  setSelectedLocalFile: (id: string | null) => void;
  refreshingRemote: boolean;
  onConnect: () => void;
  onUpload: () => void;
  onRefreshRemote: () => void;
  onDeleteLocalFile: (id: string) => void;
}

export const FTPClient: React.FC<FTPClientProps> = ({
  isSimulationMode,
  ftpConfig,
  ftpConnected,
  ftpLoading,
  ftpLogs,
  ftpLogsExpanded,
  setFtpLogsExpanded,
  currentRemotePath,
  setCurrentRemotePath,
  localFiles,
  remoteFiles,
  selectedLocalFile,
  setSelectedLocalFile,
  refreshingRemote,
  onConnect,
  onUpload,
  onRefreshRemote,
  onDeleteLocalFile,
}) => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-100 border border-gray-300 rounded-lg shadow-xl overflow-hidden font-sans">
      {/* Connection Bar */}
      <div className="bg-white p-4 border-b border-gray-200 shadow-sm relative z-20">
        <div className="flex flex-wrap items-end gap-4">
          {/* Server Info Display */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Server className={`w-4 h-4 ${styles.iconColor}`} />
            <span className="font-medium">SFTP</span>
            <span className="text-gray-400">|</span>
            <span>
              {ftpConfig.host}:{ftpConfig.port}
            </span>
          </div>

          {/* Remote Path Dropdown */}
          <div className="flex-1 min-w-[200px] max-w-[300px]">
            <label className={styles.label}>Remote Path</label>
            <select
              value={currentRemotePath}
              onChange={(e) => setCurrentRemotePath(e.target.value)}
              className={styles.input}
            >
              <option value="/bob/transaction/response">/bob/transaction/response</option>
              <option value="/bob/transaction/limits">/bob/transaction/limits</option>
            </select>
          </div>

          {/* Connect / Refresh Button */}
          <button
            onClick={onConnect}
            disabled={ftpLoading}
            className={`${styles.primaryBtn} h-[46px] px-6 rounded-lg disabled:opacity-50 text-sm tracking-wide gap-2`}
          >
            {ftpLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowRightLeft className="w-4 h-4" />
            )}
            Connect / Refresh
          </button>
        </div>
      </div>

      {/* Collapsible Log Window */}
      <div className="bg-[#0F172A] border-b border-gray-700">
        <div
          className="flex items-center justify-between px-4 py-2 bg-[#1E293B] cursor-pointer hover:bg-[#273548] transition-colors"
          onClick={() => setFtpLogsExpanded(!ftpLogsExpanded)}
        >
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Activity className="w-3 h-3" />
            <span>Connection Log</span>
            {ftpLogs.length > 0 && (
              <span className="bg-gray-700 px-2 py-0.5 rounded-full text-[10px]">{ftpLogs.length} entries</span>
            )}
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            {ftpLogsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div
          className={`${
            ftpLogsExpanded ? 'h-48' : 'h-16'
          } overflow-y-auto p-4 font-mono text-xs leading-relaxed select-text transition-all duration-300 ease-in-out`}
        >
          {ftpLogs.map((log, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 ${
                log.includes('Error') ? 'text-red-400' : log.includes('success') ? 'text-emerald-400' : 'text-gray-300'
              }`}
            >
              <span className="opacity-50 whitespace-nowrap">[{new Date().toLocaleTimeString()}]</span>
              <span className="break-all">{log}</span>
            </div>
          ))}
          {ftpLogs.length === 0 && (
            <div className="flex items-center justify-center text-slate-500 italic opacity-50 flex-col gap-1 h-full">
              <span>Ready to establish connection...</span>
              {!isSimulationMode && (
                <span className="text-[10px] text-yellow-500/50">Enable Simulation Mode if CORS fails</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Panes */}
      <div className="flex-1 flex bg-white min-h-[400px]">
        {/* Local Pane */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          <div className="bg-gray-50 px-4 py-3 text-xs border-b border-gray-200 font-bold flex items-center justify-between text-gray-700">
            <div className="flex items-center gap-2">
              <HardDrive className={`w-4 h-4 ${styles.iconColor}`} />
              <span>Local Site: /PSB_App/Generated_XMLs</span>
            </div>
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
              {localFiles.length} items
            </span>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-white sticky top-0 text-gray-500 font-semibold shadow-sm z-10 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 border-b border-gray-100">Filename</th>
                  <th className="p-3 border-b border-gray-100 w-24">Size</th>
                  <th className="p-3 border-b border-gray-100 w-32">Modified</th>
                  <th className="p-3 border-b border-gray-100 text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-100">
                {localFiles.map((file) => (
                  <tr
                    key={file.id}
                    className={`cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedLocalFile === file.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedLocalFile(file.id)}
                  >
                    <td className="p-3 flex items-center gap-3 font-medium text-gray-800">
                      <FileIcon className={`w-4 h-4 ${styles.iconColor}`} /> {file.name}
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-[10px]">{file.size}</td>
                    <td className="p-3 text-gray-500 text-[10px]">{file.date}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this file from App Storage?')) {
                            onDeleteLocalFile(file.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {localFiles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400 italic">
                      No files generated yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transfer Bar (Vertical) */}
        <div className="w-14 bg-gray-100 flex flex-col items-center justify-center gap-2 border-r border-gray-200 z-10 shadow-inner">
          <button
            disabled={!selectedLocalFile || !ftpConnected}
            onClick={onUpload}
            className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 disabled:opacity-50 transition-all hover:scale-110 active:scale-95 text-[#303087]"
            title="Upload to Remote"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Remote Pane */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-50 px-4 py-3 text-xs border-b border-gray-200 font-bold flex items-center justify-between text-gray-700">
            <div className="flex items-center gap-2">
              <Server className={`w-4 h-4 ${styles.iconColor}`} />
              <span>Remote Site: {currentRemotePath}</span>
            </div>
            <div className="flex items-center gap-2">
              {ftpConnected && (
                <button
                  onClick={onRefreshRemote}
                  disabled={refreshingRemote}
                  className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${
                    refreshingRemote ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Refresh file list"
                >
                  <RefreshCw className={`w-4 h-4 ${styles.iconColor} ${refreshingRemote ? 'animate-spin' : ''}`} />
                </button>
              )}
              {ftpConnected && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>Connected
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            {!ftpConnected ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Network className="w-8 h-8 opacity-20" />
                </div>
                <span className="font-medium">Not connected to server</span>
                <span className="text-xs text-gray-400">Configure connection above</span>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-white sticky top-0 text-gray-500 font-semibold shadow-sm z-10 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 border-b border-gray-100">Filename</th>
                    <th className="p-3 border-b border-gray-100 w-24">Size</th>
                    <th className="p-3 border-b border-gray-100 w-32">Date</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {remoteFiles.map((file) => (
                    <tr key={file.id} className="cursor-pointer hover:bg-gray-100 transition-colors">
                      <td className="p-3 flex items-center gap-3 font-medium text-gray-800">
                        {file.type === 'folder' ? (
                          <Folder className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <FileIcon className={`w-4 h-4 ${styles.iconColor}`} />
                        )}
                        {file.name}
                      </td>
                      <td className="p-3 text-gray-500 font-mono text-[10px]">{file.size}</td>
                      <td className="p-3 text-gray-500 text-[10px]">{file.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white p-2 text-[10px] border-t border-gray-200 flex gap-6 text-gray-500 font-medium px-4">
        <span>Queued: 0</span>
        <span>Failed: 0</span>
        <span className="text-green-600">
          Successful: {remoteFiles.filter((f) => f.id.startsWith('remote')).length}
        </span>
      </div>
    </div>
  );
};

