import { describe, it, expect } from 'vitest';
import { findBestDualSetup, findExactSteelSetup } from './toolingLogic';

describe('Tooling Logic Solver', () => {

  // 1. BASIC CHECKS
  it('solves for a single tool exact match', () => {
    const result = findExactSteelSetup(1.0);
    expect(result).not.toBeNull();
    expect(result?.stack).toHaveLength(1);
    expect(result?.stack[0].size).toBe(1.0);
  });

  it('solves for a simple combination (0.75)', () => {
    // 0.75 doesn't exist as a single tool, should be 0.5 + 0.25
    const result = findExactSteelSetup(0.75);
    expect(result).not.toBeNull();

    // We expect the sum to be correct
    const sum = result?.stack.reduce((acc, t) => acc + t.size, 0);
    expect(sum).toBe(0.75);
  });

  // 2. GREEDY OPTIMIZATION (> 2 inches)
  it('uses the greedy strategy for large numbers', () => {
    // Target: 4.0". Logic should pick: 3" + 1"
    const result = findExactSteelSetup(4.0);

    expect(result).not.toBeNull();
    const sizes = result?.stack.map(t => t.size).sort((a, b) => b - a); // Sort desc

    expect(sizes).toEqual([3, 1]);
  });

  it('handles massive numbers instantly', () => {
    // Target: 100". Should use roughly 33 x 3" tools + 1"
    const result = findExactSteelSetup(100.0);
    expect(result).not.toBeNull();

    // Verify the math holds up
    const sum = result?.stack.reduce((acc, t) => acc + t.size, 0);
    expect(sum).toBeCloseTo(100.0);
  });

  // 3. TIE-BREAKER PREFERENCE (Larger Tools)
  it('prefers larger tools when tool count is equal', () => {
    // Target: 0.6"
    // Option A: 0.3 + 0.3 (Max size 0.3)
    // Option B: 0.5 + 0.1 (Max size 0.5) -> We want this one!

    const result = findExactSteelSetup(0.6);
    expect(result).not.toBeNull();

    const sizes = result?.stack.map(t => t.size);
    expect(sizes).toContain(0.5);
    expect(sizes).toContain(0.1);
    expect(sizes).not.toContain(0.3);
  });

  // 4. EDGE CASES
  it('returns null for impossible sizes (0 or negative)', () => {
    expect(findExactSteelSetup(0)).toBeNull();
    expect(findExactSteelSetup(-5)).toBeNull();
  });

  // src/toolingLogic.test.ts

  it('never uses more than 2 of the same tool size', () => {
    // 0.093 is 3 x 0.031. 
    // If we limit to 2 per size, this exact match is impossible 
    // (assuming no other combination makes 0.093).
    // Actually, 0.062 + 0.031 = 0.093. 
    // So the solver SHOULD find 0.062 + 0.031 instead of 3 x 0.031.

    const result = findExactSteelSetup(0.093);
    expect(result).not.toBeNull();

    // Ensure we didn't just get 3 of the same thing
    const countOf31 = result?.stack.filter(t => t.size === 0.031).length;
    expect(countOf31).toBeLessThanOrEqual(2);
  });

  it('avoids the Greedy Trap for 2.248"', () => {
    // 2.248 is tricky. 
    // If you take 2.0" first, the remaining 0.248" is impossible.
    // The solver must be smart enough to try 1.0" + ... instead.

    const result = findExactSteelSetup(2.248);

    expect(result).not.toBeNull();

    // Verify the math
    const sum = result?.stack.reduce((acc, t) => acc + t.size, 0);
    expect(sum).toBeCloseTo(2.248);

    // Verify it found the solution using the 1" block, not the 2"
    const hasTwoInch = result?.stack.some(t => t.size === 2);
    expect(hasTwoInch).toBe(false);
  });
});

describe('Dual Setup Optimizer', () => {
  it('finds a better setup by applying an offset', () => {
    // Scenario:
    // Target 1.503. Exact match = 1.0 + 0.5 + 0.031 (3 tools)
    // If we shift -0.003 -> 1.500. Exact match = 1.0 + 0.5 (2 tools)

    const male = 1.503;
    const female = 2.503; // 2.0 + 0.5 + 0.031

    // Allow +/- 0.005
    const result = findBestDualSetup(male, female, 0.005, 0.005);

    expect(result).not.toBeNull();

    // It should choose -0.003 offset to hit the clean 1.500 numbers
    expect(result?.offset).toBeCloseTo(-0.003);

    // Verify the tool count is optimized
    // Original (at 1.503/2.503): ~6 tools total
    // Optimized (at 1.500/2.500): ~4 tools total
    expect(result?.totalToolCount).toBeLessThan(6);
  });

  it('respects the tolerance window constraints', () => {
    const male = 1.000;
    const female = 2.000;

    // CONSTRAINT TEST:
    // We want to force the solver to pick a POSITIVE offset.
    // The loop runs from [-Minus] to [+Plus].
    // If we pass -0.001 as the "Minus Tolerance", the loop starts at -(-0.001) = +0.001.

    const result = findBestDualSetup(male, female, -0.001, 0.005);

    expect(result).not.toBeNull();

    // Even though 0.000 is the perfect mathematical answer, 
    // we forced the window to start at +0.001.
    expect(result?.offset).toBeGreaterThanOrEqual(0.001);
  });
});