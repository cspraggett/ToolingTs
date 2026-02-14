import { useState, useMemo } from "react";
import { findBestDualSetup, type DualOptimizationResult } from "../../core/optimizer";
import { ResultDisplay } from "../components/ResultDisplay";
import { styles } from "../styles";

export function OptimizerMode() {
  const [male, setMale] = useState("");
  const [female, setFemale] = useState("");

  // Set default min tolerance to 0.000 as requested
  const [minusTol, setMinusTol] = useState("0.000");
  const [plusTol, setPlusTol] = useState("0.005");

  const result = useMemo<DualOptimizationResult | null>(() => {
    const m = parseFloat(male);
    const f = parseFloat(female);
    const p = parseFloat(plusTol);
    const min = parseFloat(minusTol);

    if (isNaN(m) || isNaN(f) || m <= 0 || f <= 0) return null;

    return findBestDualSetup(m, f, min, p);
  }, [male, female, plusTol, minusTol]);

  return (
    <div>
      {/* INPUT ROW 1: DIMENSIONS */}
      <div style={styles.flexRow}>
        <input
          type="number"
          step="0.001"
          placeholder="Male Size"
          value={male}
          onChange={(e) => setMale(e.target.value)}
          style={{ ...styles.input, marginBottom: 0 }}
        />
        <input
          type="number"
          step="0.001"
          placeholder="Female Size"
          value={female}
          onChange={(e) => setFemale(e.target.value)}
          style={{ ...styles.input, marginBottom: 0 }}
        />
      </div>

      {/* INPUT ROW 2: TOLERANCE */}
      <div style={{ ...styles.flexRow, marginBottom: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Minus (-)</label>
          <input
            type="number"
            step="0.001"
            value={minusTol}
            onChange={(e) => setMinusTol(e.target.value)}
            style={{ ...styles.input, marginBottom: 0 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Plus (+)</label>
          <input
            type="number"
            step="0.001"
            value={plusTol}
            onChange={(e) => setPlusTol(e.target.value)}
            style={{ ...styles.input, marginBottom: 0 }}
          />
        </div>
      </div>

      {/* RESULTS AREA */}
      {!result ? (
        <p style={styles.helper}>Enter sizes to optimize setup</p>
      ) : (
        <div style={{ textAlign: "left" }}>
          {/* THE RECOMMENDATION BANNER */}
          <div style={styles.recommendationBox}>
            <p style={styles.recTitle}>Recommended Offset:</p>
            <p style={styles.recValue}>
              {result.offset > 0 ? "+" : ""}{result.offset.toFixed(3)}"
            </p>
            <p style={styles.recCount}>
              Total Tools: <strong>{result.totalToolCount}</strong>
            </p>
          </div>

          <h3 style={{ ...styles.sectionTitle, marginTop: 0 }}>Male Setup</h3>
          <ResultDisplay result={result.maleResult} />

          <h3 style={styles.sectionTitle}>Female Setup</h3>
          <ResultDisplay result={result.femaleResult} />
        </div>
      )}
    </div>
  );
}