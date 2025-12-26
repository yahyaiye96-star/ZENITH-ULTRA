
import { GoogleGenAI, Type } from "@google/genai";
import { OptimizationTip } from "../types";

// Initialize the Gemini API client using the environment variable exclusively.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Check if the browser is online.
 */
const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

/**
 * Helper to handle API calls with basic retry logic for transient errors.
 * Includes a bypass for offline mode.
 */
async function callGemini(params: any, retries = 2): Promise<string | null> {
  if (!isOnline()) return null;

  try {
    const response = await ai.models.generateContent(params);
    return response.text || "";
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes("500") || error.message?.includes("xhr error"))) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return callGemini(params, retries - 1);
    }
    return null; // Return null to trigger offline fallbacks
  }
}

export async function generateExecutionPlan(gameName: string, stats: any): Promise<string[]> {
  const prompt = `Generate a high-tech "Kernel Execution Plan" for the game "${gameName}". 
  System Load: CPU ${stats.cpuUsage}%, RAM ${stats.ramUsage}%.
  Provide 5 short technical steps (e.g., "ISOLATING THREAD 4", "SUSPENDING SEARCHINDEXER.EXE") that sound like advanced OS-level optimizations. 
  Keep them short and technical. Focus on process management and memory allocation. No graphics.`;

  const result = await callGemini({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  if (result) {
    try {
      return JSON.parse(result);
    } catch (e) {
      console.warn("Failed to parse Gemini result, using fallback.");
    }
  }

  // High-tech offline fallback steps
  return [
    `LOCAL: Locking CPU Affinity for core 0-3`,
    `LOCAL: Flushing standby memory lists for ${gameName}`,
    `LOCAL: Suspending non-critical I/O handles`,
    `LOCAL: Reallocating virtual memory pool to high-speed cache`,
    `LOCAL: Optimizing kernel interrupt request (IRQ) pacing`
  ];
}

export async function getOptimizationAdvice(gameName: string, isLowEnd: boolean): Promise<OptimizationTip[]> {
  const result = await callGemini({
    model: "gemini-3-flash-preview",
    contents: `Provide 5 advanced, non-graphical optimization tips for running "${gameName}" on ${isLowEnd ? 'an extremely weak/low-end PC' : 'a standard PC'}. 
    Focus on OS-level process isolation, page file, and background task suspension. Output as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['OS', 'Network', 'Hardware', 'Process', 'Compatibility'] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ['High', 'Medium', 'Extreme'] }
          },
          required: ["category", "title", "description", "impact"]
        }
      }
    }
  });

  if (result) {
    try {
      return JSON.parse(result);
    } catch (e) {
      console.warn("Failed to parse Gemini optimization advice, using offline fallback.");
    }
  }

  // High-quality offline fallback tips
  return [
    {
      category: 'OS',
      title: 'Ultimate Performance Mode',
      description: 'Force the OS kernel into its highest power state. Useful for laptops and systems with aggressive power saving.',
      impact: 'High'
    },
    {
      category: 'Process',
      title: 'Realtime Priority Bridge',
      description: `Bridges ${gameName}'s main thread directly to the kernel bypass for lower input latency.`,
      impact: 'Extreme'
    },
    {
      category: 'Hardware',
      title: 'Page File Expansion',
      description: 'Manually expand the virtual memory buffer to prevent out-of-memory crashes on systems with limited physical RAM.',
      impact: 'High'
    },
    {
      category: 'OS',
      title: 'Disable Superfetch',
      description: 'Stop the OS from pre-caching non-gaming applications during your active session to free up I/O bandwidth.',
      impact: 'Medium'
    },
    {
      category: 'Compatibility',
      title: 'Legacy Instruction Emulation',
      description: 'Force old software to use modern CPU instruction sets via an software-defined affinity mask.',
      impact: 'Medium'
    }
  ];
}

export async function analyzeProcesses(processNames: string[]): Promise<any> {
  const result = await callGemini({
    model: "gemini-3-flash-preview",
    contents: `Analyze these background processes: ${processNames.join(", ")}. Identify resource-heavy apps safe to kill. Provide output in JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['safe', 'caution', 'critical'] },
            recommendation: { type: Type.STRING }
          }
        }
      }
    }
  });

  if (result) {
    try {
      return JSON.parse(result);
    } catch (e) {
      console.warn("Failed to parse Gemini process analysis, using offline heuristic.");
    }
  }

  // Basic heuristic analysis for common processes
  return processNames.map(name => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('discord') || lowerName.includes('chrome') || lowerName.includes('steam')) {
      return { name, status: 'safe', recommendation: 'Safe to terminate. These consume significant RAM/CPU.' };
    }
    if (lowerName.includes('search') || lowerName.includes('indexer') || lowerName.includes('telemetry')) {
      return { name, status: 'safe', recommendation: 'Recommended to disable during gameplay to reduce disk I/O.' };
    }
    return { name, status: 'caution', recommendation: 'Manual identification required. Likely a system or driver handle.' };
  });
}
