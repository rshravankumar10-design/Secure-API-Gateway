import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Shield, AlertOctagon, CheckCircle, Ban, Sparkles, BrainCircuit, Bug } from 'lucide-react';

interface LiveLogsProps {
  logs: LogEntry[];
}

export const LiveLogs: React.FC<LiveLogsProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 400 && status < 500) return 'text-yellow-400';
    return 'text-red-500';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ALLOWED': return <CheckCircle size={16} className="text-green-500" />;
      case 'BLOCKED': return <Ban size={16} className="text-red-500" />;
      case 'SANITIZED': return <Shield size={16} className="text-blue-500" />;
      default: return <AlertOctagon size={16} className="text-yellow-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-cyber-black border border-gray-800 rounded-xl overflow-hidden font-mono text-sm shadow-2xl">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-gray-400 text-xs">secure_gateway.log — bash — 80x24</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {logs.length === 0 && (
          <div className="text-gray-600 text-center mt-20">Waiting for traffic...</div>
        )}
        
        {logs.map((log) => (
          <div key={log.id} className="border-l-2 border-gray-800 pl-4 py-1 hover:bg-white/5 transition-colors group">
            <div className="flex items-center space-x-3 mb-1">
              <span className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`font-bold ${log.method === 'DELETE' ? 'text-red-400' : 'text-blue-400'}`}>{log.method}</span>
              <span className="text-gray-300">{log.endpoint}</span>
              <span className="flex-1 border-b border-gray-800 border-dashed mx-2"></span>
              <span className={`font-bold ${getStatusColor(log.status)}`}>{log.status}</span>
              <span className="text-gray-600 text-xs">{log.duration}ms</span>
            </div>
            
            <div className="flex items-start gap-3 mt-1">
               <div className="mt-0.5">{getActionIcon(log.actionTaken)}</div>
               <div className="flex-1">
                 <div className="flex items-center gap-2">
                   <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                     log.actionTaken === 'BLOCKED' ? 'bg-red-500/20 text-red-400' : 
                     log.actionTaken === 'SANITIZED' ? 'bg-blue-500/20 text-blue-400' : 
                     'bg-green-500/20 text-green-400'
                   }`}>
                     {log.actionTaken}
                   </span>
                   {log.threatDetected && (
                      <span className="text-red-500 text-xs font-bold animate-pulse">
                         ⚠ THREAT DETECTED: {log.threatDetected}
                      </span>
                   )}
                 </div>
                 
                 <p className="text-gray-400 mt-1">{log.details}</p>
                 
                 {/* DETAILED AI REPORT SECTION */}
                 {log.aiAnalysisResult && (
                  <div className="mt-3 mx-1 bg-[#1a1a2e] border border-cyber-primary/20 rounded-lg p-3 relative overflow-hidden animate-in fade-in slide-in-from-top-2">
                     <div className="absolute top-0 right-0 p-2 opacity-10">
                        <BrainCircuit size={40} className="text-cyber-primary" />
                     </div>
                     
                     <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                        <Sparkles size={14} className="text-cyber-primary" />
                        <span className="text-xs font-bold text-cyber-primary tracking-wider">AI INSPECTION REPORT</span>
                        <div className="ml-auto flex items-center gap-2">
                           <span className="text-[10px] text-gray-500 uppercase">Confidence</span>
                           <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                 className={`h-full rounded-full ${log.aiAnalysisResult.confidenceScore > 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                 style={{ width: `${log.aiAnalysisResult.confidenceScore * 100}%` }}
                              />
                           </div>
                           <span className="text-xs font-mono text-white">{(log.aiAnalysisResult.confidenceScore * 100).toFixed(0)}%</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                           <p className="text-[10px] text-gray-500 uppercase mb-1">Threat Classification</p>
                           <div className="flex items-center gap-2">
                              {log.aiAnalysisResult.isSafe ? (
                                 <span className="text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> SAFE / LEGITIMATE</span>
                              ) : (
                                 <span className="text-red-400 text-xs font-bold flex items-center gap-1 animate-pulse"><Bug size={12} /> {log.aiAnalysisResult.threatType || "MALICIOUS PAYLOAD"}</span>
                              )}
                           </div>
                        </div>
                        <div>
                           <p className="text-[10px] text-gray-500 uppercase mb-1">Engine Decision</p>
                           <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                              log.aiAnalysisResult.suggestedAction === 'BLOCK' ? 'bg-red-500/20 text-red-400' :
                              log.aiAnalysisResult.suggestedAction === 'FLAG' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                           }`}>
                              {log.aiAnalysisResult.suggestedAction}
                           </span>
                        </div>
                     </div>

                     <div className="bg-black/30 rounded p-2 border-l-2 border-gray-700 text-xs text-gray-300 font-mono mb-2">
                        <span className="text-gray-500 font-bold mr-2">&gt;</span>
                        {log.aiAnalysisResult.explanation}
                     </div>

                     {log.aiAnalysisResult.sanitizedBody && (
                        <div className="mt-2 bg-blue-900/10 border border-blue-500/20 rounded p-2">
                           <div className="flex items-center gap-2 mb-1">
                              <Shield size={12} className="text-blue-400" />
                              <span className="text-[10px] font-bold text-blue-400 uppercase">Sanitization Applied</span>
                           </div>
                           <code className="block text-[10px] text-blue-200 font-mono bg-black/40 p-1.5 rounded break-all">
                              {log.aiAnalysisResult.sanitizedBody}
                           </code>
                        </div>
                     )}
                  </div>
                 )}
               </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};