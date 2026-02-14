// src/core/solver.test.ts
import { describe, it, expect } from 'vitest';
import { findToolingSetup } from './solver'; // We haven't created this yet!
import { DEFAULT_MACHINE } from '../config/machine-profiles';

describe('Core Solver (Pure)', () => {
  const machine = DEFAULT_MACHINE;

  it('finds a simple exact match (1.0")', () => {
    const result = findToolingSetup(1.0, machine);

    expect(result).not.toBeNull();
    expect(result?.stack.map(t => t.size)).toContain(1.0);
  });

  it('respects the Strict Mode (No .031 or .062)', () => {
    // 0.031 would be the perfect answer, but we ban it.
    // It should fail or find a complex alternative if possible.
    const result = findToolingSetup(0.031, machine, { strictMode: true });

    // With your current list, removing .031 makes 0.031 impossible.
    expect(result).toBeNull();
  });

  it('finds .031 when Strict Mode is OFF', () => {
    const result = findToolingSetup(0.031, machine, { strictMode: false });

    expect(result).not.toBeNull();
    expect(result?.stack[0].size).toBe(0.031);
  });

  it('never uses more than 2 of the same tool', () => {
    // 0.093 could be 3x 0.031. 
    // But we limit to 2. So it must find 0.062 + 0.031.
    const result = findToolingSetup(0.093, machine, { strictMode: false });

    expect(result).not.toBeNull();

    const count031 = result?.stack.filter(t => t.size === 0.031).length;
    expect(count031).toBeLessThanOrEqual(2);
  });
});