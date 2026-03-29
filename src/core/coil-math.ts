export const STEEL_DENSITY = 0.284;

/**
 * Calculates total weight based on volume of a cylinder with a hole.
 * @param width Width of the coil in inches.
 * @param id Inner diameter of the coil in inches.
 * @param od Outer diameter of the coil in inches.
 */
export function calculateCoilWeight(width: number, id: number, od: number): number {
  const outerRadius = od / 2;
  const innerRadius = id / 2;
  const volume = Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2)) * width;
  return volume * STEEL_DENSITY;
}

/**
 * Calculates the outer diameter to stop at after removing a specific weight.
 * @param width Width of the coil in inches.
 * @param id Inner diameter of the coil in inches.
 * @param currentOD Current outer diameter of the coil in inches.
 * @param weightToRemove Weight to be removed in lbs.
 */
export function calculateStopOD(width: number, id: number, currentOD: number, weightToRemove: number): number {
  const currentRadius = currentOD / 2;
  const volumeToRemove = weightToRemove / STEEL_DENSITY;
  const stopRadiusSquared = Math.pow(currentRadius, 2) - (volumeToRemove / (Math.PI * width));
  
  // Ensure we don't return something below the ID
  const stopRadius = Math.sqrt(Math.max(stopRadiusSquared, Math.pow(id / 2, 2)));
  return stopRadius * 2;
}
