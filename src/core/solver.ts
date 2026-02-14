// src/core/solver.ts
import * as R from 'remeda';
import { MachineProfile } from '../config/machine-profiles';

// --- Types ---
export interface Tool {
  size: number;
  units: number; // calculated once
}

export interface SolverOptions {
  strictMode?: boolean;
}

export interface SolverResult {
  target: number;
  stack: Tool[];
}

// --- Constants ---
const UNITS_PER_INCH = 1000;
const inchesToUnits = (inVal: number) => Math.round(inVal * UNITS_PER_INCH);

// --- The Pure Core ---

/**
 * Prepares the tool list based on the machine profile and strict mode options.
 * Uses Remeda for a clean transformation pipeline.
 */
const getActiveTools = (profile: MachineProfile, isStrict: boolean): Tool[] => {
  return R.pipe(
    profile.tools,
    // 1. Filter Risky Tools if in Strict Mode
    R.filter((size) => {
      if (!isStrict) return true;
      return size !== 0.031 && size !== 0.062;
    }),
    // 2. Map to Tool Objects (pre-calculate units)
    R.map((size) => ({ size, units: inchesToUnits(size) })),
    // 3. Sort Descending (Greedy heuristic helper)
    R.sortBy((t) => t.units),
    R.reverse()
  );
};

/**
 * The Dynamic Programming Solver
 * Solves for specific unit amounts using the available inventory.
 */
const solveDP = (targetUnits: number, inventory: Tool[]): Tool[] | null => {
  // DP Table: dp[units] = List of tools to make that amount
  const dp: (Tool[] | null)[] = Array(targetUnits + 1).fill(null);
  dp[0] = [];

  for (let i = 0; i <= targetUnits; i++) {
    const currentStack = dp[i];
    if (!currentStack) continue;

    for (const tool of inventory) {
      const next = i + tool.units;
      if (next > targetUnits) continue;

      // INVENTORY CHECK: Max 2 of any specific size
      const countUsed = currentStack.filter(t => t.size === tool.size).length;
      if (countUsed >= 2) continue;

      const candidate = [...currentStack, tool];
      const existing = dp[next];

      // Optimization: Prefer fewer pieces, then larger pieces
      let isBetter = false;
      if (!existing) {
        isBetter = true;
      } else if (candidate.length < existing.length) {
        isBetter = true;
      } else if (candidate.length === existing.length) {
        // Tie-breaker: Check max tool size
        const maxCand = Math.max(...candidate.map(t => t.size));
        const maxExist = Math.max(...existing.map(t => t.size));
        if (maxCand > maxExist) isBetter = true;
      }

      if (isBetter) dp[next] = candidate;
    }
  }

  return dp[targetUnits];
};

/**
 * Public Pure Function
 * Takes inputs -> Returns Result. No side effects.
 */
export function findToolingSetup(
  targetInches: number,
  machine: MachineProfile,
  options: SolverOptions = {}
): SolverResult | null {
  if (targetInches <= 0) return null;

  const targetUnits = inchesToUnits(targetInches);
  const activeTools = getActiveTools(machine, !!options.strictMode);

  // Greedy Phase for Large setups (> 6 inches)
  const SAFE_BUFFER = 6000;
  let remainingUnits = targetUnits;
  const bigStack: Tool[] = [];

  // Find the largest available tool (usually 3.0 or 5.0)
  const largestTool = activeTools[0];

  if (remainingUnits > SAFE_BUFFER && largestTool) {
    while (remainingUnits > SAFE_BUFFER) {
      remainingUnits -= largestTool.units;
      bigStack.push(largestTool);
    }
  }

  // Solve the remainder
  const solvedStack = solveDP(remainingUnits, activeTools);

  if (!solvedStack) return null;

  return {
    target: targetInches,
    stack: [...bigStack, ...solvedStack]
  };
}