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

// toolingLogic.ts

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

    // REMOVED: The check for 'currentSetup.length >= 2' is gone.
    // We now allow taller stacks, provided they use different tools.

    for (const tool of steelTools) {
      const next = i + tool.units;
      if (next > targetUnits) continue;

      // === NEW INVENTORY CHECK ===
      // Count how many of THIS specific tool size we are already using.
      // If we already have 2, we cannot add a 3rd.
      const countOfThisTool = currentSetup.filter(t => t.size === tool.size).length;
      if (countOfThisTool >= 2) continue;
      // ===========================

      const candidate = [...currentSetup, tool];
      const existing = dp[next];

      // Standard "Find the best stack" logic
      let isBetter = false;

      if (!existing) {
        isBetter = true;
      } else if (candidate.length < existing.length) {
        isBetter = true;
      } else if (candidate.length === existing.length) {
        // Tie-breaker: Prefer larger tools
        const candidateMax = Math.max(...candidate.map(t => t.size));
        const existingMax = Math.max(...existing.map(t => t.size));
        if (candidateMax > existingMax) isBetter = true;
      }

      if (isBetter) {
        dp[next] = candidate;
      }
    }
  }

  return dp[targetUnits];
}

// 2. The Public Wrapper (Greedy reduction)
/* =========================
   SOLVER LOGIC
========================= */

// ... (keep solveSmallUnits exactly as we wrote it, with the Inventory Check) ...

export function findExactSteelSetup(targetWidthInches: number): ToolingSetup | null {
  // 1. Guard Clause
  if (targetWidthInches <= 0) return null;

  let unitsToSolve = inchesToUnits(targetWidthInches);

  const bigTools: Tool[] = [];
  const UNIT_3 = 3000;

  // === THE FIX IS HERE ===
  // Previously, we stripped big blocks if the target was > 2 inches.
  // Now, we wait until the target is > 6 inches.
  // This allows the DP solver to handle tricky numbers like 2.248 or 3.248
  // by trying combinations (like 1" + 0.5"...) that the Greedy loop would miss.

  const SAFE_BUFFER = 6000;

  while (unitsToSolve > SAFE_BUFFER) {
    bigTools.push({ size: 3, units: UNIT_3 });
    unitsToSolve -= UNIT_3;
  }

  // Now we pass the full 2248 units to the solver.
  // It will try [2.0 + 0.248] -> FAIL
  // Then it will try [1.0 + 1.248] -> SUCCESS
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