import { ToolingSetup, summarizeAndSortStack } from "./toolingLogic";
import { styles } from "./styles";

interface ResultDisplayProps {
  result: ToolingSetup;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  if (!result || !result.stack) return null;

  // Use the logic already in toolingLogic
  const summary = summarizeAndSortStack(result.stack);

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