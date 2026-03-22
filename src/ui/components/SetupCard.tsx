import React from "react";
import { ToolSummary, formatInches } from "../../core/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function StackList({ summary }: { summary: ToolSummary[] }) {
  return (
    <div className="my-2 text-sm grid grid-cols-[minmax(2.5rem,auto)_auto] gap-x-4 justify-center">
      {summary.map((s, i) => (
        <React.Fragment key={i}>
          <div className="py-1 border-b border-slate-50 font-bold text-slate-400 tabular-nums text-right">
            {s.count} x
          </div>
          <div className="py-1 border-b border-slate-50 font-black text-slate-800 tabular-nums tracking-tight text-left">
            {formatInches(s.size)}"
            {s.label && <span className="ml-1 text-primary italic font-black uppercase text-[10px] print:text-black print:not-italic">{s.label}</span>}
          </div>
        </React.Fragment>
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
    <Card className="break-inside-avoid border shadow-md overflow-hidden transition-all hover:shadow-lg print:shadow-none print:border-black print:border-2">
      <CardHeader className="bg-slate-50 py-3 border-b border-slate-200 print:border-black print:bg-transparent">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-extrabold text-slate-800 tracking-tight print:text-black">{title}</CardTitle>
          {extraHeader}
        </div>
      </CardHeader>
      <CardContent className="p-0 bg-white print:bg-transparent">
        <div className="grid grid-cols-2 divide-x divide-slate-100 print:divide-black print:divide-x-2">
          <div className="p-4 flex flex-col items-center h-full bg-indigo-50/5">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 w-full text-center">
              {side1.label}
            </div>
            <div className="flex-grow w-full">
              <StackList summary={side1.summary} />
            </div>
            <div className={`mt-4 pt-3 border-t border-slate-100 text-center font-black text-xl tracking-tighter w-full ${side1.isFemale ? "text-primary bg-primary/5 rounded-lg py-2 mt-2 border-primary/10 shadow-inner print:border-2 print:border-black print:bg-transparent" : "text-slate-900"}`}>
              {formatInches(side1.target)}"
            </div>
          </div>
          <div className="p-4 flex flex-col items-center h-full bg-slate-50/10">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 w-full text-center">
              {side2.label}
            </div>
            <div className="flex-grow w-full">
              <StackList summary={side2.summary} />
            </div>
            <div className={`mt-4 pt-3 border-t border-slate-100 text-center font-black text-xl tracking-tighter w-full ${side2.isFemale ? "text-primary bg-primary/5 rounded-lg py-2 mt-2 border-primary/10 shadow-inner print:border-2 print:border-black print:bg-transparent" : "text-slate-900"}`}>
              {formatInches(side2.target)}"
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
