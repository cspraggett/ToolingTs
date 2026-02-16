import { describe, it, expect } from 'vitest';
import { SLITTER_3, SLITTER_4 } from '../config/machine-profiles';
import {
  computeKnifeClearance,
  computeShoulders,
  computeCoilUsage,
} from './utils';

describe('computeKnifeClearance', () => {
  const offsets = SLITTER_3.knifeClearanceOffsets;

  it('.365 knife: bottom = clr, top = 0', () => {
    const result = computeKnifeClearance(0.365, 0.008, offsets);
    expect(result.bottomClearance).toBeCloseTo(0.008);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('.243 knife: bottom = clr + 0.003, top = 0', () => {
    const result = computeKnifeClearance(0.243, 0.008, offsets);
    expect(result.bottomClearance).toBeCloseTo(0.011);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('.480 knife with clr < 0.010: bottom = 0, top = 0.010 - clr', () => {
    const result = computeKnifeClearance(0.480, 0.008, offsets);
    expect(result.bottomClearance).toBeCloseTo(0);
    expect(result.topClearance).toBeCloseTo(0.002);
  });

  it('.480 knife with clr = 0.010: bottom = 0, top = 0', () => {
    const result = computeKnifeClearance(0.480, 0.010, offsets);
    expect(result.bottomClearance).toBeCloseTo(0);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('.480 knife with clr > 0.010: bottom = clr - 0.010, top = 0', () => {
    const result = computeKnifeClearance(0.480, 0.015, offsets);
    expect(result.bottomClearance).toBeCloseTo(0.005);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('.375 knife (Slitter 4): bottom = clr, top = 0', () => {
    const result = computeKnifeClearance(0.375, 0.008, SLITTER_4.knifeClearanceOffsets);
    expect(result.bottomClearance).toBeCloseTo(0.008);
    expect(result.topClearance).toBeCloseTo(0);
  });

  it('unknown knife falls back to bottom = clr, top = 0', () => {
    const result = computeKnifeClearance(0.999, 0.012, offsets);
    expect(result.bottomClearance).toBeCloseTo(0.012);
    expect(result.topClearance).toBeCloseTo(0);
  });
});

describe('computeShoulders', () => {
  it('computes 4 shoulders with .365 knife and 0.008 clearance', () => {
    // setupWidth=20, arbor=64, knife=0.365, bottomClr=0.008, topClr=0
    // base = round((64-20)/2 / 0.125) * 0.125 = round(22/0.125)*0.125 = 22.000
    // knifeRoundedUp = ceil(0.365/0.125)*0.125 = 3*0.125 = 0.375
    // bottomOpening = 22 + 0.008 = 22.008
    // topOpening = 22 - 0.375 + 0 = 21.625
    // bottomClosing = 64 - 22.008 - 20 = 21.992
    // topClosing = 64 - 21.625 - 20 = 22.375
    const result = computeShoulders(20, 64, 0.365, 0.008, 0);
    expect(result.bottomOpening).toBeCloseTo(22.008);
    expect(result.topOpening).toBeCloseTo(21.625);
    expect(result.bottomClosing).toBeCloseTo(21.992);
    expect(result.topClosing).toBeCloseTo(22.375);
    expect(result.isValid).toBe(true);
  });

  it('computes shoulders with .480 knife and split clearance', () => {
    // knife=0.480, bottomClr=0, topClr=0.002
    // base = round((64-50)/2 / 0.125)*0.125 = round(7/0.125)*0.125 = 7.000
    // knifeRoundedUp = ceil(0.480/0.125)*0.125 = 4*0.125 = 0.500
    // bottomOpening = 7 + 0 = 7.000
    // topOpening = 7 - 0.500 + 0.002 = 6.502
    // bottomClosing = 64 - 7 - 50 = 7.000
    // topClosing = 64 - 6.502 - 50 = 7.498
    const result = computeShoulders(50, 64, 0.480, 0, 0.002);
    expect(result.bottomOpening).toBeCloseTo(7.0);
    expect(result.topOpening).toBeCloseTo(6.502);
    expect(result.bottomClosing).toBeCloseTo(7.0);
    expect(result.topClosing).toBeCloseTo(7.498);
    expect(result.isValid).toBe(true);
  });

  it('detects invalid when shoulder < 1"', () => {
    const result = computeShoulders(63, 64, 0.365, 0.008, 0);
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
