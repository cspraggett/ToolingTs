import { useState } from "react";
import { useSteelTooling } from "./useSteelTooling";
import { styles } from "./styles";
import { ResultDisplay } from "./ResultDisplay";
import { OptimizerMode } from "./OptimizerMode";

export default function SteelToolingCalculator() {
  const [mode, setMode] = useState<"single" | "optimizer">("single");
  const singleTools = useSteelTooling();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Steel Tooling Calculator</h2>

      {/* CLEAN TAB SWITCHER */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setMode("single")}
          // If mode is single, merge 'tabButton' with 'tabButtonActive'
          style={{
            ...styles.tabButton,
            ...(mode === "single" ? styles.tabButtonActive : {})
          }}
        >
          Single
        </button>
        <button
          onClick={() => setMode("optimizer")}
          style={{
            ...styles.tabButton,
            ...(mode === "optimizer" ? styles.tabButtonActive : {})
          }}
        >
          Optimizer
        </button>
      </div>

      {mode === "single" ? (
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
        <OptimizerMode />
      )}
    </div>
  );
}