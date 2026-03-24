# Slit Master - Project Context

## Overview
This project is a React (TypeScript) application for calculating slitter setup tooling. It handles complex optimization for "male" and "female" tooling pairs within specified tolerance windows.

## Mandatory Boundaries
- **CRITICAL**: Never merge feature branches into `main` without explicit permission from the user.
- The `main` branch should only be updated with individual files (like `README.md`) if requested, but core feature code must remain isolated in feature branches until final approval.

## Current State: `feature/arbor-stations` branch
We refactored the data structure to mirror the physical arbors of the slitting machine.

### Key Changes
- **Arbor Cuts**: Replaced the previous `cuts` array with an explicit `cuts` array of `ArborCut` objects. Each cut represents a single physical strip and contains both `bottomStack` and `topStack`.
- **Alternating Logic**: Implementation ensures that Male and Female positions alternate across the arbors (Cut 1: Male-Bottom, Cut 2: Female-Bottom, etc.).
- **Physical Widths**: The system now calculates the exact physical space used on each arbor individually: `Arbor Width = Spacers + (Cuts + 1) * Knife Size`.
- **View Modes**: Added "Short View" (grouped identical consecutive cuts) and "Long View" (every cut listed individually) for reporting.
- **Day View**: UI updated to use high-contrast light colors (Whites, Blues, Greens) to ensure visibility in high-light environments.
- **Package Migration**: Project migrated from `npm` to `pnpm` and upgraded to Vite 8.

## Core Technical Logic
- **Solver (`solver.ts`)**: Uses a **Greedy** approach for the bulk of the width and **Dynamic Programming (DP)** for the final precision gap.
- **Optimizer (`optimizer.ts`)**: Iterates through 0.001" increments within the user's tolerance window to minimize total tool count across both arbors.
- **Shoulders (`utils.ts`)**: Centers both arbors independently on the machine by calculating a `baseShoulder` from the material width and applying physical offsets (`bottomOpening = base + clearance`).

## Project Commands
- **Dev**: `pnpm dev`
- **Test**: `pnpm test`
- **Build**: `pnpm build`
- **Deploy**: `pnpm deploy` (Uses `gh-pages`)

## Important Notes
- Always ensure `MachineProfile` is imported in `useFullSetup.ts` to avoid build failures.
- The `vite.config.ts` has a `base` set to `/ToolingTs/` for GitHub Pages compatibility.
- **Global Styles**: Global light mode is enforced in `index.css` to override system-level dark mode settings.

## Upcoming Feature: Overarm Setup
- **Objective**: Generate a matching overarm layout from the slitter setup.
- **Tooling Inventory**: 3", 2", 1", 0.500", 0.250", 0.125", 0.0625", 0.03125" (note: user specified 0.0325, likely 1/32" = 0.03125).
- **Separators**: 0.094" separator discs.
- **Cut Width**: Each cut is slitter cut width + 0.0625" (padding).
- **Disc Logic**: Each cut is surrounded by separator discs ($N$ cuts = $N+1$ discs).
- **Shoulder Logic**: 
  - Overarm shoulders are reversed from slitter setup (Slitter Opening = Overarm Closing).
  - "Extra width" (from 0.0625 padding + 0.094 discs vs slitter knives/clearance) must be removed evenly from both shoulders to keep overarms centered.

