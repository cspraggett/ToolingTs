import { useState } from "react";
import { MACHINES } from "../../../config/machine-profiles";
import { formatInches } from "../../../core/utils";
import { useFullSetup } from "../useFullSetup";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface SetupFormProps {
  setup: ReturnType<typeof useFullSetup>;
}

export function SetupForm({ setup }: SetupFormProps) {
  const { inputs, handleInputChange } = setup;
  const [showOptimizer, setShowOptimizer] = useState(false);

  return (
    <div className="space-y-6 no-print">
      {/* === MACHINE SELECTOR === */}
      <div className="space-y-2 border-b pb-4">
        <Label>Select Workstation</Label>
        <Select value={setup.selectedMachineId} onValueChange={(val) => setup.onMachineChange({ target: { value: val } } as any)}>
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

      <div className="grid md:grid-cols-2 gap-4">
        {/* Order + Company */}
        <div className="space-y-2">
          <Label>Order #</Label>
          <Input
            type="text"
            placeholder="e.g. 12345"
            value={inputs.orderNumber}
            onChange={(e) => handleInputChange("orderNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Company</Label>
          <Input
            type="text"
            placeholder="e.g. Acme Steel"
            value={inputs.companyName}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
          />
        </div>
      </div>

      {/* Coil Width + Weight + Gauge */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Coil Width</Label>
          <Input
            type="number"
            step="0.001"
            placeholder='e.g. 48.000"'
            value={inputs.coilWidth}
            onChange={(e) => handleInputChange("coilWidth", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Coil Weight</Label>
          <Input
            type="text"
            placeholder="e.g. 10000 lbs"
            value={inputs.coilWeight}
            onChange={(e) => handleInputChange("coilWeight", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Gauge (inches)</Label>
          <Input
            type="number"
            step="0.001"
            placeholder='e.g. 0.036"'
            value={inputs.gauge}
            onChange={(e) => handleInputChange("gauge", e.target.value)}
          />
        </div>
      </div>

      {/* Knife + Clearance */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Knife Size</Label>
          <Select value={inputs.knifeSize} onValueChange={(val) => handleInputChange("knifeSize", val || "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select knife size" />
            </SelectTrigger>
            <SelectContent>
              {setup.currentMachine.knives.map((k) => (
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
            value={inputs.clearance}
            onChange={(e) => handleInputChange("clearance", e.target.value)}
          />
        </div>
      </div>

      {/* Tight Clearance — always visible */}
      {setup.isStrictCapable && (
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="strictModeFullSetup"
            checked={inputs.strictMode}
            onCheckedChange={(checked) => handleInputChange("strictMode", !!checked)}
          />
          <Label htmlFor="strictModeFullSetup" className="font-medium">
            Tight Clearance (Ban .031 & .062)
          </Label>
        </div>
      )}

      {/* === STRIP LIST === */}
      <Card className="mt-8 border-2 shadow-md overflow-hidden bg-white">
        <div className="h-1 bg-slate-200 w-full" />
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex flex-col">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Strips to Cut</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Input material widths</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowOptimizer((v) => !v)}
                className="font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5"
              >
                {showOptimizer ? "Hide Optimizer" : "Show Optimizer"}
              </Button>
              <Button size="sm" onClick={setup.addStrip} className="font-black text-xs shadow-md">
                + Add Strip
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {setup.strips.map((strip, index) => (
              <div key={strip.id} className={`flex gap-3 items-end p-3 rounded-xl border-2 transition-all ${index % 2 === 0 ? "bg-slate-50/50 border-slate-100" : "bg-white border-transparent"}`}>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Width (Inches)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={strip.width}
                    onChange={(e) => setup.updateStrip(strip.id, "width", e.target.value)}
                    className="font-mono font-bold border-2 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="w-24 space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={strip.quantity}
                    onChange={(e) => setup.updateStrip(strip.id, "quantity", e.target.value)}
                    className="font-bold border-2 text-center focus-visible:ring-primary/20"
                  />
                </div>
                {showOptimizer && (
                  <>
                    <div className="w-24 space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">- Tol</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={strip.minusTol}
                        onChange={(e) => setup.updateStrip(strip.id, "minusTol", e.target.value)}
                        className="font-mono font-bold border-2 focus-visible:ring-primary/20 text-orange-600 bg-orange-50/20"
                      />
                    </div>
                    <div className="w-24 space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">+ Tol</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={strip.plusTol}
                        onChange={(e) => setup.updateStrip(strip.id, "plusTol", e.target.value)}
                        className="font-mono font-bold border-2 focus-visible:ring-primary/20 text-blue-600 bg-blue-50/20"
                      />
                    </div>
                  </>
                )}
                <div className="pb-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setup.removeStrip(strip.id)}
                    disabled={setup.strips.length === 1}
                    className="h-10 w-10 text-slate-300 hover:text-destructive hover:bg-destructive/5 rounded-lg"
                  >
                    <span className="font-bold">✕</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BUTTONS */}
      <div className="flex justify-between items-center pt-6 border-t-2 border-slate-100">
        <Button variant="ghost" onClick={setup.handleReset} className="font-black uppercase tracking-widest text-xs text-slate-400 hover:text-slate-600">
          Clear Setup
        </Button>
        <Button onClick={setup.handleCalculate} className="font-black uppercase tracking-widest py-6 px-10 rounded-xl shadow-xl shadow-primary/20 text-sm">
          Run Calculation
        </Button>
      </div>
    </div>
  );
}
