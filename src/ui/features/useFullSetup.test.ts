import { describe, it, expect } from 'vitest';
import { calculateFullSetup, FullSetupInputs, StripEntry } from './useFullSetup';
import { DEFAULT_MACHINE } from '../../config/machine-profiles';

describe('calculateFullSetup', () => {
  const baseInputs: FullSetupInputs = {
    orderNumber: 'TEST-123',
    companyName: 'Test Corp',
    coilWidth: '24.000',
    coilWeight: '5000',
    gauge: '0.036',
    knifeSize: '0.365',
    clearance: '0.008',
    strictMode: false,
  };

  const machine = DEFAULT_MACHINE;

  it('groups identical strips into a single cut result with correct quantity', () => {
    const strips: StripEntry[] = [
      { id: '1', width: '5.000', quantity: '3', minusTol: '0.000', plusTol: '0.000' }
    ];

    const { result, error } = calculateFullSetup(baseInputs, strips, machine);

    expect(error).toBeNull();
    expect(result).not.toBeNull();
    expect(result!.cuts).toHaveLength(1);
    expect(result!.cuts[0].stripWidth).toBe(5.000);
    expect(result!.cuts[0].quantity).toBe(3);
  });

  it('generates unique cuts for different strip widths', () => {
    const strips: StripEntry[] = [
      { id: '1', width: '4.000', quantity: '2', minusTol: '0.000', plusTol: '0.000' },
      { id: '2', width: '6.000', quantity: '2', minusTol: '0.000', plusTol: '0.000' }
    ];

    const { result, error } = calculateFullSetup(baseInputs, strips, machine);

    expect(error).toBeNull();
    expect(result!.cuts).toHaveLength(2);

    expect(result!.cuts[0].stripWidth).toBe(4.000);
    expect(result!.cuts[1].stripWidth).toBe(6.000);
  });

  it('validates that total width + knives fits on arbor', () => {
    // Machine arbor is 64"
    const crazyInputs = { ...baseInputs, coilWidth: '70.000' };
    const strips: StripEntry[] = [
      { id: '1', width: '31.000', quantity: '2', minusTol: '0.000', plusTol: '0.000' }
    ];
    // Width 62" + 6 knives (2*2 + 2) * 0.365 = 2.19 = 64.19 (Too big for 64" arbor)

    const { result, error } = calculateFullSetup(crazyInputs, strips, machine);
    expect(result).toBeNull();
    expect(error).toContain('exceeds arbor length');
  });

  it('correctly calculates nominal male width', () => {
    // Male = Width - (2 * Knife) - (2 * Clearance)
    // 5.000 - (2 * 0.365) - (2 * 0.008) = 5.000 - 0.730 - 0.016 = 4.254
    const strips: StripEntry[] = [
      { id: '1', width: '5.000', quantity: '1', minusTol: '0.000', plusTol: '0.000' }
    ];

    const { result } = calculateFullSetup(baseInputs, strips, machine);
    expect(result!.cuts[0].nominalMale).toBeCloseTo(4.254);
    expect(result!.cuts[0].nominalFemale).toBe(5.000);
  });
});
