import React from 'react';
import { Play, Activity } from 'lucide-react';
import { CronResult } from '../types';
import { styles } from '../styles';

interface InboundCronProps {
  isSimulationMode: boolean;
  loading: boolean;
  result: CronResult | null;
  onExecute: () => void;
}

export const InboundCron: React.FC<InboundCronProps> = ({
  isSimulationMode,
  loading,
  result,
  onExecute,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fadeIn w-full">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex-1 mr-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity className={`w-5 h-5 ${styles.iconColor}`} /> PSB {'->'} H2H Transfer
            {isSimulationMode && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full border border-yellow-200">
                Simulated
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-mono break-all">
            POST http://localhost:5000/api/v2/bob/transactions/ftp-cron-movement
          </p>
        </div>
        <button
          onClick={onExecute}
          disabled={loading}
          className={`${styles.primaryBtn} px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50 whitespace-nowrap`}
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Execute Cron
        </button>
      </div>

      <div className="p-0 bg-[#0F172A] min-h-[400px] font-mono text-sm text-gray-300 flex flex-col">
        <div className="border-b border-gray-700 p-2 text-xs flex justify-between bg-[#1E293B]">
          <span>Console Output</span>
          {result && (
            <span className={result.status === 200 ? 'text-green-400' : 'text-red-400'}>
              Status: {result.status} {result.statusText} • {result.time}ms
            </span>
          )}
        </div>
        <div className="p-4 space-y-2 flex-1 overflow-auto">
          {!result && !loading && (
            <span className="text-gray-500">// Ready. Click 'Execute Cron' to hit the live endpoint.</span>
          )}

          {loading && (
            <div className="space-y-1">
              <div className="text-yellow-400">{'>'} Establishing connection to http://localhost:5000...</div>
              {isSimulationMode ? (
                <div className="text-purple-400">{'>'} Simulating Network Latency...</div>
              ) : (
                <div className="text-gray-500 text-xs opacity-80">{'>'} Sending Auth Headers...</div>
              )}
              <div className="text-blue-400 animate-pulse">{'>'} Waiting for server response...</div>
            </div>
          )}

          {result && (
            <>
              <div className="text-gray-400 text-xs mb-2">
                Request ID: req_{Math.floor(Math.random() * 100000)}
                <br />
                Timestamp: {result.timestamp}
              </div>
              <div className="text-gray-300 font-bold border-b border-gray-700 pb-1 mb-2">
                Response Payload:
              </div>
              <pre
                className={`text-xs font-mono overflow-auto whitespace-pre-wrap ${
                  result.status === 200 ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {result.response}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

