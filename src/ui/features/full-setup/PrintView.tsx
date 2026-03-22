import { FullSetupResult, ArborCut, GroupedArborCut } from "../../../core/engine";
import { formatInches, ToolSummary } from "../../../core/utils";

interface PrintViewProps {
  result: FullSetupResult;
  viewMode: 'short' | 'long';
}

function PrintStack({ summary }: { summary: ToolSummary[] }) {
  return (
    <div className="flex flex-col">
      {summary.map((s, i) => (
        <div key={i} className="print-stack-item flex justify-between py-0.5 border-b border-black/10 last:border-0 text-sm font-bold">
          <span className="tabular-nums">{s.count} x</span>
          <span className="tabular-nums">{formatInches(s.size)}"{s.label ? ` [${s.label}]` : ""}</span>
        </div>
      ))}
    </div>
  );
}

function PrintSetupCard({ title, side1, side2 }: { 
  title: string; 
  side1: { label: string; target: number; summary: ToolSummary[]; isFemale?: boolean };
  side2: { label: string; target: number; summary: ToolSummary[]; isFemale?: boolean };
}) {
  return (
    <div className="print-card w-full mb-2">
      <div className="print-card-title uppercase tracking-tighter py-1 px-2 text-xs bg-slate-100 border-b border-black font-black">{title}</div>
      <div className="flex divide-x divide-black">
        <div className="w-1/2 p-2 flex flex-col h-full">
          <div className="text-[9px] font-black uppercase mb-1">{side1.label}</div>
          <div className="flex-grow">
            <PrintStack summary={side1.summary} />
          </div>
          <div className={`mt-2 border-t border-black pt-1 text-center font-black text-base ${side1.isFemale ? "bg-slate-50" : ""}`}>
            {formatInches(side1.target)}"
          </div>
        </div>
        <div className="w-1/2 p-2 flex flex-col h-full">
          <div className="text-[9px] font-black uppercase mb-1">{side2.label}</div>
          <div className="flex-grow">
            <PrintStack summary={side2.summary} />
          </div>
          <div className={`mt-2 border-t border-black pt-1 text-center font-black text-base ${side2.isFemale ? "bg-slate-50" : ""}`}>
            {formatInches(side2.target)}"
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrintView({ result, viewMode }: PrintViewProps) {
  const cutsToDisplay = viewMode === 'short' ? result.groupedCuts : result.cuts;

  return (
    <div className="hidden print-only w-full text-[9pt] leading-tight">
      {/* HEADER: Only on Page 1 */}
      <div className="flex justify-between items-center border-b-2 border-black mb-3 pb-1">
        <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Slitter Setup Sheet</h1>
        <div className="text-right flex flex-col items-end">
          <span className="text-[7px] font-black uppercase opacity-50 leading-none mb-0.5">ORD: {result.orderNumber}</span>
          <span className="text-[9px] font-bold leading-none">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 p-1.5 border border-black rounded-sm bg-slate-50/30 text-[8pt]">
        <div>
          <div className="text-[7px] font-black uppercase text-slate-500 leading-none mb-0.5 tracking-tighter">Job</div>
          <div className="font-black truncate">{result.orderNumber || "---"} | {result.companyName || "---"}</div>
        </div>
        <div className="border-x border-black/10 px-2">
          <div className="text-[7px] font-black uppercase text-slate-500 leading-none mb-0.5 tracking-tighter">Material</div>
          <div className="font-black truncate">{formatInches(result.coilWidth)}" @ {result.gauge || "---"}"</div>
        </div>
        <div className="pl-1">
          <div className="text-[7px] font-black uppercase text-slate-500 leading-none mb-0.5 tracking-tighter">Constants</div>
          <div className="font-bold truncate text-[7pt]">CLR: {formatInches(result.clearance)}" | TRIM: {formatInches(result.edgeTrim)}"</div>
        </div>
      </div>

      <div className="space-y-1">
        <PrintSetupCard
          title="OPENING SHOULDERS"
          side1={{ label: "Bottom", target: result.bottomOpening.target, summary: result.bottomOpeningSummary }}
          side2={{ label: "Top", target: result.topOpening.target, summary: result.topOpeningSummary }}
        />

        {cutsToDisplay.map((item, i) => {
          const isGrouped = 'count' in item;
          const data = isGrouped ? (item as GroupedArborCut).cut : (item as ArborCut);
          const title = isGrouped 
            ? (item as GroupedArborCut).count > 1 
              ? `CUTS ${(item as GroupedArborCut).startIdx}–${(item as GroupedArborCut).endIdx} (${formatInches(data.width)}" x ${(item as GroupedArborCut).count})`
              : `CUT ${(item as GroupedArborCut).startIdx} (${formatInches(data.width)}")`
            : `CUT ${data.cutIndex} (${formatInches(data.width)}")`;

          return (
            <PrintSetupCard
              key={i}
              title={title}
              side1={{ label: "Bottom", target: data.bottomStack.target, summary: data.bottomSummary, isFemale: data.type === 'female-bottom' }}
              side2={{ label: "Top", target: data.topStack.target, summary: data.topSummary, isFemale: data.type === 'male-bottom' }}
            />
          );
        })}

        <PrintSetupCard
          title="CLOSING SHOULDERS"
          side1={{ label: "Bottom", target: result.bottomClosing.target, summary: result.bottomClosingSummary }}
          side2={{ label: "Top", target: result.topClosing.target, summary: result.topClosingSummary }}
        />

        {/* COMPACT FOOTER SUMMARY */}
        <div className="mt-4 pt-2 border-t-2 border-black flex justify-between items-end bg-slate-50/20 p-2 break-inside-avoid">
          <div>
            <div className="text-[7px] font-black uppercase text-slate-500 tracking-tighter leading-none mb-1">Tooling Totals</div>
            <div className="text-sm font-black leading-none">TOOLS: {result.grandTotalTools} | KNIVES: {result.totalKnives}</div>
          </div>
          <div className="text-right">
            <div className="text-[7px] font-black uppercase text-slate-500 tracking-tighter leading-none mb-1">Arbor Space</div>
            <div className="text-xs font-bold tabular-nums leading-none">B: {formatInches(result.bottomArborUsed)}" / T: {formatInches(result.topArborUsed)}"</div>
          </div>
        </div>
      </div>
    </div>
  );
}

