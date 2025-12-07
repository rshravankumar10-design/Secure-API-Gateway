import React, { useState, useEffect, useRef } from 'react';
import { Send, Key, RefreshCw, AlertTriangle, Zap, Play, Square, Activity, Clock, Lock, ArrowRight, History, CheckCircle, Ban, Shield, Users } from 'lucide-react';
import { RequestPayload, LogEntry, ClientProfile } from '../types';

interface RequestSimulatorProps {
  onSendRequest: (req: RequestPayload) => Promise<number>;
  generateToken: () => string;
  currentToken: string | null;
  lastUsedToken: string | null;
  rateLimitMax: number;
  recentRequests: LogEntry[];
  isAdmin?: boolean;
  clients?: ClientProfile[];
}

export const RequestSimulator: React.FC<RequestSimulatorProps> = ({ 
  onSendRequest, 
  generateToken, 
  currentToken,
  lastUsedToken,
  rateLimitMax,
  recentRequests,
  isAdmin,
  clients
}) => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState('/api/v1/users/data');
  const [body, setBody] = useState('{\n  "userId": 12345\n}');
  const [useToken, setUseToken] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [simulatedUser, setSimulatedUser] = useState<string>(clients?.[0]?.username || 'zap');

  // Auto-Fire / Load Test State
  const [isAutoFiring, setIsAutoFiring] = useState(false);
  const [requestsPerSecond, setRequestsPerSecond] = useState(1);
  const [clientSelfLimiting, setClientSelfLimiting] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [isThrottled, setIsThrottled] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Rate Limiting Refs (Client-Side Enforcement)
  const requestsSentRef = useRef(0);
  const windowStartRef = useRef(Date.now());

  // Helper to determine if we are waiting for a token
  const needsToken = useToken && !currentToken && !isAutoFiring;

  const createPayload = (): RequestPayload => ({
    id: crypto.randomUUID(),
    method,
    endpoint,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': isAutoFiring ? 'LoadTester/2.0' : 'SimulatedClient/1.0'
    },
    body: ['GET', 'DELETE'].includes(method) ? undefined : body,
    timestamp: Date.now(),
    clientIp: '192.168.1.50', // Will be overwritten by App.tsx logic based on username
    authToken: useToken ? (currentToken || '') : undefined,
    username: isAdmin ? simulatedUser : undefined // Pass selected user if admin
  });

  const handleSingleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (needsToken) return; // Prevent submission if token is needed
    
    setIsSending(true);
    await onSendRequest(createPayload());
    setIsSending(false);
  };

  // Auto-Fire Logic with Rate Limit Enforcement
  useEffect(() => {
    if (isAutoFiring) {
      const intervalMs = 1000 / requestsPerSecond;
      
      const fire = async () => {
        const now = Date.now();

        // 1. Check Window Reset (1 Minute Sliding Window Simulation)
        if (now - windowStartRef.current >= 60000) {
           windowStartRef.current = now;
           requestsSentRef.current = 0;
           setIsThrottled(false);
        }

        // 2. Check Client-Side Proactive Limit
        if (requestsSentRef.current >= rateLimitMax) {
           setIsThrottled(true);
           return; // Pause execution for this tick
        } else {
           setIsThrottled(false);
        }

        // 3. Self-Limiting Logic (Reactive Backoff on Errors)
        if (clientSelfLimiting && consecutiveErrors > 2) {
          if (Math.random() > 0.1) { // 90% chance to skip when backed off
             return; 
          }
        }

        // Count this request
        requestsSentRef.current++;

        const status = await onSendRequest(createPayload());
        
        if (status === 429 && clientSelfLimiting) {
          setConsecutiveErrors(prev => prev + 1);
        } else if (status === 200) {
          setConsecutiveErrors(0);
        }
      };

      timerRef.current = setInterval(fire, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setConsecutiveErrors(0);
      setIsThrottled(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoFiring, requestsPerSecond, clientSelfLimiting, consecutiveErrors, method, endpoint, body, useToken, currentToken, onSendRequest, rateLimitMax, simulatedUser, isAdmin]);


  const insertMalicious = () => {
    setBody('{\n  "userId": "1 OR 1=1; DROP TABLE users",\n  "comment": "<script>alert(1)</script>"\n}');
    setMethod('POST');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-10">
      {/* Client Controls */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Load Generator Panel */}
        <div className="bg-cyber-panel border border-gray-700 rounded-xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Activity size={120} />
           </div>
           
           <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Zap size={18} className="text-cyber-accent" />
              Traffic Generator (Load Test)
            </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-400 block mb-2">Target Throughput: <span className="text-white font-mono">{requestsPerSecond} RPS</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={requestsPerSecond}
                  onChange={(e) => setRequestsPerSecond(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyber-accent"
                  disabled={isAutoFiring}
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                  <span>1 Req/s</span>
                  <span>10 Req/s</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <button
                    onClick={() => setIsAutoFiring(!isAutoFiring)}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      isAutoFiring 
                        ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' 
                        : 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/50 hover:bg-cyber-accent/30'
                    }`}
                 >
                    {isAutoFiring ? <><Square size={18} fill="currentColor" /> Stop Traffic</> : <><Play size={18} fill="currentColor" /> Start Auto-Fire</>}
                 </button>
              </div>
           </div>

           <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap items-center gap-3">
              <input 
                type="checkbox" 
                id="smartClient"
                checked={clientSelfLimiting}
                onChange={(e) => setClientSelfLimiting(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-cyber-accent focus:ring-0"
              />
              <label htmlFor="smartClient" className="text-sm text-gray-300 cursor-pointer select-none">
                <span className="text-white font-semibold">Enable Client Self-Limiting</span>
                <span className="block text-xs text-gray-500">Automatically backoff when 429 Too Many Requests is received.</span>
              </label>
              
              {isAutoFiring && clientSelfLimiting && consecutiveErrors > 0 && !isThrottled && (
                <span className="ml-auto text-xs font-mono text-yellow-500 animate-pulse">
                  backing off ({consecutiveErrors})...
                </span>
              )}
           </div>

           {/* Throttling Indicator */}
           {isThrottled && (
             <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Clock size={16} className="text-yellow-500 animate-pulse" />
                <div>
                   <span className="text-yellow-500 text-sm font-bold block">Rate Limit Policy Enforcement</span>
                   <span className="text-yellow-200/60 text-xs">Simulator paused to respect gateway limit ({rateLimitMax} RPM). Resuming shortly...</span>
                </div>
             </div>
           )}
        </div>

        {/* Manual Request Console */}
        <div className="bg-cyber-panel border border-gray-700 rounded-xl p-6 relative">
          {/* Visual Connection Line */}
          {needsToken && (
             <div className="absolute -right-3 top-1/2 w-3 h-0.5 bg-yellow-500/50 hidden lg:block animate-pulse"></div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Manual Request Console
            </h3>
            <button 
              onClick={insertMalicious}
              className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500 rounded px-2 py-1 transition-colors flex items-center gap-1"
            >
              <AlertTriangle size={12} /> Load Attack Payload
            </button>
          </div>
          
          {/* Admin Simulation Dropdown */}
          {isAdmin && clients && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-4">
               <div className="flex items-center gap-2 text-red-400 text-sm font-bold whitespace-nowrap">
                  <Users size={16} /> Simulate As:
               </div>
               <select 
                  value={simulatedUser}
                  onChange={(e) => setSimulatedUser(e.target.value)}
                  className="bg-cyber-black border border-red-900 text-white text-sm rounded px-3 py-1.5 focus:border-red-500 outline-none w-full"
               >
                  {clients.map(c => (
                     <option key={c.username} value={c.username}>{c.username.toUpperCase()} ({c.ip})</option>
                  ))}
               </select>
            </div>
          )}

          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="bg-cyber-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyber-primary focus:outline-none"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <input 
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-1 bg-cyber-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyber-primary focus:outline-none font-mono text-sm"
                placeholder="/api/resource"
              />
            </div>

            <div className="relative">
              <label className="block text-xs text-gray-400 mb-1">Request Body (JSON)</label>
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={['GET', 'DELETE'].includes(method)}
                rows={5}
                className={`w-full bg-cyber-dark border border-gray-600 rounded-lg p-4 text-white font-mono text-sm focus:border-cyber-primary focus:outline-none ${['GET', 'DELETE'].includes(method) ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
               <div className={`flex items-center space-x-3 px-3 py-1.5 rounded-lg border transition-all ${needsToken ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
                 <input 
                      type="checkbox" 
                      id="useToken"
                      checked={useToken} 
                      onChange={(e) => setUseToken(e.target.checked)}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyber-primary focus:ring-0 cursor-pointer" 
                  />
                  <label htmlFor="useToken" className="text-sm text-gray-300 cursor-pointer select-none flex items-center gap-2">
                    <Lock size={14} className={useToken ? (needsToken ? 'text-yellow-500' : 'text-cyber-primary') : 'text-gray-600'} />
                    Attach Auth Token
                  </label>
               </div>
               
               <button 
                type="submit"
                disabled={isSending || isAutoFiring || isThrottled || needsToken}
                className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ${
                  isSending || isAutoFiring || isThrottled || needsToken
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                    : 'bg-gradient-to-r from-cyber-primary to-blue-600 hover:to-blue-500 text-white shadow-lg shadow-cyber-primary/20 hover:scale-105 active:scale-95'
                }`}
               >
                 {needsToken ? <Key size={18} className="animate-pulse text-yellow-500" /> : <Send size={18} />}
                 {isSending ? 'Transmitting...' : needsToken ? 'Token Required' : 'Send Request'}
               </button>
            </div>
          </form>
        </div>

        {/* RECENT REQUEST HISTORY (NEW) */}
        <div className="bg-cyber-panel border border-gray-700 rounded-xl p-6 flex flex-col h-[300px]">
           <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <History size={18} className="text-gray-400" />
              Session Request History
           </h3>
           <div className="flex-1 overflow-auto -mx-2 pr-2">
              <table className="w-full text-left border-collapse">
                 <thead className="text-[10px] text-gray-500 uppercase sticky top-0 bg-cyber-panel z-10">
                    <tr>
                       <th className="pb-2 pl-2">Time</th>
                       <th className="pb-2">Method</th>
                       <th className="pb-2">Path</th>
                       <th className="pb-2 text-right">Result</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800 text-xs font-mono">
                    {recentRequests.map((req, i) => (
                       <tr key={req.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-2 pl-2 text-gray-500 whitespace-nowrap">
                             {new Date(req.timestamp).toLocaleTimeString([], {hour12: false})}
                          </td>
                          <td className="py-2">
                             <span className={`font-bold ${
                                req.method === 'DELETE' ? 'text-red-400' : 
                                req.method === 'POST' ? 'text-blue-400' : 
                                req.method === 'PUT' ? 'text-yellow-400' : 
                                'text-green-400'
                             }`}>{req.method}</span>
                          </td>
                          <td className="py-2 text-gray-300 max-w-[150px] truncate" title={req.endpoint}>
                             {req.endpoint}
                          </td>
                          <td className="py-2 text-right">
                             <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${
                                req.actionTaken === 'BLOCKED' ? 'bg-red-500/10 text-red-500' : 
                                req.actionTaken === 'SANITIZED' ? 'bg-blue-500/10 text-blue-400' : 
                                'bg-green-500/10 text-green-500'
                             }`}>
                                {req.actionTaken === 'BLOCKED' ? <Ban size={10} /> : req.actionTaken === 'SANITIZED' ? <Shield size={10} /> : <CheckCircle size={10} />}
                                {req.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                    {recentRequests.length === 0 && (
                       <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-600 italic">
                             No history recorded this session.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Auth Simulation Panel */}
      <div className="space-y-6">
        <div className={`bg-cyber-panel border rounded-xl p-6 h-full flex flex-col transition-all duration-500 ${needsToken ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-gray-700'}`}>
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Key size={20} className={`transition-colors ${needsToken ? 'text-yellow-500 animate-pulse' : 'text-gray-400'}`} />
            Security Token Provider
          </h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className={`bg-cyber-black p-4 rounded-lg border text-center transition-colors ${needsToken ? 'border-yellow-500/30' : 'border-gray-800'}`}>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Current Active Token</p>
              {currentToken ? (
                <div className="font-mono text-green-400 text-xl break-all animate-pulse-fast">
                  {currentToken.slice(0, 16)}...
                </div>
              ) : (
                <div className="font-mono text-gray-600 text-lg">NO ACTIVE TOKEN</div>
              )}
            </div>

            <div className="text-center">
              <p className={`text-sm mb-4 transition-colors ${needsToken ? 'text-yellow-200/80 font-medium' : 'text-gray-400'}`}>
                {needsToken 
                  ? "Authentication required to proceed. Generate a new One-Time-Code below."
                  : <>This gateway enforces a One-Time-Code (OTC) policy. Each token is valid for exactly <strong>one</strong> request.</>
                }
              </p>
              
              <div className="relative group">
                {/* Visual arrow pointing if needed */}
                {needsToken && (
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-yellow-500 hidden lg:block animate-bounce-x">
                       <ArrowRight size={24} />
                    </div>
                )}
                
                <button 
                  onClick={generateToken}
                  className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-bold ${
                    needsToken 
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20 scale-105' 
                      : 'bg-cyber-dark border border-gray-600 hover:border-green-500 hover:text-green-400 text-white'
                  }`}
                >
                  <RefreshCw size={16} className={needsToken ? 'animate-spin-once' : ''} />
                  Generate New Code
                </button>
              </div>
            </div>

            {lastUsedToken && (
               <div className="mt-8 border-t border-gray-800 pt-4">
                 <p className="text-gray-500 text-xs mb-1">Last Invalidated Token:</p>
                 <p className="font-mono text-red-900 text-xs line-through break-all">{lastUsedToken}</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};