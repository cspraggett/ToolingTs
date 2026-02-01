import { useState } from "react";
import { useSteelTooling } from "./useSteelTooling";
import { styles } from "./styles";
import { ResultDisplay } from "./ResultDisplay";
import { OptimizerMode } from "./OptimizerMode"; // Import new component

export default function SteelToolingCalculator() {
  // 1. TAB STATE
  const [mode, setMode] = useState<"single" | "optimizer">("single");

  // Single Mode Hooks (Only run when needed, but React hooks must always be called, 
  // so we leave them here. It's cheap.)
  const singleTools = useSteelTooling();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Steel Tooling Calculator</h2>

      {/* TAB SWITCHER UI */}
      <div style={{ display: "flex", marginBottom: "1.5rem", borderBottom: "1px solid #ddd" }}>
        <button
          onClick={() => setMode("single")}
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "none",
            background: "none",
            fontWeight: mode === "single" ? "bold" : "normal",
            borderBottom: mode === "single" ? "3px solid #007bff" : "none",
            cursor: "pointer"
          }}
        >
          Single
        </button>
        <button
          onClick={() => setMode("optimizer")}
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "none",
            background: "none",
            fontWeight: mode === "optimizer" ? "bold" : "normal",
            borderBottom: mode === "optimizer" ? "3px solid #007bff" : "none",
            cursor: "pointer"
          }}
        >
          Optimizer
        </button>
      </div>

      {/* CONDITIONAL RENDERING */}
      {mode === "single" ? (
        // === ORIGINAL SINGLE MODE ===
        <>
          <input
            type="number"
            step="0.001"
            placeholder='Target width (")'
            value={singleTools.targetWidth}
            onChange={singleTools.handleInputChange}
            style={styles.input}
          />

          {!singleTools.result ? (
            <p style={styles.helper}>Enter a width to calculate tooling</p>
          ) : (
            <ResultDisplay result={singleTools.result} />
          )}
        </>
      ) : (
        // === NEW OPTIMIZER MODE ===
        <OptimizerMode />
      )}
    </div>
  );
}