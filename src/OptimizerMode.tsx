import { useState, useMemo } from "react";
import { findBestDualSetup, type DualOptimizationResult } from "./toolingLogic";
import { ResultDisplay } from "./ResultDisplay";
import { styles } from "./styles";

export function OptimizerMode() {
  // 1. STATE
  const [male, setMale] = useState("");
  const [female, setFemale] = useState("");
  const [plusTol, setPlusTol] = useState("0.005");
  const [minusTol, setMinusTol] = useState("0.000");

  // 2. THE SOLVER
  const result = useMemo<DualOptimizationResult | null>(() => {
    const m = parseFloat(male);
    const f = parseFloat(female);
    const p = parseFloat(plusTol);
    const min = parseFloat(minusTol);

    if (isNaN(m) || isNaN(f) || m <= 0 || f <= 0) return null;

    // Call our new "Brain" function
    return findBestDualSetup(m, f, min, p);
  }, [male, female, plusTol, minusTol]);

  // 3. RENDER
  return (
    <div>
      {/* INPUT ROW 1: DIMENSIONS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
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
      <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "0.8rem", color: "#666" }}>Minus (-)</label>
          <input
            type="number"
            step="0.001"
            value={minusTol}
            onChange={(e) => setMinusTol(e.target.value)}
            style={{ ...styles.input, marginBottom: 0 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "0.8rem", color: "#666" }}>Plus (+)</label>
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
          <div style={{
            backgroundColor: "#e6fffa",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #b2f5ea",
            marginBottom: "1.5rem",
            textAlign: "center"
          }}>
            <p style={{ margin: 0, fontWeight: "bold", color: "#2c7a7b" }}>
              Recommended Offset:
            </p>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "#234e52" }}>
              {result.offset > 0 ? "+" : ""}{result.offset.toFixed(3)}"
            </p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem" }}>
              Total Tools: <strong>{result.totalToolCount}</strong>
            </p>
          </div>

          {/* REUSING YOUR RESULT COMPONENT */}
          <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "0.5rem" }}>Male Setup</h3>
          <ResultDisplay result={result.maleResult} />

          <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "0.5rem", marginTop: "2rem" }}>Female Setup</h3>
          <ResultDisplay result={result.femaleResult} />
        </div>
      )}
    </div>
  );
}