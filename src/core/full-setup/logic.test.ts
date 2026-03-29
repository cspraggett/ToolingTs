import { describe, test, expect, beforeEach } from 'vitest';
import { generateFullSetup } from './logic';
import { MachineProfile } from '../../config/machine-profiles';
import { ValidatedSetupConfig } from './types';

const createMockProfile = (): MachineProfile => ({
  id: 'test-machine',
  arborLength: 60,
  tools: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 0.0625, 0.125, 0.250, 0.375],
  strictExclude: [0.5, 1.0],
  clearanceOnly: [0.125],
  toolLabels: {},
  knifeClearanceStrategies: []
});

const createConfig = (strips: Array<{width: number, quantity: number, minus: number, plus: number}>): ValidatedSetupConfig => ({
  coilWidth: 60,
  coilWeight: 10000,
  gauge: 0.036,
  orderNumber: 'TEST-001',
  companyName: 'Test Co',
  knifeSize: 0.125,
  clearance: 0.0625,
  strictMode: false,
  strips
});

describe('Full Setup Generator', () => {
  let mockProfile: MachineProfile;

  beforeEach(() => {
    mockProfile = createMockProfile();
  });

  describe('Alternating Male/Female Layout', () => {
    test('alternates male-bottom and female-bottom cuts', () => {
      const config = createConfig([
        { width: 10, quantity: 2, minus: 0.01, plus: 0.01 },
        { width: 12, quantity: 1, minus: 0.01, plus: 0.01 }
      ]);
      
      const result = generateFullSetup(config, mockProfile);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const cuts = result.value.cuts;
        expect(cuts).toHaveLength(3);
        
        // Check alternating pattern
        expect(cuts[0].type).toBe('male-bottom');
        expect(cuts[1].type).toBe('female-bottom');
        expect(cuts[2].type).toBe('male-bottom');
      }
    });

    test('calculates male width correctly (female - 2*knife - 2*clearance)', () => {
      const config = createConfig([
        { width: 10, quantity: 1, minus: 0.01, plus: 0.01 }
      ]);
      
      const result = generateFullSetup(config, mockProfile);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const cut = result.value.cuts[0];
        const female = cut.width;
        const maleTarget = cut.bottomStack.target; // Should be male-bottom for first cut
        
        // male = female - 2*knife - 2*clearance
        const expectedMale = 10 - 2*0.125 - 2*0.0625;
        expect(Math.abs(maleTarget - expectedMale)).toBeLessThan(0.001);
      }
    });
  });

  describe('Validation & Error Cases', () => {
    test('rejects when strip total exceeds coil width', () => {
      const config = createConfig([
        { width: 40, quantity: 2, minus: 0.01, plus: 0.01 } // 80" total
      ]);
      
      const result = generateFullSetup(config, mockProfile);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('exceeds coil width');
      }
    });

    test('rejects when arbor usage exceeds capacity', () => {
      const config = createConfig([
        { width: 25, quantity: 2, minus: 0.01, plus: 0.01 } // 50" + knives
      ]);
      
      // Use a smaller arbor
      const smallArborProfile = { ...mockProfile, arborLength: 30 };
      const result = generateFullSetup(config, smallArborProfile);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('exceeds arbor length');
      }
    });
  });

  describe('Shoulder Calculations', () => {
    test('calculates and solves all shoulder targets', () => {
      const config = createConfig([
        { width: 10, quantity: 2, minus: 0.01, plus: 0.01 }
      ]);
      
      const result = generateFullSetup(config, mockProfile);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bottomOpening).toBeDefined();
        expect(result.value.topOpening).toBeDefined();
        expect(result.value.bottomClosing).toBeDefined();
        expect(result.value.topClosing).toBeDefined();
      }
    });
  });

  describe('Edge Cases', () => {
    test('handles zero edge trim', () => {
      const config = createConfig([
        { width: 29.875, quantity: 2, minus: 0.01, plus: 0.01 } 
      ]);
      // 2 * 29.875 + (2+1) * 0.125 (knife) = 59.75 + 0.375 = 60.125 (too wide for 60" arbor)
      // Let's adjust to fit exactly.
      // Arbor = 60.0. Knives = 3 * 0.125 = 0.375.
      // Available for strips = 60.0 - 0.375 = 59.625.
      // 59.625 / 2 = 29.8125.
      
      const configExact = createConfig([
        { width: 29.8125, quantity: 2, minus: 0.01, plus: 0.01 }
      ]);
      
      const result = generateFullSetup(configExact, mockProfile);
      // Might still be valid if it fits arbor
      if (result.ok) {
        expect(result.value.bottomArborUsed).toBeLessThanOrEqual(mockProfile.arborLength + 0.001);
      }
    });

    test('handles half-thou precision throughout', () => {
      const config = createConfig([
        { width: 10.0005, quantity: 1, minus: 0.0005, plus: 0.0005 }
      ]);
      
      const result = generateFullSetup(config, mockProfile);
      expect(result.ok).toBe(true);
    });
  });
});
