/**
 * Convierte grados a radianes
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convierte radianes a grados
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

