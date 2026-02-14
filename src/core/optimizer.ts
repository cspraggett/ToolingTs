import { MachineProfile } from '../config/machine-profiles';
import { findToolingSetup, SolverResult, SolverOptions } from './solver';
import { inchesToUnits, unitsToInches } from './utils';

export interface ToleranceWindow {
  minus: number;
  plus: number;
}

export interface DualOptimizationResult {
  offset: number;
  maleResult: SolverResult;
  femaleResult: SolverResult;
  totalToolCount: number;
}

export function findBestDualSetup(
  maleTarget: number,
  femaleTarget: number,
  tolerance: ToleranceWindow,
  machine: MachineProfile,
  options: SolverOptions = {}
): DualOptimizationResult | null {

  const minUnits = inchesToUnits(tolerance.minus);
  const maxUnits = inchesToUnits(tolerance.plus);

  if (minUnits > 500 || maxUnits > 500) return null;

  let bestResult: DualOptimizationResult | null = null;

  for (let offsetUnits = -minUnits; offsetUnits <= maxUnits; offsetUnits++) {
    const offset = unitsToInches(offsetUnits);

    const candidateMale = maleTarget + offset;
    const candidateFemale = femaleTarget + offset;

    const solM = findToolingSetup(candidateMale, machine, options);
    const solF = findToolingSetup(candidateFemale, machine, options);

    if (!solM || !solF) continue;

    const currentCount = solM.stack.length + solF.stack.length;

    let isBetter = false;
    if (!bestResult) {
      isBetter = true;
    } else if (currentCount < bestResult.totalToolCount) {
      isBetter = true;
    }
    // Tie-Breaker: Prefer smaller offsets (closer to nominal)
    else if (currentCount === bestResult.totalToolCount) {
      if (Math.abs(offset) < Math.abs(bestResult.offset)) {
        isBetter = true;
      }
    }

    if (isBetter) {
      bestResult = {
        offset,
        maleResult: solM,
        femaleResult: solF,
        totalToolCount: currentCount
      };
    }
  }

  return bestResult;
}