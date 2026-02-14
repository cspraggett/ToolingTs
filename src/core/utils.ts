import { Tool } from './solver';

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