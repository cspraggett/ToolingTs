import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { findToolingSetup } from './solver';
import { SLITTER_3, SLITTER_4 } from '../config/machine-profiles';

describe('Solver Property-Based Tests', () => {
  const machines = [SLITTER_3, SLITTER_4];

  it('should always result in a stack that sums exactly to the target (if solvable)', () => {
    machines.forEach(machine => {
      fc.assert(
        fc.property(
          // Generate target widths from 0.001 to 60.000 inches in 0.001 increments
          fc.integer({ min: 1, max: 60000 }).map(n => n / 1000),
          (target) => {
            const result = findToolingSetup(target, machine);
            
            if (result) {
              const total = result.stack.reduce((sum, t) => sum + t.size, 0);
              // Use BeCloseTo for floating point, but with 0.0001 tolerance
              expect(total).toBeCloseTo(target, 5);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  it('should never use more than 2 of any tool smaller than 1.0 inch', () => {
    machines.forEach(machine => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20000 }).map(n => n / 1000),
          (target) => {
            const result = findToolingSetup(target, machine);
            
            if (result) {
              const smallTools = result.stack.filter(t => t.size < 1.0);
              const counts = new Map<number, number>();
              
              for (const tool of smallTools) {
                const currentCount = counts.get(tool.size) || 0;
                counts.set(tool.size, currentCount + 1);
              }
              
              for (const [size, count] of counts.entries()) {
                expect(count, `Tool size ${size} used ${count} times for target ${target}`).toBeLessThanOrEqual(2);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  it('should never include clearance-only tools in the stack', () => {
    machines.forEach(machine => {
      const clearanceOnly = machine.clearanceOnly || [];
      if (clearanceOnly.length === 0) return;

      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }).map(n => n / 1000),
          (target) => {
            const result = findToolingSetup(target, machine);
            if (result) {
              const usedClearanceOnly = result.stack.some(t => clearanceOnly.includes(t.size));
              expect(usedClearanceOnly).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  it('should respect strictMode by excluding strictExclude tools', () => {
    machines.forEach(machine => {
      const strictExclude = machine.strictExclude || [];
      if (strictExclude.length === 0) return;

      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }).map(n => n / 1000),
          (target) => {
            const result = findToolingSetup(target, machine, { strictMode: true });
            if (result) {
              const usedStrictExclude = result.stack.some(t => strictExclude.includes(t.size));
              expect(usedStrictExclude).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
