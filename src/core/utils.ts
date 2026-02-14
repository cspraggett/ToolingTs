import { Tool } from './solver';

// --- Shared Unit Conversion ---
const UNITS_PER_INCH = 1000;
export const inchesToUnits = (inches: number) => Math.round(inches * UNITS_PER_INCH);
export const unitsToInches = (units: number) => units / UNITS_PER_INCH;

export interface ToolSummary {
  size: number;
  count: number;
}

export const summarizeStack = (stack: Tool[]): ToolSummary[] => {
  // 1. Group by size
  const counts: Record<string, number> = {};

  for (const tool of stack) {
    // Use string key to handle floating point consistency
    const key = tool.size.toString();
    counts[key] = (counts[key] || 0) + 1;
  }

  // 2. Convert to array and sort (Largest First)
  return Object.entries(counts)
    .map(([sizeStr, count]) => ({
      size: parseFloat(sizeStr),
      count
    }))
    .sort((a, b) => b.size - a.size);
};