import { describe, it, expect } from 'vitest';
import { findExactSteelSetup } from './toolingLogic';

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
});