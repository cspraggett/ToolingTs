import { useState, ChangeEvent } from "react";
import { findBestDualSetup, DualOptimizationResult } from "../../core/optimizer";
import { MACHINES, DEFAULT_MACHINE } from "../../config/machine-profiles";
import { computeCoilUsage, computeEdgeSpacers } from "../../core/utils";

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
  coilWidth: number;
  gauge: string;
  edgeTrim: number;
  edgeSpacer: number;
}

function makeStrip(): StripEntry {
  return { id: crypto.randomUUID(), width: "", quantity: "1", minusTol: "0.000", plusTol: "0.000" };
}

export function useFullSetup() {
  // === Machine Selection ===
  const [selectedMachineId, setSelectedMachineId] = useState(DEFAULT_MACHINE.id);
  const currentMachine = MACHINES[selectedMachineId] ?? DEFAULT_MACHINE;

  // === Inputs ===
  const [coilWidth, setCoilWidth] = useState("");
  const [gauge, setGauge] = useState("");
  const [knifeSize, setKnifeSize] = useState(currentMachine.knives[0].toString());
  const [clearance, setClearance] = useState("0.008");
  const [strictMode, setStrictMode] = useState(false);

  // === Strip List ===
  const [strips, setStrips] = useState<StripEntry[]>([makeStrip()]);

  // === Results ===
  const [result, setResult] = useState<FullSetupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isStrictCapable = !!currentMachine.strictExclude?.length;

  // === Strip List Handlers ===
  const addStrip = () => setStrips((prev) => [...prev, makeStrip()]);

  const removeStrip = (id: string) =>
    setStrips((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));

  const updateStrip = (id: string, field: "width" | "quantity" | "minusTol" | "plusTol", value: string) =>
    setStrips((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );

  // === Calculate ===
  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const cw = parseFloat(coilWidth);
    const knife = parseFloat(knifeSize);
    const clr = parseFloat(clearance);

    if (isNaN(cw) || cw <= 0) {
      setError("Please enter a valid coil width.");
      return;
    }
    if (cw > currentMachine.arborLength) {
      setError(`Coil width (${cw}") exceeds arbor length (${currentMachine.arborLength}").`);
      return;
    }

    // Parse & validate strips
    const parsed: { width: number; quantity: number; minus: number; plus: number }[] = [];
    for (const s of strips) {
      const w = parseFloat(s.width);
      const q = parseInt(s.quantity, 10);
      const m = parseFloat(s.minusTol) || 0;
      const p = parseFloat(s.plusTol) || 0;
      if (isNaN(w) || w <= 0) {
        setError("Each strip width must be greater than 0.");
        return;
      }
      if (isNaN(q) || q < 1) {
        setError("Each strip quantity must be at least 1.");
        return;
      }
      if (p > 0.500 || m > 0.500) {
        setError(`Strip ${w.toFixed(3)}": tolerance is too large (Max 0.500).`);
        return;
      }
      parsed.push({ width: w, quantity: q, minus: m, plus: p });
    }

    // Deduplicate by width (sum quantities, keep largest tolerance window)
    const deduped = new Map<number, { quantity: number; minus: number; plus: number }>();
    for (const { width, quantity, minus, plus } of parsed) {
      const existing = deduped.get(width);
      if (existing) {
        existing.quantity += quantity;
        existing.minus = Math.max(existing.minus, minus);
        existing.plus = Math.max(existing.plus, plus);
      } else {
        deduped.set(width, { quantity, minus, plus });
      }
    }

    const uniqueStrips = Array.from(deduped.entries()).map(([width, val]) => ({
      width,
      quantity: val.quantity,
      minus: val.minus,
      plus: val.plus,
    }));

    // Compute coil usage
    const { totalKnives, stripTotal, arborUsed } = computeCoilUsage(uniqueStrips, knife);

    if (stripTotal > cw) {
      setError(
        `Total cut width (${stripTotal.toFixed(3)}") exceeds coil width (${cw.toFixed(3)}").`
      );
      return;
    }

    if (arborUsed > currentMachine.arborLength) {
      setError(
        `Setup (${stripTotal.toFixed(3)}" cuts + ${totalKnives} knives) exceeds arbor length (${currentMachine.arborLength}").`
      );
      return;
    }

    const { edgeTrim, edgeSpacer } = computeEdgeSpacers(
      stripTotal,
      arborUsed,
      cw,
      currentMachine.arborLength
    );

    // Solve for each unique strip
    const stripResults: StripResult[] = [];
    let grandTotalTools = 0;

    for (const { width, quantity, minus, plus } of uniqueStrips) {
      const nominalFemale = width;
      const nominalMale = width - knife * 2 - clr * 2;

      if (nominalMale <= 0) {
        setError(
          `Strip ${width.toFixed(3)}": knives + clearance exceed the strip width.`
        );
        return;
      }

      const dualResult = findBestDualSetup(
        nominalMale,
        nominalFemale,
        { minus, plus },
        currentMachine,
        { strictMode: isStrictCapable && strictMode }
      );

      if (!dualResult) {
        setError(`No solution found for strip width ${width.toFixed(3)}".`);
        return;
      }

      stripResults.push({
        stripWidth: width,
        quantity,
        nominalMale,
        nominalFemale,
        dualResult,
      });

      grandTotalTools += dualResult.totalToolCount * quantity;
    }

    setResult({
      stripResults,
      grandTotalTools,
      totalKnives,
      stripTotal,
      coilWidth: cw,
      gauge,
      edgeTrim,
      edgeSpacer,
    });
  };

  const handleReset = () => {
    setCoilWidth("");
    setGauge("");
    setStrips([makeStrip()]);
    setResult(null);
    setError(null);
  };

  // Input change helpers
  const onMachineChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMachineId(id);
    const machine = MACHINES[id] ?? DEFAULT_MACHINE;
    setKnifeSize(machine.knives[0].toString());
    setStrictMode(false);
  };
  const onCoilWidthChange = (e: ChangeEvent<HTMLInputElement>) => setCoilWidth(e.target.value);
  const onGaugeChange = (e: ChangeEvent<HTMLInputElement>) => setGauge(e.target.value);
  const onKnifeSizeChange = (e: ChangeEvent<HTMLSelectElement>) => setKnifeSize(e.target.value);
  const onClearanceChange = (e: ChangeEvent<HTMLInputElement>) => setClearance(e.target.value);
  const onStrictModeChange = (e: ChangeEvent<HTMLInputElement>) => setStrictMode(e.target.checked);

  return {
    // Machine
    selectedMachineId,
    currentMachine,
    onMachineChange,

    // Inputs
    coilWidth,
    onCoilWidthChange,
    gauge,
    onGaugeChange,
    knifeSize,
    onKnifeSizeChange,
    clearance,
    onClearanceChange,
    strictMode,
    onStrictModeChange,
    isStrictCapable,

    // Strips
    strips,
    addStrip,
    removeStrip,
    updateStrip,

    // Actions
    handleCalculate,
    handleReset,

    // Results
    result,
    error,
  };
}
