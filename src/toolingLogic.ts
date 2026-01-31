export interface Tool {
  size: number;
  units: number;
}

export interface ToolingSetup {
  width: number;
  stack: Tool[];
}

export interface ToolSummary {
  size: number;
  count: number;
}

/* =========================
   CONSTANTS & DATA
========================= */
const UNITS_PER_INCH = 1000;

const inchesToUnits = (inches: number): number =>
  Math.round(inches * UNITS_PER_INCH);

const steelToolingSizes: number[] = [
  3, 2, 1, 0.875, 0.75, 0.625, 0.5, 0.4, 0.375,
  0.3, 0.26, 0.257, 0.255, 0.253, 0.252, 0.251, 0.25,
  0.24, 0.2, 0.125, 0.1, 0.062, 0.05, 0.031
];

/* =========================
   SOLVER LOGIC
========================= */
export function findExactSteelSetup(targetWidthInches: number): ToolingSetup | null {
  const targetWidthUnits = inchesToUnits(targetWidthInches);

  const steelTools: Tool[] = steelToolingSizes.map(size => ({
    size,
    units: inchesToUnits(size)
  }));

  const bestSetupAtWidth: (Tool[] | null)[] = Array(targetWidthUnits + 1).fill(null);
  bestSetupAtWidth[0] = [];

  for (let currentWidth = 0; currentWidth <= targetWidthUnits; currentWidth++) {
    const currentSetup = bestSetupAtWidth[currentWidth];
    if (!currentSetup) continue;

    for (const tool of steelTools) {
      const nextWidth = currentWidth + tool.units;
      if (nextWidth > targetWidthUnits) continue;

      const candidateSetup = [...currentSetup, tool];
      const existingSetup = bestSetupAtWidth[nextWidth];

      if (!existingSetup || candidateSetup.length < existingSetup.length) {
        bestSetupAtWidth[nextWidth] = candidateSetup;
      }
    }
  }

  const exactSetup = bestSetupAtWidth[targetWidthUnits];

  if (!exactSetup) return null;

  return {
    width: targetWidthUnits / UNITS_PER_INCH,
    stack: exactSetup
  };
}

export function summarizeAndSortStack(toolStack: Tool[]): ToolSummary[] {
  const countBySize = toolStack.reduce((accumulator: Record<number, number>, tool: Tool) => {
    accumulator[tool.size] = (accumulator[tool.size] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(countBySize)
    .map(([size, count]): ToolSummary => ({
      size: Number(size),
      count: count as number
    }))
    .sort((a, b) => b.size - a.size);
}