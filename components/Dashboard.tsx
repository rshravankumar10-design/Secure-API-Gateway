import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { GatewayStats } from '../types';
import { ShieldAlert, Zap, Lock, Globe, Ban } from 'lucide-react';

interface DashboardProps {
  stats: GatewayStats;
  trafficData: any[];
}

const StatCard = ({ label, value, icon: Icon, color, trend, subLabel }: any) => (
  <div className="bg-cyber-panel border border-gray-700 rounded-xl p-6 relative overflow-hidden group hover:border-gray-500 transition-colors">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={64} />
    </div>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-white font-mono">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg bg-opacity-10 ${color} backdrop-blur-sm border border-white/5`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs">
        {trend && <span className={`${trend.includes('+') ? 'text-green-400' : 'text-yellow-400'} mr-1 font-bold`}>{trend}</span>}
        <span className="text-gray-500">{subLabel || "since last hour"}</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats, trafficData }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Requests" 
          value={stats.totalRequests.toLocaleString()} 
          icon={Globe} 
          color="text-blue-500" 
          trend="+12%"
        />
        <StatCard 
          label="Blocked Threats" 
          value={stats.blockedRequests.toLocaleString()} 
          icon={ShieldAlert} 
          color="text-red-500" 
          trend="+5%"
        />
        <StatCard 
          label="Avg Latency" 
          value={`${stats.avgLatency}ms`} 
          icon={Zap} 
          color="text-yellow-500" 
          trend="-2ms"
          subLabel="processing time"
        />
        <StatCard 
          label="Banned Clients" 
          value={stats.globalBans} 
          icon={Ban} 
          color="text-orange-500" 
          trend="ACTIVE"
          subLabel="permanent bans"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        <div className="lg:col-span-2 bg-cyber-panel border border-gray-700 rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-white font-semibold flex items-center gap-2">
               <ActivityIcon /> Real-time Traffic Throughput
             </h3>
             <div className="flex items-center gap-3 text-xs">
               <span className="flex items-center gap-1 text-gray-400"><span className="w-2 h-2 rounded-full bg-cyber-primary"></span> Valid</span>
               <span className="flex items-center gap-1 text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500"></span> Blocked</span>
             </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#13131f', borderColor: '#374151', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="valid" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" name="Valid Traffic" animationDuration={500} />
                <Area type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" name="Blocked Threats" animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-cyber-panel border border-gray-700 rounded-xl p-6 flex flex-col">
          <h3 className="text-white font-semibold mb-4">Request Distribution</h3>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'GET', val: 65 },
                { name: 'POST', val: 25 },
                { name: 'PUT', val: 5 },
                { name: 'DEL', val: 5 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#374151', opacity: 0.2}} contentStyle={{ backgroundColor: '#13131f', borderColor: '#374151', borderRadius: '8px' }} />
                <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                  {
                    [0,1,2,3].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#06b6d4', '#f59e0b', '#ef4444'][index % 4]} />
                    ))
                  }
                </Bar>
              </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyber-primary">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
)