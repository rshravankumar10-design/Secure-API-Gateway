import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Splash = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div 
      onClick={onComplete} 
      className="fixed inset-0 bg-cyber-black z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
    >
      <div className="relative mb-8 group">
         {/* Glowing pulse effect */}
         <div className="absolute inset-0 bg-cyber-primary blur-[60px] opacity-20 animate-pulse group-hover:opacity-40 transition-opacity duration-1000"></div>
         <ShieldCheck size={140} className="text-cyber-primary relative z-10 animate-[pulse_3s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </div>
      
      <div className="text-center space-y-4 z-10 px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000">
          SENTINEL
        </h1>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyber-accent to-transparent mx-auto"></div>
        <p className="text-cyber-accent font-mono tracking-[0.5em] text-sm md:text-base animate-in fade-in slide-in-from-bottom-2 delay-300 duration-1000">
          SECURE GATEWAY
        </p>
      </div>

      <div className="absolute bottom-12 text-gray-500 text-xs font-mono animate-bounce opacity-70">
        [ TAP ANYWHERE TO INITIALIZE ]
      </div>
      
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ 
              backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', 
              backgroundSize: '50px 50px' 
           }}>
      </div>
    </div>
  );
};