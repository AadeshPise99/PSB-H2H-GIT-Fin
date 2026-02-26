import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, Clock } from 'lucide-react';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden flex flex-col h-[300px] border border-slate-700 shadow-2xl">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-300 font-bold uppercase">System Audit Log</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5">
        {logs.length === 0 && (
            <div className="text-slate-600 italic text-center mt-10">System Ready. No logs yet.</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-fadeIn">
            <span className="text-slate-500 whitespace-nowrap min-w-[80px]">
              {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <div className="flex-1 flex gap-2">
               <span className={`font-bold px-1.5 rounded text-[10px] h-fit py-0.5
                ${log.type === 'info' ? 'bg-blue-900/50 text-blue-400' : ''}
                ${log.type === 'success' ? 'bg-green-900/50 text-green-400' : ''}
                ${log.type === 'warning' ? 'bg-yellow-900/50 text-yellow-400' : ''}
                ${log.type === 'error' ? 'bg-red-900/50 text-red-400' : ''}
               `}>
                 {log.stage}
               </span>
               <span className="text-slate-300">{log.message}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};