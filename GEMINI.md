# Steel Tooling Calculator - Project Context

## Overview
This project is a React (TypeScript) application for calculating slitter setup tooling. It handles complex optimization for "male" and "female" tooling pairs within specified tolerance windows.

## Current State: `feature/full-setup` branch
We recently completed a major refactor of the Full Setup feature to improve maintainability and readability.

### Key Changes
- **State Consolidation**: Moved individual input states in `useFullSetup.ts` into a single `inputs` object.
- **Logic Extraction**: The core calculation logic was moved out of the hook into a pure function `calculateFullSetup`.
- **UI Refactor**: Extracted the `SetupCard` component in `FullSetupMode.tsx` to handle repetitive layouts for Opening/Closing shoulders and individual strip stations.
- **Naming Conventions**: Renamed shorthand variables (e.g., `cw` -> `coilWidth`, `clr` -> `clearance`, `s` -> `strip`) to be fully descriptive.
- **Precision Improvement**: `summarizeStack` in `utils.ts` now uses `toFixed(4)` for Map keys to avoid floating-point grouping errors.

## Core Technical Logic
- **Solver (`solver.ts`)**: Uses a **Greedy** approach for the bulk of the width and **Dynamic Programming (DP)** for the final precision gap (defined by `GREEDY_THRESHOLD_UNITS = 6000`, which is 6.000").
- **Optimizer (`optimizer.ts`)**: Iterates through 0.001" increments within the user's tolerance window to find a setup that minimizes the total tool count across both male and female arbors.
- **Shoulders (`utils.ts`)**: Calculates 4 specific points (Opening/Closing on Top/Bottom arbors) to center the setup, rounding the base to the nearest 1/8".

## Project Commands
- **Dev**: `npm run dev` (Vite)
- **Test**: `npm test` (Vitest)
- **Deploy**: `npm run deploy` (Builds and pushes `dist/` to `gh-pages` branch)

## Important Notes
- Always ensure `MachineProfile` is imported in `useFullSetup.ts` to avoid build failures.
- The `vite.config.ts` has a `base` set to `/ToolingTs/` for GitHub Pages compatibility.
- The user has indicated that the feature is **not yet finished**, so future work may involve additional validation or UI polish.
