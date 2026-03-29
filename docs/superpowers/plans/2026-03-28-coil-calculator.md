# Coil Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, mobile-optimized coil weight and "Stop OD" calculator for slitter operators.

**Architecture:** A pure math core for calculations with a React/shadcn UI layer. The UI will maintain its own state for the calculator inputs.

**Tech Stack:** React, TypeScript, Vitest, shadcn/ui.

---

### Task 1: Core Math Logic

**Files:**
- Create: `src/core/coil-math.ts`
- Create: `src/core/coil-math.test.ts`

- [ ] **Step 1: Write failing tests for coil weight**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateCoilWeight, calculateStopOD } from './coil-math';

describe('Coil Math', () => {
  it('calculates weight correctly for a standard coil', () => {
    // Width: 48, ID: 20, OD: 50
    // Vol = PI * (25^2 - 10^2) * 48 = PI * (625 - 100) * 48 = PI * 525 * 48 = 79168.13
    // Weight = 79168.13 * 0.284 = 22483.75
    const weight = calculateCoilWeight(48, 20, 50);
    expect(weight).toBeCloseTo(22483.75, 1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest src/core/coil-math.test.ts`
Expected: FAIL (functions not defined)

- [ ] **Step 3: Implement `calculateCoilWeight`**

```typescript
export const STEEL_DENSITY = 0.284;

export function calculateCoilWeight(width: number, id: number, od: number): number {
  if (od <= id) return 0;
  const outerRadius = od / 2;
  const innerRadius = id / 2;
  const volume = Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2)) * width;
  return volume * STEEL_DENSITY;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest src/core/coil-math.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing test for `calculateStopOD`**

```typescript
  it('calculates stop OD correctly', () => {
    // From previous test: 48" wide, 20" ID, 50" OD = 22483.75 lbs
    // Remove 5,000 lbs -> Remaining 17483.75 lbs
    // New Vol = 17483.75 / 0.284 = 61562.5
    // StopOD = 2 * SQRT(61562.5 / (PI * 48) + 10^2) = 2 * SQRT(408.24 + 100) = 2 * 22.54 = 45.08
    const stopOD = calculateStopOD(48, 20, 50, 5000);
    expect(stopOD).toBeCloseTo(45.08, 1);
  });
```

- [ ] **Step 6: Implement `calculateStopOD`**

```typescript
export function calculateStopOD(width: number, id: number, currentOD: number, weightToRemove: number): number {
  const currentWeight = calculateCoilWeight(width, id, currentOD);
  const targetWeight = currentWeight - weightToRemove;
  if (targetWeight <= 0) return id;

  const targetVolume = targetWeight / STEEL_DENSITY;
  const innerRadius = id / 2;
  
  const targetOuterRadius = Math.sqrt((targetVolume / (Math.PI * width)) + Math.pow(innerRadius, 2));
  return targetOuterRadius * 2;
}
```

- [ ] **Step 7: Run tests to verify all pass**

Run: `pnpm vitest src/core/coil-math.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/core/coil-math.ts src/core/coil-math.test.ts
git commit -m "feat(core): add coil weight and stop OD calculations"
```

### Task 2: UI Component Implementation

**Files:**
- Create: `src/ui/features/CoilCalculator.tsx`

- [ ] **Step 1: Scaffold the component with basic inputs**

```tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calculateCoilWeight, calculateStopOD } from '@/core/coil-math';

export const CoilCalculator = () => {
  const [width, setWidth] = useState<string>("48");
  const [gauge, setGauge] = useState<string>("0.050");
  const [id, setId] = useState<string>("20");
  const [od, setOd] = useState<string>("50");
  const [weightToRemove, setWeightToRemove] = useState<string>("0");

  const currentWeight = useMemo(() => {
    return calculateCoilWeight(parseFloat(width) || 0, parseFloat(id) || 0, parseFloat(od) || 0);
  }, [width, id, od]);

  const stopOD = useMemo(() => {
    return calculateStopOD(parseFloat(width) || 0, parseFloat(id) || 0, parseFloat(od) || 0, parseFloat(weightToRemove) || 0);
  }, [width, id, od, weightToRemove]);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Master Coil</CardTitle>
          <CardDescription>Enter dimensions to calculate weight</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (in)</Label>
              <Input id="width" type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gauge">Gauge (in)</Label>
              <Input id="gauge" type="number" value={gauge} onChange={(e) => setGauge(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>ID (in)</Label>
            <div className="flex gap-2">
              <Input type="number" value={id} onChange={(e) => setId(e.target.value)} className="flex-1" />
              <Button variant="outline" onClick={() => setId("20")}>20"</Button>
              <Button variant="outline" onClick={() => setId("24")}>24"</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="od">Current OD (in)</Label>
            <Input id="od" type="number" value={od} onChange={(e) => setOd(e.target.value)} />
          </div>
          <div className="p-4 bg-slate-100 rounded-lg text-center">
            <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Current Weight</div>
            <div className="text-3xl font-black text-slate-900">{Math.round(currentWeight).toLocaleString()} lbs</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-primary/5">
        <CardHeader>
          <CardTitle>Cut-Down Calculation</CardTitle>
          <CardDescription>Determine the stop point for a puppy coil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remove">Weight to Remove (lbs)</Label>
            <Input id="remove" type="number" value={weightToRemove} onChange={(e) => setWeightToRemove(e.target.value)} />
          </div>
          <div className="p-6 bg-primary text-primary-foreground rounded-xl text-center shadow-lg">
            <div className="text-sm uppercase font-bold tracking-widest opacity-80 mb-1">Target Stop OD</div>
            <div className="text-5xl font-black">{stopOD.toFixed(3)}"</div>
          </div>
          <div className="text-center text-sm text-slate-500 font-medium">
            Remaining: {Math.max(0, Math.round(currentWeight - (parseFloat(weightToRemove) || 0))).toLocaleString()} lbs
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/features/CoilCalculator.tsx
git commit -m "feat(ui): implement coil calculator component"
```

### Task 3: App Integration

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add tabs for switching between Slitter and Coil tools**

```tsx
import { useState } from "react";
import { FullSetupMode } from "./ui/features/FullSetupMode";
import { CoilCalculator } from "./ui/features/CoilCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SlitMaster() {
  const [mode, setMode] = useState("fullSetup");

  return (
    <div className="min-h-screen bg-slate-50/50 print:bg-white print:p-0">
      <div className={`mx-auto p-6 md:p-10 ${mode === 'fullSetup' ? 'max-w-6xl' : 'max-w-2xl'} print:max-w-none print:p-0`}>
        <header className="mb-10 text-center no-print">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Slit <span className="text-primary">Master</span>
          </h1>
        </header>

        <Tabs value={mode} onValueChange={setMode} className="w-full no-print">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-slate-200/50 p-1 border shadow-sm rounded-xl">
            <TabsTrigger value="fullSetup" className="rounded-lg font-bold">Slitter Setup</TabsTrigger>
            <TabsTrigger value="coilTools" className="rounded-lg font-bold">Coil Tools</TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === "fullSetup" && (
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
        )}

        {mode === "coilTools" && (
          <CoilCalculator />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the integration locally**

Run: `pnpm dev`
Check: Ensure the tabs switch correctly and the Coil Calculator is visible.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(ui): integrate coil calculator into main app"
```
