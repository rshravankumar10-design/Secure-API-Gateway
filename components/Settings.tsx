import React from 'react';
import { GatewayConfig, SecurityLevel } from '../types';
import { ToggleLeft, ToggleRight, Shield, AlertTriangle, Zap, Sliders } from 'lucide-react';

interface SettingsProps {
  config: GatewayConfig;
  setConfig: (c: GatewayConfig) => void;
}

const Toggle = ({ label, description, active, onChange }: any) => (
  <div className="flex items-center justify-between p-4 bg-cyber-dark border border-gray-700 rounded-lg">
    <div>
      <h4 className="text-white font-medium">{label}</h4>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
    <button 
      onClick={() => onChange(!active)}
      className={`transition-colors ${active ? 'text-cyber-primary' : 'text-gray-600'}`}
    >
      {active ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
    </button>
  </div>
);

export const Settings: React.FC<SettingsProps> = ({ config, setConfig }) => {
  const updateConfig = (key: keyof GatewayConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pb-12">
      <div className="md:col-span-2 bg-cyber-panel border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl text-white font-bold mb-6 flex items-center gap-2">
          <Shield className="text-cyber-primary" /> Global Security Policy
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-cyber-black rounded-lg border border-gray-700">
             <label className="text-gray-400 text-sm block mb-2">Security Level</label>
             <div className="flex gap-2">
                {Object.values(SecurityLevel).map((level) => (
                  <button
                    key={level}
                    onClick={() => updateConfig('securityLevel', level)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${
                      config.securityLevel === level 
                        ? 'bg-cyber-primary text-white shadow-lg shadow-cyber-primary/25' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 bg-cyber-dark border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-white font-medium flex items-center gap-2">
              <Zap size={18} className="text-yellow-500" />
              Server Rate Limit Capacity
            </h4>
            <p className="text-gray-500 text-sm mt-1">Maximum allowed requests per minute per IP.</p>
          </div>
          <div className="text-2xl font-mono text-cyber-primary font-bold">
            {config.rateLimitMax} <span className="text-xs text-gray-500">RPM</span>
          </div>
        </div>
        <input 
          type="range" 
          min="10" 
          max="300" 
          step="10"
          value={config.rateLimitMax}
          onChange={(e) => updateConfig('rateLimitMax', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyber-primary"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
          <span>10 RPM (Strict)</span>
          <span>150 RPM (Standard)</span>
          <span>300 RPM (High Load)</span>
        </div>
      </div>

      <Toggle 
        label="Rate Limiting Enforcement" 
        description="Reject requests exceeding the configured RPM threshold."
        active={config.rateLimitEnabled}
        onChange={(v: boolean) => updateConfig('rateLimitEnabled', v)}
      />

      <Toggle 
        label="Active Countermeasures" 
        description="Enable 'Reverse Attack' protocol (Simulation only)."
        active={config.reverseAttackEnabled}
        onChange={(v: boolean) => updateConfig('reverseAttackEnabled', v)}
      />

       <div className="md:col-span-2 mt-4 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-yellow-500 shrink-0" />
          <div>
            <h4 className="text-yellow-500 font-bold text-sm">Deployment Warning</h4>
            <p className="text-yellow-200/60 text-xs mt-1">
              Changes to security policies apply instantly. Enabling 'Active Countermeasures' may result in high resource usage for AI analysis.
            </p>
          </div>
       </div>
    </div>
  );
};