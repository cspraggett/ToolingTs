import { Tool } from './solver';

// --- Shared Unit Conversion ---
const UNITS_PER_INCH = 1000;
export const inchesToUnits = (inches: number) => Math.round(inches * UNITS_PER_INCH);
export const unitsToInches = (units: number) => units / UNITS_PER_INCH;

export interface ToolSummary {
  size: number;
  count: number;
}

export interface CoilUsage {
  totalStrips: number;
  totalKnives: number;
  stripTotal: number;   // just strip widths (coil material)
  arborUsed: number;    // strips + knives (physical arbor space)
}

export function computeCoilUsage(
  strips: { width: number; quantity: number }[],
  knifeWidth: number
): CoilUsage {
  const totalStrips = strips.reduce((sum, s) => sum + s.quantity, 0);
  const totalKnives = totalStrips + 1;
  const stripTotal = strips.reduce((sum, s) => sum + s.width * s.quantity, 0);
  const arborUsed = stripTotal + totalKnives * knifeWidth;
  return { totalStrips, totalKnives, stripTotal, arborUsed };
}

export function computeEdgeSpacers(
  stripTotal: number,
  arborUsed: number,
  coilWidth: number,
  arborLength: number
): { edgeTrim: number; edgeSpacer: number } {
  const edgeTrim = coilWidth - stripTotal;
  const edgeSpacer = (arborLength - arborUsed) / 2;
  return { edgeTrim, edgeSpacer };
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