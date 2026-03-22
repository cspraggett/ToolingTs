import { summarizeStack, formatInches } from "../../core/utils";
import { SolverResult } from "../../core/solver";
import styles from "../styles.module.css";

interface ResultDisplayProps {
  result: SolverResult;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  const summary = summarizeStack(result.stack);

  return (
    <ul className={styles.list}>
      {summary.map((item) => (
        <li key={item.size} className={styles.listItem}>
          <span className={styles.listItemSize}>
            {formatInches(item.size)}"
          </span>
          <span className={styles.listItemCount}>
            x {item.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
