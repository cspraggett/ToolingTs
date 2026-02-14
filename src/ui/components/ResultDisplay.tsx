// src/ResultDisplay.tsx
import { summarizeStack } from "../../core/utils"; // <--- NEW IMPORT
import { SolverResult } from "../../core/solver";  // <--- NEW IMPORT
import { styles } from "../styles";

interface ResultDisplayProps {
  result: SolverResult; // Updated type
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  // Guard clause
  if (!result || !result.stack) return null;

  // Use the new pure function
  const summary = summarizeStack(result.stack);

  return (
    <ul style={styles.list}>
      {summary.map((item) => (
        <li key={item.size} style={styles.listItem}>
          <span style={{ fontWeight: "bold", color: "#2d3748" }}>
            {item.size.toFixed(3)}"
          </span>
          <span style={{ color: "#718096" }}>
            x {item.count}
          </span>
        </li>
      ))}
    </ul>
  );
}