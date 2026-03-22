import { MACHINES } from "../../config/machine-profiles";
import { ResultDisplay } from "../components/ResultDisplay";
import styles from "../styles.module.css";
import { useCutCalculator } from "./useCutCalculator";

export function CutCalculatorMode() {
  const cut = useCutCalculator();

  return (
    <div>
      {/* === MACHINE SELECTOR === */}
      <div className={styles.machineSelector}>
        <label className={styles.label}>Select Workstation</label>
        <select
          value={cut.selectedMachineId}
          onChange={cut.onMachineChange}
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
          value={cut.cutSize}
          onChange={cut.onCutSizeChange}
          className={styles.input}
        />

        <div className={styles.flexRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Knife Size</label>
            <select
              value={cut.knifeSize}
              onChange={cut.onKnifeSizeChange}
              className={styles.selectInput}
            >
              {cut.currentMachine.knives.map((k) => (
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
              value={cut.clearance}
              onChange={cut.onClearanceChange}
              className={styles.inputNoMargin}
            />
          </div>
        </div>

        {/* TOLERANCES */}
        <div className={styles.toleranceRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Minus (-)</label>
            <input type="number" step="0.001" value={cut.minusTol} onChange={cut.onMinusTolChange} className={styles.inputNoMargin} />
          </div>
          <div className={styles.flex1}>
            <label className={styles.label}>Plus (+)</label>
            <input type="number" step="0.001" value={cut.plusTol} onChange={cut.onPlusTolChange} className={styles.inputNoMargin} />
          </div>
        </div>

        {cut.isStrictCapable && (
          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="strictMode"
              checked={cut.strictMode}
              onChange={cut.onStrictModeChange}
              className={styles.checkbox}
            />
            <label htmlFor="strictMode" className={styles.checkboxLabel}>
              <strong>Tight Clearance</strong> (Ban .031 & .062)
            </label>
          </div>
        )}

        {/* BUTTONS */}
        <div className={styles.buttonRow}>
          <button onClick={cut.handleReset} className={styles.btnReset}>Reset</button>
          <button onClick={cut.handleCalculate} className={styles.btnCalculate}>Calculate</button>
        </div>
      </div>

      {/* ERROR */}
      {cut.error && <div className={styles.errorMessage}>{cut.error}</div>}

      {/* RESULTS */}
      {cut.result && cut.calculatedTargets && (
        <div className={styles.resultsArea}>
          <div className={styles.recommendationBox}>
            <p className={styles.recTitle}>Optimization Found:</p>
            <p className={styles.recValue}>{cut.result.offset > 0 ? "+" : ""}{cut.result.offset.toFixed(3)}"</p>
            <p className={styles.recCount}>Total Tools: <strong>{cut.result.totalToolCount}</strong></p>
          </div>
          <div className={styles.sectionBlock}>
            <h3 className={styles.sectionHeader}>Male Setup</h3>
            <div className={styles.targetInfo}>
              Target: <strong>{(cut.calculatedTargets.male + cut.result.offset).toFixed(3)}"</strong>
            </div>
            <ResultDisplay result={cut.result.maleResult} />
          </div>
          <div>
            <h3 className={styles.sectionHeader}>Female Setup</h3>
            <div className={styles.targetInfo}>
              Target: <strong>{(cut.calculatedTargets.female + cut.result.offset).toFixed(3)}"</strong>
            </div>
            <ResultDisplay result={cut.result.femaleResult} />
          </div>
        </div>
      )}
    </div>
  );
}
