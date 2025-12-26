
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  cpu: number;
  ram: number;
}

export const PerformanceChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl h-[350px]">
      <h3 className="text-lg font-orbitron font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
        LIVE PERFORMANCE STREAM
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Area 
            type="monotone" 
            dataKey="cpu" 
            stroke="#22d3ee" 
            fillOpacity={1} 
            fill="url(#colorCpu)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="ram" 
            stroke="#8b5cf6" 
            fillOpacity={1} 
            fill="url(#colorRam)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
