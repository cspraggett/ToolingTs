import { Tool } from './solver';
import { KnifeClearanceOffset } from '../config/machine-profiles';

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
  const totalKnives = 2 * totalStrips + 2;
  const stripTotal = strips.reduce((sum, s) => sum + s.width * s.quantity, 0);
  const arborUsed = stripTotal + totalKnives * knifeWidth;
  return { totalStrips, totalKnives, stripTotal, arborUsed };
}

// --- Knife Clearance ---
export interface ClearanceResult {
  bottomClearance: number;
  topClearance: number;
}

export function computeKnifeClearance(
  knifeSize: number,
  userClearance: number,
  offsets: KnifeClearanceOffset[]
): ClearanceResult {
  const entry = offsets.find((o) => o.knifeSize === knifeSize);
  if (!entry) {
    return { bottomClearance: userClearance, topClearance: 0 };
  }
  return {
    bottomClearance: entry.bottom(userClearance),
    topClearance: entry.top(userClearance),
  };
}

// --- Shoulder Calculation ---
const EIGHTH_INCH = 0.125;
const round4 = (n: number) => Math.round(n * 10000) / 10000;

export interface ShoulderResult {
  bottomOpening: number;
  topOpening: number;
  bottomClosing: number;
  topClosing: number;
  isValid: boolean;
}

export function computeShoulders(
  setupWidth: number,
  arborLength: number,
  knifeWidth: number,
  bottomClearance: number,
  topClearance: number,
): ShoulderResult {
  const base = Math.round(((arborLength - setupWidth) / 2) / EIGHTH_INCH) * EIGHTH_INCH;
  const knifeRoundedUp = Math.ceil(knifeWidth / EIGHTH_INCH) * EIGHTH_INCH;

  const bottomOpening = round4(base + bottomClearance);
  const topOpening = round4(base - knifeRoundedUp + topClearance);
  const bottomClosing = round4(arborLength - bottomOpening - setupWidth);
  const topClosing = round4(arborLength - topOpening - setupWidth);

  const minShoulder = Math.min(bottomOpening, topOpening, bottomClosing, topClosing);
  return { bottomOpening, topOpening, bottomClosing, topClosing, isValid: minShoulder >= 1.0 };
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