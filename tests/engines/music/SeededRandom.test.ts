/**
 * 🎸 TEST: SEEDED RANDOM
 */

import { SeededRandom } from '../../../src/engines/music/utils/SeededRandom'

describe('SeededRandom', () => {
    it('debe generar misma secuencia con mismo seed', () => {
        const rng1 = new SeededRandom(12345)
        const rng2 = new SeededRandom(12345)
        
        expect(rng1.next()).toBe(rng2.next())
        expect(rng1.next()).toBe(rng2.next())
        expect(rng1.next()).toBe(rng2.next())
    })
    
    it('debe generar diferentes secuencias con diferentes seeds', () => {
        const rng1 = new SeededRandom(12345)
        const rng2 = new SeededRandom(54321)
        
        expect(rng1.next()).not.toBe(rng2.next())
    })
    
    it('debe generar números entre 0 y 1', () => {
        const rng = new SeededRandom(999)
        
        for (let i = 0; i < 100; i++) {
            const n = rng.next()
            expect(n).toBeGreaterThanOrEqual(0)
            expect(n).toBeLessThan(1)
        }
    })
})
