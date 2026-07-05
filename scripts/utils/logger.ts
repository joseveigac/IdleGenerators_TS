export const LOG_CONFIG = {
  DEBUG: false, // 🔁 activar en desarrollo
  WARN: true, // ⚠️ mantener en producción
};

export function log(...args: any[]) {
  if (!LOG_CONFIG.DEBUG) return;
  console.log("[IdleOre]", ...args);
}

export function warn(...args: any[]) {
  if (!LOG_CONFIG.WARN) return;
  console.warn("[IdleOre]", ...args);
}

export function error(...args: any[]) {
  console.error("[IdleOre]", ...args);
}
