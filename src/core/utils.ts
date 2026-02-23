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

/**
 * Calculates the total material and physical arbor space required for a given set of strips.
 * 
 * @param strips - List of strip widths and their quantities.
 * @param knifeWidth - The physical width of a single slitter knife.
 * @returns An object containing total counts and total widths.
 */
export function computeCoilUsage(
  strips: { width: number; quantity: number }[],
  knifeWidth: number
): CoilUsage {
  const totalStrips = strips.reduce((sum, strip) => sum + strip.quantity, 0);
  
  // Rule: 2 knives per strip plus 2 outer knives for the edges.
  const totalKnives = 2 * totalStrips + 2;
  
  const stripTotal = strips.reduce((sum, strip) => sum + strip.width * strip.quantity, 0);
  const arborUsed = stripTotal + totalKnives * knifeWidth;
  
  return { totalStrips, totalKnives, stripTotal, arborUsed };
}

// --- Knife Clearance ---
export interface ClearanceResult {
  bottomClearance: number;
  topClearance: number;
}

/**
 * Adjusts the user-provided clearance based on machine-specific knife profiles.
 * Some knives require "split" clearance where part of the gap is on the top arbor.
 */
export function computeKnifeClearance(
  knifeSize: number,
  userClearance: number,
  offsets: KnifeClearanceOffset[]
): ClearanceResult {
  const matchingOffset = offsets.find((offset) => offset.knifeSize === knifeSize);
  
  if (!matchingOffset) {
    // Default: All clearance on the bottom knife.
    return { bottomClearance: userClearance, topClearance: 0 };
  }
  
  return {
    bottomClearance: matchingOffset.bottom(userClearance),
    topClearance: matchingOffset.top(userClearance),
  };
}

// --- Shoulder Calculation ---
const EIGHTH_INCH = 0.125;
const roundToTenThousandth = (value: number) => Math.round(value * 10000) / 10000;

export interface ShoulderResult {
  bottomOpening: number;
  topOpening: number;
  bottomClosing: number;
  topClosing: number;
  isValid: boolean;
}

/**
 * Calculates the 4 shoulder widths (Opening/Closing on Top/Bottom arbors) 
 * required to center the setup on the arbor.
 * 
 * "Opening" is the operator-side (start) of the arbor.
 * "Closing" is the drive-side (end) of the arbor.
 */
export function computeShoulders(
  setupWidth: number,
  arborLength: number,
  knifeWidth: number,
  bottomClearance: number,
  topClearance: number,
): ShoulderResult {
  // Base shoulder is the theoretical space on one side, rounded to the nearest 1/8".
  const baseShoulder = Math.round(((arborLength - setupWidth) / 2) / EIGHTH_INCH) * EIGHTH_INCH;
  const knifeRoundedUp = Math.ceil(knifeWidth / EIGHTH_INCH) * EIGHTH_INCH;

  const bottomOpening = roundToTenThousandth(baseShoulder + bottomClearance);
  const topOpening = roundToTenThousandth(baseShoulder - knifeRoundedUp + topClearance);
  
  const bottomClosing = roundToTenThousandth(arborLength - bottomOpening - setupWidth);
  const topClosing = roundToTenThousandth(arborLength - topOpening - setupWidth);

  const minShoulder = Math.min(bottomOpening, topOpening, bottomClosing, topClosing);
  
  // Safety rule: All shoulders must be at least 1.0" for physical stability.
  return { bottomOpening, topOpening, bottomClosing, topClosing, isValid: minShoulder >= 1.0 };
}

/**
 * Aggregates a list of individual tools into a summarized view (e.g., "5 x 1.000").
 */
export const summarizeStack = (stack: Tool[]): ToolSummary[] => {
  // 1. Group by size
  const counts: Record<string, number> = {};

  for (const tool of stack) {
    // Use string key with fixed precision to handle floating point consistency
    const key = tool.size.toFixed(4);
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