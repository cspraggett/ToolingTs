import { useState, ChangeEvent } from "react";
import { findBestDualSetup, DualOptimizationResult } from "../../core/optimizer";
import { MACHINES, DEFAULT_MACHINE } from "../../config/machine-profiles";

export function useStationCalculator() {
  // === Machine Selection ===
  const [selectedMachineId, setSelectedMachineId] = useState(DEFAULT_MACHINE.id);
  const currentMachine = MACHINES[selectedMachineId] ?? DEFAULT_MACHINE;

  // === Calculator Inputs ===
  const [cutSize, setCutSize] = useState("");
  const [knifeSize, setKnifeSize] = useState(currentMachine.knives[0].toString());
  const [clearance, setClearance] = useState("0.008");
  const [minusTol, setMinusTol] = useState("0.000");
  const [plusTol, setPlusTol] = useState("0.005");
  const [strictMode, setStrictMode] = useState(false);

  // === Results ===
  const [result, setResult] = useState<DualOptimizationResult | null>(null);
  const [calculatedTargets, setCalculatedTargets] = useState<{ male: number; female: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isStrictCapable = !!currentMachine.strictExclude?.length;

  const handleCalculate = () => {
    setError(null);
    const cut = parseFloat(cutSize);
    const knife = parseFloat(knifeSize);
    const clr = parseFloat(clearance);
    const p = parseFloat(plusTol);
    const m = parseFloat(minusTol);

    if (isNaN(cut) || cut <= 0) {
      setError("Please enter a valid Cut Size.");
      return;
    }

    const nominalFemale = cut;
    const nominalMale = cut - (knife * 2) - (clr * 2);

    if (nominalMale <= 0) {
      setError("Impossible Setup: Knives are wider than the cut!");
      return;
    }

    if (p > 0.500 || m > 0.500) {
      setError("Tolerance is too large (Max 0.500)");
      return;
    }

    setCalculatedTargets({ male: nominalMale, female: nominalFemale });

    const bestResult = findBestDualSetup(
      nominalMale,
      nominalFemale,
      { minus: m, plus: p },
      currentMachine,
      { strictMode: isStrictCapable && strictMode }
    );

    setResult(bestResult);
  };

  const handleReset = () => {
    setCutSize("");
    setResult(null);
    setError(null);
    setCalculatedTargets(null);
  };

  // Input change helpers
  const onMachineChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMachineId(id);
    const machine = MACHINES[id] ?? DEFAULT_MACHINE;
    setKnifeSize(machine.knives[0].toString());
    setStrictMode(false);
  };
  const onCutSizeChange = (e: ChangeEvent<HTMLInputElement>) => setCutSize(e.target.value);
  const onKnifeSizeChange = (e: ChangeEvent<HTMLSelectElement>) => setKnifeSize(e.target.value);
  const onClearanceChange = (e: ChangeEvent<HTMLInputElement>) => setClearance(e.target.value);
  const onMinusTolChange = (e: ChangeEvent<HTMLInputElement>) => setMinusTol(e.target.value);
  const onPlusTolChange = (e: ChangeEvent<HTMLInputElement>) => setPlusTol(e.target.value);
  const onStrictModeChange = (e: ChangeEvent<HTMLInputElement>) => setStrictMode(e.target.checked);

  return {
    // Machine
    selectedMachineId,
    currentMachine,
    onMachineChange,

    // Inputs
    cutSize,
    onCutSizeChange,
    knifeSize,
    onKnifeSizeChange,
    clearance,
    onClearanceChange,
    minusTol,
    onMinusTolChange,
    plusTol,
    onPlusTolChange,
    strictMode,
    onStrictModeChange,
    isStrictCapable,

    // Actions
    handleCalculate,
    handleReset,

    // Results
    result,
    calculatedTargets,
    error,
  };
}
