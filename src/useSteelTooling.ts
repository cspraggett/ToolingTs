import { useState, useMemo, ChangeEvent } from "react";
import { findExactSteelSetup, type ToolingSetup } from "./toolingLogic";

export function useSteelTooling() {
  // 1. Manage the raw input state
  const [targetWidth, setTargetWidth] = useState<string>("");

  // 2. Derive the calculated result
  const result = useMemo<ToolingSetup | null>(() => {
    const parsedWidth = parseFloat(targetWidth);

    // Safety check: if it's not a number or <= 0, return null
    if (isNaN(parsedWidth) || parsedWidth <= 0) return null;

    return findExactSteelSetup(parsedWidth);
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