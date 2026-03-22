import { useState } from "react";
import { useSteelTooling } from "./ui/features/useSteelTooling";
import { ResultDisplay } from "./ui/components/ResultDisplay";
import { CutCalculatorMode } from "./ui/features/CutCalculatorMode";
import { FullSetupMode } from "./ui/features/FullSetupMode";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SteelToolingCalculator() {
  const [mode, setMode] = useState("single");
  const singleTools = useSteelTooling();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className={`mx-auto p-6 md:p-10 ${mode === "fullSetup" ? "max-w-6xl" : "max-w-2xl"}`}>
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Steel Tooling <span className="text-primary">Calculator</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Precision arbor setup for master slitters</p>
        </header>

        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-slate-200/50 p-1 border shadow-sm rounded-xl">
            <TabsTrigger value="single" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Single Spacer</TabsTrigger>
            <TabsTrigger value="makeCut" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Make Cut</TabsTrigger>
            <TabsTrigger value="fullSetup" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Full Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-0 outline-none">
            <Card className="shadow-lg border-slate-200 overflow-hidden">
              <div className="h-1.5 bg-primary w-full" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Single Spacer</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Find the optimal stack for any target width.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="single-target" className="text-sm uppercase tracking-wider font-bold text-slate-500 ml-1">Target Width</Label>
                  <Input
                    id="single-target"
                    type="number"
                    step="0.001"
                    placeholder='0.000"'
                    value={singleTools.targetWidth}
                    onChange={singleTools.handleInputChange}
                    className="text-2xl py-8 font-mono font-bold text-primary border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/20 bg-slate-50/50"
                  />
                </div>

                {!singleTools.result ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50/30">
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Awaiting Input</p>
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl overflow-hidden border shadow-inner bg-white">
                    <div className="bg-slate-50 border-b px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500">Recommended Stack</div>
                    <div className="p-6">
                      <ResultDisplay result={singleTools.result} labels={singleTools.labels} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="makeCut" className="mt-0 outline-none">
            <Card className="shadow-lg border-slate-200 overflow-hidden">
              <div className="h-1.5 bg-primary w-full" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Cut Calculator</CardTitle>
                <CardDescription className="text-slate-500 font-medium font-medium">Optimize a single cut with alternating male/female sides.</CardDescription>
              </CardHeader>
              <CardContent>
                <CutCalculatorMode />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fullSetup" className="mt-0 outline-none">
            <Card className="shadow-lg border-slate-200 overflow-hidden">
              <div className="h-1.5 bg-primary w-full" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Full Setup Mode</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Generate a complete master arbor layout for multiple strips.</CardDescription>
              </CardHeader>
              <CardContent>
                <FullSetupMode />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
