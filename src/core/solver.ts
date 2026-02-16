import { MachineProfile } from '../config/machine-profiles';
import { inchesToUnits } from './utils';

export interface Tool {
  size: number;
  units: number;
}

export interface SolverOptions {
  strictMode?: boolean;
}

export interface SolverResult {
  target: number;
  stack: Tool[];
}

const getActiveTools = (profile: MachineProfile, isStrict: boolean): Tool[] => {
  let tools = profile.tools;

  // 1. Filter Strict Mode
  const strictList = profile.strictExclude;
  if (isStrict && strictList?.length) {
    tools = tools.filter(size => !strictList.includes(size));
  }

  // 2. Filter Clearance-Only Tools
  const clearanceList = profile.clearanceOnly;
  if (clearanceList?.length) {
    tools = tools.filter(size => !clearanceList.includes(size));
  }

  // 3. Map & Sort (Largest to Smallest)
  return tools
    .map(size => ({ size, units: inchesToUnits(size) }))
    .sort((a, b) => b.units - a.units);
};

const solveDP = (targetUnits: number, inventory: Tool[]): Tool[] | null => {
  const dp: (Tool[] | null)[] = new Array<Tool[] | null>(targetUnits + 1).fill(null);
  dp[0] = [];

  for (let i = 0; i <= targetUnits; i++) {
    const currentStack = dp[i];
    if (!currentStack) continue;

    for (const tool of inventory) {
      const next = i + tool.units;
      if (next > targetUnits) continue;

      const countUsed = currentStack.filter(t => t.size === tool.size).length;
      if (countUsed >= 2) continue;

      const candidate = [...currentStack, tool];
      const existing = dp[next];

      let isBetter = false;
      if (!existing) {
        isBetter = true;
      } else if (candidate.length < existing.length) {
        isBetter = true;
      } else if (candidate.length === existing.length) {
        const maxCand = Math.max(...candidate.map(t => t.size));
        const maxExist = Math.max(...existing.map(t => t.size));
        if (maxCand > maxExist) isBetter = true;
      }

      if (isBetter) dp[next] = candidate;
    }
  }

  return dp[targetUnits];
};

export function findToolingSetup(
  targetInches: number,
  machine: MachineProfile,
  options: SolverOptions = {}
): SolverResult | null {
  if (targetInches <= 0) return null;

  const targetUnits = inchesToUnits(targetInches);
  const activeTools = getActiveTools(machine, !!options.strictMode);

  const SAFE_BUFFER = 6000;
  let remainingUnits = targetUnits;
  const bigStack: Tool[] = [];

  const largestTool = activeTools[0];

  if (remainingUnits > SAFE_BUFFER) {
    while (remainingUnits > SAFE_BUFFER) {
      remainingUnits -= largestTool.units;
      bigStack.push(largestTool);
    }
  }

  const solvedStack = solveDP(remainingUnits, activeTools);

  if (!solvedStack) return null;

  return {
    target: targetInches,
    stack: [...bigStack, ...solvedStack]
  };
}