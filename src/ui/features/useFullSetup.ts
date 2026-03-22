import { useState, ChangeEvent } from "react";
import { findBestDualSetup } from "../../core/optimizer";
import { findToolingSetup, SolverResult } from "../../core/solver";
import { MACHINES, DEFAULT_MACHINE, MachineProfile } from "../../config/machine-profiles";
import { computeCoilUsage, computeKnifeClearance, computeShoulders } from "../../core/utils";

export interface StripEntry {
  id: string;
  width: string;
  quantity: string;
  minusTol: string;
  plusTol: string;
}

export interface ArborCut {
  cutIndex: number; // 1, 2, 3...
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

function makeStrip(): StripEntry {
  return { id: crypto.randomUUID(), width: "", quantity: "1", minusTol: "0.000", plusTol: "0.000" };
}

/**
 * Validates and transforms raw input strings into numerical data,
 * then performs the full tooling setup calculation.
 */
export function calculateFullSetup(
  inputs: FullSetupInputs,
  strips: StripEntry[],
  machine: MachineProfile
): { result: FullSetupResult | null; error: string | null } {
  const coilWidth = parseFloat(inputs.coilWidth);
  const knifeSize = parseFloat(inputs.knifeSize);
  const clearance = parseFloat(inputs.clearance);
  const isStrictCapable = !!machine.strictExclude?.length;

  // Validate Basic Coil Inputs
  if (isNaN(coilWidth) || coilWidth <= 0) return { result: null, error: "Please enter a valid coil width." };
  if (coilWidth > machine.arborLength) return { result: null, error: `Coil width (${coilWidth}") exceeds arbor length (${machine.arborLength}").` };

  // 1. Parse & validate individual strip inputs
  const parsedStrips = [];
  for (const stripEntry of strips) {
    const width = parseFloat(stripEntry.width);
    const quantity = parseInt(stripEntry.quantity, 10);
    const minusTolerance = parseFloat(stripEntry.minusTol) || 0;
    const plusTolerance = parseFloat(stripEntry.plusTol) || 0;
    
    if (isNaN(width) || width <= 0) return { result: null, error: "Each strip width must be greater than 0." };
    if (isNaN(quantity) || quantity < 1) return { result: null, error: "Each strip quantity must be at least 1." };
    if (plusTolerance > 0.500 || minusTolerance > 0.500) {
      return { result: null, error: `Strip ${width.toFixed(3)}": tolerance is too large (Max 0.500).` };
    }
    
    parsedStrips.push({ width, quantity, minus: minusTolerance, plus: plusTolerance });
  }

  // 2. Compute physical coil usage (using ALL strips to verify space)
  const { totalKnives, stripTotal, arborUsed } = computeCoilUsage(parsedStrips, knifeSize);

  if (stripTotal > coilWidth) {
    return { result: null, error: `Total cut width (${stripTotal.toFixed(3)}") exceeds coil width (${coilWidth.toFixed(3)}").` };
  }
  if (arborUsed > machine.arborLength) {
    return { result: null, error: `Setup (${stripTotal.toFixed(3)}" cuts + ${totalKnives} knives) exceeds arbor length (${machine.arborLength}").` };
  }

  // 3. Create all individual cuts (No deduplication)
  const cuts: ArborCut[] = [];
  let grandTotalTools = 0;
  let cutCounter = 1;

  for (const strip of parsedStrips) {
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
      { strictMode: isStrictCapable && inputs.strictMode }
    );

    if (!dualResult) return { result: null, error: `No solution found for strip width ${strip.width.toFixed(3)}".` };

    // Create a cut for each quantity
    for (let i = 0; i < strip.quantity; i++) {
      // Logic: Cut 1 is Male-Bottom, Cut 2 is Female-Bottom, etc.
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

  // 4. Compute physical arbor setup widths (User Advice)
  // Each arbor has (n + 1) knives where n is the total number of cuts.
  const setupKnivesCount = cuts.length + 1;
  const bottomSpacersTotal = cuts.reduce((sum, s) => sum + s.bottomStack.target, 0);
  const topSpacersTotal = cuts.reduce((sum, s) => sum + s.topStack.target, 0);
  
  const bottomArborUsed = bottomSpacersTotal + setupKnivesCount * knifeSize;
  const topArborUsed = topSpacersTotal + setupKnivesCount * knifeSize;

  if (bottomArborUsed > machine.arborLength || topArborUsed > machine.arborLength) {
    const maxArbor = Math.max(bottomArborUsed, topArborUsed);
    return { result: null, error: `Physical setup (${maxArbor.toFixed(3)}") exceeds arbor length (${machine.arborLength}").` };
  }

  // 5. Compute arbor centering shoulders
  const { bottomClearance, topClearance } = computeKnifeClearance(knifeSize, clearance, machine.knifeClearanceOffsets);
  const shoulders = computeShoulders(
    stripTotal,
    machine.arborLength,
    knifeSize,
    bottomClearance,
    topClearance,
    bottomArborUsed,
    topArborUsed
  );

  // 6. Solve tooling stacks for all 4 shoulders
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
      orderNumber: inputs.orderNumber,
      companyName: inputs.companyName,
      coilWidth,
      coilWeight: inputs.coilWeight,
      gauge: inputs.gauge,
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

export function useFullSetup() {
  const [selectedMachineId, setSelectedMachineId] = useState(DEFAULT_MACHINE.id);
  const currentMachine = MACHINES[selectedMachineId] ?? DEFAULT_MACHINE;

  const [inputs, setInputs] = useState<FullSetupInputs>({
    orderNumber: "",
    companyName: "",
    coilWidth: "",
    coilWeight: "",
    gauge: "",
    knifeSize: currentMachine.knives[0].toString(),
    clearance: "0.008",
    strictMode: false,
  });

  const [strips, setStrips] = useState<StripEntry[]>([makeStrip()]);
  const [result, setResult] = useState<FullSetupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isStrictCapable = !!currentMachine.strictExclude?.length;

  // Handlers
  const addStrip = () => setStrips((prev) => [...prev, makeStrip()]);
  const removeStrip = (id: string) => setStrips((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  const updateStrip = (id: string, field: keyof Omit<StripEntry, 'id'>, value: string) =>
    setStrips((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const handleInputChange = (field: keyof FullSetupInputs, value: string | boolean) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const { result, error } = calculateFullSetup(inputs, strips, currentMachine);
    setResult(result);
    setError(error);
  };

  const handleReset = () => {
    setInputs({
      orderNumber: "",
      companyName: "",
      coilWidth: "",
      coilWeight: "",
      gauge: "",
      knifeSize: currentMachine.knives[0].toString(),
      clearance: "0.008",
      strictMode: false,
    });
    setStrips([makeStrip()]);
    setResult(null);
    setError(null);
  };

  const onMachineChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMachineId(id);
    const machine = MACHINES[id] ?? DEFAULT_MACHINE;
    setInputs(prev => ({
      ...prev,
      knifeSize: machine.knives[0].toString(),
      strictMode: false
    }));
  };

  return {
    selectedMachineId,
    currentMachine,
    onMachineChange,
    inputs,
    handleInputChange,
    isStrictCapable,
    strips,
    addStrip,
    removeStrip,
    updateStrip,
    handleCalculate,
    handleReset,
    result,
    error,
  };
}
