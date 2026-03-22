import { useState, ChangeEvent, useReducer } from "react";
import { 
  calculateFullSetup, 
  FullSetupInputs, 
  FullSetupResult, 
  StripEntry 
} from "../../core/engine";
import { MACHINES, DEFAULT_MACHINE } from "../../config/machine-profiles";

function makeStrip(): StripEntry {
  return { id: crypto.randomUUID(), width: "", quantity: "1", minusTol: "0.000", plusTol: "0.000" };
}

type SetupState = {
  inputs: FullSetupInputs;
  strips: StripEntry[];
  result: FullSetupResult | null;
  error: string | null;
};

type SetupAction =
  | { type: 'SET_INPUT'; field: keyof FullSetupInputs; value: string | boolean }
  | { type: 'ADD_STRIP' }
  | { type: 'REMOVE_STRIP'; id: string }
  | { type: 'UPDATE_STRIP'; id: string; field: keyof Omit<StripEntry, 'id'>; value: string }
  | { type: 'SET_CALCULATION'; result: FullSetupResult | null; error: string | null }
  | { type: 'RESET'; defaultInputs: FullSetupInputs };

function setupReducer(state: SetupState, action: SetupAction): SetupState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, inputs: { ...state.inputs, [action.field]: action.value } };
    case 'ADD_STRIP':
      return { ...state, strips: [...state.strips, makeStrip()] };
    case 'REMOVE_STRIP':
      return { 
        ...state, 
        strips: state.strips.length <= 1 ? state.strips : state.strips.filter(s => s.id !== action.id) 
      };
    case 'UPDATE_STRIP':
      return {
        ...state,
        strips: state.strips.map(s => s.id === action.id ? { ...s, [action.field]: action.value } : s)
      };
    case 'SET_CALCULATION':
      return { ...state, result: action.result, error: action.error };
    case 'RESET':
      return {
        inputs: action.defaultInputs,
        strips: [makeStrip()],
        result: null,
        error: null
      };
    default:
      return state;
  }
}

export function useFullSetup() {
  const [selectedMachineId, setSelectedMachineId] = useState(DEFAULT_MACHINE.id);
  const currentMachine = MACHINES[selectedMachineId] ?? DEFAULT_MACHINE;

  const initialInputs: FullSetupInputs = {
    orderNumber: "",
    companyName: "",
    coilWidth: "",
    coilWeight: "",
    gauge: "",
    knifeSize: currentMachine.knives[0].toString(),
    clearance: "0.008",
    strictMode: false,
  };

  const [state, dispatch] = useReducer(setupReducer, {
    inputs: initialInputs,
    strips: [makeStrip()],
    result: null,
    error: null
  });

  const isStrictCapable = !!currentMachine.strictExclude?.length;

  // Handlers
  const addStrip = () => dispatch({ type: 'ADD_STRIP' });
  const removeStrip = (id: string) => dispatch({ type: 'REMOVE_STRIP', id });
  const updateStrip = (id: string, field: keyof Omit<StripEntry, 'id'>, value: string) =>
    dispatch({ type: 'UPDATE_STRIP', id, field, value });

  const handleInputChange = (field: keyof FullSetupInputs, value: string | boolean) => {
    dispatch({ type: 'SET_INPUT', field, value });
  };

  const handleCalculate = () => {
    const res = calculateFullSetup(state.inputs, state.strips, currentMachine);
    if (res.ok) {
      dispatch({ type: 'SET_CALCULATION', result: res.value, error: null });
    } else {
      dispatch({ type: 'SET_CALCULATION', result: null, error: res.error });
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET', defaultInputs: {
      ...initialInputs,
      knifeSize: currentMachine.knives[0].toString()
    }});
  };

  const onMachineChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMachineId(id);
    const machine = MACHINES[id] ?? DEFAULT_MACHINE;
    dispatch({ type: 'RESET', defaultInputs: {
      ...initialInputs,
      knifeSize: machine.knives[0].toString()
    }});
  };

  return {
    selectedMachineId,
    currentMachine,
    onMachineChange,
    inputs: state.inputs,
    handleInputChange,
    isStrictCapable,
    strips: state.strips,
    addStrip,
    removeStrip,
    updateStrip,
    handleCalculate,
    handleReset,
    result: state.result,
    error: state.error,
  };
}
