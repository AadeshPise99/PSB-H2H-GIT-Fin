import React from 'react';
import { Play, Server, CheckCircle } from 'lucide-react';
import { CronResult } from '../types';
import { styles } from '../styles';

type CronType = 'status-repayment' | 'h2h-limit';

interface OutboundCronProps {
  isSimulationMode: boolean;
  loading: boolean;
  result: CronResult | null;
  selectedCron: CronType;
  setSelectedCron: (cron: CronType) => void;
  onExecute: () => void;
}

export const OutboundCron: React.FC<OutboundCronProps> = ({
  isSimulationMode,
  loading,
  result,
  selectedCron,
  setSelectedCron,
  onExecute,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fadeIn w-full">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 mr-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Server className={`w-5 h-5 ${styles.iconColor}`} /> H2H {'->'} PSB Transfer
              {isSimulationMode && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full border border-yellow-200">
                  Simulated
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-mono break-all">
              POST{' '}
              {selectedCron === 'status-repayment'
                ? 'http://localhost:5000/api/v2/bob/transactions/status-repayment-callback'
                : 'http://localhost:5000/api/v2/bob/cron/h2h-limit-callback'}
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

        {/* Cron Type Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Select Cron Type:</label>
          <select
            value={selectedCron}
            onChange={(e) => setSelectedCron(e.target.value as CronType)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#303087] focus:border-transparent"
          >
            <option value="status-repayment">Status Repayment Callback</option>
            <option value="h2h-limit">H2H Limit Callback Cron</option>
          </select>
        </div>
      </div>

      <div className="p-0 bg-[#0F172A] min-h-[400px] font-mono text-sm text-gray-300">
        <div className="border-b border-gray-700 p-2 text-xs flex justify-between bg-[#1E293B]">
          <span>Console Output</span>
          {result && (
            <span className="text-green-400">
              Status: {result.status} {result.statusText} • {result.time}ms
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          {!result && !loading && (
            <span className="text-gray-500">// Click Run to execute the final transfer...</span>
          )}

          {loading && (
            <div className="space-y-1">
              <div className="text-yellow-400">{'>'} Initiating connection to H2H Server...</div>
              <div className="text-yellow-400">{'>'} Validating XML Response files...</div>
              <div className="text-green-400 animate-pulse">{'>'} Pushing data to PSB UAT...</div>
            </div>
          )}

          {result && (
            <>
              <div className="text-green-500">{'>'} Connection Established.</div>
              <div className="text-green-500">{'>'} Request Sent at {result.timestamp}</div>
              <div className="mt-4 text-gray-400">Response Body:</div>
              <pre className="text-emerald-300 mt-2">{result.response}</pre>
              <div className="text-green-400 mt-4 font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Cycle Completed Successfully.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

