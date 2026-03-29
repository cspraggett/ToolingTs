import { describe, it, expect } from 'vitest';
import { calculateCoilWeight, calculateStopOD } from './coil-math';

describe('coil-math', () => {
  describe('calculateCoilWeight', () => {
    it('should calculate correct weight for 48" width, 20" ID, 50" OD', () => {
      const weight = calculateCoilWeight(48, 20, 50);
      expect(weight).toBeCloseTo(22483.75, 1);
    });
  });

  describe('calculateStopOD', () => {
    it('should calculate correct stop OD after removing 5000 lbs', () => {
      const stopOD = calculateStopOD(48, 20, 50, 5000);
      expect(stopOD).toBeCloseTo(45.08, 1);
    });
  });
});
