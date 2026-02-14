import { useState, useMemo } from "react";
import { findBestDualSetup, DualOptimizationResult } from "../../core/optimizer";
import { DEFAULT_MACHINE } from "../../config/machine-profiles";
import { ResultDisplay } from "../components/ResultDisplay";
import styles from "../styles.module.css";

export function OptimizerMode() {
  const [male, setMale] = useState("");
  const [female, setFemale] = useState("");

  const [minusTol, setMinusTol] = useState("0.000");
  const [plusTol, setPlusTol] = useState("0.005");

  const result = useMemo<DualOptimizationResult | null>(() => {
    const m = parseFloat(male);
    const f = parseFloat(female);
    const p = parseFloat(plusTol);
    const min = parseFloat(minusTol);

    if (isNaN(m) || isNaN(f) || m <= 0 || f <= 0) return null;

    return findBestDualSetup(
      m,
      f,
      { minus: min, plus: p },
      DEFAULT_MACHINE
    );
  }, [male, female, plusTol, minusTol]);

  return (
    <div>
      {/* INPUT ROW 1: DIMENSIONS */}
      <div className={styles.flexRow}>
        <input
          type="number"
          step="0.001"
          placeholder="Male Size"
          value={male}
          onChange={(e) => setMale(e.target.value)}
          className={styles.inputNoMargin}
        />
        <input
          type="number"
          step="0.001"
          placeholder="Female Size"
          value={female}
          onChange={(e) => setFemale(e.target.value)}
          className={styles.inputNoMargin}
        />
      </div>

      {/* INPUT ROW 2: TOLERANCE */}
      <div className={styles.flexRowSpaced}>
        <div className={styles.flex1}>
          <label className={styles.label}>Minus (-)</label>
          <input
            type="number"
            step="0.001"
            value={minusTol}
            onChange={(e) => setMinusTol(e.target.value)}
            className={styles.inputNoMargin}
          />
        </div>
        <div className={styles.flex1}>
          <label className={styles.label}>Plus (+)</label>
          <input
            type="number"
            step="0.001"
            value={plusTol}
            onChange={(e) => setPlusTol(e.target.value)}
            className={styles.inputNoMargin}
          />
        </div>
      </div>

      {/* RESULTS AREA */}
      {!result ? (
        <p className={styles.helper}>Enter sizes to optimize setup</p>
      ) : (
        <div className={styles.resultsArea}>
          {/* THE RECOMMENDATION BANNER */}
          <div className={styles.recommendationBox}>
            <p className={styles.recTitle}>Recommended Offset:</p>
            <p className={styles.recValue}>
              {result.offset > 0 ? "+" : ""}{result.offset.toFixed(3)}"
            </p>
            <p className={styles.recCount}>
              Total Tools: <strong>{result.totalToolCount}</strong>
            </p>
          </div>

          <h3 className={styles.sectionTitleFlush}>Male Setup</h3>
          <ResultDisplay result={result.maleResult} />

          <h3 className={styles.sectionTitle}>Female Setup</h3>
          <ResultDisplay result={result.femaleResult} />
        </div>
      )}
    </div>
  );
}
