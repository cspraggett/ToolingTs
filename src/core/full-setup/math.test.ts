import { describe, it, expect } from 'vitest';
import { SLITTER_3, SLITTER_4 } from '../../config/machine-profiles';
import {
  computeKnifeClearance,
  computeShoulders,
  computeCoilUsage,
  summarizeCuts
} from './math';

describe('summarizeCuts', () => {
  it('groups consecutive identical cuts', () => {
    const cuts: any[] = [
      { cutIndex: 1, width: 5.0 },
      { cutIndex: 2, width: 5.0 },
      { cutIndex: 3, width: 10.0 },
    ];
    const groups = summarizeCuts(cuts);
    expect(groups).toHaveLength(2);
    expect(groups[0].count).toBe(2);
    expect(groups[0].startIdx).toBe(1);
    expect(groups[0].endIdx).toBe(2);
    expect(groups[1].count).toBe(1);
    expect(groups[1].startIdx).toBe(3);
  });
});

describe('computeKnifeClearance', () => {
  const strategies = SLITTER_3.knifeClearanceStrategies;

  it('.365 knife: bottom = clr, top = 0', () => {
    const result = computeKnifeClearance(0.365, 0.008, strategies);
    expect(result.bottomClearance).toBeCloseTo(0.008);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('.243 knife: bottom = clr + 0.003, top = 0', () => {
    const result = computeKnifeClearance(0.243, 0.008, strategies);
    expect(result.bottomClearance).toBeCloseTo(0.011);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('.480 knife with clr < 0.010: bottom = 0, top = 0.010 - clr', () => {
    const result = computeKnifeClearance(0.480, 0.008, strategies);
    expect(result.bottomClearance).toBeCloseTo(0);
    expect(result.topClearance).toBeCloseTo(0.002);
  });

  it('.480 knife with clr = 0.010: bottom = 0, top = 0', () => {
    const result = computeKnifeClearance(0.480, 0.010, strategies);
    expect(result.bottomClearance).toBeCloseTo(0);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('.480 knife with clr > 0.010: bottom = clr - 0.010, top = 0', () => {
    const result = computeKnifeClearance(0.480, 0.015, strategies);
    expect(result.bottomClearance).toBeCloseTo(0.005);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('.375 knife (Slitter 4): bottom = clr, top = 0', () => {
    const result = computeKnifeClearance(0.375, 0.008, SLITTER_4.knifeClearanceStrategies);
    expect(result.bottomClearance).toBeCloseTo(0.008);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('unknown knife falls back to bottom = clr, top = 0', () => {
    const result = computeKnifeClearance(0.999, 0.012, strategies);
    expect(result.bottomClearance).toBeCloseTo(0.012);
    expect(result.topClearance).toBeCloseTo(0);
  });
});

describe('computeShoulders', () => {
  it('centers arbors relative to stripTotal with clearance offsets', () => {
    const result = computeShoulders(20, 64, 0.365, 0.008, 0, 19.984, 20.730);
    expect(result.bottomOpening).toBeCloseTo(22.008);
    expect(result.topOpening).toBeCloseTo(21.625);
    expect(result.bottomClosing).toBeCloseTo(22.008);
    expect(result.topClosing).toBeCloseTo(21.645);
    expect(result.isValid).toBe(true);
  });

  it('detects invalid when shoulder < 1"', () => {
    const result = computeShoulders(63, 64, 0.365, 0.008, 0, 62.984, 63.730);
    expect(result.isValid).toBe(false);
  });

  it('applies 2" offset for slitter-4', () => {
    // Normal calculation:
    // rawBase = (67 - 20) / 2 = 23.5
    // base = 23.5
    // knifeRoundedUp = 0.375
    // bottomOpening = 23.5 + 0.008 = 23.508
    // topOpening = 23.5 - 0.375 + 0 = 23.125
    
    // Slitter 4:
    // bottomOpening = 23.508 - 2.0 = 21.508
    // topOpening = 23.125 - 2.0 = 21.125
    
    const result = computeShoulders(20, 67, 0.375, 0.008, 0, 19.984, 20.730, 'slitter-4');
    expect(result.bottomOpening).toBe(21.508);
    expect(result.topOpening).toBe(21.125);
    
    // Check closing: 67 - 21.508 - 19.984 = 25.508
    expect(result.bottomClosing).toBe(25.508);
  });
});

describe('computeCoilUsage', () => {
  it('uses 2N+2 knife count', () => {
    const result = computeCoilUsage(
      [{ width: 5, quantity: 3, minus: 0, plus: 0 }],
      0.365,
    );
    expect(result.totalStrips).toBe(3);
    expect(result.totalKnives).toBe(8);
    expect(result.stripTotal).toBeCloseTo(15);
    expect(result.arborUsed).toBeCloseTo(15 + 8 * 0.365);
  });
});
