/* =========================
   TYPES & INTERFACES
========================= */
export interface Tool {
  size: number;
  units: number;
}

export interface ToolingSetup {
  width: number;
  stack: Tool[];
}

export interface ToolSummary {
  size: number;
  count: number;
}

/* =========================
   CONSTANTS & DATA
========================= */
const UNITS_PER_INCH = 1000;

// Conversion helper
const inchesToUnits = (inches: number): number =>
  Math.round(inches * UNITS_PER_INCH);

const steelToolingSizes: number[] = [
  3, 2, 1, 0.875, 0.75, 0.625, 0.5, 0.4, 0.375,
  0.3, 0.26, 0.257, 0.255, 0.253, 0.252, 0.251, 0.25,
  0.24, 0.2, 0.125, 0.1, 0.062, 0.05, 0.031
];

/* =========================
   SOLVER LOGIC
========================= */

// 1. The Core DP Solver (Private, only solves <= 2 inches)
function solveSmallUnits(targetUnits: number): Tool[] | null {
  const steelTools: Tool[] = steelToolingSizes.map(size => ({
    size,
    units: inchesToUnits(size)
  }));

  const dp: (Tool[] | null)[] = Array(targetUnits + 1).fill(null);
  dp[0] = [];

  for (let i = 0; i <= targetUnits; i++) {
    const currentSetup = dp[i];
    if (!currentSetup) continue;

    for (const tool of steelTools) {
      const next = i + tool.units;
      if (next > targetUnits) continue;

      const candidate = [...currentSetup, tool];
      const existing = dp[next];

      if (!existing || candidate.length < existing.length) {
        dp[next] = candidate;
      }
    }
  }

  return dp[targetUnits];
}

// 2. The Public Wrapper (Greedy reduction)
export function findExactSteelSetup(targetWidthInches: number): ToolingSetup | null {
  // Convert to integer units immediately to avoid float math errors
  let unitsToSolve = inchesToUnits(targetWidthInches);

  const bigTools: Tool[] = [];
  const UNIT_3 = 3000;
  const UNIT_2 = 2000;

  // OPTIMIZATION:
  // As long as we are above 2.0" (2000 units), we can safely peel off
  // 3s and 2s because 1" is available in the DP set if needed.

  while (unitsToSolve > UNIT_2) {
    if (unitsToSolve >= UNIT_3) {
      bigTools.push({ size: 3, units: UNIT_3 });
      unitsToSolve -= UNIT_3;
    } else {
      // If between 2001 and 2999, peel off a 2"
      bigTools.push({ size: 2, units: UNIT_2 });
      unitsToSolve -= UNIT_2;
    }
  }

  // Now we solve the remainder (guaranteed to be <= 2.0")
  const dpSolution = solveSmallUnits(unitsToSolve);

  if (!dpSolution) return null;

  return {
    width: targetWidthInches,
    stack: [...bigTools, ...dpSolution]
  };
}

// Helper: Summarize for display
export function summarizeAndSortStack(toolStack: Tool[]): ToolSummary[] {
  const countBySize = toolStack.reduce((accumulator: Record<number, number>, tool: Tool) => {
    accumulator[tool.size] = (accumulator[tool.size] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(countBySize)
    .map(([size, count]): ToolSummary => ({
      size: Number(size),
      count: count as number
    }))
    .sort((a, b) => b.size - a.size);
}