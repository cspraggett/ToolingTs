import { useState } from "react";
import { useSteelTooling } from "./ui/features/useSteelTooling";
import styles from "./ui/styles.module.css";
import { ResultDisplay } from "./ui/components/ResultDisplay";
import { StationCalculatorMode } from "./ui/features/StationCalculatorMode";

export default function SteelToolingCalculator() {
  const [mode, setMode] = useState<"single" | "makeCut">("single");
  const singleTools = useSteelTooling();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Steel Tooling Calculator</h2>

      <div className={styles.tabContainer}>
        <button
          onClick={() => setMode("single")}
          className={mode === "single" ? styles.tabButtonActive : styles.tabButton}
        >
          Single
        </button>
        <button
          onClick={() => setMode("makeCut")}
          className={mode === "makeCut" ? styles.tabButtonActive : styles.tabButton}
        >
          Make Cut
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
            className={styles.input}
          />

          {!singleTools.result ? (
            <p className={styles.helper}>Enter a width to calculate tooling</p>
          ) : (
            <ResultDisplay result={singleTools.result} />
          )}
        </>
      ) : (
        <StationCalculatorMode />
      )}
    </div>
  );
}
