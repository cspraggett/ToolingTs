export interface KnifeClearanceOffset {
  knifeSize: number;
  bottom: (userClearance: number) => number;
  top: (userClearance: number) => number;
}

export interface MachineProfile {
  id: string;
  name: string;
  tools: number[];
  knives: number[];
  clearanceOnly?: number[];
  strictExclude?: number[];
  arborLength: number; // inches
  knifeClearanceOffsets: KnifeClearanceOffset[];
}

// === SLITTER 3 (Current Workstation) ===
export const SLITTER_3: MachineProfile = {
  id: "slitter-3",
  name: "Slitter 3",
  tools: [
    3, 2, 1,
    0.875, 0.75, 0.625, 0.5, 0.4, 0.375, 0.3,
    0.26, 0.257, 0.255, 0.253, 0.252, 0.251, 0.25, 0.24,
    0.2, 0.125, 0.1,
    0.062, 0.05, 0.031
  ],
  knives: [0.243, 0.365, 0.480],
  strictExclude: [0.031, 0.062],
  arborLength: 64,
  knifeClearanceOffsets: [
    { knifeSize: 0.365, bottom: (clr) => clr, top: () => 0 },
    { knifeSize: 0.243, bottom: (clr) => clr + 0.003, top: () => 0 },
    { knifeSize: 0.480, bottom: (clr) => clr <= 0.010 ? 0 : clr - 0.010, top: (clr) => clr <= 0.010 ? 0.010 - clr : 0 },
  ],
};

// === SLITTER 4 (New Workstation) ===
export const SLITTER_4: MachineProfile = {
  id: "slitter-4",
  name: "Slitter 4",
  tools: [
    // Standard Spacers
    3.0000, 2.0000, 1.0000,
    0.8000, 0.4000, 0.2000, 0.1000,

    // Precision Spacers
    0.0750, 0.0650, 0.0580,
    0.0540, 0.0520, 0.0510,
    0.0505, // Regrind Compensator
    0.0500
  ],
  knives: [0.375],
  clearanceOnly: [0.0505],
  arborLength: 67,
  knifeClearanceOffsets: [
    { knifeSize: 0.375, bottom: (clr) => clr, top: () => 0 },
  ],
};

// === REGISTRY ===
export const MACHINES: Record<string, MachineProfile> = {
  [SLITTER_3.id]: SLITTER_3,
  [SLITTER_4.id]: SLITTER_4,
};

export const DEFAULT_MACHINE = SLITTER_3;