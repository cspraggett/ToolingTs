import { useState, useEffect } from "react";
import { findBestDualSetup, DualOptimizationResult } from "../../core/optimizer";
import { MACHINES, DEFAULT_MACHINE } from "../../config/machine-profiles";
import { ResultDisplay } from "../components/ResultDisplay";
import styles from "../styles.module.css";

export function StationCalculatorMode() {
  // === STATE: Machine Selection ===
  const [selectedMachineId, setSelectedMachineId] = useState(DEFAULT_MACHINE.id);
  const currentMachine = MACHINES[selectedMachineId] || DEFAULT_MACHINE;

  // === STATE: Calculator Inputs ===
  const [cutSize, setCutSize] = useState("");
  const [knifeSize, setKnifeSize] = useState(currentMachine.knives[0].toString());
  const [clearance, setClearance] = useState("0.008");
  const [minusTol, setMinusTol] = useState("0.000");
  const [plusTol, setPlusTol] = useState("0.005");
  const [strictMode, setStrictMode] = useState(false);

  const [result, setResult] = useState<DualOptimizationResult | null>(null);
  const [calculatedTargets, setCalculatedTargets] = useState<{ male: number, female: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // === EFFECT: Reset Knife & Strict Mode when Machine Changes ===
  useEffect(() => {
    setKnifeSize(currentMachine.knives[0].toString());
    setStrictMode(false);
  }, [currentMachine]);

  // Helper: Only Slitter 3 has the "Risky" tools (.031 / .062)
  const isStrictCapable = currentMachine.tools.includes(.031);

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

    const bestResult = findBestDualSetup(
      nominalMale,
      nominalFemale,
      { minus: m, plus: p },
      currentMachine,
      { strictMode: isStrictCapable && strictMode }
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
      <div className={styles.machineSelector}>
        <label className={styles.label}>Select Workstation</label>
        <select
          value={selectedMachineId}
          onChange={(e) => setSelectedMachineId(e.target.value)}
          className={styles.selectInput}
        >
          {Object.values(MACHINES).map((machine) => (
            <option key={machine.id} value={machine.id}>
              {machine.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.inputSection}>
        <label className={styles.label}>Strip Width (Cut Size)</label>
        <input
          type="number"
          step="0.001"
          placeholder='e.g. 5.000"'
          value={cutSize}
          onChange={(e) => setCutSize(e.target.value)}
          className={styles.input}
        />

        <div className={styles.flexRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Knife Size</label>
            <select
              value={knifeSize}
              onChange={(e) => setKnifeSize(e.target.value)}
              className={styles.selectInput}
            >
              {currentMachine.knives.map((k) => (
                <option key={k} value={k}>
                  {k.toFixed(3)}"
                </option>
              ))}
            </select>
          </div>
          <div className={styles.flex1}>
            <label className={styles.label}>Clearance</label>
            <input
              type="number"
              step="0.001"
              value={clearance}
              onChange={(e) => setClearance(e.target.value)}
              className={styles.inputNoMargin}
            />
          </div>
        </div>

        {/* TOLERANCES */}
        <div className={styles.toleranceRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Minus (-)</label>
            <input type="number" step="0.001" value={minusTol} onChange={(e) => setMinusTol(e.target.value)} className={styles.inputNoMargin} />
          </div>
          <div className={styles.flex1}>
            <label className={styles.label}>Plus (+)</label>
            <input type="number" step="0.001" value={plusTol} onChange={(e) => setPlusTol(e.target.value)} className={styles.inputNoMargin} />
          </div>
        </div>

        {/* CHECKBOX: HIDDEN FOR SLITTER 4 */}
        {isStrictCapable && (
          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="strictMode"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="strictMode" className={styles.checkboxLabel}>
              <strong>Tight Clearance</strong> (Ban .031 & .062)
            </label>
          </div>
        )}

        {/* BUTTONS */}
        <div className={styles.buttonRow}>
          <button onClick={handleReset} className={styles.btnReset}>Reset</button>
          <button onClick={handleCalculate} className={styles.btnCalculate}>Calculate</button>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* RESULTS */}
      {result && calculatedTargets && (
        <div className={styles.resultsArea}>
          <div className={styles.recommendationBox}>
            <p className={styles.recTitle}>Optimization Found:</p>
            <p className={styles.recValue}>{result.offset > 0 ? "+" : ""}{result.offset.toFixed(3)}"</p>
            <p className={styles.recCount}>Total Tools: <strong>{result.totalToolCount}</strong></p>
          </div>
          <div className={styles.sectionBlock}>
            <h3 className={styles.sectionHeader}>Male Setup</h3>
            <div className={styles.targetInfo}>
              Target: <strong>{(calculatedTargets.male + result.offset).toFixed(3)}"</strong>
            </div>
            <ResultDisplay result={result.maleResult} />
          </div>
          <div>
            <h3 className={styles.sectionHeader}>Female Setup</h3>
            <div className={styles.targetInfo}>
              Target: <strong>{(calculatedTargets.female + result.offset).toFixed(3)}"</strong>
            </div>
            <ResultDisplay result={result.femaleResult} />
          </div>
        </div>
      )}
    </div>
  );
}
