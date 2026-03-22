import { describe, it, expect } from 'vitest';
import { SLITTER_3, SLITTER_4 } from '../config/machine-profiles';
import {
  computeKnifeClearance,
  computeShoulders,
  computeCoilUsage,
} from './utils';

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
    // stripTotal=20, arbor=64, knife=0.365, bottomClr=0.008, topClr=0
    // bottomArborUsed=19.984, topArborUsed=20.730
    // baseShoulder = round((64-20)/2 / 0.125) * 0.125 = 22.000
    // knifeRoundedUp = ceil(0.365/0.125)*0.125 = 0.375
    // bottomOpening = 22 + 0.008 = 22.008
    // topOpening = 22 - 0.375 + 0 = 21.625
    // bottomClosing = 64 - 22.008 - 19.984 = 22.008
    // topClosing = 64 - 21.625 - 20.730 = 21.645
    const result = computeShoulders(20, 64, 0.365, 0.008, 0, 19.984, 20.730);
    expect(result.bottomOpening).toBeCloseTo(22.008);
    expect(result.topOpening).toBeCloseTo(21.625);
    expect(result.bottomClosing).toBeCloseTo(22.008);
    expect(result.topClosing).toBeCloseTo(21.645);
    expect(result.isValid).toBe(true);
  });

  it('detects invalid when shoulder < 1"', () => {
    // stripTotal=63, arbor=64 -> baseShoulder = round(0.5 / 0.125) * 0.125 = 0.5 (Invalid)
    const result = computeShoulders(63, 64, 0.365, 0.008, 0, 62.984, 63.730);
    expect(result.isValid).toBe(false);
  });
});

describe('computeCoilUsage', () => {
  it('uses 2N+2 knife count', () => {
    const result = computeCoilUsage(
      [{ width: 5, quantity: 3 }],
      0.365,
    );
    expect(result.totalStrips).toBe(3);
    expect(result.totalKnives).toBe(8);
    expect(result.stripTotal).toBeCloseTo(15);
    expect(result.arborUsed).toBeCloseTo(15 + 8 * 0.365);
  });
});
