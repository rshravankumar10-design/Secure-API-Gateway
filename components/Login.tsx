import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, Activity, CheckCircle2, AlertCircle, Fingerprint, RefreshCw, ScanLine, Server, Terminal, ShieldAlert } from 'lucide-react';

const CLIENT_CREDENTIALS: Record<string, string> = {
  'zap': 'lklkl',
  'ness': 'pass',
  'shark': 'fail',
  'hat': 'test',
  'blue': 'hack'
};

export const Login = ({ onLogin }: { onLogin: (username: string, isAdmin: boolean) => void }) => {
  // Client State
  const [clientUser, setClientUser] = useState('');
  const [clientPass, setClientPass] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);
  const [clientLoading, setClientLoading] = useState(false);

  // Server State
  const [serverUser, setServerUser] = useState('');
  const [serverPass, setServerPass] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverLoading, setServerLoading] = useState(false);
  
  // Captcha State (Client Only)
  const [captchaStatus, setCaptchaStatus] = useState<'IDLE' | 'ACTIVE' | 'VERIFIED'>('IDLE');
  const [targetSequence, setTargetSequence] = useState<number[]>([]);
  const [inputSequence, setInputSequence] = useState<number[]>([]);
  const [captchaError, setCaptchaError] = useState(false);

  const startCaptcha = () => {
    const nums = new Set<number>();
    while(nums.size < 4) {
      nums.add(Math.floor(Math.random() * 9) + 1);
    }
    setTargetSequence(Array.from(nums));
    setInputSequence([]);
    setCaptchaStatus('ACTIVE');
    setCaptchaError(false);
  };

  const handleCaptchaInput = (num: number) => {
    if (captchaError) return;
    const expectedNum = targetSequence[inputSequence.length];
    
    if (num === expectedNum) {
      const newInput = [...inputSequence, num];
      setInputSequence(newInput);
      if (newInput.length === targetSequence.length) {
        setTimeout(() => setCaptchaStatus('VERIFIED'), 300);
      }
    } else {
      setCaptchaError(true);
      setTimeout(() => {
        setCaptchaError(false);
        setInputSequence([]);
      }, 500);
    }
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (captchaStatus !== 'VERIFIED') {
      setClientError("Security handshake required.");
      return;
    }

    if (clientUser.toLowerCase() === 'server') {
        setClientError("RESTRICTED: Server IDs cannot use Client Node Access.");
        return;
    }

    setClientLoading(true);

    setTimeout(() => {
        const storedPass = CLIENT_CREDENTIALS[clientUser.toLowerCase()];
        if (storedPass && storedPass === clientPass) {
          onLogin(clientUser.toLowerCase(), false);
        } else {
          setClientLoading(false);
          setClientError("Invalid Client Identity or Password.");
          setCaptchaStatus('IDLE');
        }
    }, 1200);
  };

  const handleServerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerLoading(true);

    setTimeout(() => {
        // Server Check - Granular Error Handling
        if (serverUser !== 'server') {
           setServerLoading(false);
           setServerError("CRITICAL: Invalid Server Node ID.");
        } else if (serverPass !== 'server') {
           setServerLoading(false);
           setServerError("ACCESS DENIED: Incorrect Root Password.");
        } else {
           onLogin('server', true);
        }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-cyber-black flex items-center justify-center z-50 p-4 font-sans overflow-y-auto">
       {/* Split Background */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none flex">
          <div className="w-1/2 h-full bg-cyber-primary/5 animate-pulse-fast"></div>
          <div className="w-1/2 h-full bg-red-900/5 animate-pulse-fast" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-cyber-black/80 to-cyber-black"></div>
       </div>
       
       <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl z-10 relative">
          
          {/* CLIENT LOGIN CARD */}
          <div className="flex-1 bg-cyber-panel/80 border border-gray-700/50 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col transition-all hover:border-cyber-primary/30">
             <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl border bg-cyber-dark border-gray-700 shadow-[0_0_20px_rgba(99,102,241,0.2)] relative">
                   <div className="absolute inset-0 blur-xl rounded-full bg-cyber-primary/20 animate-pulse"></div>
                   <Shield size={42} className="text-cyber-primary relative z-10" />
                </div>
             </div>
             
             <div className="text-center mb-6">
                <h2 className="text-xl font-bold tracking-widest text-white">GATEWAY ACCESS</h2>
                <p className="text-gray-400 text-xs mt-2 uppercase tracking-wide">Standard Client Node</p>
             </div>

             <form onSubmit={handleClientSubmit} className="space-y-4 flex-1 flex flex-col">
                {clientError && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-xs text-red-400 animate-in slide-in-from-top-2">
                    <AlertCircle size={16} />
                    {clientError}
                  </div>
                )}

                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Client ID</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3 transition-colors text-gray-500 group-focus-within:text-cyber-primary" size={18} />
                        <input 
                          type="text" 
                          value={clientUser}
                          onChange={(e) => setClientUser(e.target.value)}
                          placeholder="e.g. zap, ness"
                          className="w-full bg-cyber-dark border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:ring-1 focus:border-cyber-primary focus:ring-cyber-primary outline-none transition-all placeholder-gray-700"
                        />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Access Key</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 transition-colors text-gray-500 group-focus-within:text-cyber-primary" size={18} />
                        <input 
                          type="password" 
                          value={clientPass}
                          onChange={(e) => setClientPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-cyber-dark border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:ring-1 focus:border-cyber-primary focus:ring-cyber-primary outline-none transition-all placeholder-gray-700"
                        />
                    </div>
                </div>

                <div className="mt-2 mb-2">
                   {captchaStatus === 'IDLE' && (
                        <button
                          type="button"
                          onClick={startCaptcha}
                          className="w-full p-3 bg-cyber-dark border border-gray-700 rounded-lg flex items-center justify-between group hover:border-cyber-primary transition-all hover:bg-cyber-dark/80"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-800 p-1.5 rounded-md group-hover:bg-cyber-primary/20 transition-colors">
                              <ScanLine size={18} className="text-gray-400 group-hover:text-cyber-primary" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs text-gray-200 font-medium block">Security Check</span>
                            </div>
                          </div>
                          <ArrowRight size={14} className="text-gray-600 group-hover:text-cyber-primary transition-transform group-hover:translate-x-1" />
                        </button>
                      )}

                      {captchaStatus === 'ACTIVE' && (
                        <div className={`bg-cyber-dark border rounded-lg p-3 transition-colors duration-300 ${captchaError ? 'border-red-500/50 bg-red-500/5' : 'border-cyber-primary/50'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verify Sequence</span>
                            <button type="button" onClick={startCaptcha} className="text-gray-500 hover:text-white" title="Reset">
                              <RefreshCw size={12} />
                            </button>
                          </div>
                          <div className="flex justify-center gap-3 mb-3">
                            {targetSequence.map((num, idx) => {
                               const isMatched = idx < inputSequence.length;
                               return (
                                 <div key={idx} className={`w-6 h-6 flex items-center justify-center rounded font-mono font-bold text-sm transition-all border ${
                                    isMatched ? 'bg-cyber-primary border-cyber-primary text-white' : 'bg-gray-800 border-gray-600 text-gray-300'
                                 }`}>{num}</div>
                               );
                            })}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <button key={num} type="button" onClick={() => handleCaptchaInput(num)} disabled={inputSequence.includes(num)} className={`h-8 rounded bg-gray-800 border border-gray-700 text-gray-300 font-mono text-xs hover:bg-gray-700 active:scale-95 transition-all ${inputSequence.includes(num) ? 'opacity-20' : ''}`}>{num}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      {captchaStatus === 'VERIFIED' && (
                        <div className="p-3 bg-cyber-success/10 border border-cyber-success/30 rounded-lg flex items-center gap-3 animate-in fade-in">
                           <CheckCircle2 size={16} className="text-cyber-success" />
                           <span className="text-xs text-white font-medium">Verified</span>
                        </div>
                      )}
                </div>

                <button 
                   type="submit" 
                   disabled={clientLoading || captchaStatus !== 'VERIFIED'}
                   className={`w-full font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group mt-auto ${
                      clientLoading || captchaStatus !== 'VERIFIED'
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyber-primary to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-cyber-primary/20'
                   }`}
                 >
                   {clientLoading ? <Activity size={18} className="animate-spin" /> : <>Establish Connection <ArrowRight size={18} /></>}
                 </button>
             </form>
          </div>

          {/* SERVER LOGIN CARD */}
          <div className="flex-1 bg-red-950/20 border border-red-900/40 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col transition-all hover:border-red-600/30 relative overflow-hidden">
             {/* Decorative Warning Strip */}
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
             
             <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl border bg-red-950/30 border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.2)] relative">
                   <div className="absolute inset-0 blur-xl rounded-full bg-red-600/20 animate-pulse"></div>
                   <Terminal size={42} className="text-red-500 relative z-10" />
                </div>
             </div>
             
             <div className="text-center mb-6">
                <h2 className="text-xl font-bold tracking-widest text-red-500">ROOT ACCESS</h2>
                <p className="text-red-400/60 text-xs mt-2 uppercase tracking-wide">Administrative Control</p>
             </div>

             <form onSubmit={handleServerSubmit} className="space-y-4 flex-1 flex flex-col">
                {serverError && (
                  <div className="bg-red-500 border border-red-400 text-white rounded-lg p-3 flex items-center gap-2 text-xs animate-in slide-in-from-top-2 font-bold shadow-lg shadow-red-900/50">
                    <ShieldAlert size={16} />
                    {serverError}
                  </div>
                )}

                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-red-400/80 font-bold ml-1">Server Login ID</label>
                    <div className="relative group">
                        <Server className="absolute left-3 top-3 transition-colors text-red-900 group-focus-within:text-red-500" size={18} />
                        <input 
                          type="text" 
                          value={serverUser}
                          onChange={(e) => setServerUser(e.target.value)}
                          placeholder="server"
                          className="w-full bg-red-950/20 border border-red-900/50 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:ring-1 focus:border-red-500 focus:ring-red-500 outline-none transition-all placeholder-red-900/50"
                        />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-red-400/80 font-bold ml-1">Server Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 transition-colors text-red-900 group-focus-within:text-red-500" size={18} />
                        <input 
                          type="password" 
                          value={serverPass}
                          onChange={(e) => setServerPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-red-950/20 border border-red-900/50 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:ring-1 focus:border-red-500 focus:ring-red-500 outline-none transition-all placeholder-red-900/50"
                        />
                    </div>
                </div>

                <div className="mt-auto pt-6">
                     <button 
                       type="submit" 
                       disabled={serverLoading}
                       className={`w-full font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group ${
                          serverLoading
                            ? 'bg-red-900/50 text-red-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                       }`}
                     >
                       {serverLoading ? <Activity size={18} className="animate-spin" /> : <>Initialize Admin Session <ArrowRight size={18} /></>}
                     </button>
                     <p className="text-[10px] text-red-500/50 text-center mt-3 font-mono">
                        WARNING: UNAUTHORIZED ACCESS IS LOGGED
                     </p>
                </div>
             </form>
          </div>

       </div>
    </div>
  );
};