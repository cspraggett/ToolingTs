import { useState, useEffect } from "react";
import { findBestDualSetup, DualOptimizationResult } from "../../core/optimizer";
import { MACHINES, DEFAULT_MACHINE } from "../../config/machine-profiles";
import { ResultDisplay } from "../components/ResultDisplay";
import { styles } from "../styles";

export function StationCalculatorMode() {
  // === STATE: Machine Selection ===
  // We store the ID, then look up the profile
  const [selectedMachineId, setSelectedMachineId] = useState(DEFAULT_MACHINE.id);

  // Derived state: The actual machine object
  const currentMachine = MACHINES[selectedMachineId] || DEFAULT_MACHINE;

  // === STATE: Calculator Inputs ===
  const [cutSize, setCutSize] = useState("");

  // Default knife to the first one available on this machine
  const [knifeSize, setKnifeSize] = useState(currentMachine.knives[0].toString());

  const [clearance, setClearance] = useState("0.008");
  const [minusTol, setMinusTol] = useState("0.000");
  const [plusTol, setPlusTol] = useState("0.005");
  const [strictMode, setStrictMode] = useState(false);

  const [result, setResult] = useState<DualOptimizationResult | null>(null);
  const [calculatedTargets, setCalculatedTargets] = useState<{ male: number, female: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // === EFFECT: Reset Knife when Machine Changes ===
  // If we switch from Slitter 3 (0.500) to Slitter 4 (0.375), 
  // we must update the knife selection immediately.
  useEffect(() => {
    setKnifeSize(currentMachine.knives[0].toString());
  }, [currentMachine]);

  const handleCalculate = () => {
    setError(null);
    const cut = parseFloat(cutSize);
    const knife = parseFloat(knifeSize);
    const clr = parseFloat(clearance);
    const p = parseFloat(plusTol);
    const m = parseFloat(minusTol);

    if (isNaN(cut) || cut <= 0) {
      setError("Please enter a valid Cut Size.");
      return;
    }

    const nominalFemale = cut;
    const nominalMale = cut - (knife * 2) - (clr * 2);

    if (nominalMale <= 0) {
      setError("Impossible Setup: Knives are wider than the cut!");
      return;
    }

    if (p > 0.500 || m > 0.500) {
      setError("Tolerance is too large (Max 0.500)");
      return;
    }

    setCalculatedTargets({ male: nominalMale, female: nominalFemale });

    // === SOLVER CALL ===
    // Now passes 'currentMachine' instead of DEFAULT_MACHINE
    const bestResult = findBestDualSetup(
      nominalMale,
      nominalFemale,
      { minus: m, plus: p },
      currentMachine,
      { strictMode: strictMode }
    );

    setResult(bestResult);
  };

  const handleReset = () => {
    setCutSize("");
    setResult(null);
    setError(null);
    setCalculatedTargets(null);
  };

  return (
    <div>
      {/* === MACHINE SELECTOR === */}
      <div style={{ marginBottom: "1rem", textAlign: "left" }}>
        <label style={styles.label}>Select Workstation</label>
        <select
          value={selectedMachineId}
          onChange={(e) => setSelectedMachineId(e.target.value)}
          style={{ ...styles.input, textAlign: "left", cursor: "pointer" }}
        >
          {Object.values(MACHINES).map((machine) => (
            <option key={machine.id} value={machine.id}>
              {machine.name}
            </option>
          ))}
        </select>
      </div>

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
            {/* CHANGED: Dropdown for Knives */}
            <select
              value={knifeSize}
              onChange={(e) => setKnifeSize(e.target.value)}
              style={{ ...styles.input, marginBottom: 0, cursor: "pointer" }}
            >
              {currentMachine.knives.map((k) => (
                <option key={k} value={k}>
                  {k.toFixed(3)}"
                </option>
              ))}
            </select>
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

        {/* TOLERANCES */}
        <div style={{ ...styles.flexRow, marginTop: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Minus (-)</label>
            <input type="number" step="0.001" value={minusTol} onChange={(e) => setMinusTol(e.target.value)} style={{ ...styles.input, marginBottom: 0 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Plus (+)</label>
            <input type="number" step="0.001" value={plusTol} onChange={(e) => setPlusTol(e.target.value)} style={{ ...styles.input, marginBottom: 0 }} />
          </div>
        </div>

        {/* CHECKBOX */}
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            id="strictMode"
            checked={strictMode}
            onChange={(e) => setStrictMode(e.target.checked)}
            style={{ width: "20px", height: "20px", marginRight: "10px" }}
          />
          <label htmlFor="strictMode" style={{ fontSize: "1rem", cursor: "pointer" }}>
            <strong>Tight Clearance</strong> (Ban .031 & .062)
          </label>
        </div>

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
          <button onClick={handleReset} style={{ flex: 1, padding: "0.75rem", backgroundColor: "#e2e8f0", borderRadius: "6px", border: "none", cursor: "pointer" }}>Reset</button>
          <button onClick={handleCalculate} style={{ flex: 2, padding: "0.75rem", backgroundColor: "#3182ce", color: "white", borderRadius: "6px", border: "none", cursor: "pointer" }}>Calculate</button>
        </div>
      </div>

      {/* ERROR */}
      {error && <div style={{ color: "red", marginBottom: "1rem", fontWeight: "bold" }}>{error}</div>}

      {/* RESULTS */}
      {result && calculatedTargets && (
        <div style={{ textAlign: "left" }}>
          <div style={styles.recommendationBox}>
            <p style={styles.recTitle}>Optimization Found:</p>
            <p style={styles.recValue}>{result.offset > 0 ? "+" : ""}{result.offset.toFixed(3)}"</p>
            <p style={styles.recCount}>Total Tools: <strong>{result.totalToolCount}</strong></p>
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