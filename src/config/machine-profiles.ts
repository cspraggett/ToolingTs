export interface MachineProfile {
  id: string;
  name: string;
  tools: number[];
}

export const DEFAULT_MACHINE: MachineProfile = {
  id: "slitter-1",
  name: "Standard Slitter",
  tools: [
    3, 2, 1,
    0.875, 0.75, 0.625, 0.5, 0.4, 0.375, 0.3,
    0.26, 0.257, 0.255, 0.253, 0.252, 0.251, 0.25, 0.24,
    0.2, 0.125, 0.1,
    0.062, 0.05, 0.031
  ]
};

// This is where we will add the new machine later
export const MACHINES: Record<string, MachineProfile> = {
  [DEFAULT_MACHINE.id]: DEFAULT_MACHINE,
};