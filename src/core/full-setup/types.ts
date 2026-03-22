import { SolverResult } from "../solver";
import { ToolSummary } from "../utils";

// --- Input Types (Strings from UI) ---
export interface StripEntry {
  id: string;
  width: string;
  quantity: string;
  minusTol: string;
  plusTol: string;
}

export interface FullSetupInputs {
  orderNumber: string;
  companyName: string;
  coilWidth: string;
  coilWeight: string;
  gauge: string;
  knifeSize: string;
  clearance: string;
  strictMode: boolean;
}

// --- Internal Validated Types (Numbers for Logic) ---
export interface ValidatedStrip {
  width: number;
  quantity: number;
  minus: number;
  plus: number;
}

export interface ValidatedSetupConfig {
  coilWidth: number;
  knifeSize: number;
  clearance: number;
  strictMode: boolean;
  strips: ValidatedStrip[];
  // Metadata kept for the final result
  orderNumber: string;
  companyName: string;
  coilWeight: string;
  gauge: string;
}

// --- Result Types ---
export interface ArborCut {
  cutIndex: number; 
  width: number;
  bottomStack: SolverResult;
  topStack: SolverResult;
  bottomSummary: ToolSummary[];
  topSummary: ToolSummary[];
  type: 'male-bottom' | 'female-bottom';
}

export interface GroupedArborCut {
  startIdx: number;
  endIdx: number;
  count: number;
  cut: ArborCut;
}

export interface FullSetupResult {
  cuts: ArborCut[];
  groupedCuts: GroupedArborCut[];
  grandTotalTools: number;
  totalKnives: number;
  stripTotal: number;
  bottomArborUsed: number;
  topArborUsed: number;
  orderNumber: string;
  companyName: string;
  coilWidth: number;
  coilWeight: string;
  gauge: string;
  edgeTrim: number;
  clearance: number;
  bottomOpening: SolverResult;
  topOpening: SolverResult;
  bottomClosing: SolverResult;
  topClosing: SolverResult;
  bottomOpeningSummary: ToolSummary[];
  topOpeningSummary: ToolSummary[];
  bottomClosingSummary: ToolSummary[];
  topClosingSummary: ToolSummary[];
  shouldersValid: boolean;
}
