import { useState, ChangeEvent } from "react";
import { 
  calculateFullSetup, 
  FullSetupInputs, 
  FullSetupResult, 
  StripEntry 
} from "../../core/engine";
import { MACHINES, DEFAULT_MACHINE, MachineProfile } from "../../config/machine-profiles";

function makeStrip(): StripEntry {
  return { id: crypto.randomUUID(), width: "", quantity: "1", minusTol: "0.000", plusTol: "0.000" };
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
    const res = calculateFullSetup(inputs, strips, currentMachine);
    if (res.ok) {
      setResult(res.value);
      setError(null);
    } else {
      setResult(null);
      setError(res.error);
    }
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
