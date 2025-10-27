/**
 * 🎸 SEEDED RANDOM - RNG DETERMINISTICO
 * 100% reproducible, 0% Math.random()
 */

export class SeededRandom {
    private seed: number
    
    constructor(seed: number) {
        this.seed = seed
    }
    
    /**
     * Generar siguiente número (0-1)
     * Algoritmo: Mulberry32
     */
    next(): number {
        let t = this.seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
    
    /**
     * Número entero en rango [min, max]
     */
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min
    }
    
    /**
     * Elemento aleatorio de array
     */
    choice<T>(array: T[]): T {
        return array[this.nextInt(0, array.length - 1)]
    }
    
    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffle<T>(array: T[]): T[] {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i)
            ;[result[i], result[j]] = [result[j], result[i]]
        }
        return result
    }
}

