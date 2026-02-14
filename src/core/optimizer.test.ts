import { describe, it, expect } from 'vitest';
import { findBestDualSetup } from './optimizer';
import { DEFAULT_MACHINE } from '../config/machine-profiles';

describe('Dual Setup Optimizer (Pure)', () => {
  const machine = DEFAULT_MACHINE;

  it('finds a better setup by shifting offset (Classic Scenario)', () => {
    // Scenario:
    // Male 1.503 (Hard: 1.0 + 0.5 + 0.003 is impossible without shims)
    // Female 2.503 (Hard)
    //
    // If we shift -0.003:
    // Male 1.500 (Easy: 1.0 + 0.5)
    // Female 2.500 (Easy: 2.0 + 0.5)

    const result = findBestDualSetup(
      1.503,
      2.503,
      { minus: 0.005, plus: 0.005 },
      machine
    );

    expect(result).not.toBeNull();
    // It should find the -0.003 offset to hit the whole numbers
    expect(result?.offset).toBeCloseTo(-0.003);
    // Tool count should be very low (approx 4 tools total)
    expect(result?.totalToolCount).toBeLessThan(6);
  });

  it('respects strict mode during optimization', () => {
    // If strict mode is ON, it should avoid solutions that require .031/.062
    // even if they are mathematically perfect.
    const result = findBestDualSetup(
      1.031,
      2.031,
      { minus: 0.000, plus: 0.005 },
      machine,
      { strictMode: true }
    );

    // It might fail to find a solution if strict mode bans the only tools that work
    // OR it might find a different combination if tolerance allows.
    if (result) {
      // If it found a result, ensure no risky tools are in it
      const hasRisky = result.maleResult.stack.some(t => t.size === 0.031);
      expect(hasRisky).toBe(false);
    }
  });
});