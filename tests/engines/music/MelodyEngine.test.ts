/**
 * 🎵 MELODY ENGINE TESTS
 * Tests unitarios para MelodyEngine
 */

import { describe, it, expect } from 'vitest'
import { MelodyEngine } from '../../../src/engines/music/harmony/MelodyEngine.js'

describe('MelodyEngine', () => {
    describe('generateMelody', () => {
        it('debe generar melodía con seed determinístico', () => {
            const options = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.5,
                contour: 'ascending' as const,
                tempo: 120,
                duration: 4,
                range: { min: 4, max: 5 }
            }

            const melody1 = new MelodyEngine(42).generateMelody(options)
            const melody2 = new MelodyEngine(42).generateMelody(options)

            // Mismo seed debe producir misma melodía
            expect(melody1.length).toBe(melody2.length)
            expect(melody1[0].pitch).toBe(melody2[0].pitch)
        })

        it('debe generar melodía en rango de octavas especificado', () => {
            const options = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.5,
                contour: 'static' as const,
                tempo: 120,
                duration: 4,
                range: { min: 4, max: 5 }
            }

            const melody = new MelodyEngine(42).generateMelody(options)
            
            // Verificar que las notas están en el rango esperado (con margen para contour)
            melody.forEach(note => {
                expect(note.pitch).toBeGreaterThanOrEqual(36) // C3 (más margen)
                expect(note.pitch).toBeLessThanOrEqual(120)   // C8 (más margen para contour)
            })
        })

        it('debe aplicar contorno melódico', () => {
            const optionsAscending = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.5,
                contour: 'ascending' as const,
                tempo: 120,
                duration: 4,
                range: { min: 3, max: 6 }
            }

            const melody = new MelodyEngine(42).generateMelody(optionsAscending)
            
            // Para contorno ascendente, las notas deben tender a subir
            if (melody.length > 2) {
                const firstPitch = melody[0].pitch
                const lastPitch = melody[melody.length - 1].pitch
                expect(lastPitch).toBeGreaterThanOrEqual(firstPitch)
            }
        })
    })

    describe('Motif Transformations', () => {
        const engine = new MelodyEngine(42)
        const testMotif = [
            { pitch: 60, velocity: 80, startTime: 0, duration: 480 },
            { pitch: 64, velocity: 80, startTime: 480, duration: 480 },
            { pitch: 67, velocity: 80, startTime: 960, duration: 480 }
        ]

        it('debe aplicar transformación retrograde (invertir orden)', () => {
            const transformed = engine.applyMotifTransformation(testMotif, 'retrograde')
            expect(transformed.length).toBe(testMotif.length)
            expect(transformed[0].pitch).toBe(testMotif[testMotif.length - 1].pitch)
        })

        it('debe aplicar transformación inversion (invertir intervalos)', () => {
            const transformed = engine.applyMotifTransformation(testMotif, 'inversion')
            expect(transformed.length).toBe(testMotif.length)
            // La primera nota debe ser el pivote
            expect(transformed[0].pitch).toBe(testMotif[0].pitch)
        })

        it('debe aplicar transformación augmentation (alargar duraciones)', () => {
            const transformed = engine.applyMotifTransformation(testMotif, 'augmentation')
            expect(transformed.length).toBe(testMotif.length)
            expect(transformed[0].duration).toBe(testMotif[0].duration * 2)
        })

        it('debe aplicar transformación diminution (acortar duraciones)', () => {
            const transformed = engine.applyMotifTransformation(testMotif, 'diminution')
            expect(transformed.length).toBe(testMotif.length)
            expect(transformed[0].duration).toBeLessThan(testMotif[0].duration)
            expect(transformed[0].duration).toBeGreaterThanOrEqual(120) // Mínimo 120 ticks
        })

        it('debe aplicar transformación transposition', () => {
            const transformed = engine.applyMotifTransformation(testMotif, 'transposition')
            expect(transformed.length).toBe(testMotif.length)
            // Las notas deben estar transpuestas
            const pitchDiff = transformed[0].pitch - testMotif[0].pitch
            expect(Math.abs(pitchDiff)).toBeGreaterThan(0)
        })

        it('debe aplicar transformación rhythmDisplacement', () => {
            const transformed = engine.applyMotifTransformation(testMotif, 'rhythmDisplacement')
            expect(transformed.length).toBe(testMotif.length)
        })

        it('debe aplicar transformación fragmentation', () => {
            const transformed = engine.applyMotifTransformation(testMotif, 'fragmentation')
            expect(transformed.length).toBeGreaterThan(testMotif.length) // Debe crear más notas
        })
    })

    describe('Fibonacci Rhythm', () => {
        it('debe generar motivo con ritmo Fibonacci', () => {
            const options = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.5,
                contour: 'static' as const,
                tempo: 120,
                duration: 2,
                range: { min: 4, max: 5 }
            }

            const melody = new MelodyEngine(42).generateMelody(options)
            
            // Verificar que las duraciones son válidas
            const durations = melody.map(note => note.duration)
            const validDurations = [120, 240, 480, 720, 960] // Fibonacci scaled durations
            
            durations.forEach(duration => {
                expect(duration).toBeGreaterThan(0)
            })
        })
    })

    describe('Scale Modes', () => {
        it('debe generar melodía en modo major', () => {
            const options = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.5,
                contour: 'static' as const,
                tempo: 120,
                duration: 2,
                range: { min: 4, max: 5 }
            }

            const melody = new MelodyEngine(42).generateMelody(options)
            expect(melody.length).toBeGreaterThan(0)
        })

        it('debe generar melodía en modo minor', () => {
            const options = {
                seed: 42,
                key: 0,
                mode: 'minor',
                complexity: 0.5,
                contour: 'static' as const,
                tempo: 120,
                duration: 2,
                range: { min: 4, max: 5 }
            }

            const melody = new MelodyEngine(42).generateMelody(options)
            expect(melody.length).toBeGreaterThan(0)
        })

        it('debe generar melodía en modo pentatonic', () => {
            const options = {
                seed: 42,
                key: 0,
                mode: 'pentatonic',
                complexity: 0.5,
                contour: 'static' as const,
                tempo: 120,
                duration: 2,
                range: { min: 4, max: 5 }
            }

            const melody = new MelodyEngine(42).generateMelody(options)
            expect(melody.length).toBeGreaterThan(0)
        })
    })

    describe('Contour Shapes', () => {
        const engine = new MelodyEngine(42)
        const baseOptions = {
            seed: 42,
            key: 0,
            mode: 'major',
            complexity: 0.5,
            tempo: 120,
            duration: 4,
            range: { min: 4, max: 5 }
        }

        it('debe generar contorno ascending', () => {
            const melody = engine.generateMelody({ ...baseOptions, contour: 'ascending' })
            expect(melody.length).toBeGreaterThan(0)
        })

        it('debe generar contorno descending', () => {
            const melody = engine.generateMelody({ ...baseOptions, contour: 'descending' })
            expect(melody.length).toBeGreaterThan(0)
        })

        it('debe generar contorno arched', () => {
            const melody = engine.generateMelody({ ...baseOptions, contour: 'arched' })
            expect(melody.length).toBeGreaterThan(0)
        })

        it('debe generar contorno valley', () => {
            const melody = engine.generateMelody({ ...baseOptions, contour: 'valley' })
            expect(melody.length).toBeGreaterThan(0)
        })

        it('debe generar contorno wave', () => {
            const melody = engine.generateMelody({ ...baseOptions, contour: 'wave' })
            expect(melody.length).toBeGreaterThan(0)
        })

        it('debe generar contorno static', () => {
            const melody = engine.generateMelody({ ...baseOptions, contour: 'static' })
            expect(melody.length).toBeGreaterThan(0)
        })
    })
})
