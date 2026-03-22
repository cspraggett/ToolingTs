import { summarizeStack, formatInches } from "../../core/utils";
import { SolverResult } from "../../core/solver";
import styles from "../styles.module.css";

interface ResultDisplayProps {
  result: SolverResult;
  labels?: Record<number, string>;
}

export function ResultDisplay({ result, labels }: ResultDisplayProps) {
  const summary = summarizeStack(result.stack, labels);

  return (
    <ul className={styles.list}>
      {summary.map((item) => (
        <li key={item.size} className={styles.listItem}>
          <span className={styles.listItemSize}>
            {formatInches(item.size)}"{item.label ? ` ${item.label}` : ""}
          </span>
          <span className={styles.listItemCount}>
            x {item.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
