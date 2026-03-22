import { summarizeStack, formatInches } from "../../core/utils";
import { SolverResult } from "../../core/solver";

interface ResultDisplayProps {
  result: SolverResult;
  labels?: Record<number, string>;
}

export function ResultDisplay({ result, labels }: ResultDisplayProps) {
  const summary = summarizeStack(result.stack, labels);

  return (
    <ul className="grid gap-2 grid-cols-1 sm:grid-cols-2">
      {summary.map((item) => (
        <li key={item.size} className="flex justify-between items-center bg-slate-50/50 border-2 border-slate-100 rounded-xl px-4 py-3 shadow-sm hover:border-primary/20 transition-colors">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Size</span>
            <span className="font-black text-xl text-primary tabular-nums tracking-tighter">
              {formatInches(item.size)}"
              {item.label && <span className="ml-1 text-primary/60 italic font-black uppercase text-xs">{item.label}</span>}
            </span>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Qty</span>
            <span className="text-slate-900 font-black text-xl tabular-nums">
              {item.count}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
