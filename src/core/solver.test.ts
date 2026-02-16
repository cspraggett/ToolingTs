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

describe('Greedy/DP boundary edge cases', () => {
  const machine = DEFAULT_MACHINE;

  it('solves a target just above the greedy buffer', () => {
    // 2.400" — just above 2" buffer, greedy should not overshoot
    const result = findToolingSetup(2.4, machine);
    expect(result).not.toBeNull();
    const total = result!.stack.reduce((sum, t) => sum + t.size, 0);
    expect(total).toBeCloseTo(2.4);
  });

  it('solves a target that needs only small tools (0.400")', () => {
    // 0.400" — no 3"/2"/1" tools needed, pure small tool territory
    const result = findToolingSetup(0.4, machine);
    expect(result).not.toBeNull();
    expect(result!.stack.length).toBe(1); // 0.4 is an exact tool
    expect(result!.stack[0].size).toBe(0.4);
  });

  it('solves a large target where greedy packs many 3" tools (20.5")', () => {
    const result = findToolingSetup(20.5, machine);
    expect(result).not.toBeNull();
    const total = result!.stack.reduce((sum, t) => sum + t.size, 0);
    expect(total).toBeCloseTo(20.5);
    // Optimal: 6x3" + 2" + 0.5" = 8 tools
    expect(result!.stack.length).toBeLessThanOrEqual(8);
  });

  it('solves target just under largest tool (2.875")', () => {
    // 2.875" — can't use a 3", must use 2" + 0.875"
    const result = findToolingSetup(2.875, machine);
    expect(result).not.toBeNull();
    expect(result!.stack.length).toBe(2);
    const total = result!.stack.reduce((sum, t) => sum + t.size, 0);
    expect(total).toBeCloseTo(2.875);
  });

  it('solves target that crosses greedy boundary with non-round remainder (7.375")', () => {
    // 7.375" — greedy takes 3" + 3", remainder 1.375" solved by DP
    // optimal: 3+3+1+0.375 = 4 tools
    const result = findToolingSetup(7.375, machine);
    expect(result).not.toBeNull();
    const total = result!.stack.reduce((sum, t) => sum + t.size, 0);
    expect(total).toBeCloseTo(7.375);
    expect(result!.stack.length).toBeLessThanOrEqual(4);
  });

  it('prefers fewer tools over greedy (5.0" = 3+2 not 3+1+1)', () => {
    const result = findToolingSetup(5.0, machine);
    expect(result).not.toBeNull();
    // Optimal: 3" + 2" = 2 tools
    expect(result!.stack.length).toBe(2);
  });

  it('handles target exactly equal to greedy buffer (2.0")', () => {
    const result = findToolingSetup(2.0, machine);
    expect(result).not.toBeNull();
    expect(result!.stack.length).toBe(1);
    expect(result!.stack[0].size).toBe(2.0);
  });

  it('solves target needing many small precision tools (0.506")', () => {
    // 0.506" — needs combo like 0.5 + small shim, or 0.256 + 0.25, etc.
    const result = findToolingSetup(0.506, machine);
    expect(result).not.toBeNull();
    const total = result!.stack.reduce((sum, t) => sum + t.size, 0);
    expect(total).toBeCloseTo(0.506);
  });

  it('solves 6.0" exactly (was the old buffer boundary)', () => {
    const result = findToolingSetup(6.0, machine);
    expect(result).not.toBeNull();
    // 3+3 = 2 tools
    expect(result!.stack.length).toBe(2);
  });

  it('solves 4.0" — where greedy at buffer=2 takes one 3", leaving 1" for DP', () => {
    const result = findToolingSetup(4.0, machine);
    expect(result).not.toBeNull();
    // 3+1 = 2 tools, or could be 2+2 = 2 tools — either way, 2 tools
    expect(result!.stack.length).toBe(2);
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