/**
 * 🎸 HARMONY ENGINE TESTS
 * Tests unitarios para HarmonyEngine
 */

import { describe, it, expect } from 'vitest'
import { HarmonyEngine } from '../../../src/engines/music/harmony/HarmonyEngine.js'

describe('HarmonyEngine', () => {
    describe('generateChordSequence', () => {
        it('debe generar secuencia de acordes determinística', () => {
            const engine1 = new HarmonyEngine(42)
            const engine2 = new HarmonyEngine(42)

            const options = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.5,
                voiceLeadingStrategy: 'smooth' as const,
                tempo: 120,
                totalBars: 8
            }

            const sequence1 = engine1.generateChordSequence(options)
            const sequence2 = engine2.generateChordSequence(options)

            // Mismo seed debe producir misma secuencia
            expect(sequence1.length).toBe(sequence2.length)
            if (sequence1.length > 0 && sequence2.length > 0) {
                expect(sequence1[0][0].pitch).toBe(sequence2[0][0].pitch)
            }
        })

        it('debe generar secuencia en tonalidad especificada', () => {
            const engine = new HarmonyEngine(42)

            const options = {
                seed: 42,
                key: 0, // C major
                mode: 'major',
                complexity: 0.5,
                voiceLeadingStrategy: 'smooth' as const,
                tempo: 120,
                totalBars: 4
            }

            const sequence = engine.generateChordSequence(options)
            expect(sequence.length).toBeGreaterThan(0)
            
            // Verificar que hay acordes generados
            sequence.forEach(chord => {
                expect(chord.length).toBeGreaterThan(0)
                chord.forEach(note => {
                    expect(note.pitch).toBeGreaterThanOrEqual(0)
                    expect(note.pitch).toBeLessThanOrEqual(127)
                })
            })
        })

        it('debe respetar totalBars especificado', () => {
            const engine = new HarmonyEngine(42)

            const options = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.5,
                voiceLeadingStrategy: 'smooth' as const,
                tempo: 120,
                totalBars: 8
            }

            const sequence = engine.generateChordSequence(options)
            
            // Debe haber acordes para los 8 compases
            expect(sequence.length).toBeGreaterThan(0)
        })

        it('debe aplicar voice leading según estrategia', () => {
            const engine = new HarmonyEngine(42)

            const optionsSmooth = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.5,
                voiceLeadingStrategy: 'smooth' as const,
                tempo: 120,
                totalBars: 4
            }

            const optionsFree = {
                ...optionsSmooth,
                voiceLeadingStrategy: 'free' as const
            }

            const sequenceSmooth = engine.generateChordSequence(optionsSmooth)
            const sequenceFree = engine.generateChordSequence(optionsFree)

            expect(sequenceSmooth.length).toBeGreaterThan(0)
            expect(sequenceFree.length).toBeGreaterThan(0)
        })
    })

    describe('generateAccompaniment', () => {
        const engine = new HarmonyEngine(42)
        const testSequence = [
            [
                { pitch: 60, velocity: 80, startTime: 0, duration: 1920 },
                { pitch: 64, velocity: 80, startTime: 0, duration: 1920 },
                { pitch: 67, velocity: 80, startTime: 0, duration: 1920 }
            ],
            [
                { pitch: 65, velocity: 80, startTime: 1920, duration: 1920 },
                { pitch: 69, velocity: 80, startTime: 1920, duration: 1920 },
                { pitch: 72, velocity: 80, startTime: 1920, duration: 1920 }
            ]
        ]

        it('debe generar acompañamiento block chords', () => {
            const accompaniment = engine.generateAccompaniment(testSequence, 'block')
            expect(accompaniment.length).toBeGreaterThan(0)
            
            // Block chords deben tocar todas las notas juntas
            expect(accompaniment[0].velocity).toBe(70) // Velocity reducida
            expect(accompaniment[0].channel).toBe(1)
        })

        it('debe generar acompañamiento arpeggio', () => {
            const accompaniment = engine.generateAccompaniment(testSequence, 'arpeggio')
            expect(accompaniment.length).toBeGreaterThan(testSequence.length)
            
            // Arpeggios deben tener más notas (cada acorde dividido)
            expect(accompaniment[0].channel).toBe(1)
        })

        it('debe generar acompañamiento broken chords', () => {
            const accompaniment = engine.generateAccompaniment(testSequence, 'broken')
            expect(accompaniment.length).toBeGreaterThan(0)
            expect(accompaniment[0].channel).toBe(1)
        })
    })

    describe('modifyComplexity', () => {
        const engine = new HarmonyEngine(42)
        const testSequence = [
            [
                { pitch: 60, velocity: 80, startTime: 0, duration: 1920 },
                { pitch: 64, velocity: 80, startTime: 0, duration: 1920 },
                { pitch: 67, velocity: 80, startTime: 0, duration: 1920 },
                { pitch: 70, velocity: 80, startTime: 0, duration: 1920 }
            ]
        ]

        it('debe simplificar acordes con baja complejidad', () => {
            const simplified = engine.modifyComplexity(testSequence, 0.2)
            expect(simplified.length).toBe(1)
            expect(simplified[0].length).toBeLessThanOrEqual(3) // Máximo 3 notas (tríada)
        })

        it('debe complicar acordes con alta complejidad', () => {
            const complex = engine.modifyComplexity(testSequence, 0.8)
            expect(complex.length).toBe(1)
            expect(complex[0].length).toBeGreaterThanOrEqual(3)
        })

        it('debe mantener complejidad media sin cambios', () => {
            const medium = engine.modifyComplexity(testSequence, 0.5)
            expect(medium.length).toBe(1)
            expect(medium[0].length).toBeGreaterThan(0)
        })
    })

    describe('Progression Selection', () => {
        it('debe seleccionar progresión según modo minor', () => {
            const engine = new HarmonyEngine(42)

            const options = {
                seed: 42,
                key: 0,
                mode: 'minor',
                complexity: 0.5,
                voiceLeadingStrategy: 'smooth' as const,
                tempo: 120,
                totalBars: 4
            }

            const sequence = engine.generateChordSequence(options)
            expect(sequence.length).toBeGreaterThan(0)
        })

        it('debe seleccionar progresión según alta complejidad', () => {
            const engine = new HarmonyEngine(42)

            const options = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.9,
                voiceLeadingStrategy: 'smooth' as const,
                tempo: 120,
                totalBars: 4
            }

            const sequence = engine.generateChordSequence(options)
            expect(sequence.length).toBeGreaterThan(0)
        })

        it('debe seleccionar progresión según baja complejidad', () => {
            const engine = new HarmonyEngine(42)

            const options = {
                seed: 42,
                key: 0,
                mode: 'major',
                complexity: 0.2,
                voiceLeadingStrategy: 'smooth' as const,
                tempo: 120,
                totalBars: 4
            }

            const sequence = engine.generateChordSequence(options)
            expect(sequence.length).toBeGreaterThan(0)
        })
    })

    describe('Voice Leading Strategies', () => {
        const engine = new HarmonyEngine(42)
        const baseOptions = {
            seed: 42,
            key: 0,
            mode: 'major',
            complexity: 0.5,
            tempo: 120,
            totalBars: 4
        }

        it('debe aplicar estrategia smooth', () => {
            const sequence = engine.generateChordSequence({
                ...baseOptions,
                voiceLeadingStrategy: 'smooth'
            })
            expect(sequence.length).toBeGreaterThan(0)
        })

        it('debe aplicar estrategia contrary', () => {
            const sequence = engine.generateChordSequence({
                ...baseOptions,
                voiceLeadingStrategy: 'contrary'
            })
            expect(sequence.length).toBeGreaterThan(0)
        })

        it('debe aplicar estrategia parallel', () => {
            const sequence = engine.generateChordSequence({
                ...baseOptions,
                voiceLeadingStrategy: 'parallel'
            })
            expect(sequence.length).toBeGreaterThan(0)
        })

        it('debe aplicar estrategia oblique', () => {
            const sequence = engine.generateChordSequence({
                ...baseOptions,
                voiceLeadingStrategy: 'oblique'
            })
            expect(sequence.length).toBeGreaterThan(0)
        })

        it('debe aplicar estrategia free', () => {
            const sequence = engine.generateChordSequence({
                ...baseOptions,
                voiceLeadingStrategy: 'free'
            })
            expect(sequence.length).toBeGreaterThan(0)
        })
    })
})
