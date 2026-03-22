import React from "react";
import { FullSetupResult, ArborCut, GroupedArborCut } from "../../../core/engine";
import { formatInches, ToolSummary } from "../../../core/utils";

interface PrintViewProps {
  result: FullSetupResult;
  viewMode: 'short' | 'long';
}

function PrintStack({ summary }: { summary: ToolSummary[] }) {
  return (
    <div className="grid grid-cols-[minmax(1.5rem,auto)_auto] gap-x-3 justify-center text-xs font-bold tabular-nums">
      {summary.map((s, i) => (
        <React.Fragment key={i}>
          <div className="text-right py-0.5 border-b border-black/10 last:border-0">
            {s.count} x
          </div>
          <div className="text-left py-0.5 border-b border-black/10 last:border-0">
            {formatInches(s.size)}"{s.label ? ` [${s.label}]` : ""}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function PrintArborCell({ summary, target, isFemale }: { 
  summary: ToolSummary[]; 
  target: number; 
  isFemale?: boolean;
}) {
  return (
    <div className="flex flex-col items-center py-2 h-full">
      <div className="flex-grow w-full">
        <PrintStack summary={summary} />
      </div>
      <div className={`mt-2 w-[70px] text-center font-black text-sm tabular-nums ${
        isFemale 
          ? "border-2 border-black bg-slate-50 py-0.5" 
          : "border-t border-black pt-1"
      }`}>
        {formatInches(target)}"
        {isFemale && <span className="text-[7px] ml-0.5 block -mt-1 uppercase opacity-60">FEMALE</span>}
      </div>
    </div>
  );
}

export function PrintView({ result, viewMode }: PrintViewProps) {
  const cutsToDisplay = viewMode === 'short' ? result.groupedCuts : result.cuts;

  return (
    <div className="hidden print-only w-full text-[9pt] leading-tight font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b-2 border-black mb-4 pb-1">
        <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Slitter Setup Sheet</h1>
        <div className="text-right flex flex-col items-end">
          <span className="text-[8px] font-black uppercase opacity-60 leading-none mb-0.5">ORD: {result.orderNumber || "---"}</span>
          <span className="text-[10px] font-bold leading-none">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* JOB INFO GRID */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-2 border border-black/20 bg-slate-50/50 rounded-sm text-[8pt]">
        <div>
          <div className="text-[7px] font-black uppercase text-slate-500 leading-none mb-1 tracking-tighter">Job / Customer</div>
          <div className="font-black truncate uppercase">{result.orderNumber || "---"} | {result.companyName || "---"}</div>
        </div>
        <div className="border-x border-black/10 px-4">
          <div className="text-[7px] font-black uppercase text-slate-500 leading-none mb-1 tracking-tighter">Material Width / Gauge</div>
          <div className="font-black tabular-nums">{formatInches(result.coilWidth)}" @ {result.gauge || "---"}"</div>
        </div>
        <div className="pl-2">
          <div className="text-[7px] font-black uppercase text-slate-500 leading-none mb-1 tracking-tighter">Setup Settings</div>
          <div className="font-bold tabular-nums text-[7pt]">CLR: {formatInches(result.clearance)}" | TRIM: {formatInches(result.edgeTrim)}"</div>
        </div>
      </div>

      {/* MAIN TOOLING TABLE */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-[7px] font-black uppercase tracking-widest text-slate-500">
            <th className="text-left py-2 px-1 w-[120px]">Station / Width</th>
            <th className="text-center py-2 px-1">Bottom Arbor</th>
            <th className="text-center py-2 px-1">Top Arbor</th>
          </tr>
        </thead>
        <tbody>
          {/* OPENING SHOULDERS */}
          <tr className="border-b border-black/20 page-break-inside-avoid">
            <td className="py-2 px-1">
              <div className="text-[7px] font-black uppercase text-slate-400">Station 0</div>
              <div className="text-sm font-black leading-tight uppercase">Opening<br/>Shoulder</div>
            </td>
            <td className="border-x border-black/10">
              <PrintArborCell 
                summary={result.bottomOpeningSummary} 
                target={result.bottomOpening.target} 
              />
            </td>
            <td>
              <PrintArborCell 
                summary={result.topOpeningSummary} 
                target={result.topOpening.target} 
              />
            </td>
          </tr>

          {/* CUTS */}
          {cutsToDisplay.map((item, i) => {
            const isGrouped = 'count' in item;
            const data = isGrouped ? (item as GroupedArborCut).cut : (item as ArborCut);
            const indexLabel = isGrouped 
              ? (item as GroupedArborCut).count > 1 
                ? `Cuts ${(item as GroupedArborCut).startIdx}–${(item as GroupedArborCut).endIdx}`
                : `Cut ${(item as GroupedArborCut).startIdx}`
              : `Cut ${data.cutIndex}`;
            
            const countLabel = isGrouped && (item as GroupedArborCut).count > 1 
              ? ` (${(item as GroupedArborCut).count}x)` 
              : "";

            return (
              <tr key={i} className="border-b border-black/20 page-break-inside-avoid">
                <td className="py-2 px-1">
                  <div className="text-[7px] font-black uppercase text-slate-400">{indexLabel}{countLabel}</div>
                  <div className="text-base font-black tabular-nums">{formatInches(data.width)}"</div>
                </td>
                <td className="border-x border-black/10">
                  <PrintArborCell 
                    summary={data.bottomSummary} 
                    target={data.bottomStack.target} 
                    isFemale={data.type === 'female-bottom'}
                  />
                </td>
                <td>
                  <PrintArborCell 
                    summary={data.topSummary} 
                    target={data.topStack.target} 
                    isFemale={data.type === 'male-bottom'}
                  />
                </td>
              </tr>
            );
          })}

          {/* CLOSING SHOULDERS */}
          <tr className="border-b-2 border-black page-break-inside-avoid">
            <td className="py-2 px-1">
              <div className="text-[7px] font-black uppercase text-slate-400">Final Station</div>
              <div className="text-sm font-black leading-tight uppercase">Closing<br/>Shoulder</div>
            </td>
            <td className="border-x border-black/10">
              <PrintArborCell 
                summary={result.bottomClosingSummary} 
                target={result.bottomClosing.target} 
              />
            </td>
            <td>
              <PrintArborCell 
                summary={result.topClosingSummary} 
                target={result.topClosing.target} 
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* COMPACT FOOTER SUMMARY */}
      <div className="mt-6 flex justify-between items-end bg-slate-50 p-3 border border-black/20 rounded-sm page-break-inside-avoid">
        <div>
          <div className="text-[7px] font-black uppercase text-slate-500 tracking-tighter leading-none mb-1">Tooling Configuration Summary</div>
          <div className="text-sm font-black leading-none uppercase">
            Tools: <span className="tabular-nums">{result.grandTotalTools}</span> | 
            Knives: <span className="tabular-nums">{result.totalKnives}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[7px] font-black uppercase text-slate-500 tracking-tighter leading-none mb-1">Arbor Physical Space Used</div>
          <div className="text-xs font-bold tabular-nums leading-none">
            BOTTOM: {formatInches(result.bottomArborUsed)}" / TOP: {formatInches(result.topArborUsed)}"
          </div>
        </div>
      </div>
    </div>
  );
}
