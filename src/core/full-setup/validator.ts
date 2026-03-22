import { z } from "zod";
import { MachineProfile } from "../../config/machine-profiles";
import { 
  Result, 
  err, 
  formatInches 
} from "../utils";
import { 
  FullSetupInputs, 
  FullSetupResult, 
  StripEntry, 
  ValidatedSetupConfig, 
} from "./types";
import { generateFullSetup } from "./logic";

// --- ZOD SCHEMAS ---

/**
 * Validates a single strip entry from the UI.
 * Handles conversion from string to number.
 */
const StripSchema = z.object({
  width: z.coerce.number().positive("Strip width must be greater than 0."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  minusTol: z.coerce.number().min(0).max(0.500, "Tolerance max 0.500").default(0),
  plusTol: z.coerce.number().min(0).max(0.500, "Tolerance max 0.500").default(0),
});

/**
 * Validates the main setup configuration from the UI.
 */
const SetupConfigSchema = z.object({
  orderNumber: z.string().optional(),
  companyName: z.string().optional(),
  coilWidth: z.coerce.number().positive("Coil width must be greater than 0."),
  coilWeight: z.string().optional(),
  gauge: z.string().optional(),
  knifeSize: z.coerce.number().positive(),
  clearance: z.coerce.number().min(0),
  strictMode: z.boolean().default(false),
});

/**
 * BOUNDARY FUNCTION: Parsing & Validation
 * Converts raw UI inputs into a ValidatedSetupConfig.
 */
export function calculateFullSetup(
  inputs: FullSetupInputs,
  strips: StripEntry[],
  machine: MachineProfile
): Result<FullSetupResult, string> {
  // 1. Validate main inputs
  const configParse = SetupConfigSchema.safeParse(inputs);
  if (!configParse.success) {
    // Return the first error found for simplicity in UI
    return err(configParse.error.issues[0].message);
  }
  const config = configParse.data;

  // 2. Machine boundary check
  if (config.coilWidth > machine.arborLength) {
    return err(`Coil width (${formatInches(config.coilWidth)}") exceeds arbor length (${machine.arborLength}").`);
  }

  // 3. Validate strips
  const validatedStrips = [];
  for (const s of strips) {
    const stripParse = StripSchema.safeParse(s);
    if (!stripParse.success) {
      const errorMsg = stripParse.error.issues[0].message;
      const widthContext = s.width ? `Strip ${s.width}": ` : "One of the strips: ";
      return err(`${widthContext}${errorMsg}`);
    }
    
    // Map to internal ValidatedStrip type
    const data = stripParse.data;
    validatedStrips.push({
      width: data.width,
      quantity: data.quantity,
      minus: data.minusTol,
      plus: data.plusTol
    });
  }

  // 4. Assemble the final config for the engine
  const fullConfig: ValidatedSetupConfig = {
    ...config,
    strips: validatedStrips,
    orderNumber: config.orderNumber || "",
    companyName: config.companyName || "",
    coilWeight: config.coilWeight || "",
    gauge: config.gauge || "",
  };

  return generateFullSetup(fullConfig, machine);
}
