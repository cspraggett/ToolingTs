# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Steel tooling calculator — a React + TypeScript + Vite app for calculating tooling setups on steel slitting machines. Optimizes tool stack configurations for single cuts, dual-purpose setups (male/female dies), and full production runs across multiple strips.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build
- `npm run test` — Run Vitest (watch mode by default)
- `npx vitest run` — Run tests once without watch
- `npx vitest run src/core/solver.test.ts` — Run a single test file
- `npm run lint` — ESLint with strict type-aware rules
- `npm run deploy` — Build and deploy to GitHub Pages

## Architecture

### Core / UI separation

All calculation logic lives in `src/core/` as pure functions with no side effects. UI code lives in `src/ui/`. This separation is intentional — core logic should never import from ui.

### Unit system

Internally, all measurements use integer units where **1 inch = 1000 units**. This avoids floating-point precision errors in the DP solver. Convert at system boundaries only using `inchesToUnits()` / `unitsToInches()` from `src/core/utils.ts`.

### Solver (`src/core/solver.ts`)

Dynamic programming algorithm that finds the optimal tool stack (fewest tools, preferring larger sizes) to hit a target width. Each tool size is limited to max 2 uses per stack. Handles strict mode (excludes small tools) and clearance-only tool filtering.

### Optimizer (`src/core/optimizer.ts`)

Wraps the solver for dual-purpose setups. Iterates through a tolerance window to find the best offset where both male and female die stacks minimize total tool count, with tie-breaking toward smaller offsets.

### Machine profiles (`src/config/machine-profiles.ts`)

Data-driven machine definitions (Slitter 3, Slitter 4) with available tool sizes, knife widths, arbor lengths, and exclusion lists. The `MACHINES` registry and `DEFAULT_MACHINE` are the entry points.

### Hook-per-feature pattern

Each application mode has a dedicated custom hook that owns all state and logic:
- `useSteelTooling` — Single mode
- `useStationCalculator` — Make Cut mode (dual optimization)
- `useFullSetup` — Full Setup mode (multi-strip production)

UI components consume these hooks and are kept thin.

### Styling

CSS Modules only (`src/ui/styles.module.css`). No Tailwind or component library. Forces light mode globally.

### Deployment

GitHub Pages at `/ToolingTs/` base path (configured in `vite.config.ts`).

## Key Conventions

- Strict TypeScript (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)
- React Compiler enabled via Babel plugin
- New calculation logic → pure function in `src/core/` with a vitest test
- New UI feature → custom hook in `src/ui/features/use[Feature].ts` + component in `src/ui/features/[Feature].tsx`
- State management is local React hooks — no Redux/Context
