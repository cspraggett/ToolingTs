import { describe, test, expect, beforeEach } from 'vitest';
import { findToolingSetup } from './solver';
import { MachineProfile } from '../config/machine-profiles';

// Mock machine profile for testing
const createMockProfile = (): MachineProfile => ({
  id: 'test-machine',
  arborLength: 60,
  tools: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 0.0625, 0.125, 0.250, 0.375],
  strictExclude: [0.125, 0.25],
  clearanceOnly: [3.0],
  toolLabels: {},
  knifeClearanceStrategies: []
});

describe('solver.ts', () => {
  let mockProfile: MachineProfile;

  beforeEach(() => {
    mockProfile = createMockProfile();
  });

  describe('findToolingSetup', () => {
    test('should return null for zero or negative target', () => {
      expect(findToolingSetup(0, mockProfile)).toBeNull();
      expect(findToolingSetup(-1, mockProfile)).toBeNull();
    });

    test('should handle half-thou precision when needed', () => {
      const halfThouMachine: MachineProfile = {
        ...mockProfile,
        tools: [0.125, 0.2505, 0.5]
      };
      const result = findToolingSetup(0.2505, halfThouMachine);
      expect(result).toBeTruthy();
      expect(result?.stack[0].size).toBe(0.2505);
    });

    test('should respect strict mode exclusions', () => {
      const result = findToolingSetup(0.375, mockProfile, { strictMode: true });
      // Should not use 0.125 + 0.25 since they're in strictExclude
      expect(result?.stack).not.toContainEqual(expect.objectContaining({ size: 0.125 }));
      expect(result?.stack).not.toContainEqual(expect.objectContaining({ size: 0.25 }));
    });

    test('should filter clearance-only tools by default', () => {
      const result = findToolingSetup(3.0, mockProfile);
      // 3.0 is clearance-only, should not be used in normal stacking
      expect(result?.stack).not.toContainEqual(expect.objectContaining({ size: 3.0 }));
    });

    test('should allow clearance-only tools when skipClearanceFilter is true', () => {
      const result = findToolingSetup(3.0, mockProfile, { skipClearanceFilter: true });
      expect(result?.stack).toContainEqual(expect.objectContaining({ size: 3.0 }));
    });

    test('should enforce max 2 tools per size for sizes < 1.0"', () => {
      const smallToolsMachine: MachineProfile = {
        ...mockProfile,
        tools: [0.125, 0.25, 0.5]
      };
      const result = findToolingSetup(1.0, smallToolsMachine);
      const toolCounts = result?.stack.reduce((acc, tool) => {
        acc[tool.size] = (acc[tool.size] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      Object.entries(toolCounts || {}).forEach(([size, count]) => {
        if (parseFloat(size) < 1.0) {
          expect(count).toBeLessThanOrEqual(2);
        }
      });
    });

    test('should allow unlimited block spacers (>= 1.0")', () => {
      const blockSpacerMachine: MachineProfile = {
        ...mockProfile,
        tools: [1.0] // Only 1.0 is available
      };
      const result = findToolingSetup(5.0, blockSpacerMachine);
      const oneInchTools = result?.stack.filter(t => t.size === 1.0) || [];
      expect(oneInchTools.length).toBe(5); // Should allow exactly 5
    });

    test('should use greedy algorithm for large targets', () => {
      const result = findToolingSetup(20.0, mockProfile);
      // Should use largest available tools first for efficiency
      const largestTool = Math.max(...mockProfile.tools.filter(t => t !== 3.0));
      expect(result?.stack[0].size).toBe(largestTool);
    });

    test('should return null when no solution exists', () => {
      const impossibleMachine: MachineProfile = {
        ...mockProfile,
        tools: [10.0] // Only huge tools
      };
      const result = findToolingSetup(0.1, impossibleMachine);
      expect(result).toBeNull();
    });

    test('should handle edge case: target exactly equals a tool size', () => {
      const result = findToolingSetup(0.5, mockProfile);
      expect(result?.stack).toHaveLength(1);
      expect(result?.stack[0].size).toBe(0.5);
    });

    test('should prefer fewer tools when possible', () => {
      const result1 = findToolingSetup(1.0, mockProfile);
      const result2 = findToolingSetup(1.0, { 
        ...mockProfile, 
        tools: [0.5, 0.25, 0.125] 
      });
      
      // 1.0" tool is better than 0.5 + 0.5
      expect(result1?.stack.length).toBeLessThanOrEqual(result2?.stack.length || Infinity);
    });

    test('should handle very small targets with precision', () => {
      const tinyMachine: MachineProfile = {
        ...mockProfile,
        tools: [0.001, 0.002, 0.005]
      };
      const result = findToolingSetup(0.003, tinyMachine);
      expect(result?.stack.reduce((sum, t) => sum + t.size, 0)).toBeCloseTo(0.003, 6);
    });

    test('should handle mixed precision in tool inventory', () => {
      const mixedMachine: MachineProfile = {
        ...mockProfile,
        tools: [0.125, 0.2505, 0.5, 0.7505, 1.0]
      };
      const result = findToolingSetup(1.0005, mixedMachine);
      expect(result).toBeTruthy();
      // Should use half-thou precision
      const total = result?.stack.reduce((sum, t) => sum + t.size, 0) || 0;
      expect(total).toBeCloseTo(1.0005, 4);
    });
  });

  describe('solveOptimalStack DP algorithm', () => {
    test('should find optimal solution for complex combinations', () => {
      const complexMachine: MachineProfile = {
        ...mockProfile,
        tools: [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0]
      };
      const target = 2.875;
      const result = findToolingSetup(target, complexMachine);
      expect(result).toBeTruthy();
      const total = result?.stack.reduce((sum, t) => sum + t.size, 0) || 0;
      expect(total).toBeCloseTo(target, 4);
    });

    test('should minimize tool count as primary objective', () => {
      const machine: MachineProfile = {
        ...mockProfile,
        tools: [0.5, 1.0, 1.5, 2.0]
      };
      const result = findToolingSetup(3.0, machine);
      // Best solution: 1.5 + 1.5 (2 tools) not 0.5 * 6 (6 tools)
      expect(result?.stack.length).toBe(2);
    });

    test('should prefer larger tools when tool counts are equal', () => {
      const machine: MachineProfile = {
        ...mockProfile,
        tools: [0.5, 0.75, 1.0, 1.25]
      };
      const result = findToolingSetup(2.0, machine);
      // Both [1.0, 1.0] and [1.25, 0.75] have 2 tools.
      // Our logic prefers [1.25, 0.75] because 1.25 > 1.0.
      expect(result?.stack.length).toBe(2);
      const sizes = result?.stack.map(t => t.size);
      expect(sizes).toContain(1.25);
      expect(sizes).toContain(0.75);
    });
  });
});
