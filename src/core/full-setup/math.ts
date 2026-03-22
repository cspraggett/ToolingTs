import { KnifeClearanceStrategy } from "../../config/machine-profiles";
import { ArborCut, ValidatedStrip } from "./types";

/**
 * Calculates the total physical space used on the arbor by material and knives.
 */
export const computeCoilUsage = (strips: ValidatedStrip[], knifeSize: number) => {
  const totalStrips = strips.reduce((sum, s) => sum + s.quantity, 0);
  // Physical slitter rule: Each cut has a pair of knives (top/bottom)
  // PLUS the edge knives on each end. 
  // For 3 strips, we have 3 pairs = 6 knives, PLUS 2 edge knives = 8.
  // Formula: 2 * totalStrips + 2
  const totalKnives = 2 * totalStrips + 2;
  const stripTotal = strips.reduce((sum, s) => sum + s.width * s.quantity, 0);
  const arborUsed = stripTotal + totalKnives * knifeSize;
  return { totalStrips, totalKnives, stripTotal, arborUsed };
};

/**
 * Determines which side (bottom or top) receives the clearance offset.
 */
export const computeKnifeClearance = (
  knifeSize: number, 
  clearance: number, 
  strategies: KnifeClearanceStrategy[]
) => {
  const strategy = strategies.find(s => s.knifeSize === knifeSize);
  
  if (!strategy) return { bottomClearance: clearance, topClearance: 0 };

  if (strategy.type === 'offset') {
    return { bottomClearance: clearance + strategy.value, topClearance: 0 };
  } else if (strategy.type === 'split') {
    if (clearance < strategy.value) {
      return { bottomClearance: 0, topClearance: strategy.value - clearance };
    } else {
      return { bottomClearance: clearance - strategy.value, topClearance: 0 };
    }
  }

  return { bottomClearance: clearance, topClearance: 0 };
};

const roundToTenThousandth = (val: number) => Math.round(val * 10000) / 10000;

/**
 * Calculates the 4 shoulder areas (Opening Bottom/Top, Closing Bottom/Top).
 */
export function computeShoulders(
  stripTotal: number,
  arborLength: number,
  knifeSize: number,
  bottomClearance: number,
  topClearance: number,
  bottomArborUsed: number,
  topArborUsed: number
) {
  // 1. Center the entire layout on the arbor in 1/8" increments for physical simplicity.
  const rawBaseShoulder = (arborLength - stripTotal) / 2;
  const baseShoulder = Math.round(rawBaseShoulder / 0.125) * 0.125;
  
  // 2. Adjust for knife size (since knives are offset from the strip edge)
  const knifeRoundedUp = Math.ceil(knifeSize / 0.125) * 0.125;

  // 3. Apply clearance offsets
  const bottomOpening = roundToTenThousandth(baseShoulder + bottomClearance);
  const topOpening = roundToTenThousandth(baseShoulder - knifeRoundedUp + topClearance);
  
  const bottomClosing = roundToTenThousandth(arborLength - bottomOpening - bottomArborUsed);
  const topClosing = roundToTenThousandth(arborLength - topOpening - topArborUsed);

  const minShoulder = Math.min(bottomOpening, topOpening, bottomClosing, topClosing);
  
  // Safety rule: All shoulders must be at least 1.0" for physical stability.
  return { bottomOpening, topOpening, bottomClosing, topClosing, isValid: minShoulder >= 1.0 };
}

/**
 * Groups consecutive identical cuts into a single summary.
 */
export function summarizeCuts(cuts: ArborCut[]): any[] {
  if (cuts.length === 0) return [];
  
  const groups: any[] = [];
  
  let currentGroup: any = {
    startIdx: cuts[0].cutIndex,
    endIdx: cuts[0].cutIndex,
    count: 1,
    cut: cuts[0]
  };
  
  for (let i = 1; i < cuts.length; i++) {
    const s = cuts[i];
    const prev = currentGroup.cut;
    
    // Group consecutive cuts with the same strip width.
    const isMatch = s.width === prev.width;
                    
    if (isMatch) {
      currentGroup.endIdx = s.cutIndex;
      currentGroup.count++;
    } else {
      groups.push(currentGroup);
      currentGroup = {
        startIdx: s.cutIndex,
        endIdx: s.cutIndex,
        count: 1,
        cut: s
      };
    }
  }
  groups.push(currentGroup);
  return groups;
}
