import { useState } from "react";
import { MACHINES } from "../../config/machine-profiles";
import { ToolSummary, formatInches } from "../../core/utils";
import { GroupedArborCut } from "../../core/engine";
import styles from "../styles.module.css";
import { useFullSetup } from "./useFullSetup";

function StackList({ summary }: { summary: ToolSummary[] }) {
  return (
    <div className={styles.stackList}>
      {summary.map((s, i) => (
        <div key={i} className={styles.stackLine}>
          {s.count} x {formatInches(s.size)}"
        </div>
      ))}
    </div>
  );
}

interface SetupCardProps {
  title: string;
  side1: { label: string; target: number; summary: ToolSummary[]; isFemale?: boolean };
  side2: { label: string; target: number; summary: ToolSummary[]; isFemale?: boolean };
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
            {side1.label}
          </div>
          <StackList summary={side1.summary} />
          <div className={styles.targetSize}>
            <span className={side1.isFemale ? styles.femaleTargetBox : ""}>
              {formatInches(side1.target)}"
            </span>
          </div>
        </div>
        <div className={styles.cutCardSide}>
          <div className={styles.cutCardSideTitle}>
            {side2.label}
          </div>
          <StackList summary={side2.summary} />
          <div className={styles.targetSize}>
            <span className={side2.isFemale ? styles.femaleTargetBox : ""}>
              {formatInches(side2.target)}"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FullSetupMode() {
  const setup = useFullSetup();
  const { inputs, handleInputChange } = setup;
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [viewMode, setViewMode] = useState<'short' | 'long'>('short');

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
                  {formatInches(k)}"
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
          <div className={styles.btnGroup}>
            <button onClick={() => window.print()} className={styles.btnPrint}>
              Print Setup
            </button>
            <div className={styles.viewToggle}>
              <button 
                className={viewMode === 'short' ? styles.viewToggleActive : styles.viewToggleBtn}
                onClick={() => setViewMode('short')}
              >
                Short View
              </button>
              <button 
                className={viewMode === 'long' ? styles.viewToggleActive : styles.viewToggleBtn}
                onClick={() => setViewMode('long')}
              >
                Long View
              </button>
            </div>
          </div>

          <div className={styles.printArea}>
          {/* Summary Banner */}
          <div className={styles.recommendationBox}>
            <p className={styles.recTitle}>Setup Summary</p>
            {(setup.result.orderNumber || setup.result.companyName) && (
              <p className={styles.recCount} style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                {setup.result.orderNumber && (
                  <>Order: <strong>{setup.result.orderNumber}</strong></>
                )}
                {setup.result.orderNumber && setup.result.companyName && " | "}
                {setup.result.companyName && (
                  <>Company: <strong>{setup.result.companyName}</strong></>
                )}
              </p>
            )}
            <p className={styles.recCount}>
              Coil Width: <strong>{formatInches(setup.result.coilWidth)}"</strong>
              {setup.result.coilWeight && (
                <> | Weight: <strong>{setup.result.coilWeight} lbs</strong></>
              )}
              {setup.result.gauge && (
                <> | Gauge: <strong>{formatInches(parseFloat(setup.result.gauge))}"</strong></>
              )}
              {" | "} Clearance: <strong>{formatInches(setup.result.clearance)}"</strong>
            </p>
            <p className={styles.recCount}>
              Edge Trim: <strong>{formatInches(setup.result.edgeTrim)}"</strong>
              {" | "}
              Setup Width: <strong>{formatInches(setup.result.stripTotal)}"</strong>
              {!setup.result.shouldersValid && (
                <span style={{ color: "red" }}> (Shoulders below 1"!)</span>
              )}
            </p>
            <p className={styles.recCount}>
              Bottom Arbor: <strong>{formatInches(setup.result.bottomArborUsed)}"</strong>
              {" | "}
              Top Arbor: <strong>{formatInches(setup.result.topArborUsed)}"</strong>
            </p>
            <p className={styles.recCount} style={{ marginTop: "0.5rem", borderTop: "1px solid #ddd", paddingTop: "0.5rem" }}>
              Total: {setup.result.grandTotalTools} tools | {setup.result.totalKnives} knives
            </p>
          </div>

          {/* Opening Shoulders */}
          <SetupCard
            title="Opening Shoulders"
            side1={{ label: "Bottom", target: setup.result.bottomOpening.target, summary: setup.result.bottomOpeningSummary }}
            side2={{ label: "Top", target: setup.result.topOpening.target, summary: setup.result.topOpeningSummary }}
          />

          {/* Setup Sheet */}
          {viewMode === 'short' ? (
            // Short View: Grouped consecutive cuts
            setup.result.groupedCuts.map((group: GroupedArborCut, i: number) => (
              <SetupCard
                key={`group-${i}`}
                title={group.count > 1 
                  ? `${formatInches(group.cut.width)}" x ${group.count} (Cuts ${group.startIdx}–${group.endIdx})`
                  : `Cut ${group.startIdx}: ${formatInches(group.cut.width)}"`
                }
                side1={{
                  label: "Bottom",
                  target: group.cut.bottomStack.target,
                  summary: group.cut.bottomSummary,
                  isFemale: group.cut.type === 'female-bottom'
                }}
                side2={{
                  label: "Top",
                  target: group.cut.topStack.target,
                  summary: group.cut.topSummary,
                  isFemale: group.cut.type === 'male-bottom'
                }}
              />
            ))
          ) : (
            // Long View: Every cut listed individually
            setup.result.cuts.map((s, i) => (
              <SetupCard
                key={`cut-${s.cutIndex}-${i}`}
                title={`Cut ${s.cutIndex}: ${formatInches(s.width)}"`}
                side1={{
                  label: s.type === 'male-bottom' ? "Bottom (Male)" : "Bottom (Female)",
                  target: s.bottomStack.target,
                  summary: s.bottomSummary,
                  isFemale: s.type === 'female-bottom'
                }}
                side2={{
                  label: s.type === 'male-bottom' ? "Top (Female)" : "Top (Male)",
                  target: s.topStack.target,
                  summary: s.topSummary,
                  isFemale: s.type === 'male-bottom'
                }}
              />
            ))
          )}

          {/* Closing Shoulders */}
          <SetupCard
            title="Closing Shoulders"
            side1={{ label: "Bottom", target: setup.result.bottomClosing.target, summary: setup.result.bottomClosingSummary }}
            side2={{ label: "Top", target: setup.result.topClosing.target, summary: setup.result.topClosingSummary }}
          />
          </div>{/* end printArea */}
        </div>
      )}
    </div>
  );
}
