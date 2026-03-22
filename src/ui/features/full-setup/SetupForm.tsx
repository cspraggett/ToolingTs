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
    <div className="space-y-6">
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
      <Card className="mt-6 border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold tracking-tight">Strips</h3>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowOptimizer((v) => !v)}>
                {showOptimizer ? "Hide Optimizer" : "Show Optimizer"}
              </Button>
              <Button size="sm" onClick={setup.addStrip}>
                + Add Strip
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {setup.strips.map((strip, index) => (
              <div key={strip.id} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  {index === 0 && <Label className="text-xs text-muted-foreground uppercase">Width</Label>}
                  <Input
                    type="number"
                    step="0.001"
                    placeholder='e.g. 5.000'
                    value={strip.width}
                    onChange={(e) => setup.updateStrip(strip.id, "width", e.target.value)}
                  />
                </div>
                <div className="w-24 space-y-1">
                  {index === 0 && <Label className="text-xs text-muted-foreground uppercase">Qty</Label>}
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={strip.quantity}
                    onChange={(e) => setup.updateStrip(strip.id, "quantity", e.target.value)}
                  />
                </div>
                {showOptimizer && (
                  <>
                    <div className="w-24 space-y-1">
                      {index === 0 && <Label className="text-xs text-muted-foreground uppercase">- Tol</Label>}
                      <Input
                        type="number"
                        step="0.001"
                        value={strip.minusTol}
                        onChange={(e) => setup.updateStrip(strip.id, "minusTol", e.target.value)}
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      {index === 0 && <Label className="text-xs text-muted-foreground uppercase">+ Tol</Label>}
                      <Input
                        type="number"
                        step="0.001"
                        value={strip.plusTol}
                        onChange={(e) => setup.updateStrip(strip.id, "plusTol", e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className={`${index === 0 ? "pt-5" : ""}`}>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setup.removeStrip(strip.id)}
                    disabled={setup.strips.length === 1}
                  >
                    X
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BUTTONS */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={setup.handleReset}>
          Reset
        </Button>
        <Button onClick={setup.handleCalculate}>
          Calculate
        </Button>
      </div>
    </div>
  );
}
