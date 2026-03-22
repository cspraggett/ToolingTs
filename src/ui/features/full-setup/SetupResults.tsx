import { useState } from "react";
import { formatInches } from "../../../core/utils";
import { GroupedArborCut, FullSetupResult } from "../../../core/engine";
import { SetupCard } from "../../components/SetupCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SetupResultsProps {
  result: FullSetupResult;
}

export function SetupResults({ result }: SetupResultsProps) {
  const [viewMode, setViewMode] = useState<'short' | 'long'>('short');

  return (
    <div className="mt-8 space-y-6">
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

      <div className="print:m-0 space-y-6">
        {/* Summary Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Setup Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(result.orderNumber || result.companyName) && (
              <div className="text-lg font-medium">
                {result.orderNumber && (
                  <>Order: <span className="font-bold">{result.orderNumber}</span></>
                )}
                {result.orderNumber && result.companyName && " | "}
                {result.companyName && (
                  <>Company: <span className="font-bold">{result.companyName}</span></>
                )}
              </div>
            )}
            <div className="text-sm">
              Coil Width: <strong>{formatInches(result.coilWidth)}"</strong>
              {result.coilWeight && (
                <> | Weight: <strong>{result.coilWeight} lbs</strong></>
              )}
              {result.gauge && (
                <> | Gauge: <strong>{formatInches(parseFloat(result.gauge))}"</strong></>
              )}
              {" | "} Clearance: <strong>{formatInches(result.clearance)}"</strong>
            </div>
            <div className="text-sm">
              Edge Trim: <strong>{formatInches(result.edgeTrim)}"</strong>
              {" | "}
              Setup Width: <strong>{formatInches(result.stripTotal)}"</strong>
              {!result.shouldersValid && (
                <span className="text-destructive font-bold ml-2"> (Shoulders below 1"!)</span>
              )}
            </div>
            <div className="text-sm">
              Bottom Arbor: <strong>{formatInches(result.bottomArborUsed)}"</strong>
              {" | "}
              Top Arbor: <strong>{formatInches(result.topArborUsed)}"</strong>
            </div>
            <div className="pt-2 mt-2 border-t text-sm font-medium">
              Total: {result.grandTotalTools} tools | {result.totalKnives} knives
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Opening Shoulders */}
          <SetupCard
            title="Opening Shoulders"
            side1={{ label: "Bottom", target: result.bottomOpening.target, summary: result.bottomOpeningSummary }}
            side2={{ label: "Top", target: result.topOpening.target, summary: result.topOpeningSummary }}
          />

          {/* Setup Sheet */}
          {viewMode === 'short' ? (
            // Short View: Grouped consecutive cuts
            result.groupedCuts.map((group: GroupedArborCut, i: number) => (
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
            ))
          ) : (
            // Long View: Every cut listed individually
            result.cuts.map((s, i) => (
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
            ))
          )}

          {/* Closing Shoulders */}
          <SetupCard
            title="Closing Shoulders"
            side1={{ label: "Bottom", target: result.bottomClosing.target, summary: result.bottomClosingSummary }}
            side2={{ label: "Top", target: result.topClosing.target, summary: result.topClosingSummary }}
          />
        </div>
      </div>
    </div>
  );
}
