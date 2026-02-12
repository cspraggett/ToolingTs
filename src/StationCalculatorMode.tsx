import { useState } from "react";
import { findBestDualSetup, type DualOptimizationResult } from "./toolingLogic";
import { ResultDisplay } from "./ResultDisplay";
import { styles } from "./styles";

export function StationCalculatorMode() {
  // 1. INPUT STATE
  const [cutSize, setCutSize] = useState("");
  const [knifeSize, setKnifeSize] = useState("0.500");
  const [clearance, setClearance] = useState("0.008");
  const [minusTol, setMinusTol] = useState("0.000");
  const [plusTol, setPlusTol] = useState("0.005");

  // 2. RESULT STATE (Only updates when button is clicked)
  const [result, setResult] = useState<DualOptimizationResult | null>(null);
  const [calculatedTargets, setCalculatedTargets] = useState<{ male: number, female: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 3. ACTIONS
  const handleCalculate = () => {
    setError(null);
    const cut = parseFloat(cutSize);
    const knife = parseFloat(knifeSize);
    const clr = parseFloat(clearance);
    const p = parseFloat(plusTol);
    const m = parseFloat(minusTol);

    // Validation
    if (isNaN(cut) || cut <= 0) {
      setError("Please enter a valid Cut Size.");
      return;
    }
    if (isNaN(knife) || isNaN(clr)) {
      setError("Check Knife or Clearance values.");
      return;
    }

    // Math
    const nominalFemale = cut;
    const nominalMale = cut - (knife * 2) - (clr * 2);

    if (nominalMale <= 0) {
      setError("Impossible Setup: Knives are wider than the cut!");
      return;
    }

    // Save nominals for display
    setCalculatedTargets({ male: nominalMale, female: nominalFemale });

    // Run Optimization
    const bestResult = findBestDualSetup(nominalMale, nominalFemale, m, p);
    setResult(bestResult);
  };

  const handleReset = () => {
    setCutSize("");
    setKnifeSize("0.500");
    setClearance("0.008");
    setResult(null);
    setError(null);
    setCalculatedTargets(null);
  };

  // 4. RENDER
  return (
    <div>
      {/* INPUTS */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={styles.label}>Strip Width (Cut Size)</label>
        <input
          type="number"
          step="0.001"
          placeholder='e.g. 5.000"'
          value={cutSize}
          onChange={(e) => setCutSize(e.target.value)}
          style={styles.input}
        />

        <div style={styles.flexRow}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Knife Size</label>
            <input
              type="number"
              step="0.001"
              value={knifeSize}
              onChange={(e) => setKnifeSize(e.target.value)}
              style={{ ...styles.input, marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Clearance</label>
            <input
              type="number"
              step="0.001"
              value={clearance}
              onChange={(e) => setClearance(e.target.value)}
              style={{ ...styles.input, marginBottom: 0 }}
            />
          </div>
        </div>

        <div style={styles.flexRow}>
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

        {/* BUTTON ROW */}
        <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
          <button
            onClick={handleReset}
            style={{
              flex: 1,
              padding: "0.75rem",
              backgroundColor: "#e2e8f0",
              color: "#4a5568",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Reset
          </button>
          <button
            onClick={handleCalculate}
            style={{
              flex: 2,
              padding: "0.75rem",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer"
            }}
          >
            Calculate
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ color: "red", marginBottom: "1rem", fontWeight: "bold" }}>
          {error}
        </div>
      )}

      {/* RESULTS */}
      {result && calculatedTargets && (
        <div style={{ textAlign: "left" }}>
          <div style={styles.recommendationBox}>
            <p style={styles.recTitle}>Optimization Found:</p>
            <p style={styles.recValue}>
              {result.offset > 0 ? "+" : ""}{result.offset.toFixed(3)}"
            </p>
            <p style={styles.recCount}>
              Total Tools: <strong>{result.totalToolCount}</strong>
            </p>
          </div>

          <div style={{ borderBottom: "2px solid #eee", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <h3 style={{ margin: "0 0 0.5rem" }}>Male Setup</h3>
            <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
              Target: <strong>{(calculatedTargets.male + result.offset).toFixed(3)}"</strong>
            </div>
            <ResultDisplay result={result.maleResult} />
          </div>

          <div>
            <h3 style={{ margin: "0 0 0.5rem" }}>Female Setup</h3>
            <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
              Target: <strong>{(calculatedTargets.female + result.offset).toFixed(3)}"</strong>
            </div>
            <ResultDisplay result={result.femaleResult} />
          </div>
        </div>
      )}
    </div>
  );
}