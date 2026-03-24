import { useState } from "react";
import { CutCalculatorMode } from "./ui/features/CutCalculatorMode";
import { FullSetupMode } from "./ui/features/FullSetupMode";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SlitMaster() {
  const [mode, setMode] = useState("fullSetup");

  return (
    <div className="min-h-screen bg-slate-50/50 print:bg-white print:p-0">
      <div className={`mx-auto p-6 md:p-10 ${mode === "fullSetup" ? "max-w-6xl" : "max-w-2xl"} print:max-w-none print:p-0`}>
        <header className="mb-10 text-center no-print">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Slit <span className="text-primary">Master</span>
          </h1>
        </header>

        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-slate-200/50 p-1 border shadow-sm rounded-xl no-print">
            <TabsTrigger value="makeCut" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Cut Calculator</TabsTrigger>
            <TabsTrigger value="fullSetup" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Full Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="makeCut" className="mt-0 outline-none print:hidden">
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

          <TabsContent value="fullSetup" className="mt-0 outline-none print:p-0">
            <Card className="shadow-lg border-slate-200 overflow-hidden print:shadow-none print:border-none print:bg-transparent">
              <div className="h-1.5 bg-primary w-full no-print" />
              <CardHeader className="pb-4 no-print">
                <CardTitle className="text-2xl">Full Setup Mode</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Generate a complete master arbor layout for multiple strips.</CardDescription>
              </CardHeader>
              <CardContent className="print:p-0">
                <FullSetupMode />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

