import { z } from "zod";
import { MachineProfile } from "../../config/machine-profiles";
import { findBestDualSetup, DualOptimizationResult } from "../optimizer";
import { Result, ok, err } from "../utils";

export const CutCalculatorSchema = z.object({
  cutSize: z.coerce.number().positive("Strip width must be greater than 0."),
  knifeSize: z.coerce.number().positive(),
  clearance: z.coerce.number().min(0),
  minusTol: z.coerce.number().min(0).max(0.500, "Tolerance max 0.500").default(0),
  plusTol: z.coerce.number().min(0).max(0.500, "Tolerance max 0.500").default(0),
  strictMode: z.boolean().default(false),
});

export type CutCalculatorInputs = z.infer<typeof CutCalculatorSchema>;

export function calculateCut(
  inputs: any, // Raw inputs from UI
  machine: MachineProfile
): Result<DualOptimizationResult, string> {
  const parse = CutCalculatorSchema.safeParse(inputs);
  if (!parse.success) {
    return err(parse.error.issues[0].message);
  }

  const { cutSize, knifeSize, clearance, minusTol, plusTol, strictMode } = parse.data;

  const nominalFemale = cutSize;
  const nominalMale = cutSize - knifeSize * 2 - clearance * 2;

  if (nominalMale <= 0) {
    return err("Knives + Clearance exceed strip width.");
  }

  const isStrictCapable = !!machine.strictExclude?.length;
  
  const dual = findBestDualSetup(
    nominalMale, 
    nominalFemale, 
    { minus: minusTol, plus: plusTol }, 
    machine, 
    clearance, 
    { strictMode: isStrictCapable && strictMode }
  );

  if (!dual) {
    return err("No tooling solution found for these targets.");
  }

  return ok(dual);
}
