import { findBestDualSetup } from "./optimizer";
import { findToolingSetup, SolverResult } from "./solver";
import { MachineProfile } from "../config/machine-profiles";
import { computeCoilUsage, computeKnifeClearance, computeShoulders } from "./utils";

// --- Input Types (Strings from UI) ---
export interface StripEntry {
  id: string;
  width: string;
  quantity: string;
  minusTol: string;
  plusTol: string;
}

export interface FullSetupInputs {
  orderNumber: string;
  companyName: string;
  coilWidth: string;
  coilWeight: string;
  gauge: string;
  knifeSize: string;
  clearance: string;
  strictMode: boolean;
}

// --- Internal Validated Types (Numbers for Logic) ---
export interface ValidatedStrip {
  width: number;
  quantity: number;
  minus: number;
  plus: number;
}

export interface ValidatedSetupConfig {
  coilWidth: number;
  knifeSize: number;
  clearance: number;
  strictMode: boolean;
  strips: ValidatedStrip[];
  // Metadata kept for the final result
  orderNumber: string;
  companyName: string;
  coilWeight: string;
  gauge: string;
}

// --- Result Types ---
export interface ArborCut {
  cutIndex: number; 
  width: number;
  bottomStack: SolverResult;
  topStack: SolverResult;
  type: 'male-bottom' | 'female-bottom';
}

export interface FullSetupResult {
  cuts: ArborCut[];
  grandTotalTools: number;
  totalKnives: number;
  stripTotal: number;
  bottomArborUsed: number;
  topArborUsed: number;
  orderNumber: string;
  companyName: string;
  coilWidth: number;
  coilWeight: string;
  gauge: string;
  edgeTrim: number;
  clearance: number;
  bottomOpening: SolverResult;
  topOpening: SolverResult;
  bottomClosing: SolverResult;
  topClosing: SolverResult;
  shouldersValid: boolean;
}

/**
 * PURE CALCULATION ENGINE
 * This function handles only numerical data and business logic.
 * This is the primary candidate for the Rust/WASM implementation.
 */
export function generateFullSetup(
  config: ValidatedSetupConfig,
  machine: MachineProfile
): { result: FullSetupResult | null; error: string | null } {
  const { coilWidth, knifeSize, clearance, strictMode, strips } = config;
  const isStrictCapable = !!machine.strictExclude?.length;

  // 1. Compute physical coil usage
  const { totalKnives, stripTotal, arborUsed } = computeCoilUsage(strips, knifeSize);

  if (stripTotal > coilWidth) {
    return { result: null, error: `Total cut width (${stripTotal.toFixed(3)}") exceeds coil width (${coilWidth.toFixed(3)}").` };
  }
  if (arborUsed > machine.arborLength) {
    return { result: null, error: `Setup (${stripTotal.toFixed(3)}" cuts + ${totalKnives} knives) exceeds arbor length (${machine.arborLength}").` };
  }

  // 2. Create all individual cuts
  const cuts: ArborCut[] = [];
  let grandTotalTools = 0;
  let cutCounter = 1;

  for (const strip of strips) {
    const nominalFemale = strip.width;
    const nominalMale = strip.width - knifeSize * 2 - clearance * 2;

    if (nominalMale <= 0) {
      return { result: null, error: `Strip ${strip.width.toFixed(3)}": knives + clearance exceed the strip width.` };
    }

    const dualResult = findBestDualSetup(
      nominalMale,
      nominalFemale,
      { minus: strip.minus, plus: strip.plus },
      machine,
      { strictMode: isStrictCapable && strictMode }
    );

    if (!dualResult) return { result: null, error: `No solution found for strip width ${strip.width.toFixed(3)}".` };

    for (let i = 0; i < strip.quantity; i++) {
      const type: 'male-bottom' | 'female-bottom' = (cutCounter % 2 !== 0) ? 'male-bottom' : 'female-bottom';
      
      cuts.push({
        cutIndex: cutCounter,
        width: strip.width,
        bottomStack: type === 'male-bottom' ? dualResult.maleResult : dualResult.femaleResult,
        topStack: type === 'male-bottom' ? dualResult.femaleResult : dualResult.maleResult,
        type
      });
      
      grandTotalTools += dualResult.totalToolCount;
      cutCounter++;
    }
  }

  // 3. Compute physical arbor setup widths
  const setupKnivesCount = cuts.length + 1;
  const bottomSpacersTotal = cuts.reduce((sum, s) => sum + s.bottomStack.target, 0);
  const topSpacersTotal = cuts.reduce((sum, s) => sum + s.topStack.target, 0);
  
  const bottomArborUsed = bottomSpacersTotal + setupKnivesCount * knifeSize;
  const topArborUsed = topSpacersTotal + setupKnivesCount * knifeSize;

  if (bottomArborUsed > machine.arborLength || topArborUsed > machine.arborLength) {
    const maxArbor = Math.max(bottomArborUsed, topArborUsed);
    return { result: null, error: `Physical setup (${maxArbor.toFixed(3)}") exceeds arbor length (${machine.arborLength}").` };
  }

  // 4. Compute arbor centering shoulders
  const { bottomClearance, topClearance } = computeKnifeClearance(knifeSize, clearance, machine.knifeClearanceStrategies);
  const shoulders = computeShoulders(
    stripTotal,
    machine.arborLength,
    knifeSize,
    bottomClearance,
    topClearance,
    bottomArborUsed,
    topArborUsed
  );

  // 5. Solve tooling stacks for shoulders
  const shoulderTargets = [
    { key: "bottomOpening" as const, value: shoulders.bottomOpening, strict: true },
    { key: "topOpening" as const, value: shoulders.topOpening, strict: true },
    { key: "bottomClosing" as const, value: shoulders.bottomClosing, strict: false },
    { key: "topClosing" as const, value: shoulders.topClosing, strict: false },
  ];

  const solvedShoulders: Record<string, SolverResult> = {};
  for (const target of shoulderTargets) {
    const solution = findToolingSetup(target.value, machine, { strictMode: target.strict });
    if (!solution) return { result: null, error: `No tooling solution for ${target.key} shoulder (${target.value.toFixed(3)}").` };
    solvedShoulders[target.key] = solution;
  }

  return {
    error: null,
    result: {
      cuts,
      grandTotalTools,
      totalKnives,
      stripTotal,
      bottomArborUsed,
      topArborUsed,
      orderNumber: config.orderNumber,
      companyName: config.companyName,
      coilWidth,
      coilWeight: config.coilWeight,
      gauge: config.gauge,
      edgeTrim: coilWidth - stripTotal,
      clearance,
      bottomOpening: solvedShoulders.bottomOpening,
      topOpening: solvedShoulders.topOpening,
      bottomClosing: solvedShoulders.bottomClosing,
      topClosing: solvedShoulders.topClosing,
      shouldersValid: shoulders.isValid,
    }
  };
}

/**
 * BOUNDARY FUNCTION: Parsing & Validation
 * Converts raw UI inputs into a ValidatedSetupConfig.
 */
export function calculateFullSetup(
  inputs: FullSetupInputs,
  strips: StripEntry[],
  machine: MachineProfile
): { result: FullSetupResult | null; error: string | null } {
  const coilWidth = parseFloat(inputs.coilWidth);
  const knifeSize = parseFloat(inputs.knifeSize);
  const clearance = parseFloat(inputs.clearance);

  if (isNaN(coilWidth) || coilWidth <= 0) return { result: null, error: "Please enter a valid coil width." };
  if (coilWidth > machine.arborLength) return { result: null, error: `Coil width (${coilWidth}") exceeds arbor length (${machine.arborLength}").` };

  const parsedStrips: ValidatedStrip[] = [];
  for (const stripEntry of strips) {
    const width = parseFloat(stripEntry.width);
    const quantity = parseInt(stripEntry.quantity, 10);
    const minus = parseFloat(stripEntry.minusTol) || 0;
    const plus = parseFloat(stripEntry.plusTol) || 0;
    
    if (isNaN(width) || width <= 0) return { result: null, error: "Each strip width must be greater than 0." };
    if (isNaN(quantity) || quantity < 1) return { result: null, error: "Each strip quantity must be at least 1." };
    if (plus > 0.500 || minus > 0.500) {
      return { result: null, error: `Strip ${width.toFixed(3)}": tolerance is too large (Max 0.500).` };
    }
    
    parsedStrips.push({ width, quantity, minus, plus });
  }

  const config: ValidatedSetupConfig = {
    coilWidth,
    knifeSize,
    clearance,
    strictMode: inputs.strictMode,
    strips: parsedStrips,
    orderNumber: inputs.orderNumber,
    companyName: inputs.companyName,
    coilWeight: inputs.coilWeight,
    gauge: inputs.gauge,
  };

  return generateFullSetup(config, machine);
}
