import { useState } from "react";
import { MACHINES } from "../../config/machine-profiles";
import { Tool } from "../../core/solver";
import { summarizeStack } from "../../core/utils";
import styles from "../styles.module.css";
import { useFullSetup } from "./useFullSetup";

function StackList({ stack }: { stack: Tool[] }) {
  const summary = summarizeStack(stack);
  return (
    <div className={styles.stackList}>
      {summary.map((s, i) => (
        <div key={i} className={styles.stackLine}>
          {s.count} x {s.size.toFixed(3)}"
        </div>
      ))}
    </div>
  );
}

export function FullSetupMode() {
  const setup = useFullSetup();
  const [showOptimizer, setShowOptimizer] = useState(false);

  return (
    <div>
      {/* === MACHINE SELECTOR === */}
      <div className={styles.machineSelector}>
        <label className={styles.label}>Select Workstation</label>
        <select
          value={setup.selectedMachineId}
          onChange={setup.onMachineChange}
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
        {/* Coil Width + Gauge */}
        <div className={styles.flexRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Coil Width</label>
            <input
              type="number"
              step="0.001"
              placeholder='e.g. 48.000"'
              value={setup.coilWidth}
              onChange={setup.onCoilWidthChange}
              className={styles.inputNoMargin}
            />
          </div>
          <div className={styles.flex1}>
            <label className={styles.label}>Gauge (display only)</label>
            <input
              type="text"
              placeholder="e.g. 20ga"
              value={setup.gauge}
              onChange={setup.onGaugeChange}
              className={styles.inputNoMargin}
            />
          </div>
        </div>

        {/* Knife + Clearance */}
        <div className={styles.flexRowTop}>
          <div className={styles.flex1}>
            <label className={styles.label}>Knife Size</label>
            <select
              value={setup.knifeSize}
              onChange={setup.onKnifeSizeChange}
              className={styles.selectInput}
            >
              {setup.currentMachine.knives.map((k) => (
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
              value={setup.clearance}
              onChange={setup.onClearanceChange}
              className={styles.inputNoMargin}
            />
          </div>
        </div>

        {/* Tight Clearance — always visible */}
        {setup.isStrictCapable && (
          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="strictModeFullSetup"
              checked={setup.strictMode}
              onChange={setup.onStrictModeChange}
              className={styles.checkbox}
            />
            <label htmlFor="strictModeFullSetup" className={styles.checkboxLabel}>
              <strong>Tight Clearance</strong> (Ban .031 & .062)
            </label>
          </div>
        )}

        {/* === STRIP LIST === */}
        <div className={styles.stripListHeader}>
          <div className={styles.stripListHeaderLeft}>
            <h3>Strips</h3>
            <button
              type="button"
              onClick={() => setShowOptimizer((v) => !v)}
              className={styles.btnToggle}
            >
              {showOptimizer ? "Hide" : "Show"} Optimizer
            </button>
          </div>
          <button onClick={setup.addStrip} className={styles.btnAddStrip} type="button">
            + Add Strip
          </button>
        </div>

        {/* Strip column labels */}
        <div className={styles.stripRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Width</label>
          </div>
          <div className={styles.stripQtyCol}>
            <label className={styles.label}>Qty</label>
          </div>
          {showOptimizer && (
            <>
              <div className={styles.stripTolCol}>
                <label className={styles.label}>- Tol</label>
              </div>
              <div className={styles.stripTolCol}>
                <label className={styles.label}>+ Tol</label>
              </div>
            </>
          )}
          {/* spacer matching remove button width */}
          <div className={styles.btnRemoveSpacer} />
        </div>

        {setup.strips.map((strip) => (
          <div key={strip.id} className={styles.stripRow}>
            <div className={styles.flex1}>
              <input
                type="number"
                step="0.001"
                placeholder='e.g. 5.000'
                value={strip.width}
                onChange={(e) => setup.updateStrip(strip.id, "width", e.target.value)}
                className={styles.inputNoMargin}
              />
            </div>
            <div className={styles.stripQtyCol}>
              <input
                type="number"
                min="1"
                step="1"
                value={strip.quantity}
                onChange={(e) => setup.updateStrip(strip.id, "quantity", e.target.value)}
                className={styles.inputNoMargin}
              />
            </div>
            {showOptimizer && (
              <>
                <div className={styles.stripTolCol}>
                  <input
                    type="number"
                    step="0.001"
                    value={strip.minusTol}
                    onChange={(e) => setup.updateStrip(strip.id, "minusTol", e.target.value)}
                    className={styles.stripTolInput}
                  />
                </div>
                <div className={styles.stripTolCol}>
                  <input
                    type="number"
                    step="0.001"
                    value={strip.plusTol}
                    onChange={(e) => setup.updateStrip(strip.id, "plusTol", e.target.value)}
                    className={styles.stripTolInput}
                  />
                </div>
              </>
            )}
            <button
              onClick={() => setup.removeStrip(strip.id)}
              className={styles.btnRemoveStrip}
              type="button"
            >
              X
            </button>
          </div>
        ))}

        {/* BUTTONS */}
        <div className={styles.buttonRow}>
          <button onClick={setup.handleReset} className={styles.btnReset}>
            Reset
          </button>
          <button onClick={setup.handleCalculate} className={styles.btnCalculate}>
            Calculate
          </button>
        </div>
      </div>

      {/* ERROR */}
      {setup.error && <div className={styles.errorMessage}>{setup.error}</div>}

      {/* RESULTS */}
      {setup.result && (
        <div className={styles.resultsArea}>
          {/* Summary Banner */}
          <div className={styles.recommendationBox}>
            <p className={styles.recTitle}>Setup Summary</p>
            <p className={styles.recValue}>
              {setup.result.grandTotalTools} tools | {setup.result.totalKnives} knives
            </p>
            <p className={styles.recCount}>
              Coil: <strong>{setup.result.coilWidth.toFixed(3)}"</strong>
              {setup.result.gauge && (
                <> | Gauge: <strong>{setup.result.gauge}</strong></>
              )}
            </p>
            <p className={styles.recCount}>
              Edge Trim: <strong>{setup.result.edgeTrim.toFixed(3)}"</strong>
              {" | "}
              Setup Width: <strong>{setup.result.stripTotal.toFixed(3)}"</strong>
              {!setup.result.shouldersValid && (
                <span style={{ color: "red" }}> (Shoulders below 1"!)</span>
              )}
            </p>
          </div>

          {/* Opening Shoulders */}
          <div className={styles.cutCard}>
            <div className={styles.cutCardHeader}>
              <span><strong>Opening Shoulders</strong></span>
            </div>
            <div className={styles.cutCardBody}>
              <div className={styles.cutCardSide}>
                <div className={styles.cutCardSideTitle}>
                  Bottom — {setup.result.bottomOpening.target.toFixed(3)}"
                </div>
                <StackList stack={setup.result.bottomOpening.stack} />
              </div>
              <div className={styles.cutCardSide}>
                <div className={styles.cutCardSideTitle}>
                  Top — {setup.result.topOpening.target.toFixed(3)}"
                </div>
                <StackList stack={setup.result.topOpening.stack} />
              </div>
            </div>
          </div>

          {/* Setup Sheet — one card per strip */}
          {setup.result.stripResults.map((sr, i) => (
            <div key={`${sr.stripWidth}-${i}`} className={styles.cutCard}>
              <div className={styles.cutCardHeader}>
                <span><strong>{sr.stripWidth.toFixed(3)}"</strong> x{sr.quantity}</span>
                {sr.dualResult.offset !== 0 && (
                  <span>
                    Offset: {sr.dualResult.offset > 0 ? "+" : ""}
                    {sr.dualResult.offset.toFixed(3)}"
                  </span>
                )}
              </div>
              <div className={styles.cutCardBody}>
                <div className={styles.cutCardSide}>
                  <div className={styles.cutCardSideTitle}>
                    Male — {(sr.nominalMale + sr.dualResult.offset).toFixed(3)}"
                  </div>
                  <StackList stack={sr.dualResult.maleResult.stack} />
                </div>
                <div className={styles.cutCardSide}>
                  <div className={styles.cutCardSideTitle}>
                    Female — {(sr.nominalFemale + sr.dualResult.offset).toFixed(3)}"
                  </div>
                  <StackList stack={sr.dualResult.femaleResult.stack} />
                </div>
              </div>
            </div>
          ))}

          {/* Closing Shoulders */}
          <div className={styles.cutCard}>
            <div className={styles.cutCardHeader}>
              <span><strong>Closing Shoulders</strong></span>
            </div>
            <div className={styles.cutCardBody}>
              <div className={styles.cutCardSide}>
                <div className={styles.cutCardSideTitle}>
                  Bottom — {setup.result.bottomClosing.target.toFixed(3)}"
                </div>
                <StackList stack={setup.result.bottomClosing.stack} />
              </div>
              <div className={styles.cutCardSide}>
                <div className={styles.cutCardSideTitle}>
                  Top — {setup.result.topClosing.target.toFixed(3)}"
                </div>
                <StackList stack={setup.result.topClosing.stack} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
