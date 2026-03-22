import React from "react";
import { ToolSummary, formatInches } from "../../core/utils";
import styles from "../styles.module.css";

export function StackList({ summary }: { summary: ToolSummary[] }) {
  return (
    <div className={styles.stackList}>
      {summary.map((s, i) => (
        <div key={i} className={styles.stackLine}>
          {s.count} x {formatInches(s.size)}"{s.label ? ` ${s.label}` : ""}
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

export function SetupCard({ title, side1, side2, extraHeader }: SetupCardProps) {
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
