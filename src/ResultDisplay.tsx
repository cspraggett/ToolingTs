import React from "react";
import { summarizeAndSortStack, type ToolingSetup } from "./toolingLogic";
import { styles } from "./styles";

// 1. Define what data this component needs to work
interface ResultDisplayProps {
  result: ToolingSetup; // We reuse the type we made earlier!
}

// 2. The Component
export function ResultDisplay({ result }: ResultDisplayProps) {
  return (
    <>
      <p style={styles.resultHeader}>
        {result.width.toFixed(3)}" Setup
      </p>

      <ul style={styles.list}>
        {summarizeAndSortStack(result.stack).map((item) => (
          <li key={item.size} style={styles.listItem}>
            <span>{item.size.toFixed(3)}"</span>
            <span>× {item.count}</span>
          </li>
        ))}
      </ul>
    </>
  );
}