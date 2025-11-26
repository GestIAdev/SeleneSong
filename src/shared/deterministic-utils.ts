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

// 🆔 Generador de IDs deterministas (UUID-like)
export function deterministicId(prefix: string = '', suffix: string | number = ''): string {
  const hex = (len: number) => {
    let result = '';
    for (let i = 0; i < len; i++) {
      result += Math.floor(deterministicRandom() * 16).toString(16);
    }
    return result;
  };
  const uuid = `${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(12)}`;
  return prefix ? `${prefix}_${uuid}${suffix ? '_' + suffix : ''}` : uuid;
}

// 🌊 Noise determinista simple (para visualizaciones)
// Soporta firma: (x, y?, time?, seed?)
export function deterministicNoise(x: number, y: number = 0, time: number = 0, seed: string = ''): number {
  // Hash del seed para variar el resultado
  const seedHash = seed ? seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 0.001 : 0;
  // Simple hash-based noise con tiempo y seed
  const hash = Math.sin((x + seedHash) * 12.9898 + y * 78.233 + time * 0.1) * 43758.5453;
  return hash - Math.floor(hash);
}

// 🎭 Perlin noise simplificado determinista
export function deterministicPerlinNoise(x: number, y: number = 0, octaves: number = 4, seed: string = ''): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    value += deterministicNoise(x * frequency, y * frequency, 0, seed) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  return value / maxValue;
}
