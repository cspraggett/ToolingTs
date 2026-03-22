import { useState, ChangeEvent } from "react";
import { DualOptimizationResult } from "../../core/optimizer";
import { MACHINES, DEFAULT_MACHINE } from "../../config/machine-profiles";
import { calculateCut } from "../../core/cut-calculator/validator";

export function useCutCalculator() {
  const [selectedMachineId, setSelectedMachineId] = useState(DEFAULT_MACHINE.id);
  const currentMachine = MACHINES[selectedMachineId] ?? DEFAULT_MACHINE;

  const [cutSize, setCutSize] = useState("");
  const [knifeSize, setKnifeSize] = useState(currentMachine.knives[0].toString());
  const [clearance, setClearance] = useState("0.008");
  const [minusTol, setMinusTol] = useState("0.000");
  const [plusTol, setPlusTol] = useState("0.000");
  const [strictMode, setStrictMode] = useState(false);

  const [result, setResult] = useState<DualOptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isStrictCapable = !!currentMachine.strictExclude?.length;

  const onCutSizeChange = (e: ChangeEvent<HTMLInputElement>) => setCutSize(e.target.value);
  const onKnifeSizeChange = (e: ChangeEvent<HTMLSelectElement>) => setKnifeSize(e.target.value);
  const onClearanceChange = (e: ChangeEvent<HTMLInputElement>) => setClearance(e.target.value);
  const onMinusTolChange = (e: ChangeEvent<HTMLInputElement>) => setMinusTol(e.target.value);
  const onPlusTolChange = (e: ChangeEvent<HTMLInputElement>) => setPlusTol(e.target.value);
  const onStrictModeChange = (e: ChangeEvent<HTMLInputElement>) => setStrictMode(e.target.checked);

  const onMachineChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMachineId(id);
    const machine = MACHINES[id] ?? DEFAULT_MACHINE;
    setKnifeSize(machine.knives[0].toString());
    setStrictMode(false);
  };

  const handleCalculate = () => {
    const inputs = { cutSize, knifeSize, clearance, minusTol, plusTol, strictMode };
    const res = calculateCut(inputs, currentMachine);

    if (res.ok) {
      setError(null);
      setResult(res.value);
    } else {
      setError(res.error);
      setResult(null);
    }
  };

  const handleReset = () => {
    setCutSize("");
    setKnifeSize(currentMachine.knives[0].toString());
    setClearance("0.008");
    setMinusTol("0.000");
    setPlusTol("0.000");
    setStrictMode(false);
    setResult(null);
    setError(null);
  };

  const calculatedTargets = cutSize ? {
    female: parseFloat(cutSize) || 0,
    male: (parseFloat(cutSize) || 0) - (parseFloat(knifeSize) || 0) * 2 - (parseFloat(clearance) || 0) * 2
  } : null;

  return {
    selectedMachineId,
    currentMachine,
    onMachineChange,
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
    handleCalculate,
    handleReset,
    result,
    error,
    calculatedTargets
  };
}
