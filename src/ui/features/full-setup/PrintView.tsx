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
  
  // Group into 4 per page for compactness
  const cutChunks: any[][] = [];
  for (let i = 0; i < cutsToDisplay.length; i += 4) {
    cutChunks.push(cutsToDisplay.slice(i, i + 4));
  }

  return (
    <div className="hidden print-only w-full text-[10pt]">
      {/* PAGE 1: Header + Opening Shoulders + First Chunk */}
      <div className="print-page pb-4">
        <div className="flex justify-between items-center border-b-2 border-black mb-4 pb-1">
          <h1 className="text-xl font-black tracking-tighter uppercase">Slitter Setup Sheet</h1>
          <span className="text-[10px] font-bold">DATE: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 p-2 border border-black rounded-sm bg-slate-50/30 text-[9pt]">
          <div>
            <div className="text-[8px] font-black uppercase text-slate-500 leading-none mb-0.5 tracking-tighter">Job Information</div>
            <div className="font-black">ORD: {result.orderNumber || "---"} | {result.companyName || "---"}</div>
          </div>
          <div className="border-x border-black/10 px-4">
            <div className="text-[8px] font-black uppercase text-slate-500 leading-none mb-0.5 tracking-tighter">Material Info</div>
            <div className="font-black">{formatInches(result.coilWidth)}" @ {result.gauge ? `${formatInches(parseFloat(result.gauge))}"` : "---"}</div>
          </div>
          <div className="pl-2">
            <div className="text-[8px] font-black uppercase text-slate-500 leading-none mb-0.5 tracking-tighter">Setup Targets</div>
            <div className="font-bold">CLR: {formatInches(result.clearance)}" | TRIM: {formatInches(result.edgeTrim)}"</div>
          </div>
        </div>

        <div className="space-y-2">
          <PrintSetupCard
            title="OPENING SHOULDERS"
            side1={{ label: "Bottom", target: result.bottomOpening.target, summary: result.bottomOpeningSummary }}
            side2={{ label: "Top", target: result.topOpening.target, summary: result.topOpeningSummary }}
          />

          {cutChunks[0]?.map((item, i) => {
            const isGrouped = 'count' in item;
            const data = isGrouped ? (item as GroupedArborCut).cut : (item as ArborCut);
            const title = isGrouped 
              ? (item as GroupedArborCut).count > 1 
                ? `CUTS ${(item as GroupedArborCut).startIdx}–${(item as GroupedArborCut).endIdx} (${formatInches(data.width)}" x ${(item as GroupedArborCut).count})`
                : `CUT ${(item as GroupedArborCut).startIdx} (${formatInches(data.width)}")`
              : `CUT ${data.cutIndex} (${formatInches(data.width)}")`;

            return (
              <PrintSetupCard
                key={`p1-${i}`}
                title={title}
                side1={{ label: "Bottom", target: data.bottomStack.target, summary: data.bottomSummary, isFemale: data.type === 'female-bottom' }}
                side2={{ label: "Top", target: data.topStack.target, summary: data.topSummary, isFemale: data.type === 'male-bottom' }}
              />
            );
          })}
        </div>
      </div>

      {/* SUBSEQUENT PAGES */}
      {cutChunks.slice(1).map((chunk, chunkIdx) => (
        <div key={`page-${chunkIdx + 2}`} className="print-page pb-4 pt-2">
          <div className="text-[9px] font-black border-b border-black mb-4 flex justify-between uppercase">
            <span>ORD: {result.orderNumber} | Page {chunkIdx + 2}</span>
          </div>
          <div className="space-y-2">
            {chunk.map((item, i) => {
              const isGrouped = 'count' in item;
              const data = isGrouped ? (item as GroupedArborCut).cut : (item as ArborCut);
              const title = isGrouped 
                ? (item as GroupedArborCut).count > 1 
                  ? `CUTS ${(item as GroupedArborCut).startIdx}–${(item as GroupedArborCut).endIdx} (${formatInches(data.width)}" x ${(item as GroupedArborCut).count})`
                  : `CUT ${(item as GroupedArborCut).startIdx} (${formatInches(data.width)}")`
                : `CUT ${data.cutIndex} (${formatInches(data.width)}")`;

              return (
                <PrintSetupCard
                  key={`p${chunkIdx + 2}-${i}`}
                  title={title}
                  side1={{ label: "Bottom", target: data.bottomStack.target, summary: data.bottomSummary, isFemale: data.type === 'female-bottom' }}
                  side2={{ label: "Top", target: data.topStack.target, summary: data.topSummary, isFemale: data.type === 'male-bottom' }}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* FINAL PAGE SUMMARY */}
      <div className="print-page pt-2 mt-4 border-t-2 border-black">
        <div className="flex justify-between items-start">
          <div className="space-y-4 w-2/3 pr-8">
            <PrintSetupCard
              title="CLOSING SHOULDERS"
              side1={{ label: "Bottom", target: result.bottomClosing.target, summary: result.bottomClosingSummary }}
              side2={{ label: "Top", target: result.topClosing.target, summary: result.topClosingSummary }}
            />
          </div>
          <div className="w-1/3 border-l-2 border-black pl-6 space-y-4">
            <div>
              <div className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Total Tooling</div>
              <div className="text-base font-black">TOOLS: {result.grandTotalTools}</div>
              <div className="text-base font-black">KNIVES: {result.totalKnives}</div>
            </div>
            <div>
              <div className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Arbor Space</div>
              <div className="text-sm font-bold tabular-nums">B: {formatInches(result.bottomArborUsed)}"</div>
              <div className="text-sm font-bold tabular-nums">T: {formatInches(result.topArborUsed)}"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
