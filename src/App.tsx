import { useState } from "react";
import { useSteelTooling } from "./ui/features/useSteelTooling";
import { ResultDisplay } from "./ui/components/ResultDisplay";
import { CutCalculatorMode } from "./ui/features/CutCalculatorMode";
import { FullSetupMode } from "./ui/features/FullSetupMode";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SteelToolingCalculator() {
  const [mode, setMode] = useState("single");
  const singleTools = useSteelTooling();

  return (
    <div className={`mx-auto p-4 ${mode === "fullSetup" ? "max-w-6xl" : "max-w-2xl"}`}>
      <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Steel Tooling Calculator</h2>

      <Tabs value={mode} onValueChange={setMode} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="single">Single Spacer</TabsTrigger>
          <TabsTrigger value="makeCut">Make Cut</TabsTrigger>
          <TabsTrigger value="fullSetup">Full Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Single Spacer Calculator</CardTitle>
              <CardDescription>Enter a target width to find the optimal spacer stack.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                step="0.001"
                placeholder='Target width (")'
                value={singleTools.targetWidth}
                onChange={singleTools.handleInputChange}
                className="text-lg py-6"
              />

              {!singleTools.result ? (
                <p className="text-sm text-muted-foreground text-center py-8">Enter a width to calculate tooling</p>
              ) : (
                <div className="mt-6 border rounded-md p-4 bg-muted/20">
                  <ResultDisplay result={singleTools.result} labels={singleTools.labels} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="makeCut">
          <Card>
            <CardHeader>
              <CardTitle>Cut Calculator</CardTitle>
              <CardDescription>Optimize a single cut with male and female sides.</CardDescription>
            </CardHeader>
            <CardContent>
              <CutCalculatorMode />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fullSetup">
          <Card>
            <CardHeader>
              <CardTitle>Full Setup Mode</CardTitle>
              <CardDescription>Calculate a complete arbor setup for multiple cuts.</CardDescription>
            </CardHeader>
            <CardContent>
              <FullSetupMode />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

