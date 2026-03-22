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
  ValidatedStrip 
} from "./types";
import { generateFullSetup } from "./logic";

/**
 * BOUNDARY FUNCTION: Parsing & Validation
 * Converts raw UI inputs into a ValidatedSetupConfig.
 */
export function calculateFullSetup(
  inputs: FullSetupInputs,
  strips: StripEntry[],
  machine: MachineProfile
): Result<FullSetupResult, string> {
  const coilWidth = parseFloat(inputs.coilWidth);
  const knifeSize = parseFloat(inputs.knifeSize);
  const clearance = parseFloat(inputs.clearance);

  if (isNaN(coilWidth) || coilWidth <= 0) return err("Please enter a valid coil width.");
  if (coilWidth > machine.arborLength) return err(`Coil width (${formatInches(coilWidth)}") exceeds arbor length (${machine.arborLength}").`);

  const parsedStrips: ValidatedStrip[] = [];
  for (const stripEntry of strips) {
    const width = parseFloat(stripEntry.width);
    const quantity = parseInt(stripEntry.quantity, 10);
    const minus = parseFloat(stripEntry.minusTol) || 0;
    const plus = parseFloat(stripEntry.plusTol) || 0;
    
    if (isNaN(width) || width <= 0) return err("Each strip width must be greater than 0.");
    if (isNaN(quantity) || quantity < 1) return err("Each strip quantity must be at least 1.");
    if (plus > 0.500 || minus > 0.500) {
      return err(`Strip ${formatInches(width)}": tolerance is too large (Max 0.500).`);
    }
    
    parsedStrips.push({ width, quantity, minus, plus });
  }

  const config: ValidatedSetupConfig = {
    coilWidth,
    knifeSize,
    clearance,
    strictMode: inputs.strictMode,
    strips: parsedStrips,
    orderNumber: inputs.orderNumber,
    companyName: inputs.companyName,
    coilWeight: inputs.coilWeight,
    gauge: inputs.gauge,
  };

  return generateFullSetup(config, machine);
}
