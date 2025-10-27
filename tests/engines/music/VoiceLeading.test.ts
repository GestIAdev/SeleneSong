/**
 * 🎸 VOICE LEADING TESTS
 * Tests unitarios para VoiceLeading
 */

import { describe, it, expect } from 'vitest'
import { VoiceLeading } from '../../../src/engines/music/harmony/VoiceLeading.js'
import { MIDINote } from '../../../src/engines/music/core/interfaces.js'

describe('VoiceLeading', () => {
    describe('minimizeVoiceMovement - Smooth Strategy', () => {
        it('debe minimizar movimiento entre acordes cercanos', () => {
            const fromChord: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0, duration: 480 }, // C
                { pitch: 64, velocity: 80, startTime: 0, duration: 480 }, // E
                { pitch: 67, velocity: 80, startTime: 0, duration: 480 }  // G
            ]
            const toChord: MIDINote[] = [
                { pitch: 65, velocity: 80, startTime: 480, duration: 480 }, // F
                { pitch: 69, velocity: 80, startTime: 480, duration: 480 }, // A
                { pitch: 72, velocity: 80, startTime: 480, duration: 480 }  // C
            ]

            const result = VoiceLeading.minimizeVoiceMovement(fromChord, toChord, 'smooth')
            expect(result.length).toBe(3)
            
            // Verificar que se mantuvo alguna estructura
            const pitches = result.map(n => n.pitch)
            expect(pitches).toContain(65)
            expect(pitches).toContain(69)
            expect(pitches).toContain(72)
        })

        it('debe manejar acordes vacíos', () => {
            const fromChord: MIDINote[] = []
            const toChord: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0, duration: 480 }
            ]

            const result = VoiceLeading.minimizeVoiceMovement(fromChord, toChord, 'smooth')
            expect(result).toEqual(toChord)
        })
    })

    describe('calculateMovementCost', () => {
        it('debe calcular costo cero para acordes idénticos', () => {
            const chord: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0, duration: 480 },
                { pitch: 64, velocity: 80, startTime: 0, duration: 480 },
                { pitch: 67, velocity: 80, startTime: 0, duration: 480 }
            ]

            const cost = VoiceLeading.calculateMovementCost(chord, chord)
            expect(cost).toBe(0)
        })

        it('debe calcular costo mayor para acordes distantes', () => {
            const chord1: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0, duration: 480 },
                { pitch: 64, velocity: 80, startTime: 0, duration: 480 },
                { pitch: 67, velocity: 80, startTime: 0, duration: 480 }
            ]
            const chord2: MIDINote[] = [
                { pitch: 72, velocity: 80, startTime: 0, duration: 480 },
                { pitch: 76, velocity: 80, startTime: 0, duration: 480 },
                { pitch: 79, velocity: 80, startTime: 0, duration: 480 }
            ]

            const cost = VoiceLeading.calculateMovementCost(chord1, chord2)
            expect(cost).toBeGreaterThan(0)
        })

        it('smooth voice leading debe tener menor costo que sin optimizar', () => {
            const chord1: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0, duration: 480 },
                { pitch: 64, velocity: 80, startTime: 0, duration: 480 },
                { pitch: 67, velocity: 80, startTime: 0, duration: 480 }
            ]
            const chord2: MIDINote[] = [
                { pitch: 65, velocity: 80, startTime: 480, duration: 480 },
                { pitch: 69, velocity: 80, startTime: 480, duration: 480 },
                { pitch: 72, velocity: 80, startTime: 480, duration: 480 }
            ]

            const optimized = VoiceLeading.minimizeVoiceMovement(chord1, chord2, 'smooth')
            const costOriginal = VoiceLeading.calculateMovementCost(chord1, chord2)
            const costOptimized = VoiceLeading.calculateMovementCost(chord1, optimized)

            expect(costOptimized).toBeLessThanOrEqual(costOriginal)
        })
    })

    describe('optimizeChordSequence', () => {
        it('debe optimizar secuencia completa de acordes', () => {
            const sequence: MIDINote[][] = [
                [
                    { pitch: 60, velocity: 80, startTime: 0, duration: 480 },
                    { pitch: 64, velocity: 80, startTime: 0, duration: 480 },
                    { pitch: 67, velocity: 80, startTime: 0, duration: 480 }
                ],
                [
                    { pitch: 65, velocity: 80, startTime: 480, duration: 480 },
                    { pitch: 69, velocity: 80, startTime: 480, duration: 480 },
                    { pitch: 72, velocity: 80, startTime: 480, duration: 480 }
                ],
                [
                    { pitch: 62, velocity: 80, startTime: 960, duration: 480 },
                    { pitch: 65, velocity: 80, startTime: 960, duration: 480 },
                    { pitch: 69, velocity: 80, startTime: 960, duration: 480 }
                ]
            ]

            const optimized = VoiceLeading.optimizeChordSequence(sequence, 'smooth')
            expect(optimized.length).toBe(3)
            expect(optimized[0]).toEqual(sequence[0]) // Primer acorde sin cambios
        })

        it('debe manejar secuencia vacía', () => {
            const sequence: MIDINote[][] = []
            const result = VoiceLeading.optimizeChordSequence(sequence, 'smooth')
            expect(result).toEqual([])
        })

        it('debe manejar secuencia de un acorde', () => {
            const sequence: MIDINote[][] = [
                [
                    { pitch: 60, velocity: 80, startTime: 0, duration: 480 }
                ]
            ]
            const result = VoiceLeading.optimizeChordSequence(sequence, 'smooth')
            expect(result).toEqual(sequence)
        })
    })

    describe('Voice Leading Strategies', () => {
        const fromChord: MIDINote[] = [
            { pitch: 60, velocity: 80, startTime: 0, duration: 480 },
            { pitch: 64, velocity: 80, startTime: 0, duration: 480 },
            { pitch: 67, velocity: 80, startTime: 0, duration: 480 }
        ]
        const toChord: MIDINote[] = [
            { pitch: 65, velocity: 80, startTime: 480, duration: 480 },
            { pitch: 69, velocity: 80, startTime: 480, duration: 480 },
            { pitch: 72, velocity: 80, startTime: 480, duration: 480 }
        ]

        it('debe aplicar estrategia smooth', () => {
            const result = VoiceLeading.minimizeVoiceMovement(fromChord, toChord, 'smooth')
            expect(result.length).toBe(3)
        })

        it('debe aplicar estrategia contrary', () => {
            const result = VoiceLeading.minimizeVoiceMovement(fromChord, toChord, 'contrary')
            expect(result.length).toBe(3)
        })

        it('debe aplicar estrategia parallel', () => {
            const result = VoiceLeading.minimizeVoiceMovement(fromChord, toChord, 'parallel')
            expect(result.length).toBe(3)
        })

        it('debe aplicar estrategia oblique', () => {
            const result = VoiceLeading.minimizeVoiceMovement(fromChord, toChord, 'oblique')
            expect(result.length).toBeGreaterThanOrEqual(3)
        })

        it('debe aplicar estrategia free (sin cambios)', () => {
            const result = VoiceLeading.minimizeVoiceMovement(fromChord, toChord, 'free')
            expect(result).toEqual(toChord)
        })
    })
})
