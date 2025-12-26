
export interface SystemStats {
  cpuUsage: number;
  ramUsage: number;
  temp: number;
  ping: number;
  activeProcesses: number;
}

export interface OptimizationTip {
  category: 'OS' | 'Network' | 'Hardware' | 'Process' | 'Compatibility';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Extreme';
}

export interface ProcessItem {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  status: 'safe' | 'caution' | 'critical';
  recommendation: string;
  priority?: 'Normal' | 'High' | 'Realtime';
  affinity?: string;
}

export interface CompatibilityProfile {
  id: string;
  name: string;
  description: string;
  target: 'Emulator' | 'Low-End PC' | 'Legacy App';
}

export interface PerformanceProfile {
  targetFps: number;
  hexMovementBoost: boolean;
}
