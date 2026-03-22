import { MACHINES } from "../../config/machine-profiles";
import { ResultDisplay } from "../components/ResultDisplay";
import { formatInches } from "../../core/utils";
import { useCutCalculator } from "./useCutCalculator";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CutCalculatorMode() {
  const cut = useCutCalculator();

  return (
    <div className="space-y-6">
      {/* === MACHINE SELECTOR === */}
      <div className="space-y-2">
        <Label>Select Workstation</Label>
        <Select value={cut.selectedMachineId} onValueChange={(val) => cut.onMachineChange({ target: { value: val } } as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a machine" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(MACHINES).map((machine) => (
              <SelectItem key={machine.id} value={machine.id}>
                {machine.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Strip Width (Cut Size)</Label>
          <Input
            type="number"
            step="0.001"
            placeholder='e.g. 5.000"'
            value={cut.cutSize}
            onChange={cut.onCutSizeChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Knife Size</Label>
            <Select value={cut.knifeSize} onValueChange={(val) => cut.onKnifeSizeChange({ target: { value: val } } as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select knife size" />
              </SelectTrigger>
              <SelectContent>
                {cut.currentMachine.knives.map((k) => (
                  <SelectItem key={k} value={k.toString()}>
                    {formatInches(k)}"
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Clearance</Label>
            <Input
              type="number"
              step="0.001"
              value={cut.clearance}
              onChange={cut.onClearanceChange}
            />
          </div>
        </div>

        {/* TOLERANCES */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Minus (-)</Label>
            <Input type="number" step="0.001" value={cut.minusTol} onChange={cut.onMinusTolChange} />
          </div>
          <div className="space-y-2">
            <Label>Plus (+)</Label>
            <Input type="number" step="0.001" value={cut.plusTol} onChange={cut.onPlusTolChange} />
          </div>
        </div>

        {cut.isStrictCapable && (
          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="strictMode"
              checked={cut.strictMode}
              onCheckedChange={(checked) => cut.onStrictModeChange({ target: { checked } } as any)}
            />
            <Label htmlFor="strictMode" className="font-medium">
              Tight Clearance (Ban .031 & .062)
            </Label>
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={cut.handleReset}>Reset</Button>
          <Button onClick={cut.handleCalculate}>Calculate</Button>
        </div>
      </div>

      {/* ERROR */}
      {cut.error && <div className="text-destructive font-medium p-4 border border-destructive rounded-md bg-destructive/10">{cut.error}</div>}

      {/* RESULTS */}
      {cut.result && cut.calculatedTargets && (
        <div className="space-y-6 mt-8 border-t pt-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Optimization Found</p>
                <p className="text-4xl font-bold text-primary my-2">
                  {cut.result.offset > 0 ? "+" : ""}{formatInches(cut.result.offset)}"
                </p>
                <p className="text-sm">Total Tools: <strong className="text-lg">{cut.result.totalToolCount}</strong></p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="text-lg">Male Setup</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Target: <strong className="text-foreground">{formatInches(cut.calculatedTargets.male + cut.result.offset)}"</strong>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ResultDisplay result={cut.result.maleResult} labels={cut.currentMachine.toolLabels} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="text-lg">Female Setup</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Target: <strong className="text-foreground">{formatInches(cut.calculatedTargets.female + cut.result.offset)}"</strong>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ResultDisplay result={cut.result.femaleResult} labels={cut.currentMachine.toolLabels} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
