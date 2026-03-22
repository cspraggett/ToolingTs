import { describe, it, expect } from 'vitest';
import { generateFullSetup, ValidatedSetupConfig } from './engine';
import { DEFAULT_MACHINE } from '../config/machine-profiles';

describe('generateFullSetup', () => {
  const machine = DEFAULT_MACHINE;
  
  const baseConfig: ValidatedSetupConfig = {
    coilWidth: 24.000,
    knifeSize: 0.365,
    clearance: 0.008,
    strictMode: false,
    strips: [
      { width: 5.000, quantity: 2, minus: 0, plus: 0 }
    ],
    orderNumber: 'TEST-123',
    companyName: 'Test Corp',
    coilWeight: '5000',
    gauge: '0.036'
  };

  it('generates a valid result and groups identical cuts', () => {
    const res = generateFullSetup(baseConfig, machine);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.cuts).toHaveLength(2);
      expect(res.value.groupedCuts).toHaveLength(1);
      expect(res.value.groupedCuts[0].count).toBe(2);
      expect(res.value.groupedCuts[0].startIdx).toBe(1);
      expect(res.value.groupedCuts[0].endIdx).toBe(2);
    }
  });

  it('alternates male-bottom and female-bottom', () => {
    const res = generateFullSetup(baseConfig, machine);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.cuts[0].type).toBe('male-bottom');
      expect(res.value.cuts[1].type).toBe('female-bottom');
    }
  });

  it('returns error if setup exceeds arbor length', () => {
    const crazyConfig: ValidatedSetupConfig = {
      ...baseConfig,
      coilWidth: 70.000,
      strips: [{ width: 31.000, quantity: 2, minus: 0, plus: 0 }]
    };
    // 62" + 6 knives * 0.365 = 64.19 (Arbor is 64")
    const res = generateFullSetup(crazyConfig, machine);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('exceeds arbor length');
    }
  });

  it('includes tool summaries for all components', () => {
    const res = generateFullSetup(baseConfig, machine);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const v = res.value;
      expect(v.bottomOpeningSummary).toBeDefined();
      expect(v.topOpeningSummary).toBeDefined();
      expect(v.bottomClosingSummary).toBeDefined();
      expect(v.topClosingSummary).toBeDefined();
      expect(v.cuts[0].bottomSummary).toBeDefined();
      expect(v.cuts[0].topSummary).toBeDefined();
    }
  });

  it('correctly calculates edge trim', () => {
    const res = generateFullSetup(baseConfig, machine);
    expect(res.ok).toBe(true);
    if (res.ok) {
      // 24.000 - (2 * 5.000) = 14.000
      expect(res.value.edgeTrim).toBeCloseTo(14.000);
    }
  });
});
