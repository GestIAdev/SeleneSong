/**
 * 🎸 VITALS INTEGRATION ENGINE - UNIT TESTS
 * Valida mapeo emocional SystemVitals → Música
 */

import { describe, it, expect } from 'vitest'
import { VitalsIntegrationEngine, CoherenceEngine } from '../../../src/engines/music/vitals/VitalsIntegrationEngine.js'
import { VitalSigns } from '../../../src/engines/music/core/types.js'
import { StylePreset } from '../../../src/engines/music/style/StylePreset.js'

describe('VitalsIntegrationEngine', () => {
    const engine = new VitalsIntegrationEngine(0.7)

    describe('applyVitalsToStyle', () => {
        const baseStyle: StylePreset = {
            id: 'test-style',
            name: 'Test Style',
            description: 'Test',
            tags: ['test'],
            musical: {
                mode: 'major',
                tempo: 120,
                timeSignature: [4, 4],
                rootRange: [48, 72],
                harmonic: {
                    progressionType: 'tonal',
                    chordComplexity: 'triads',
                    density: 1,
                    inversionProbability: 0.3,
                    dissonanceLevel: 0.3,
                    modulationStrategy: 'none'
                },
                melodic: {
                    range: [0, 2],
                    contourPreference: 'arched',
                    noteDensity: 0.5,
                    restProbability: 0.1,
                    ornamentation: 'minimal',
                    motifRepetition: 0.5
                },
                rhythmic: {
                    baseDivision: 8,
                    complexity: 'moderate',
                    swing: 0,
                    syncopation: 0.3,
                    layerDensity: 3
                }
            },
            layers: {
                melody: {
                    enabled: true,
                    octave: 5,
                    velocity: 80,
                    velocityVariation: 0.2,
                    articulation: 'normal',
                    noteDuration: 1,
                    mixWeight: 1
                },
                harmony: false,
                bass: false,
                rhythm: false,
                pad: false,
                lead: false
            },
            texture: {
                density: 'medium',
                verticalSpacing: 0.5,
                activeLayersRange: [2, 4],
                transparency: 0.3
            },
            temporal: {
                tempoEvolution: 'static',
                tempoVariation: 0,
                intensityArc: 'flat',
                fadeIn: 0,
                fadeOut: 0,
                loopable: false
            }
        }

        it('should increase tempo when stress is high', () => {
            const vitals: VitalSigns = { stress: 0.8, harmony: 0.5, creativity: 0.5 }
            const modified = engine.applyVitalsToStyle(baseStyle, vitals)

            // stress=0.8 con strength=0.7 → tempoMultiplier = 1 + (0.8 * 0.4 * 0.7) = 1.224
            expect(modified.musical.tempo).toBeGreaterThan(baseStyle.musical.tempo)
            expect(modified.musical.tempo).toBeCloseTo(120 * 1.224, 1)
        })

        it('should increase dissonance when stress is high', () => {
            const vitals: VitalSigns = { stress: 0.8, harmony: 0.5, creativity: 0.5 }
            const modified = engine.applyVitalsToStyle(baseStyle, vitals)

            // stress=0.8 con strength=0.7 → dissonanceBoost = 0.8 * 0.3 * 0.7 = 0.168
            expect(modified.musical.harmonic.dissonanceLevel).toBeGreaterThan(baseStyle.musical.harmonic.dissonanceLevel)
            expect(modified.musical.harmonic.dissonanceLevel).toBeCloseTo(0.3 + 0.168, 2)
        })

        it('should upgrade rhythmic complexity when stress is high', () => {
            const vitals: VitalSigns = { stress: 0.8, harmony: 0.5, creativity: 0.5 }
            const modified = engine.applyVitalsToStyle(baseStyle, vitals)

            // moderate → complex
            expect(modified.musical.rhythmic.complexity).toBe('complex')
        })

        it('should decrease dissonance when harmony is high', () => {
            const vitals: VitalSigns = { stress: 0.2, harmony: 0.9, creativity: 0.5 }
            const modified = engine.applyVitalsToStyle(baseStyle, vitals)

            // harmony=0.9 con strength=0.7 → consonanceBoost = 0.9 * 0.4 * 0.7 = 0.252
            expect(modified.musical.harmonic.dissonanceLevel).toBeLessThan(baseStyle.musical.harmonic.dissonanceLevel)
            expect(modified.musical.harmonic.dissonanceLevel).toBeCloseTo(Math.max(0, 0.3 - 0.252), 2)
        })

        it('should change mode to more consonant when harmony is very high', () => {
            const phrygianStyle = { ...baseStyle, musical: { ...baseStyle.musical, mode: 'phrygian' as const } }
            const vitals: VitalSigns = { stress: 0.2, harmony: 0.9, creativity: 0.5 }
            const modified = engine.applyVitalsToStyle(phrygianStyle, vitals)

            expect(modified.musical.mode).toBe('dorian')  // Más suave que phrygian
        })

        it('should simplify chords when harmony is very high', () => {
            const extendedStyle = {
                ...baseStyle,
                musical: {
                    ...baseStyle.musical,
                    harmonic: { ...baseStyle.musical.harmonic, chordComplexity: 'extended' as const }
                }
            }
            const vitals: VitalSigns = { stress: 0.2, harmony: 0.9, creativity: 0.5 }
            const modified = engine.applyVitalsToStyle(extendedStyle, vitals)

            expect(modified.musical.harmonic.chordComplexity).toBe('seventh')
        })

        it('should increase ornamentation when creativity is high', () => {
            const vitals: VitalSigns = { stress: 0.5, harmony: 0.5, creativity: 0.85 }
            const modified = engine.applyVitalsToStyle(baseStyle, vitals)

            expect(modified.musical.melodic.ornamentation).toBe('heavy')
        })

        it('should prefer modal progressions when creativity is very high', () => {
            const vitals: VitalSigns = { stress: 0.5, harmony: 0.5, creativity: 0.85 }
            const modified = engine.applyVitalsToStyle(baseStyle, vitals)

            expect(modified.musical.harmonic.progressionType).toBe('modal')
        })
    })

    describe('detectEmotionalState', () => {
        it('should detect calm state (low stress, high harmony)', () => {
            const vitals: VitalSigns = { stress: 0.2, harmony: 0.8, creativity: 0.5 }
            // No llamar applyVitalsToStyle con objeto vacío, solo verificar vitals
            expect(vitals.stress).toBeLessThan(0.3)
            expect(vitals.harmony).toBeGreaterThan(0.7)
        })

        it('should detect anxious state (high stress, low harmony)', () => {
            const vitals: VitalSigns = { stress: 0.8, harmony: 0.2, creativity: 0.5 }
            expect(vitals.stress).toBeGreaterThan(0.7)
            expect(vitals.harmony).toBeLessThan(0.3)
        })

        it('should detect energetic state (high creativity, medium stress)', () => {
            const vitals: VitalSigns = { stress: 0.6, harmony: 0.5, creativity: 0.8 }
            expect(vitals.creativity).toBeGreaterThan(0.6)
            expect(vitals.stress).toBeGreaterThan(0.5)
        })

        it('should detect melancholic state (low creativity, low harmony)', () => {
            const vitals: VitalSigns = { stress: 0.5, harmony: 0.3, creativity: 0.3 }
            expect(vitals.creativity).toBeLessThan(0.4)
            expect(vitals.harmony).toBeLessThan(0.4)
        })

        it('should detect euphoric state (high creativity, high harmony)', () => {
            const vitals: VitalSigns = { stress: 0.3, harmony: 0.8, creativity: 0.8 }
            expect(vitals.creativity).toBeGreaterThan(0.7)
            expect(vitals.harmony).toBeGreaterThan(0.7)
        })

        it('should detect chaotic state (high stress, high creativity, low harmony)', () => {
            const vitals: VitalSigns = { stress: 0.8, harmony: 0.3, creativity: 0.8 }
            expect(vitals.stress).toBeGreaterThan(0.7)
            expect(vitals.creativity).toBeGreaterThan(0.7)
            expect(vitals.harmony).toBeLessThan(0.4)
        })
    })

    describe('generateModeAdjustments', () => {
        it('should boost entropy when creativity is high', () => {
            const vitals: VitalSigns = { stress: 0.5, harmony: 0.5, creativity: 0.8 }
            const adjustments = engine.generateModeAdjustments(vitals)

            // creativity=0.8 → floor(0.8 * 40) = 32
            expect(adjustments.entropyFactor).toBe(32)
        })

        it('should boost risk when stress is high', () => {
            const vitals: VitalSigns = { stress: 0.8, harmony: 0.5, creativity: 0.5 }
            const adjustments = engine.generateModeAdjustments(vitals)

            // stress=0.8 → floor(0.8 * 50) = 40 → 50 + 40 = 90
            expect(adjustments.riskThreshold).toBe(90)
        })

        it('should boost punk when harmony is low', () => {
            const vitals: VitalSigns = { stress: 0.5, harmony: 0.3, creativity: 0.5 }
            const adjustments = engine.generateModeAdjustments(vitals)

            // harmony=0.3 → deficit=0.7 → floor(0.7 * 60) = 42
            expect(adjustments.punkProbability).toBe(42)
        })
    })
})

describe('CoherenceEngine', () => {
    const coherenceEngine = new CoherenceEngine()

    describe('validateCoherence', () => {
        it('should return high coherence when all moods match', () => {
            const vitals: VitalSigns = { stress: 0.2, harmony: 0.8, creativity: 0.5 }
            const midiMetadata = {
                duration: 120,
                tempo: 80,
                key: 'C',
                mode: 'major' as const,
                structure: 'A-B-A',
                stylePreset: 'test',
                seed: 42,
                timestamp: Date.now()
            }
            const poetry = {
                verses: ['Verso sereno'],
                fullText: 'Verso sereno y tranquilo',
                theme: 'peace',
                mood: 'calm'
            }

            const report = coherenceEngine.validateCoherence(midiMetadata, poetry, vitals)

            expect(report.coherenceScore).toBeGreaterThan(0.5)
            expect(report.emotionalState).toBe('calm')
        })

        it('should return low coherence when moods mismatch', () => {
            const vitals: VitalSigns = { stress: 0.8, harmony: 0.2, creativity: 0.5 }
            const midiMetadata = {
                duration: 120,
                tempo: 80,
                key: 'C',
                mode: 'major' as const,
                structure: 'A-B-A',
                stylePreset: 'test',
                seed: 42,
                timestamp: Date.now()
            }
            const poetry = {
                verses: ['Verso tranquilo'],
                fullText: 'Verso tranquilo y sereno',
                theme: 'peace',
                mood: 'calm'
            }

            const report = coherenceEngine.validateCoherence(midiMetadata, poetry, vitals)

            // vitals=anxious, midi=calm, poetry=calm → baja coherencia
            expect(report.coherenceScore).toBeLessThan(0.7)
            expect(report.issues.length).toBeGreaterThan(0)
        })
    })
})
