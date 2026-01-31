// App.tsx (or SteelToolingCalculator.tsx)
import React, { useMemo, useState, ChangeEvent } from "react";
import { findExactSteelSetup, type ToolingSetup } from "./toolingLogic"; // Note: summarizeAndSortStack is removed from here
import { styles } from "./styles";
import { ResultDisplay } from "./ResultDisplay"; // Import the new component

export default function SteelToolingCalculator() {
  const [targetWidth, setTargetWidth] = useState<string>("");

  const calculationResult = useMemo<ToolingSetup | null>(() => {
    const parsedWidth = parseFloat(targetWidth);
    if (isNaN(parsedWidth) || parsedWidth <= 0) return null;

    return findExactSteelSetup(parsedWidth);
  }, [targetWidth]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTargetWidth(event.target.value);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Steel Tooling Calculator</h2>

      <input
        type="number"
        step="0.001"
        placeholder='Target width (")'
        value={targetWidth}
        onChange={handleInputChange}
        style={styles.input}
      />

      {!calculationResult && (
        <p style={styles.helper}>
          Enter a width to calculate tooling
        </p>
      )}

      {/* Look how clean this part is now! */}
      {calculationResult && <ResultDisplay result={calculationResult} />}
    </div>
  );
}