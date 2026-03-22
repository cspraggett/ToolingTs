import { summarizeStack, formatInches } from "../../core/utils";
import { SolverResult } from "../../core/solver";

interface ResultDisplayProps {
  result: SolverResult;
  labels?: Record<number, string>;
}

export function ResultDisplay({ result, labels }: ResultDisplayProps) {
  const summary = summarizeStack(result.stack, labels);

  return (
    <ul className="space-y-2 text-lg">
      {summary.map((item) => (
        <li key={item.size} className="flex justify-between items-center bg-background border rounded-md px-4 py-2 shadow-sm">
          <span className="font-semibold text-primary">
            {formatInches(item.size)}"{item.label ? ` ${item.label}` : ""}
          </span>
          <span className="text-muted-foreground font-medium">
            x {item.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
