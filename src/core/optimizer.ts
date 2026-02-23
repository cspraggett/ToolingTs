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

/**
 * Finds the optimal dual setup for both Male and Female sides.
 * It shifts the nominal targets within the allowed tolerance window
 * to find the setup that uses the fewest total tools.
 */
export function findBestDualSetup(
  maleTarget: number,
  femaleTarget: number,
  tolerance: ToleranceWindow,
  machine: MachineProfile,
  options: SolverOptions = {}
): DualOptimizationResult | null {

  const minOffsetUnits = inchesToUnits(tolerance.minus);
  const maxOffsetUnits = inchesToUnits(tolerance.plus);

  // Safety check to prevent excessive calculations.
  if (minOffsetUnits > 500 || maxOffsetUnits > 500) return null;

  let bestDualResult: DualOptimizationResult | null = null;

  // We iterate through every possible 0.001" increment within the tolerance window.
  for (let currentOffsetUnits = -minOffsetUnits; currentOffsetUnits <= maxOffsetUnits; currentOffsetUnits++) {
    const currentOffsetInches = unitsToInches(currentOffsetUnits);

    const candidateMaleTarget = maleTarget + currentOffsetInches;
    const candidateFemaleTarget = femaleTarget + currentOffsetInches;

    // Find tooling stacks for both targets at this specific offset.
    const maleSolution = findToolingSetup(candidateMaleTarget, machine, options);
    const femaleSolution = findToolingSetup(candidateFemaleTarget, machine, options);

    if (!maleSolution || !femaleSolution) continue;

    const totalToolCount = maleSolution.stack.length + femaleSolution.stack.length;

    let isBetterResult = false;
    if (!bestDualResult) {
      isBetterResult = true;
    } else if (totalToolCount < bestDualResult.totalToolCount) {
      // Primary Optimization: Minimize total tool count for the pair.
      isBetterResult = true;
    }
    else if (totalToolCount === bestDualResult.totalToolCount) {
      // Tie-Breaker: Prefer the setup that is closest to the nominal target (smallest offset).
      if (Math.abs(currentOffsetInches) < Math.abs(bestDualResult.offset)) {
        isBetterResult = true;
      }
    }

    if (isBetterResult) {
      bestDualResult = {
        offset: currentOffsetInches,
        maleResult: maleSolution,
        femaleResult: femaleSolution,
        totalToolCount
      };
    }
  }

  return bestDualResult;
}