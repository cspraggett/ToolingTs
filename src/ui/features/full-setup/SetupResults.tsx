import { useState } from "react";
import { formatInches } from "../../../core/utils";
import { GroupedArborCut, FullSetupResult } from "../../../core/engine";
import styles from "../../styles.module.css";
import { SetupCard } from "../../components/SetupCard";

interface SetupResultsProps {
  result: FullSetupResult;
}

export function SetupResults({ result }: SetupResultsProps) {
  const [viewMode, setViewMode] = useState<'short' | 'long'>('short');

  return (
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
          {(result.orderNumber || result.companyName) && (
            <p className={styles.recCount} style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              {result.orderNumber && (
                <>Order: <strong>{result.orderNumber}</strong></>
              )}
              {result.orderNumber && result.companyName && " | "}
              {result.companyName && (
                <>Company: <strong>{result.companyName}</strong></>
              )}
            </p>
          )}
          <p className={styles.recCount}>
            Coil Width: <strong>{formatInches(result.coilWidth)}"</strong>
            {result.coilWeight && (
              <> | Weight: <strong>{result.coilWeight} lbs</strong></>
            )}
            {result.gauge && (
              <> | Gauge: <strong>{formatInches(parseFloat(result.gauge))}"</strong></>
            )}
            {" | "} Clearance: <strong>{formatInches(result.clearance)}"</strong>
          </p>
          <p className={styles.recCount}>
            Edge Trim: <strong>{formatInches(result.edgeTrim)}"</strong>
            {" | "}
            Setup Width: <strong>{formatInches(result.stripTotal)}"</strong>
            {!result.shouldersValid && (
              <span style={{ color: "red" }}> (Shoulders below 1"!)</span>
            )}
          </p>
          <p className={styles.recCount}>
            Bottom Arbor: <strong>{formatInches(result.bottomArborUsed)}"</strong>
            {" | "}
            Top Arbor: <strong>{formatInches(result.topArborUsed)}"</strong>
          </p>
          <p className={styles.recCount} style={{ marginTop: "0.5rem", borderTop: "1px solid #ddd", paddingTop: "0.5rem" }}>
            Total: {result.grandTotalTools} tools | {result.totalKnives} knives
          </p>
        </div>

        {/* Opening Shoulders */}
        <SetupCard
          title="Opening Shoulders"
          side1={{ label: "Bottom", target: result.bottomOpening.target, summary: result.bottomOpeningSummary }}
          side2={{ label: "Top", target: result.topOpening.target, summary: result.topOpeningSummary }}
        />

        {/* Setup Sheet */}
        {viewMode === 'short' ? (
          // Short View: Grouped consecutive cuts
          result.groupedCuts.map((group: GroupedArborCut, i: number) => (
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
          result.cuts.map((s, i) => (
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
          side1={{ label: "Bottom", target: result.bottomClosing.target, summary: result.bottomClosingSummary }}
          side2={{ label: "Top", target: result.topClosing.target, summary: result.topClosingSummary }}
        />
      </div>{/* end printArea */}
    </div>
  );
}
