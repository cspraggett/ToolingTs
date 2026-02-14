import { MACHINES } from "../../config/machine-profiles";
import { ResultDisplay } from "../components/ResultDisplay";
import styles from "../styles.module.css";
import { useStationCalculator } from "./useStationCalculator";

export function StationCalculatorMode() {
  const station = useStationCalculator();

  return (
    <div>
      {/* === MACHINE SELECTOR === */}
      <div className={styles.machineSelector}>
        <label className={styles.label}>Select Workstation</label>
        <select
          value={station.selectedMachineId}
          onChange={station.onMachineChange}
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
          value={station.cutSize}
          onChange={station.onCutSizeChange}
          className={styles.input}
        />

        <div className={styles.flexRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Knife Size</label>
            <select
              value={station.knifeSize}
              onChange={station.onKnifeSizeChange}
              className={styles.selectInput}
            >
              {station.currentMachine.knives.map((k) => (
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
              value={station.clearance}
              onChange={station.onClearanceChange}
              className={styles.inputNoMargin}
            />
          </div>
        </div>

        {/* TOLERANCES */}
        <div className={styles.toleranceRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Minus (-)</label>
            <input type="number" step="0.001" value={station.minusTol} onChange={station.onMinusTolChange} className={styles.inputNoMargin} />
          </div>
          <div className={styles.flex1}>
            <label className={styles.label}>Plus (+)</label>
            <input type="number" step="0.001" value={station.plusTol} onChange={station.onPlusTolChange} className={styles.inputNoMargin} />
          </div>
        </div>

        {station.isStrictCapable && (
          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="strictMode"
              checked={station.strictMode}
              onChange={station.onStrictModeChange}
              className={styles.checkbox}
            />
            <label htmlFor="strictMode" className={styles.checkboxLabel}>
              <strong>Tight Clearance</strong> (Ban .031 & .062)
            </label>
          </div>
        )}

        {/* BUTTONS */}
        <div className={styles.buttonRow}>
          <button onClick={station.handleReset} className={styles.btnReset}>Reset</button>
          <button onClick={station.handleCalculate} className={styles.btnCalculate}>Calculate</button>
        </div>
      </div>

      {/* ERROR */}
      {station.error && <div className={styles.errorMessage}>{station.error}</div>}

      {/* RESULTS */}
      {station.result && station.calculatedTargets && (
        <div className={styles.resultsArea}>
          <div className={styles.recommendationBox}>
            <p className={styles.recTitle}>Optimization Found:</p>
            <p className={styles.recValue}>{station.result.offset > 0 ? "+" : ""}{station.result.offset.toFixed(3)}"</p>
            <p className={styles.recCount}>Total Tools: <strong>{station.result.totalToolCount}</strong></p>
          </div>
          <div className={styles.sectionBlock}>
            <h3 className={styles.sectionHeader}>Male Setup</h3>
            <div className={styles.targetInfo}>
              Target: <strong>{(station.calculatedTargets.male + station.result.offset).toFixed(3)}"</strong>
            </div>
            <ResultDisplay result={station.result.maleResult} />
          </div>
          <div>
            <h3 className={styles.sectionHeader}>Female Setup</h3>
            <div className={styles.targetInfo}>
              Target: <strong>{(station.calculatedTargets.female + station.result.offset).toFixed(3)}"</strong>
            </div>
            <ResultDisplay result={station.result.femaleResult} />
          </div>
        </div>
      )}
    </div>
  );
}
