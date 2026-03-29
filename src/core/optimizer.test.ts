import { describe, test, expect, beforeEach } from 'vitest';
import { findBestDualSetup } from './optimizer';
import { MachineProfile } from '../config/machine-profiles';

const createMockProfile = (): MachineProfile => ({
  id: 'test-machine',
  name: 'Test Machine',
  arborLength: 60,
  tools: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
  knives: [0.375],
  strictExclude: [],
  clearanceOnly: [],
  toolLabels: {},
  knifeClearanceStrategies: []
});

describe('Dual Setup Optimizer', () => {
  let mockProfile: MachineProfile;

  beforeEach(() => {
    mockProfile = createMockProfile();
  });

  describe('Tolerance Window Search', () => {
    test('finds optimal offset within tolerance range', () => {
      const maleTarget = 10.0;
      const femaleTarget = 10.5;
      const tolerance = { minus: 0.01, plus: 0.01 };
      
      const result = findBestDualSetup(maleTarget, femaleTarget, tolerance, mockProfile);
      expect(result).toBeTruthy();
      expect(Math.abs(result!.offset)).toBeLessThanOrEqual(0.01);
    });

    test('returns null for excessive tolerance range', () => {
      const maleTarget = 10.0;
      const femaleTarget = 10.5;
      const tolerance = { minus: 100, plus: 100 }; // Too large
      
      const result = findBestDualSetup(maleTarget, femaleTarget, tolerance, mockProfile);
      expect(result).toBeNull();
    });

    test('explores entire offset range with half-thou steps', () => {
      const maleTarget = 10.0005;
      const femaleTarget = 10.5005;
      const tolerance = { minus: 0.002, plus: 0.002 };
      
      const result = findBestDualSetup(maleTarget, femaleTarget, tolerance, mockProfile);
      expect(result).toBeTruthy();
      // Offset should be in half-thou increments
      const offset = result!.offset;
      const remainder = Math.abs(offset * 2000) % 1;
      expect(remainder).toBeLessThan(0.0001);
    });
  });

  describe('Solution Optimization', () => {
    test('minimizes total tool count', () => {
      const maleTarget = 9.5;
      const femaleTarget = 10.0;
      const tolerance = { minus: 0.05, plus: 0.05 };
      
      const result = findBestDualSetup(maleTarget, femaleTarget, tolerance, mockProfile);
      expect(result).toBeTruthy();
      
      // Manual check - nominal offset 0 is 9.5 (4 tools: 3+3+3+0.5) and 10.0 (4 tools: 3+3+3+1.0)
      // Total 8.
      // If we shift +0.5: 10.0 (4 tools) and 10.5 (4 tools). Still 8.
      // But we prefer smaller offset.
      expect(result!.totalToolCount).toBeLessThanOrEqual(8);
    });

    test('prefers smaller absolute offset when tool counts are equal', () => {
      const maleTarget = 10.0;
      const femaleTarget = 10.5;
      const tolerance = { minus: 0.02, plus: 0.02 };
      
      const result = findBestDualSetup(maleTarget, femaleTarget, tolerance, mockProfile);
      expect(result).toBeTruthy();
      
      // Should prefer offset closest to 0 when multiple solutions have same tool count
      expect(Math.abs(result!.offset)).toBeLessThan(0.01);
    });
  });

  describe('Clearance Handling', () => {
    test('incorporates clearance in calculations', () => {
      const maleTarget = 9.5;
      const femaleTarget = 10.0;
      const tolerance = { minus: 0.01, plus: 0.01 };
      const clearance = 0.0625;
      
      const result = findBestDualSetup(maleTarget, femaleTarget, tolerance, mockProfile, clearance);
      expect(result).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    test('returns null when no solution exists in tolerance range', () => {
      const maleTarget = 0.1; // Too small
      const femaleTarget = 0.2;
      const tolerance = { minus: 0.001, plus: 0.001 };
      
      const result = findBestDualSetup(maleTarget, femaleTarget, tolerance, mockProfile);
      expect(result).toBeNull();
    });

    test('handles half-thou precision in all inputs', () => {
      const maleTarget = 10.0005;
      const femaleTarget = 10.5005;
      const tolerance = { minus: 0.0005, plus: 0.0005 };
      const clearance = 0.0625;
      
      const result = findBestDualSetup(maleTarget, femaleTarget, tolerance, mockProfile, clearance);
      expect(result).toBeTruthy();
    });
  });
});
