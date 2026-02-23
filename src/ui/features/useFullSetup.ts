import { useState, ChangeEvent } from "react";
import { findBestDualSetup, DualOptimizationResult } from "../../core/optimizer";
import { findToolingSetup, SolverResult } from "../../core/solver";
import { MACHINES, DEFAULT_MACHINE } from "../../config/machine-profiles";
import { computeCoilUsage, computeKnifeClearance, computeShoulders } from "../../core/utils";

export interface StripEntry {
  id: string;
  width: string;
  quantity: string;
  minusTol: string;
  plusTol: string;
}

export interface StripResult {
  stripWidth: number;
  quantity: number;
  nominalMale: number;
  nominalFemale: number;
  dualResult: DualOptimizationResult;
}

export interface FullSetupResult {
  stripResults: StripResult[];
  grandTotalTools: number;
  totalKnives: number;
  stripTotal: number;
  orderNumber: string;
  companyName: string;
  coilWidth: number;
  coilWeight: string;
  gauge: string;
  edgeTrim: number;
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
function calculateFullSetup(
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

  // 2. Deduplicate identical strip widths
  // Physically, we set up one station per unique width. We group them to find a single tooling solution.
  const uniqueWidthMap = new Map<string, { width: number; quantity: number; minus: number; plus: number }>();
  for (const strip of parsedStrips) {
    const widthKey = strip.width.toFixed(3);
    const existingEntry = uniqueWidthMap.get(widthKey);
    if (existingEntry) {
      existingEntry.quantity += strip.quantity;
      // We take the largest allowed tolerance window if they vary.
      existingEntry.minus = Math.max(existingEntry.minus, strip.minus);
      existingEntry.plus = Math.max(existingEntry.plus, strip.plus);
    } else {
      uniqueWidthMap.set(widthKey, { ...strip });
    }
  }

  const uniqueStrips = Array.from(uniqueWidthMap.values());

  // 3. Compute physical coil usage and check against arbor limits
  const { totalKnives, stripTotal, arborUsed } = computeCoilUsage(uniqueStrips, knifeSize);

  if (stripTotal > coilWidth) {
    return { result: null, error: `Total cut width (${stripTotal.toFixed(3)}") exceeds coil width (${coilWidth.toFixed(3)}").` };
  }
  if (arborUsed > machine.arborLength) {
    return { result: null, error: `Setup (${stripTotal.toFixed(3)}" cuts + ${totalKnives} knives) exceeds arbor length (${machine.arborLength}").` };
  }

  // 4. Solve for each unique strip setup (Male and Female tooling)
  const stripResults: StripResult[] = [];
  let grandTotalTools = 0;

  for (const strip of uniqueStrips) {
    const nominalFemale = strip.width;
    // Calculation: Male = Width - (2 * Knife) - (2 * Clearance)
    const nominalMale = strip.width - knifeSize * 2 - clearance * 2;

    if (nominalMale <= 0) {
      return { result: null, error: `Strip ${strip.width.toFixed(3)}": knives + clearance exceed the strip width.` };
    }

    // Optimization: find the best tooling stack for both male and female within tolerances.
    const dualResult = findBestDualSetup(
      nominalMale,
      nominalFemale,
      { minus: strip.minus, plus: strip.plus },
      machine,
      { strictMode: isStrictCapable && inputs.strictMode }
    );

    if (!dualResult) return { result: null, error: `No solution found for strip width ${strip.width.toFixed(3)}".` };

    stripResults.push({ stripWidth: strip.width, quantity: strip.quantity, nominalMale, nominalFemale, dualResult });
    grandTotalTools += dualResult.totalToolCount * strip.quantity;
  }

  // 5. Compute clearance and arbor centering shoulders
  const { bottomClearance, topClearance } = computeKnifeClearance(knifeSize, clearance, machine.knifeClearanceOffsets);
  const shoulders = computeShoulders(stripTotal, machine.arborLength, knifeSize, bottomClearance, topClearance);

  // 6. Solve tooling stacks for all 4 shoulders (Opening/Closing, Top/Bottom)
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
      stripResults,
      grandTotalTools,
      totalKnives,
      stripTotal,
      orderNumber: inputs.orderNumber,
      companyName: inputs.companyName,
      coilWidth,
      coilWeight: inputs.coilWeight,
      gauge: inputs.gauge,
      edgeTrim: coilWidth - stripTotal,
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
