import { useState } from "react";
import { formatInches } from "../../../core/utils";
import { GroupedArborCut, FullSetupResult, ArborCut } from "../../../core/engine";
import { SetupCard } from "../../components/SetupCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SetupResultsProps {
  result: FullSetupResult;
}

/**
 * Helper to split an array into chunks of a specific size.
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function SetupResults({ result }: SetupResultsProps) {
  const [viewMode, setViewMode] = useState<'short' | 'long'>('short');

  const cutsToDisplay = viewMode === 'short' ? result.groupedCuts : result.cuts;
  const cutChunks = chunkArray(cutsToDisplay as any[], 3);

  return (
    <div className="mt-8 space-y-6">
      {/* --- WEB VIEW ACTIONS --- */}
      <div className="flex items-center justify-between no-print">
        <div className="space-x-2">
          <Button 
            variant={viewMode === 'short' ? 'default' : 'outline'}
            onClick={() => setViewMode('short')}
          >
            Short View
          </Button>
          <Button 
            variant={viewMode === 'long' ? 'default' : 'outline'}
            onClick={() => setViewMode('long')}
          >
            Long View
          </Button>
        </div>
        <Button onClick={() => window.print()} variant="secondary">
          Print Setup
        </Button>
      </div>

      {/* --- WEB VIEW CONTENT --- */}
      <div className="space-y-6 no-print">
        {/* Summary Banner (Web Only) */}
        <Card className="bg-primary text-primary-foreground border-none shadow-xl relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Setup Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {(result.orderNumber || result.companyName) && (
              <div className="text-2xl font-black tracking-tight leading-tight">
                {result.orderNumber && (
                  <span>Order {result.orderNumber}</span>
                )}
                {result.orderNumber && result.companyName && <span className="mx-3 opacity-40 font-light">|</span>}
                {result.companyName && (
                  <span className="opacity-90">{result.companyName}</span>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Coil Width</span>
                <span className="text-xl font-black tabular-nums tracking-tighter">{formatInches(result.coilWidth)}"</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Gauge / Weight</span>
                <span className="text-xl font-black tracking-tighter">
                  {result.gauge ? `${formatInches(parseFloat(result.gauge))}"` : "N/A"}
                  {result.coilWeight && <span className="text-sm font-bold opacity-70 ml-1">({result.coilWeight}#)</span>}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Edge Trim</span>
                <span className="text-xl font-black tracking-tighter">{formatInches(result.edgeTrim)}"</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Clearance</span>
                <span className="text-xl font-black tracking-tighter">{formatInches(result.clearance)}"</span>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Arbor Used:</span>
                <span className="font-bold tabular-nums">B: {formatInches(result.bottomArborUsed)}" / T: {formatInches(result.topArborUsed)}"</span>
              </div>
              <div className="flex items-baseline space-x-2 md:justify-end">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Total:</span>
                <span className="font-bold">{result.grandTotalTools} tools | {result.totalKnives} knives</span>
              </div>
            </div>

            {!result.shouldersValid && (
              <div className="mt-4 p-3 bg-white text-destructive rounded-lg flex items-center justify-center space-x-2 animate-pulse">
                <span className="font-black uppercase tracking-tighter text-sm italic underline decoration-2 underline-offset-2">CRITICAL: SHOULDERS BELOW 1.0" SAFETY LIMIT</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <SetupCard
            title="Opening Shoulders"
            side1={{ label: "Bottom", target: result.bottomOpening.target, summary: result.bottomOpeningSummary }}
            side2={{ label: "Top", target: result.topOpening.target, summary: result.topOpeningSummary }}
          />

          {cutsToDisplay.map((item, i) => {
            const isGrouped = 'count' in item;
            if (isGrouped) {
              const group = item as GroupedArborCut;
              return (
                <SetupCard
                  key={`group-${i}`}
                  title={group.count > 1 
                    ? `${formatInches(group.cut.width)}" x ${group.count} (Cuts ${group.startIdx}–${group.endIdx})`
                    : `Cut ${group.startIdx}: ${formatInches(group.cut.width)}"`
                  }
                  side1={{
                    label: "Bottom",
                    target: group.cut.bottomStack.target,
                    summary: group.cut.bottomSummary,
                    isFemale: group.cut.type === 'female-bottom'
                  }}
                  side2={{
                    label: "Top",
                    target: group.cut.topStack.target,
                    summary: group.cut.topSummary,
                    isFemale: group.cut.type === 'male-bottom'
                  }}
                />
              );
            } else {
              const s = item as ArborCut;
              return (
                <SetupCard
                  key={`cut-${s.cutIndex}-${i}`}
                  title={`Cut ${s.cutIndex}: ${formatInches(s.width)}"`}
                  side1={{
                    label: s.type === 'male-bottom' ? "Bottom (Male)" : "Bottom (Female)",
                    target: s.bottomStack.target,
                    summary: s.bottomSummary,
                    isFemale: s.type === 'female-bottom'
                  }}
                  side2={{
                    label: s.type === 'male-bottom' ? "Top (Female)" : "Top (Male)",
                    target: s.topStack.target,
                    summary: s.topSummary,
                    isFemale: s.type === 'male-bottom'
                  }}
                />
              );
            }
          })}

          <SetupCard
            title="Closing Shoulders"
            side1={{ label: "Bottom", target: result.bottomClosing.target, summary: result.bottomClosingSummary }}
            side2={{ label: "Top", target: result.topClosing.target, summary: result.topClosingSummary }}
          />
        </div>
      </div>

      {/* --- PRINT ONLY VIEW --- */}
      <div className="hidden print:block text-black bg-white min-h-screen">
        {/* Simple Header on Page 1 */}
        <div className="border-b-4 border-black pb-4 mb-8">
          <div className="flex justify-between items-baseline mb-4">
            <h1 className="text-3xl font-black tracking-tighter">SLITTER SETUP SHEET</h1>
            <div className="text-right text-sm font-bold border-2 border-black p-2 rounded">
              DATE: {new Date().toLocaleDateString()}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 text-[11pt]">
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-slate-500">Order Information</div>
              <div className="font-bold">ORD: {result.orderNumber || "---"}</div>
              <div className="font-bold uppercase">CO: {result.companyName || "---"}</div>
            </div>
            <div className="space-y-1 border-x border-slate-200 px-6">
              <div className="text-[9px] font-black uppercase text-slate-500">Material Info</div>
              <div className="font-bold">WIDTH: {formatInches(result.coilWidth)}"</div>
              <div className="font-bold">GAUGE: {result.gauge || "---"}"</div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-[9px] font-black uppercase text-slate-500">Setup Constants</div>
              <div className="font-bold">CLR: {formatInches(result.clearance)}"</div>
              <div className="font-bold text-red-600 print:text-black">TRIM: {formatInches(result.edgeTrim)}"</div>
            </div>
          </div>
        </div>

        {/* Shoulders + First Chunk */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <SetupCard
              title="OPENING SHOULDERS"
              side1={{ label: "Bottom", target: result.bottomOpening.target, summary: result.bottomOpeningSummary }}
              side2={{ label: "Top", target: result.topOpening.target, summary: result.topOpeningSummary }}
            />
            
            {/* First chunk of cuts (or whatever fits) */}
            {cutChunks[0]?.map((item, i) => {
              const isGrouped = 'count' in item;
              if (isGrouped) {
                const group = item as GroupedArborCut;
                return (
                  <SetupCard
                    key={`p-group-0-${i}`}
                    title={group.count > 1 
                      ? `${formatInches(group.cut.width)}" x ${group.count} (Cuts ${group.startIdx}–${group.endIdx})`
                      : `Cut ${group.startIdx}: ${formatInches(group.cut.width)}"`
                    }
                    side1={{
                      label: "Bottom",
                      target: group.cut.bottomStack.target,
                      summary: group.cut.bottomSummary,
                      isFemale: group.cut.type === 'female-bottom'
                    }}
                    side2={{
                      label: "Top",
                      target: group.cut.topStack.target,
                      summary: group.cut.topSummary,
                      isFemale: group.cut.type === 'male-bottom'
                    }}
                  />
                );
              } else {
                const s = item as ArborCut;
                return (
                  <SetupCard
                    key={`p-cut-${s.cutIndex}-0-${i}`}
                    title={`Cut ${s.cutIndex}: ${formatInches(s.width)}"`}
                    side1={{
                      label: s.type === 'male-bottom' ? "Bottom (M)" : "Bottom (F)",
                      target: s.bottomStack.target,
                      summary: s.bottomSummary,
                      isFemale: s.type === 'female-bottom'
                    }}
                    side2={{
                      label: s.type === 'male-bottom' ? "Top (F)" : "Top (M)",
                      target: s.topStack.target,
                      summary: s.topSummary,
                      isFemale: s.type === 'male-bottom'
                    }}
                  />
                );
              }
            })}
          </div>
          
          {/* Forced break if there are more chunks or if we want closing shoulders on its own if many cuts */}
          {cutChunks.length > 1 && <div className="print-break-after" />}
          
          {/* Remaining Chunks */}
          {cutChunks.slice(1).map((chunk, chunkIdx) => (
            <div key={`p-chunk-${chunkIdx + 1}`} className={`space-y-6 ${(chunkIdx + 1) < cutChunks.length - 1 ? "print-break-after" : ""}`}>
              {chunk.map((item, i) => {
                const isGrouped = 'count' in item;
                if (isGrouped) {
                  const group = item as GroupedArborCut;
                  return (
                    <SetupCard
                      key={`p-group-${chunkIdx + 1}-${i}`}
                      title={group.count > 1 
                        ? `${formatInches(group.cut.width)}" x ${group.count} (Cuts ${group.startIdx}–${group.endIdx})`
                        : `Cut ${group.startIdx}: ${formatInches(group.cut.width)}"`
                      }
                      side1={{
                        label: "Bottom",
                        target: group.cut.bottomStack.target,
                        summary: group.cut.bottomSummary,
                        isFemale: group.cut.type === 'female-bottom'
                      }}
                      side2={{
                        label: "Top",
                        target: group.cut.topStack.target,
                        summary: group.cut.topSummary,
                        isFemale: group.cut.type === 'male-bottom'
                      }}
                    />
                  );
                } else {
                  const s = item as ArborCut;
                  return (
                    <SetupCard
                      key={`p-cut-${s.cutIndex}-${chunkIdx + 1}-${i}`}
                      title={`Cut ${s.cutIndex}: ${formatInches(s.width)}"`}
                      side1={{
                        label: s.type === 'male-bottom' ? "Bottom (M)" : "Bottom (F)",
                        target: s.bottomStack.target,
                        summary: s.bottomSummary,
                        isFemale: s.type === 'female-bottom'
                      }}
                      side2={{
                        label: s.type === 'male-bottom' ? "Top (F)" : "Top (M)",
                        target: s.topStack.target,
                        summary: s.topSummary,
                        isFemale: s.type === 'male-bottom'
                      }}
                    />
                  );
                }
              })}
            </div>
          ))}

          {/* Closing Shoulders on the final page */}
          <div className="pt-4">
            <SetupCard
              title="CLOSING SHOULDERS"
              side1={{ label: "Bottom", target: result.bottomClosing.target, summary: result.bottomClosingSummary }}
              side2={{ label: "Top", target: result.topClosing.target, summary: result.topClosingSummary }}
            />
          </div>
          
          <div className="hidden print:flex justify-between items-center border-t-2 border-black pt-4 mt-8">
            <div className="text-[10px] font-bold">TOTAL TOOLS: {result.grandTotalTools} | KNIVES: {result.totalKnives}</div>
            <div className="text-[10px] font-bold">ARBOR USED: B {formatInches(result.bottomArborUsed)}" / T {formatInches(result.topArborUsed)}"</div>
          </div>
        </div>
      </div>
    </div>
  );
}


