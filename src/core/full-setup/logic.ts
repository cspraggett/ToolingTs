import { MachineProfile } from "../../config/machine-profiles";
import { findBestDualSetup } from "../optimizer";
import { findToolingSetup, SolverResult } from "../solver";
import { 
  summarizeStack,
  Result,
  ok,
  err,
  DEFAULT_UNITS_PER_INCH,
  HALF_THOU_UNITS_PER_INCH,
  hasHalfThou,
  inchesToUnits,
  unitsToInches,
  formatInches
} from "../utils";
import { 
  ArborCut, 
  FullSetupResult, 
  ValidatedSetupConfig 
} from "./types";
import { 
  computeCoilUsage, 
  computeKnifeClearance, 
  computeShoulders,
  summarizeCuts
} from "./math";

/**
 * PURE CALCULATION ENGINE
 * This function handles only numerical data and business logic.
 */
export function generateFullSetup(
  config: ValidatedSetupConfig,
  machine: MachineProfile
): Result<FullSetupResult, string> {
  const { coilWidth, knifeSize, clearance, strictMode, strips } = config;
  const isStrictCapable = !!machine.strictExclude?.length;

  // 1. Compute physical coil usage
  const { totalKnives, stripTotal, arborUsed } = computeCoilUsage(strips, knifeSize);

  if (stripTotal > coilWidth) {
    return err(`Total cut width (${formatInches(stripTotal)}") exceeds coil width (${formatInches(coilWidth)}").`);
  }
  if (arborUsed > machine.arborLength) {
    return err(`Setup (${formatInches(stripTotal)}" cuts + ${totalKnives} knives) exceeds arbor length (${machine.arborLength}").`);
  }
  
  // Physical Layout rule: 
  // Bottom Arbor = Spacers + Knives
  // Top Arbor = Spacers + Knives
  // (We'll calculate the actual tool stacks first, then check total width)

  // 2. Create all individual cuts
  const cuts: ArborCut[] = [];
  let grandTotalTools = 0;
  let cutCounter = 1;

  for (const strip of strips) {
    for (let i = 0; i < strip.quantity; i++) {
      const nominalFemale = strip.width;
      
      // Determine precision for this strip to avoid floating point drift
      let precision = DEFAULT_UNITS_PER_INCH;
      if (hasHalfThou(nominalFemale) || hasHalfThou(clearance) || machine.tools.some(t => hasHalfThou(t))) {
        precision = HALF_THOU_UNITS_PER_INCH;
      }

      const femaleUnits = inchesToUnits(nominalFemale, precision);
      const knifeUnits = inchesToUnits(knifeSize, precision);
      const clearanceUnits = inchesToUnits(clearance, precision);
      
      const maleUnits = femaleUnits - (knifeUnits * 2) - (clearanceUnits * 2);
      const nominalMale = unitsToInches(maleUnits, precision);

      if (nominalMale <= 0) {
        return err(`Strip ${formatInches(strip.width)}": knives + clearance exceed the strip width.`);
      }

      const dualResult = findBestDualSetup(
        nominalMale,
        nominalFemale,
        { minus: strip.minus, plus: strip.plus },
        machine,
        clearance,
        { strictMode: isStrictCapable && strictMode }
      );

      if (!dualResult) return err(`No solution found for strip width ${formatInches(strip.width)}".`);

      const type: 'male-bottom' | 'female-bottom' = (cutCounter % 2 !== 0) ? 'male-bottom' : 'female-bottom';
      
      const bottomStack = type === 'male-bottom' ? dualResult.maleResult : dualResult.femaleResult;
      const topStack = type === 'male-bottom' ? dualResult.femaleResult : dualResult.maleResult;

      cuts.push({
        cutIndex: cutCounter,
        width: strip.width,
        bottomStack,
        topStack,
        bottomSummary: summarizeStack(bottomStack.stack, machine.toolLabels),
        topSummary: summarizeStack(topStack.stack, machine.toolLabels),
        type
      });
      
      grandTotalTools += dualResult.totalToolCount;
      cutCounter++;
    }
  }

  // 3. Compute physical arbor setup widths
  const setupKnivesCount = cuts.length + 1;
  const bottomSpacersTotal = cuts.reduce((sum, s) => sum + s.bottomStack.target, 0);
  const topSpacersTotal = cuts.reduce((sum, s) => sum + s.topStack.target, 0);
  
  const bottomArborUsed = bottomSpacersTotal + setupKnivesCount * knifeSize;
  const topArborUsed = topSpacersTotal + setupKnivesCount * knifeSize;

  if (bottomArborUsed > machine.arborLength || topArborUsed > machine.arborLength) {
    const maxArbor = Math.max(bottomArborUsed, topArborUsed);
    return err(`Physical setup (${formatInches(maxArbor)}") exceeds arbor length (${machine.arborLength}").`);
  }

  // 4. Compute arbor centering shoulders
  const { bottomClearance, topClearance } = computeKnifeClearance(knifeSize, clearance, machine.knifeClearanceStrategies);
  const shoulders = computeShoulders(
    stripTotal,
    machine.arborLength,
    knifeSize,
    bottomClearance,
    topClearance,
    bottomArborUsed,
    topArborUsed
  );

  // 5. Solve tooling stacks for shoulders
  // Determine global precision for this setup to ensure shoulders and cuts agree
  let globalPrecision = DEFAULT_UNITS_PER_INCH;
  if (hasHalfThou(clearance) || strips.some(s => hasHalfThou(s.width)) || machine.tools.some(t => hasHalfThou(t))) {
    globalPrecision = HALF_THOU_UNITS_PER_INCH;
  }

  const shoulderTargets = [
    { key: "bottomOpening" as const, value: shoulders.bottomOpening, strict: true },
    { key: "topOpening" as const, value: shoulders.topOpening, strict: true },
    { key: "bottomClosing" as const, value: shoulders.bottomClosing, strict: false },
    { key: "topClosing" as const, value: shoulders.topClosing, strict: false },
  ];

  const solvedShoulders: Record<string, SolverResult> = {};
  for (const target of shoulderTargets) {
    // Normalize target to the requested precision to avoid floating point drift
    const normalizedTarget = unitsToInches(inchesToUnits(target.value, globalPrecision), globalPrecision);

    const solution = findToolingSetup(normalizedTarget, machine, { 
      strictMode: target.strict,
      skipClearanceFilter: true
    });
    if (!solution) return err(`No tooling solution for ${target.key} shoulder (${formatInches(normalizedTarget)}").`);
    solvedShoulders[target.key] = solution;
  }

  return ok({
    cuts,
    groupedCuts: summarizeCuts(cuts),
    grandTotalTools,
    totalKnives,
    stripTotal,
    bottomArborUsed,
    topArborUsed,
    orderNumber: config.orderNumber,
    companyName: config.companyName,
    coilWidth,
    coilWeight: config.coilWeight,
    gauge: config.gauge,
    edgeTrim: coilWidth - stripTotal,
    clearance,
    bottomOpening: solvedShoulders.bottomOpening,
    topOpening: solvedShoulders.topOpening,
    bottomClosing: solvedShoulders.bottomClosing,
    topClosing: solvedShoulders.topClosing,
    bottomOpeningSummary: summarizeStack(solvedShoulders.bottomOpening.stack, machine.toolLabels),
    topOpeningSummary: summarizeStack(solvedShoulders.topOpening.stack, machine.toolLabels),
    bottomClosingSummary: summarizeStack(solvedShoulders.bottomClosing.stack, machine.toolLabels),
    topClosingSummary: summarizeStack(solvedShoulders.topClosing.stack, machine.toolLabels),
    shouldersValid: shoulders.isValid,
  });
}
