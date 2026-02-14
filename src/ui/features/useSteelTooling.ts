import { useState, useMemo, ChangeEvent } from "react";
// UPDATED IMPORTS: Point to core/solver and config
import { findToolingSetup, SolverResult } from "../../core/solver";
import { DEFAULT_MACHINE } from "../../config/machine-profiles";

export function useSteelTooling() {
  // 1. Manage the raw input state
  const [targetWidth, setTargetWidth] = useState<string>("");

  // 2. Derive the calculated result
  // UPDATED TYPE: SolverResult instead of ToolingSetup
  const result = useMemo<SolverResult | null>(() => {
    const parsedWidth = parseFloat(targetWidth);

    // Safety check: if it's not a number or <= 0, return null
    if (isNaN(parsedWidth) || parsedWidth <= 0) return null;

    // UPDATED CALL: findToolingSetup with the machine profile
    return findToolingSetup(parsedWidth, DEFAULT_MACHINE);
  }, [targetWidth]);

  // 3. Helper to handle the messy event object
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTargetWidth(event.target.value);
  };

  // 4. Return exactly what the UI needs
  return {
    targetWidth,
    result,
    handleInputChange
  };
}