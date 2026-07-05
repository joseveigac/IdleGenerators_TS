/**
 * IdleGen - Common Types
 *
 * Tipos compartidos en todo el proyecto
 */

// ============================================================================
// MATH
// ============================================================================

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// ============================================================================
// PLACED INSTANCES (GENERIC SYSTEM)
// ============================================================================

/**
 * Tipo de instancia colocada
 */
export type PlacedType = "generator";

/**
 * Instancia genérica colocada en el mundo
 */
export interface PlacedInstance<T = unknown> {
  id: string;
  type: PlacedType;
  placedAt: number;
  posKey: string; // "dimensionId:x,y,z"
  ownerId?: string; // Player ID (Optional)
  data: T;
}
