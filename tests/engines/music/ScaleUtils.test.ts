/**
 * 🎸 TEST: SCALE UTILS
 */

import { getScaleNotes, getScaleDegree } from '../../../src/engines/music/utils/ScaleUtils'

describe('ScaleUtils', () => {
    it('debe generar escala major correcta', () => {
        const notes = getScaleNotes(60, 'major')
        expect(notes).toEqual([60, 62, 64, 65, 67, 69, 71])
    })
    
    it('debe generar escala dorian correcta', () => {
        const notes = getScaleNotes(60, 'dorian')
        expect(notes).toEqual([60, 62, 63, 65, 67, 69, 70])
    })
    
    it('debe obtener grado de escala correcto', () => {
        const degree1 = getScaleDegree(60, 'major', 1)
        const degree5 = getScaleDegree(60, 'major', 5)
        
        expect(degree1).toBe(60)
        expect(degree5).toBe(67)
    })
})
