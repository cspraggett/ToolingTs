import React, { useState } from "react";
import { MACHINES } from "../../../config/machine-profiles";
import { formatInches } from "../../../core/utils";
import styles from "../../styles.module.css";
import { useFullSetup } from "../useFullSetup";

interface SetupFormProps {
  setup: ReturnType<typeof useFullSetup>;
}

export function SetupForm({ setup }: SetupFormProps) {
  const { inputs, handleInputChange } = setup;
  const [showOptimizer, setShowOptimizer] = useState(false);

  return (
    <div className={styles.inputSection}>
      {/* === MACHINE SELECTOR === */}
      <div className={styles.machineSelector} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
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
  );
}
