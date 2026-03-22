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
        <div key={i} className="print-stack-item flex justify-between">
          <span className="font-bold tabular-nums">{s.count} x</span>
          <span className="font-black tabular-nums">{formatInches(s.size)}"{s.label ? ` [${s.label}]` : ""}</span>
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
    <div className="print-card w-full">
      <div className="print-card-title uppercase tracking-tighter">{title}</div>
      <div className="flex divide-x-2 divide-black">
        <div className="w-1/2 p-4 flex flex-col h-full">
          <div className="print-label mb-2 border-b border-black/10 pb-1">{side1.label}</div>
          <div className="flex-grow">
            <PrintStack summary={side1.summary} />
          </div>
          <div className={`print-target mt-4 border-t-2 border-black pt-3 ${side1.isFemale ? "bg-slate-100" : ""}`}>
            <span className="text-[10px] block font-black leading-none opacity-50 mb-1">TARGET</span>
            {formatInches(side1.target)}"
          </div>
        </div>
        <div className="w-1/2 p-4 flex flex-col h-full">
          <div className="print-label mb-2 border-b border-black/10 pb-1">{side2.label}</div>
          <div className="flex-grow">
            <PrintStack summary={side2.summary} />
          </div>
          <div className={`print-target mt-4 border-t-2 border-black pt-3 ${side2.isFemale ? "bg-slate-100" : ""}`}>
            <span className="text-[10px] block font-black leading-none opacity-50 mb-1">TARGET</span>
            {formatInches(side2.target)}"
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrintView({ result, viewMode }: PrintViewProps) {
  const cutsToDisplay = viewMode === 'short' ? result.groupedCuts : result.cuts;
  
  // Strictly group cuts into batches of 3
  const cutChunks: any[][] = [];
  for (let i = 0; i < cutsToDisplay.length; i += 3) {
    cutChunks.push(cutsToDisplay.slice(i, i + 3));
  }

  return (
    <div className="hidden print-only w-full">
      {/* PAGE 1: Header + Opening Shoulders + First Chunk of 3 */}
      <div className="print-page">
        <div className="print-header flex justify-between items-end pb-2 mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 leading-none mb-1">MASTER PRODUCTION</span>
            <span className="text-3xl font-black tracking-tighter">SLITTER SETUP SHEET</span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] font-black tracking-widest text-slate-500 leading-none mb-1">DATE GENERATED</span>
            <span className="text-sm font-black">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8 p-4 border-2 border-black rounded-sm bg-slate-50/50">
          <div className="border-r border-black/20 pr-4">
            <div className="print-label mb-1">Job Details</div>
            <div className="font-black text-xl leading-tight">ORD: {result.orderNumber || "---"}</div>
            <div className="font-bold text-xs uppercase opacity-70">CO: {result.companyName || "---"}</div>
          </div>
          <div className="border-r border-black/20 px-4">
            <div className="print-label mb-1">Material Info</div>
            <div className="font-black text-xl leading-tight">WIDTH: {formatInches(result.coilWidth)}"</div>
            <div className="font-bold text-xs uppercase opacity-70">GAUGE: {result.gauge ? `${formatInches(parseFloat(result.gauge))}"` : "---"}</div>
          </div>
          <div className="pl-4">
            <div className="print-label mb-1">Constants</div>
            <div className="font-bold text-sm">CLEARANCE: {formatInches(result.clearance)}"</div>
            <div className="font-bold text-sm">EDGE TRIM: {formatInches(result.edgeTrim)}"</div>
          </div>
        </div>

        <div className="space-y-6">
          <PrintSetupCard
            title="OPENING SHOULDERS"
            side1={{ label: "Bottom", target: result.bottomOpening.target, summary: result.bottomOpeningSummary }}
            side2={{ label: "Top", target: result.topOpening.target, summary: result.topOpeningSummary }}
          />

          {/* First 3 Cuts */}
          {cutChunks[0]?.map((item, i) => {
            const isGrouped = 'count' in item;
            const key = isGrouped ? `p1-g-${i}` : `p1-c-${(item as ArborCut).cutIndex}`;
            const title = isGrouped 
              ? (item as GroupedArborCut).count > 1 
                ? `CUTS ${(item as GroupedArborCut).startIdx}–${(item as GroupedArborCut).endIdx} (${formatInches((item as GroupedArborCut).cut.width)}" x ${(item as GroupedArborCut).count})`
                : `CUT ${(item as GroupedArborCut).startIdx} (${formatInches((item as GroupedArborCut).cut.width)}")`
              : `CUT ${(item as ArborCut).cutIndex} (${formatInches((item as ArborCut).width)}")`;
            
            const data = isGrouped ? (item as GroupedArborCut).cut : (item as ArborCut);

            return (
              <PrintSetupCard
                key={key}
                title={title}
                side1={{ label: "Bottom", target: data.bottomStack.target, summary: data.bottomSummary, isFemale: data.type === 'female-bottom' }}
                side2={{ label: "Top", target: data.topStack.target, summary: data.topSummary, isFemale: data.type === 'male-bottom' }}
              />
            );
          })}
        </div>
      </div>

      {/* SUBSEQUENT PAGES: 3 Cuts per page */}
      {cutChunks.slice(1).map((chunk, chunkIdx) => (
        <div key={`page-${chunkIdx + 2}`} className="print-page">
          <div className="print-header text-sm py-2 mb-8 opacity-50 border-b-2 border-black flex justify-between">
            <span>ORD: {result.orderNumber} | CO: {result.companyName}</span>
            <span>PAGE {chunkIdx + 2}</span>
          </div>
          <div className="space-y-8">
            {chunk.map((item, i) => {
              const isGrouped = 'count' in item;
              const key = isGrouped ? `p${chunkIdx + 2}-g-${i}` : `p${chunkIdx + 2}-c-${(item as ArborCut).cutIndex}`;
              const title = isGrouped 
                ? (item as GroupedArborCut).count > 1 
                  ? `CUTS ${(item as GroupedArborCut).startIdx}–${(item as GroupedArborCut).endIdx} (${formatInches((item as GroupedArborCut).cut.width)}" x ${(item as GroupedArborCut).count})`
                  : `CUT ${(item as GroupedArborCut).startIdx} (${formatInches((item as GroupedArborCut).cut.width)}")`
                : `CUT ${(item as ArborCut).cutIndex} (${formatInches((item as ArborCut).width)}")`;
              
              const data = isGrouped ? (item as GroupedArborCut).cut : (item as ArborCut);

              return (
                <PrintSetupCard
                  key={key}
                  title={title}
                  side1={{ label: "Bottom", target: data.bottomStack.target, summary: data.bottomSummary, isFemale: data.type === 'female-bottom' }}
                  side2={{ label: "Top", target: data.topStack.target, summary: data.topSummary, isFemale: data.type === 'male-bottom' }}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* FINAL PAGE: Closing Shoulders + Totals summary */}
      <div className="print-page">
        <div className="print-header text-sm py-2 mb-8 opacity-50 border-b-2 border-black flex justify-between font-black">
          <span>CLOSING SUMMARY</span>
          <span>ORD: {result.orderNumber}</span>
        </div>
        
        <div className="space-y-12">
          <PrintSetupCard
            title="CLOSING SHOULDERS"
            side1={{ label: "Bottom", target: result.bottomClosing.target, summary: result.bottomClosingSummary }}
            side2={{ label: "Top", target: result.topClosing.target, summary: result.topClosingSummary }}
          />

          <div className="border-t-8 border-black pt-8 grid grid-cols-2 gap-12">
            <div>
              <div className="print-label text-xs mb-2">Final Tooling Counts</div>
              <div className="text-3xl font-black tracking-tighter">TOOLS: {result.grandTotalTools}</div>
              <div className="text-3xl font-black tracking-tighter">KNIVES: {result.totalKnives}</div>
            </div>
            <div className="text-right">
              <div className="print-label text-xs mb-2">Total Arbor Space Occupied</div>
              <div className="text-2xl font-black tracking-tighter">BOTTOM: {formatInches(result.bottomArborUsed)}"</div>
              <div className="text-2xl font-black tracking-tighter">TOP: {formatInches(result.topArborUsed)}"</div>
            </div>
          </div>
          
          <div className="mt-24 border-2 border-dashed border-black/20 p-8 rounded-lg text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">End of Setup Sheet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
