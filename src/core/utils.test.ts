import { describe, it, expect } from 'vitest';
import { summarizeStack, ArborUnits } from './utils';

describe('summarizeStack', () => {
  it('groups tools by size and sorts by largest first', () => {
    const stack = [
      { size: 1.0, units: 1000 as ArborUnits },
      { size: 0.5, units: 500 as ArborUnits },
      { size: 1.0, units: 1000 as ArborUnits },
    ];
    const summary = summarizeStack(stack);
    expect(summary).toHaveLength(2);
    expect(summary[0]).toEqual({ size: 1.0, count: 2, label: undefined });
    expect(summary[1]).toEqual({ size: 0.5, count: 1, label: undefined });
  });

  it('populates labels if provided', () => {
    const stack = [
      { size: 0.0500, units: 50 as ArborUnits },
      { size: 0.0505, units: 50.5 as ArborUnits },
    ];
    const labels = {
      0.0500: "a",
      0.0505: "b",
    };
    const summary = summarizeStack(stack, labels);
    expect(summary[0].label).toBe("b"); // 0.0505 is larger
    expect(summary[1].label).toBe("a");
  });
});
