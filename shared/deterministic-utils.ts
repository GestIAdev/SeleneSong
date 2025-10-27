// 🎯 DETERMINISTIC RANDOM UTILITY - NO deterministicRandom()
// ⚡ Algoritmo procedural puro: Linear Congruential Generator (LCG)
// 🔒 Semilla fija para 100% determinismo

const DETERMINISTIC_SEED = 1728345600000; // Timestamp fijo para determinismo
let state = DETERMINISTIC_SEED;

const a = 1664525; // Multiplicador
const c = 1013904223; // Incremento
const m = 4294967296; // Módulo (2^32)

export function deterministicRandom(): number {
  state = (a * state + c) % m;
  return state / m; // Retorna valor entre 0 y 1
}

// 🎨 Función para números enteros deterministas
export function deterministicInt(min: number, _max: number): number {
  return Math.floor(deterministicRandom() * (_max - min + 1)) + min;
}

// 🔮 Función para booleanos deterministas
export function deterministicBool(_probability: number = 0.5): boolean {
  return deterministicRandom() < _probability;
}

// 🎯 Reset del estado para pruebas consistentes
export function resetDeterministicState(): void {
  state = DETERMINISTIC_SEED;
}
