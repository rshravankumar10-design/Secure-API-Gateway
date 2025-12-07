import React, { useState } from 'react';
import { ShieldCheck, Activity, Terminal, Settings, Lock, Server, Users, UserCircle, LogOut, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser?: string;
  isAdmin?: boolean;
}

const NavItem = ({ id, icon: Icon, label, active, onClick, disabled }: any) => (
  <button
    onClick={() => !disabled && onClick(id)}
    disabled={disabled}
    className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'bg-cyber-primary/10 text-white' 
        : disabled ? 'text-gray-700 cursor-not-allowed opacity-50' : 'text-gray-400 hover:bg-cyber-panel hover:text-white'
    }`}
  >
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyber-primary rounded-r-full shadow-[0_0_10px_#6366f1]" />
    )}
    <Icon size={20} className={`transition-colors ${active ? 'text-cyber-primary' : disabled ? 'text-gray-700' : 'group-hover:text-cyber-primary'}`} />
    <span className="font-medium relative z-10">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, currentUser, isAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-cyber-black overflow-hidden selection:bg-cyber-primary/30 font-sans">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full w-64 border-r border-gray-800 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isAdmin ? 'bg-cyber-dark' : 'bg-[#0f0f16]'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className={`${isAdmin ? 'bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-cyber-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]'} p-2 rounded-lg`}>
              <ShieldCheck className={isAdmin ? 'text-red-500' : 'text-cyber-primary'} size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">SECURE API</h1>
              <p className={`text-xs font-mono tracking-widest ${isAdmin ? 'text-red-400' : 'text-cyber-accent'}`}>
                {isAdmin ? 'ADMIN CONSOLE' : 'CLIENT GATEWAY'}
              </p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {isAdmin && (
            <div className="pb-2 mb-2 border-b border-gray-800/50">
               <p className="px-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Server Controls</p>
               <NavItem 
                id="dashboard" 
                icon={Activity} 
                label="Live Monitor" 
                active={activeTab === 'dashboard'} 
                onClick={handleTabChange} 
              />
              <NavItem 
                id="intel" 
                icon={Users} 
                label="Client Intel" 
                active={activeTab === 'intel'} 
                onClick={handleTabChange} 
              />
               <NavItem 
                id="logs" 
                icon={Terminal} 
                label="Security Logs" 
                active={activeTab === 'logs'} 
                onClick={handleTabChange} 
              />
            </div>
          )}

          <div>
            <p className="px-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
               {isAdmin ? 'Simulation' : 'Node Operations'}
            </p>
            <NavItem 
              id="client" 
              icon={Server} 
              label={isAdmin ? "Client Simulator" : "My Console"} 
              active={activeTab === 'client'} 
              onClick={handleTabChange} 
            />
          </div>
        </nav>

        <div className="mt-auto p-4 space-y-2">
           {isAdmin && (
             <NavItem 
                id="settings" 
                icon={Settings} 
                label="System Policy" 
                active={activeTab === 'settings'} 
                onClick={handleTabChange} 
              />
           )}
           <button 
             onClick={() => window.location.reload()} 
             className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
           >
             <LogOut size={20} />
             <span className="font-medium">Terminate Session</span>
           </button>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-cyber-panel/50 p-3 rounded-lg border border-gray-700/50 flex items-center space-x-3 backdrop-blur-sm">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">System Status</p>
              <p className="text-xs font-bold text-green-400">OPERATIONAL</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-cyber-black w-full">
        {/* Header */}
        <header className="h-16 bg-cyber-dark/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setMobileMenuOpen(true)} 
               className="md:hidden text-gray-400 hover:text-white transition-colors"
             >
               <Menu size={24} />
             </button>
             <h2 className="text-lg font-semibold text-white capitalize flex items-center gap-2 truncate">
               {activeTab === 'dashboard' ? 'Traffic Overview' : activeTab === 'intel' ? 'Client Intelligence' : activeTab === 'client' && !isAdmin ? 'My Secure Console' : activeTab.replace('-', ' ')}
             </h2>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
             {/* Enhanced TLS Badge */}
             <div className="hidden md:flex px-3 py-1.5 rounded-full border border-cyber-accent/30 bg-cyber-accent/10 text-cyber-accent text-[11px] font-mono font-bold items-center gap-2 shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]">
                <Lock size={12} /> TLS 1.3 ENFORCED
             </div>
             
             {/* Current User Indicator */}
             <div className="flex items-center gap-3 pl-4 md:border-l border-gray-700">
                <div className="text-right hidden sm:block">
                   <p className="text-[10px] text-gray-400 uppercase tracking-wide">Connected As</p>
                   <p className={`text-sm font-bold capitalize ${isAdmin ? 'text-red-400' : 'text-white'}`}>{currentUser || 'Unknown'}</p>
                </div>
                <div className="relative group cursor-pointer">
                  <div className={`absolute inset-0 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity ${isAdmin ? 'bg-red-500' : 'bg-cyber-primary'}`}></div>
                  <UserCircle size={36} className={`${isAdmin ? 'text-red-500' : 'text-cyber-primary'} relative z-10`} />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-cyber-dark rounded-full z-20"></div>
               </div>
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 relative w-full">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none" 
                 style={{ 
                    backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', 
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                 }}>
            </div>
            {/* Subtle glow orb in background */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[100px] rounded-full pointer-events-none ${isAdmin ? 'bg-red-500/5' : 'bg-cyber-primary/5'}`}></div>

            <div className="relative z-10 max-w-7xl mx-auto h-full">
              {children}
            </div>
        </div>
      </main>
    </div>
  );
};