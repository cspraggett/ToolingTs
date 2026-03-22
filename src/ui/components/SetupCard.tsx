import React from "react";
import { ToolSummary, formatInches } from "../../core/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function StackList({ summary }: { summary: ToolSummary[] }) {
  return (
    <ul className="space-y-1 my-3 text-sm">
      {summary.map((s, i) => (
        <li key={i} className="flex justify-between border-b border-border/50 pb-1 last:border-0">
          <span>{s.count} x</span>
          <span className="font-medium">{formatInches(s.size)}"{s.label ? ` ${s.label}` : ""}</span>
        </li>
      ))}
    </ul>
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
    <Card className="break-inside-avoid">
      <CardHeader className="bg-muted/30 py-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-bold">{title}</CardTitle>
          {extraHeader}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x">
          <div className="p-4 flex flex-col h-full">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {side1.label}
            </div>
            <div className="flex-grow">
              <StackList summary={side1.summary} />
            </div>
            <div className={`mt-4 pt-3 border-t text-center font-bold text-lg ${side1.isFemale ? "bg-primary/10 text-primary border-primary/20 rounded-md py-2 mt-2" : ""}`}>
              {formatInches(side1.target)}"
            </div>
          </div>
          <div className="p-4 flex flex-col h-full">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {side2.label}
            </div>
            <div className="flex-grow">
              <StackList summary={side2.summary} />
            </div>
            <div className={`mt-4 pt-3 border-t text-center font-bold text-lg ${side2.isFemale ? "bg-primary/10 text-primary border-primary/20 rounded-md py-2 mt-2" : ""}`}>
              {formatInches(side2.target)}"
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
