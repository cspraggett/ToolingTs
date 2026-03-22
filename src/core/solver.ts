import { MachineProfile } from '../config/machine-profiles';
import { 
  inchesToUnits, 
  hasHalfThou, 
  DEFAULT_UNITS_PER_INCH, 
  HALF_THOU_UNITS_PER_INCH 
} from './utils';

export interface Tool {
  size: number;
  units: number;
}

export interface SolverOptions {
  strictMode?: boolean;
  skipClearanceFilter?: boolean;
}

export interface SolverResult {
  target: number;
  stack: Tool[];
}

const getActiveTools = (
  profile: MachineProfile, 
  isStrict: boolean, 
  precision: number, 
  skipClearanceFilter: boolean = false
): Tool[] => {
  let tools = profile.tools;

  // 1. Filter Strict Mode
  const strictList = profile.strictExclude;
  if (isStrict && strictList?.length) {
    tools = tools.filter(size => !strictList.includes(size));
  }

  // 2. Filter Clearance-Only Tools
  const clearanceList = profile.clearanceOnly;
  if (clearanceList?.length && !skipClearanceFilter) {
    tools = tools.filter(size => !clearanceList.includes(size));
  }

  // 3. Map & Sort (Largest to Smallest)
  return tools
    .map(size => ({ size, units: inchesToUnits(size, precision) }))
    .sort((a, b) => b.units - a.units);
};

/**
 * Solves for the optimal stack of tools using Dynamic Programming.
 * It minimizes the number of tools used and breaks ties by preferring larger tools.
 */
const solveOptimalStack = (targetUnits: number, inventory: Tool[]): Tool[] | null => {
  // dp[units] stores the best (fewest tools) stack for that exact unit value.
  const bestStackAtUnits: (Tool[] | null)[] = new Array<Tool[] | null>(targetUnits + 1).fill(null);
  bestStackAtUnits[0] = [];

  for (let currentUnits = 0; currentUnits <= targetUnits; currentUnits++) {
    const currentStack = bestStackAtUnits[currentUnits];
    if (!currentStack) continue;

    for (const tool of inventory) {
      const nextTotalUnits = currentUnits + tool.units;
      if (nextTotalUnits > targetUnits) continue;

      // Limitation: We only allow a maximum of 2 tools of the same size per setup
      // for smaller tools to avoid using up specific inventory sizes.
      // For large "block" spacers (1.0" and above), we allow more.
      const countOfThisToolUsed = currentStack.filter(t => t.size === tool.size).length;
      const maxAllowed = tool.size >= 1.0 ? 50 : 2;
      if (countOfThisToolUsed >= maxAllowed) continue;

      const candidateStack = [...currentStack, tool];
      const existingBestStack = bestStackAtUnits[nextTotalUnits];

      let isCandidateBetter = false;
      if (!existingBestStack) {
        isCandidateBetter = true;
      } else if (candidateStack.length < existingBestStack.length) {
        // Preference 1: Fewer tools total.
        isCandidateBetter = true;
      } else if (candidateStack.length === existingBestStack.length) {
        // Preference 2: Tie-breaker - Use larger tools if possible.
        const maxCandidateSize = Math.max(...candidateStack.map(t => t.size));
        const maxExistingSize = Math.max(...existingBestStack.map(t => t.size));
        if (maxCandidateSize > maxExistingSize) isCandidateBetter = true;
      }

      if (isCandidateBetter) {
        bestStackAtUnits[nextTotalUnits] = candidateStack;
      }
    }
  }

  return bestStackAtUnits[targetUnits];
};

/**
 * Finds the tooling setup for a target width.
 * For performance, it uses a 'Greedy' approach for the bulk of the width 
 * and DP for the remaining small fraction.
 */
export function findToolingSetup(
  targetInches: number,
  machine: MachineProfile,
  options: SolverOptions = {}
): SolverResult | null {
  if (targetInches <= 0) return null;

  // 1. Determine precision: Default 1000, or 2000 if target or any tool has a half-thou component.
  let precision = DEFAULT_UNITS_PER_INCH;
  if (hasHalfThou(targetInches) || machine.tools.some(t => hasHalfThou(t))) {
    precision = HALF_THOU_UNITS_PER_INCH;
  }

  const targetUnits = inchesToUnits(targetInches, precision);
  const activeTools = getActiveTools(machine, !!options.strictMode, precision, !!options.skipClearanceFilter);

  // We use Greedy logic for widths larger than this buffer (6 inches).
  const GREEDY_THRESHOLD_UNITS = 6.0 * precision; 
  let unitsToSolveWithGreedy = targetUnits;
  const greedyStack: Tool[] = [];

  const largestAvailableTool = activeTools[0];

  // Fill the bulk of the width with the largest available tool.
  while (unitsToSolveWithGreedy > GREEDY_THRESHOLD_UNITS && unitsToSolveWithGreedy - largestAvailableTool.units >= 0) {
    unitsToSolveWithGreedy -= largestAvailableTool.units;
    greedyStack.push(largestAvailableTool);
  }

  // Solve the remaining precision gap using the optimal DP solver.
  const optimalRemainderStack = solveOptimalStack(unitsToSolveWithGreedy, activeTools);

  if (!optimalRemainderStack) return null;

  return {
    target: targetInches,
    stack: [...greedyStack, ...optimalRemainderStack]
  };
}
