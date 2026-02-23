import { useState } from "react";
import { MACHINES } from "../../config/machine-profiles";
import { Tool, SolverResult } from "../../core/solver";
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

interface SetupCardProps {
  title: string;
  side1: { label: string; result: SolverResult };
  side2: { label: string; result: SolverResult };
  extraHeader?: React.ReactNode;
}

function SetupCard({ title, side1, side2, extraHeader }: SetupCardProps) {
  return (
    <div className={styles.cutCard}>
      <div className={styles.cutCardHeader}>
        <span><strong>{title}</strong></span>
        {extraHeader}
      </div>
      <div className={styles.cutCardBody}>
        <div className={styles.cutCardSide}>
          <div className={styles.cutCardSideTitle}>
            {side1.label} — {side1.result.target.toFixed(3)}"
          </div>
          <StackList stack={side1.result.stack} />
        </div>
        <div className={styles.cutCardSide}>
          <div className={styles.cutCardSideTitle}>
            {side2.label} — {side2.result.target.toFixed(3)}"
          </div>
          <StackList stack={side2.result.stack} />
        </div>
      </div>
    </div>
  );
}

export function FullSetupMode() {
  const setup = useFullSetup();
  const { inputs, handleInputChange } = setup;
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
        {/* Order + Company */}
        <div className={styles.flexRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Order #</label>
            <input
              type="text"
              placeholder="e.g. 12345"
              value={inputs.orderNumber}
              onChange={(e) => handleInputChange("orderNumber", e.target.value)}
              className={styles.inputNoMargin}
            />
          </div>
          <div className={styles.flex1}>
            <label className={styles.label}>Company</label>
            <input
              type="text"
              placeholder="e.g. Acme Steel"
              value={inputs.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className={styles.inputNoMargin}
            />
          </div>
        </div>

        {/* Coil Width + Weight + Gauge */}
        <div className={styles.flexRow}>
          <div className={styles.flex1}>
            <label className={styles.label}>Coil Width</label>
            <input
              type="number"
              step="0.001"
              placeholder='e.g. 48.000"'
              value={inputs.coilWidth}
              onChange={(e) => handleInputChange("coilWidth", e.target.value)}
              className={styles.inputNoMargin}
            />
          </div>
          <div className={styles.flex1}>
            <label className={styles.label}>Coil Weight</label>
            <input
              type="text"
              placeholder="e.g. 10000 lbs"
              value={inputs.coilWeight}
              onChange={(e) => handleInputChange("coilWeight", e.target.value)}
              className={styles.inputNoMargin}
            />
          </div>
          <div className={styles.flex1}>
            <label className={styles.label}>Gauge (inches)</label>
            <input
              type="number"
              step="0.001"
              placeholder='e.g. 0.036"'
              value={inputs.gauge}
              onChange={(e) => handleInputChange("gauge", e.target.value)}
              className={styles.inputNoMargin}
            />
          </div>
        </div>

        {/* Knife + Clearance */}
        <div className={styles.flexRowTop}>
          <div className={styles.flex1}>
            <label className={styles.label}>Knife Size</label>
            <select
              value={inputs.knifeSize}
              onChange={(e) => handleInputChange("knifeSize", e.target.value)}
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
              value={inputs.clearance}
              onChange={(e) => handleInputChange("clearance", e.target.value)}
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
              checked={inputs.strictMode}
              onChange={(e) => handleInputChange("strictMode", e.target.checked)}
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
          <button onClick={() => window.print()} className={styles.btnPrint}>
            Print Setup
          </button>
          <div className={styles.printArea}>
          {/* Summary Banner */}
          <div className={styles.recommendationBox}>
            <p className={styles.recTitle}>Setup Summary</p>
            {(setup.result.orderNumber || setup.result.companyName) && (
              <p className={styles.recCount}>
                {setup.result.orderNumber && (
                  <>Order: <strong>{setup.result.orderNumber}</strong></>
                )}
                {setup.result.orderNumber && setup.result.companyName && " | "}
                {setup.result.companyName && (
                  <>Company: <strong>{setup.result.companyName}</strong></>
                )}
              </p>
            )}
            <p className={styles.recValue}>
              {setup.result.grandTotalTools} tools | {setup.result.totalKnives} knives
            </p>
            <p className={styles.recCount}>
              Coil Width: <strong>{setup.result.coilWidth.toFixed(3)}"</strong>
              {setup.result.coilWeight && (
                <> | Weight: <strong>{setup.result.coilWeight} lbs</strong></>
              )}
              {setup.result.gauge && (
                <> | Gauge: <strong>{parseFloat(setup.result.gauge).toFixed(3)}"</strong></>
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
          <SetupCard
            title="Opening Shoulders"
            side1={{ label: "Bottom", result: setup.result.bottomOpening }}
            side2={{ label: "Top", result: setup.result.topOpening }}
          />

          {/* Setup Sheet — one card per strip */}
          {setup.result.stripResults.map((sr, i) => (
            <SetupCard
              key={`${sr.stripWidth}-${i}`}
              title={`${sr.stripWidth.toFixed(3)}" x${sr.quantity}`}
              extraHeader={
                sr.dualResult.offset !== 0 && (
                  <span>
                    Offset: {sr.dualResult.offset > 0 ? "+" : ""}
                    {sr.dualResult.offset.toFixed(3)}"
                  </span>
                )
              }
              side1={{
                label: "Male",
                result: sr.dualResult.maleResult
              }}
              side2={{
                label: "Female",
                result: sr.dualResult.femaleResult
              }}
            />
          ))}

          {/* Closing Shoulders */}
          <SetupCard
            title="Closing Shoulders"
            side1={{ label: "Bottom", result: setup.result.bottomClosing }}
            side2={{ label: "Top", result: setup.result.topClosing }}
          />
          </div>{/* end printArea */}
        </div>
      )}
    </div>
  );
}
