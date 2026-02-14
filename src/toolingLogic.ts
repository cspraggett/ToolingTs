import { DEFAULT_MACHINE } from "./config/machine-profiles";
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

const inchesToUnits = (inches: number): number =>
  Math.round(inches * UNITS_PER_INCH);

const steelToolingSizes = DEFAULT_MACHINE.tools;

/* =========================
   SOLVER LOGIC
========================= */

// UPDATED: Now accepts 'availableTools' as an argument
function solveSmallUnits(targetUnits: number, availableTools: Tool[]): Tool[] | null {
  const dp: (Tool[] | null)[] = Array(targetUnits + 1).fill(null);
  dp[0] = [];

  for (let i = 0; i <= targetUnits; i++) {
    const currentSetup = dp[i];
    if (!currentSetup) continue;

    for (const tool of availableTools) {
      const next = i + tool.units;
      if (next > targetUnits) continue;

      // INVENTORY CHECK (Max 2 of any specific tool)
      const countOfThisTool = currentSetup.filter(t => t.size === tool.size).length;
      if (countOfThisTool >= 2) continue;

      const candidate = [...currentSetup, tool];
      const existing = dp[next];

      // Optimization Logic
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

// UPDATED: Accepts 'useRiskyTools' flag
export function findExactSteelSetup(
  targetWidthInches: number,
  useRiskyTools: boolean = true // Default to true (Allow everything)
): ToolingSetup | null {

  if (targetWidthInches <= 0) return null;

  // 1. FILTERING STEP
  // If useRiskyTools is FALSE, we remove .031 and .062 from the list
  let activeSizes = steelToolingSizes;
  if (!useRiskyTools) {
    activeSizes = steelToolingSizes.filter(s => s !== 0.031 && s !== 0.062);
  }

  // Convert to Tool objects with units
  const activeTools: Tool[] = activeSizes.map(size => ({
    size,
    units: inchesToUnits(size)
  }));

  let unitsToSolve = inchesToUnits(targetWidthInches);
  const bigTools: Tool[] = [];
  const UNIT_3 = 3000;
  const SAFE_BUFFER = 6000;

  // 2. GREEDY REDUCTION (Using 3" spacers)
  while (unitsToSolve > SAFE_BUFFER) {
    bigTools.push({ size: 3, units: UNIT_3 });
    unitsToSolve -= UNIT_3;
  }

  // 3. RUN SOLVER with the FILTERED tool list
  const dpSolution = solveSmallUnits(unitsToSolve, activeTools);

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

/* =========================
   OPTIMIZER (Dual Value)
========================= */

export interface DualOptimizationResult {
  offset: number;
  maleResult: ToolingSetup;
  femaleResult: ToolingSetup;
  totalToolCount: number;
}

export function findBestDualSetup(
  maleInches: number,
  femaleInches: number,
  minusTolInches: number,
  plusTolInches: number,
  useRiskyTools: boolean = true // Pass the flag here
): DualOptimizationResult | null {

  const minUnits = inchesToUnits(minusTolInches);
  const maxUnits = inchesToUnits(plusTolInches);

  let bestResult: DualOptimizationResult | null = null;

  // SAFETY: Stop massive loops
  if (maxUnits > 500 || minUnits > 500) return null;

  for (let offsetUnits = -minUnits; offsetUnits <= maxUnits; offsetUnits++) {
    const currentOffsetInches = offsetUnits / 1000;
    const candidateMale = maleInches + currentOffsetInches;
    const candidateFemale = femaleInches + currentOffsetInches;

    // PASS THE FLAG
    const solM = findExactSteelSetup(candidateMale, useRiskyTools);
    const solF = findExactSteelSetup(candidateFemale, useRiskyTools);

    if (!solM || !solF) continue;

    const currentCount = solM.stack.length + solF.stack.length;

    let isNewBest = false;

    if (!bestResult) {
      isNewBest = true;
    } else if (currentCount < bestResult.totalToolCount) {
      isNewBest = true;
    }

    if (isNewBest) {
      bestResult = {
        offset: currentOffsetInches,
        maleResult: solM,
        femaleResult: solF,
        totalToolCount: currentCount
      };
    }
  }

  return bestResult;
}