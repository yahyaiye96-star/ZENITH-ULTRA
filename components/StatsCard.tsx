
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, unit, color, trend }) => {
  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 transition-all hover:scale-[1.02] hover:bg-slate-800/80">
      <div className="flex justify-between items-start">
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
        {trend && (
          <div className={`text-xs px-2 py-0.5 rounded-full ${
            trend === 'down' ? 'bg-emerald-500/10 text-emerald-400' : 
            trend === 'up' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
          }`}>
            {trend.toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-orbitron font-bold ${color}`}>{value}</span>
        <span className="text-slate-500 text-sm font-orbitron">{unit}</span>
      </div>
      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-2">
        <div 
          className={`h-full ${color.replace('text-', 'bg-')}`} 
          style={{ width: `${Math.min(Number(value) || 0, 100)}%` }}
        />
      </div>
    </div>
  );
};
