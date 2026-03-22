import { Tool } from './solver';

// --- Result Type (Rust-style) ---
export type Result<T, E = string> = 
  | { ok: true; value: T } 
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, any> => ({ ok: true, value });
export const err = <E>(error: E): Result<any, E> => ({ ok: false, error });

// --- Shared Unit Conversion ---
export const DEFAULT_UNITS_PER_INCH = 1000;
export const HALF_THOU_UNITS_PER_INCH = 2000;

/**
 * Checks if a value contains a "half-thou" (0.0005") component.
 */
export const hasHalfThou = (val: number) => {
  const thousandths = val * 1000;
  // If thousandths is not an integer (e.g. 1.5), it has a half-thou component.
  return Math.abs(thousandths - Math.round(thousandths)) > 0.0001;
};

export const inchesToUnits = (inches: number, precision: number = DEFAULT_UNITS_PER_INCH) => 
  Math.round(inches * precision);

export const unitsToInches = (units: number, precision: number = DEFAULT_UNITS_PER_INCH) => 
  units / precision;

/**
 * Formats a numerical inch value for display.
 * Uses 4 decimal places if it has a half-thou, otherwise 3.
 */
export const formatInches = (val: number) => {
  return hasHalfThou(val) ? val.toFixed(4) : val.toFixed(3);
};

export interface ToolSummary {
  size: number;
  count: number;
  label?: string;
}

/**
 * Aggregates a list of individual tools into a summarized view (e.g., "5 x 1.000").
 */
export const summarizeStack = (stack: Tool[], labels?: Record<number, string>): ToolSummary[] => {
  // 1. Group by size
  const counts: Record<string, number> = {};

  for (const tool of stack) {
    // Use string key with fixed precision to handle floating point consistency
    const key = tool.size.toFixed(4);
    counts[key] = (counts[key] || 0) + 1;
  }

  // 2. Convert to array and sort (Largest First)
  return Object.entries(counts)
    .map(([sizeStr, count]) => {
      const size = parseFloat(sizeStr);
      return {
        size,
        count,
        label: labels?.[size]
      };
    })
    .sort((a, b) => b.size - a.size);
};
