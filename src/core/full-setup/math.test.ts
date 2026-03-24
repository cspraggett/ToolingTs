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

  it('matches the 60" coil test case for slitter-4', () => {
    // Coil = 60.0
    // Gauge = 0.057
    // Clearance = 0.006
    // Cuts = 18.233, 20.631, 19.818 (Total = 58.682)
    // Perm = 2.050
    // Center = 34.0
    // Knife = 0.375
    
    // effectiveCenteringWidth = 60 + (0.375 - 0.057) = 60.318
    // centeringAmount = 34 - (60.318 / 2) - 2.05 = 34 - 30.159 - 2.05 = 1.791
    // topOpening = 1.791 - 0.375 = 1.416 (Matches 1.415 with slight rounding)
    // bottomOpening = 1.791 + 0.006 = 1.797 (Matches 1.796 with slight rounding)

    // Using exact values from user to verify closing logic:
    // bottomOpening = 1.796, topOpening = 1.415
    // bottomArborUsed = 58.658 (Verified sum)
    // topArborUsed = 59.420 (Verified sum)
    
    // bottomClosing = 66.175 - 2.05 - 1.796 - 58.658 = 3.671
    // topClosing = 66.175 - 2.05 - 1.415 - 59.420 = 3.290
    
    const result = computeShoulders(
      58.682, 66.175, 0.375, 0.008, 0, 58.658, 59.420, 'slitter-4', 60.0, 0.057
    );
    
    // Adjusting for the 0.006 clearance provided in the text vs the 0.008 in the manual call above
    const resultWith006 = computeShoulders(
      58.682, 66.175, 0.375, 0.006, 0, 58.658, 59.420, 'slitter-4', 60.0, 0.057
    );

    expect(resultWith006.topOpening).toBe(1.415);
    expect(resultWith006.bottomOpening).toBe(1.796);
    expect(resultWith006.topClosing).toBe(3.290);
    expect(resultWith006.bottomClosing).toBe(3.671);
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
