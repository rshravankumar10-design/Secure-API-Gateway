import React, { useState } from 'react';
import { ClientProfile } from '../types';
import { User, ShieldAlert, Activity, Clock, Terminal, Search, X, FileText, ChevronRight } from 'lucide-react';

interface ClientIntelProps {
  clients: ClientProfile[];
}

export const ClientIntel: React.FC<ClientIntelProps> = ({ clients }) => {
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.ip.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-full">
      
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
         <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-cyber-accent" />
            Client Threat Intelligence
         </h2>
         
         <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID or IP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-cyber-dark border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-cyber-primary outline-none w-full md:w-64 transition-all"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.username} className={`bg-cyber-panel border relative overflow-hidden rounded-xl transition-all hover:scale-[1.01] flex flex-col ${
            client.status === 'BANNED' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
            client.status === 'FLAGGED' ? 'border-yellow-500/50' : 'border-gray-700 hover:border-cyber-primary/50'
          }`}>
             {/* Status Badge */}
             <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold ${
               client.status === 'BANNED' ? 'bg-red-500 text-white' :
               client.status === 'FLAGGED' ? 'bg-yellow-500 text-black' :
               'bg-green-500/20 text-green-400'
             }`}>
               {client.status}
             </div>

             <div className="p-6 flex-1">
                <div className="flex items-center gap-4 mb-6">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${
                     client.status === 'BANNED' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-cyber-dark border-gray-600 text-gray-300'
                   }`}>
                      {client.username.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <h3 className="text-white font-bold capitalize">{client.username}</h3>
                      <p className="text-xs text-gray-500 font-mono">{client.ip}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div className="bg-cyber-black p-3 rounded-lg border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase">Logins</p>
                      <p className="text-lg font-mono text-white">{client.loginCount}</p>
                   </div>
                   <div className="bg-cyber-black p-3 rounded-lg border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase">Risk Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                           <div 
                             className={`h-full rounded-full ${client.riskScore > 80 ? 'bg-red-500' : client.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                             style={{ width: `${client.riskScore}%` }}
                           ></div>
                        </div>
                        <span className={`text-xs font-bold ${client.riskScore > 80 ? 'text-red-500' : 'text-gray-400'}`}>{client.riskScore}%</span>
                      </div>
                   </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                   <p className="text-[10px] text-gray-500 mb-2 flex items-center gap-1">
                      <Terminal size={10} /> RECENT ACTIVITY
                   </p>
                   <div className="space-y-2 max-h-24 overflow-hidden relative">
                      {client.activityLog.slice().reverse().slice(0, 3).map((log, i) => (
                        <div key={i} className="text-xs font-mono text-gray-400 truncate flex items-center gap-2">
                           <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
                           <span className={log.action.includes('BLOCKED') ? 'text-red-400' : 'text-gray-300'}>{log.action}</span>
                        </div>
                      ))}
                      {client.activityLog.length === 0 && (
                        <span className="text-xs text-gray-600 italic">No activity recorded</span>
                      )}
                      
                      {/* Fade out effect */}
                      {client.activityLog.length > 3 && (
                         <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-cyber-panel to-transparent"></div>
                      )}
                   </div>
                </div>
             </div>

             {/* Footer Action */}
             <button 
               onClick={() => setSelectedClient(client)}
               className="w-full py-3 bg-cyber-dark border-t border-gray-800 hover:bg-cyber-primary/10 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-white group"
             >
                <FileText size={14} /> VIEW FULL HISTORY
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        ))}
      </div>

      {/* Full History Modal */}
      {selectedClient && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="bg-cyber-panel border border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
               {/* Header */}
               <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-cyber-dark/50">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border ${
                        selectedClient.status === 'BANNED' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-cyber-dark border-gray-600 text-gray-300'
                     }`}>
                        {selectedClient.username.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="text-white font-bold text-lg">{selectedClient.username} <span className="text-gray-500 font-normal">/ Activity Log</span></h3>
                        <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                           <span>{selectedClient.ip}</span>
                           <span>•</span>
                           <span className={selectedClient.status === 'BANNED' ? 'text-red-500' : 'text-green-500'}>{selectedClient.status}</span>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white"
                  >
                     <X size={24} />
                  </button>
               </div>

               {/* Log Content */}
               <div className="flex-1 overflow-auto p-0 bg-cyber-black/30">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-cyber-dark text-xs uppercase text-gray-500 font-bold sticky top-0 z-10 shadow-sm">
                        <tr>
                           <th className="px-6 py-3 border-b border-gray-800 w-40">Timestamp</th>
                           <th className="px-6 py-3 border-b border-gray-800">Action / Event</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-800/50">
                        {selectedClient.activityLog.slice().reverse().map((log, index) => (
                           <tr key={index} className="hover:bg-white/5 transition-colors font-mono">
                              <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                                 {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className={`px-6 py-3 ${
                                 log.action.includes('BLOCKED') ? 'text-red-400 font-bold' : 
                                 log.action.includes('LOGIN') ? 'text-cyber-accent' : 
                                 log.action.includes('TOKEN') ? 'text-yellow-400' :
                                 'text-gray-300'
                              }`}>
                                 {log.action}
                              </td>
                           </tr>
                        ))}
                        {selectedClient.activityLog.length === 0 && (
                           <tr>
                              <td colSpan={2} className="px-6 py-8 text-center text-gray-500 italic">
                                 No history available for this client node.
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>

               {/* Footer */}
               <div className="p-4 border-t border-gray-800 bg-cyber-dark/30 text-right text-xs text-gray-500">
                  Total Records: {selectedClient.activityLog.length}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};