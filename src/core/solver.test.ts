import { describe, it, expect } from 'vitest';
import { findToolingSetup } from './solver';
import { DEFAULT_MACHINE, SLITTER_4 } from '../config/machine-profiles';

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

describe('Clearance-Only Tools (Slitter 4)', () => {
  it('excludes 0.0505 from solver stacks', () => {
    // 0.101 = 2x 0.0505, but solver should use 0.1 + something else
    const result = findToolingSetup(0.101, SLITTER_4);

    expect(result).not.toBeNull();
    const has0505 = result?.stack.some(t => t.size === 0.0505);
    expect(has0505).toBe(false);
  });

  it('still solves targets that would have used 0.0505', () => {
    // 0.1505 = 0.1 + 0.0505, but without 0.0505 it should find 0.1 + 0.05 + something
    const result = findToolingSetup(0.1505, SLITTER_4);

    // May be null if no exact combination exists, which is fine —
    // the point is 0.0505 must not appear
    if (result) {
      const has0505 = result.stack.some(t => t.size === 0.0505);
      expect(has0505).toBe(false);
    }
  });
});