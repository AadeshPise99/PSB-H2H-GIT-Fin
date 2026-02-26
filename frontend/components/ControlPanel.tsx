import React from 'react';
import { Play, RotateCw, CheckCircle2, CloudCog } from 'lucide-react';

interface ControlPanelProps {
  onSimulateInbound: () => void;
  onRunCron1: () => void;
  onGenerateResponse: () => void;
  onRunCron2: () => void;
  isProcessing: boolean;
  canRunCron1: boolean;
  canGenerate: boolean;
  canRunCron2: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onSimulateInbound,
  onRunCron1,
  onGenerateResponse,
  onRunCron2,
  isProcessing,
  canRunCron1,
  canGenerate,
  canRunCron2
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Step 0: Simulate New Invoice */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step 0: Sourcing</span>
          <CloudCog className="w-4 h-4 text-gray-400" />
        </div>
        <h4 className="font-semibold text-gray-800 mb-2">Receive Invoice</h4>
        <p className="text-xs text-gray-500 mb-4 flex-1">
          Simulate an XML invoice arriving from a Sourcing Partner.
        </p>
        <button
          onClick={onSimulateInbound}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCw className="w-4 h-4" />
          <span>New Invoice XML</span>
        </button>
      </div>

      {/* Step 1: Cron Job 1 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-psb-600 uppercase tracking-wider">Step 1: Inbound Cron</span>
          <div className="w-2 h-2 rounded-full bg-psb-500"></div>
        </div>
        <h4 className="font-semibold text-gray-800 mb-2">Transfer to H2H</h4>
        <p className="text-xs text-gray-500 mb-4 flex-1">
          Cron Trigger: Moves XML from PSB UAT → H2H Server folders.
        </p>
        <button
          onClick={onRunCron1}
          disabled={!canRunCron1 || isProcessing}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            canRunCron1 
              ? 'bg-psb-600 hover:bg-psb-500 text-white shadow-md shadow-psb-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Run Inbound Cron</span>
        </button>
      </div>

      {/* Step 2: Generate Response */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">
        {isProcessing && canGenerate && (
             <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
             </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Step 2: AI Processing</span>
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
        </div>
        <h4 className="font-semibold text-gray-800 mb-2">Generate Response</h4>
        <p className="text-xs text-gray-500 mb-4 flex-1">
          Analyzes Request XML and creates Response XML on H2H Server.
        </p>
        <button
          onClick={onGenerateResponse}
          disabled={!canGenerate || isProcessing}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            canGenerate 
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <CloudCog className="w-4 h-4" />
          <span>Generate XML</span>
        </button>
      </div>

      {/* Step 3: Cron Job 2 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Step 3: Outbound Cron</span>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
        <h4 className="font-semibold text-gray-800 mb-2">Return to UAT</h4>
        <p className="text-xs text-gray-500 mb-4 flex-1">
          Cron Trigger: Moves Response XML from H2H → PSB UAT.
        </p>
        <button
          onClick={onRunCron2}
          disabled={!canRunCron2 || isProcessing}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            canRunCron2 
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Run Outbound Cron</span>
        </button>
      </div>
    </div>
  );
};