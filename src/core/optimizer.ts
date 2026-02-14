// src/core/optimizer.ts
import * as R from 'remeda';
import { MachineProfile } from '../config/machine-profiles';
import { findToolingSetup, SolverResult, SolverOptions } from './solver';

// --- Types ---
export interface ToleranceWindow {
  minus: number; // e.g., 0.002
  plus: number;  // e.g., 0.005
}

export interface DualOptimizationResult {
  offset: number;
  maleResult: SolverResult;
  femaleResult: SolverResult;
  totalToolCount: number;
}

// --- Helpers ---
const PRECISION = 1000;
const toUnits = (n: number) => Math.round(n * PRECISION);
const toInches = (n: number) => n / PRECISION;

/**
 * Pure Optimizer Function
 * 1. Generates a range of offsets based on tolerance.
 * 2. Calculates setups for Male/Female at each offset.
 * 3. Returns the setup with the LOWEST total tool count.
 */
export function findBestDualSetup(
  maleTarget: number,
  femaleTarget: number,
  tolerance: ToleranceWindow,
  machine: MachineProfile,
  options: SolverOptions = {}
): DualOptimizationResult | null {

  const minUnits = toUnits(tolerance.minus);
  const maxUnits = toUnits(tolerance.plus);

  // Safety Break
  if (minUnits > 500 || maxUnits > 500) return null;

  // 1. Generate all possible offsets (Imperative loop is cleaner/faster here than mapping array)
  let bestResult: DualOptimizationResult | null = null;

  for (let offsetUnits = -minUnits; offsetUnits <= maxUnits; offsetUnits++) {
    const offset = toInches(offsetUnits);

    const candidateMale = maleTarget + offset;
    const candidateFemale = femaleTarget + offset;

    // Use the pure solver we just wrote!
    const solM = findToolingSetup(candidateMale, machine, options);
    const solF = findToolingSetup(candidateFemale, machine, options);

    if (!solM || !solF) continue;

    const currentCount = solM.stack.length + solF.stack.length;

    // 2. Optimization Strategy: Lowest Tool Count Wins
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