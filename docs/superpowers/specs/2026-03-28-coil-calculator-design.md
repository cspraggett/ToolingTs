# Spec: Coil Calculator Utility

**Date:** 2026-03-28
**Status:** Draft
**Feature:** Standalone Coil Weight and OD Calculator

## 1. Goal
Provide a mobile-optimized tool for slitter operators to:
1. Calculate the weight of a carbon steel coil based on dimensions.
2. Calculate the exact "Stop OD" of a master coil after removing a specified weight of material.

## 2. Technical Logic

### 2.1 Constants
- `STEEL_DENSITY`: 0.284 lbs/in³ (Standard for Carbon, Galvanized, and Galvalume steel).
- `PI`: Math.PI (~3.14159).

### 2.2 Formulas
- **Volume ($V$):** $\pi \times (R_{outer}^2 - R_{inner}^2) \times Width$
- **Weight ($W$):** $V \times 0.284$
- **Stop OD ($OD_{stop}$):** Given a target volume $V_{target}$ after removal:
  $OD_{stop} = 2 \times \sqrt{\frac{V_{target}}{\pi \times Width} + (ID/2)^2}$

### 2.3 Edge Cases & Validation
- $OD$ must be greater than $ID$.
- $WeightToRemove$ cannot exceed the total calculated weight of the master coil.
- All inputs must be positive numbers.

## 3. User Interface (Mobile-First)

### 3.1 Master Coil Section
- **Inputs:**
  - `Width` (inches)
  - `Gauge` (decimal inches)
  - `ID` (inches) - *Include 20" and 24" preset buttons*
  - `Current OD` (inches)
- **Live Output:**
  - `Total Weight` (lbs) - Formatted with commas.

### 3.2 Cut-Down Section
- **Input:**
  - `Weight to Remove` (lbs)
- **Primary Output (Large/Bold):**
  - `Target Stop OD` (inches) - Formatted to 3 decimal places.
- **Secondary Output:**
  - `Remaining Weight` (lbs)

## 4. Implementation Plan

### 4.1 Core
- Create `src/core/coil-math.ts` containing the pure calculation functions.
- Add unit tests in `src/core/coil-math.test.ts`.

### 4.2 UI
- Create `src/ui/features/CoilCalculator.tsx`.
- Use `shadcn/ui` Card, Input, and Label components.
- Ensure the layout is responsive and works well on small screens.

### 4.3 App Integration
- Update `src/App.tsx` to include the Coil Calculator as a new mode/tab.
- Add a clear header for switching between "Slitter Setup" and "Coil Tools".
