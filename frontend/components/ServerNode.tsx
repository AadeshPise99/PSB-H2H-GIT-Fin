import React from 'react';
import { Server, FileText, ArrowRight } from 'lucide-react';
import { InvoiceFile, ServerLocation } from '../types';

interface ServerNodeProps {
  title: string;
  location: ServerLocation;
  files: InvoiceFile[];
  icon?: React.ReactNode;
  isDestination?: boolean;
  colorClass: string;
  onSelectFile: (file: InvoiceFile) => void;
}

export const ServerNode: React.FC<ServerNodeProps> = ({ 
  title, 
  location, 
  files, 
  icon, 
  colorClass,
  onSelectFile 
}) => {
  const filesInLocation = files.filter(f => f.location === location);

  return (
    <div className={`relative flex flex-col border rounded-xl p-4 bg-white shadow-sm h-full ${filesInLocation.length > 0 ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}>
      <div className={`flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 ${colorClass}`}>
        {icon || <Server className="w-5 h-5" />}
        <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
        <span className="ml-auto text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
          {filesInLocation.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-[120px] max-h-[200px]">
        {filesInLocation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs italic">
            <span>Empty Folder</span>
          </div>
        ) : (
          filesInLocation.map((file) => (
            <div 
              key={file.id} 
              onClick={() => onSelectFile(file)}
              className="group flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-gray-700 truncate">{file.filename}</span>
                  <span className="text-[10px] text-gray-400 truncate">{file.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};