/**
 * 🎸 ORCHESTRATOR - UNIT TESTS
 * Valida generación de capas y mixing
 */

import { describe, it, expect } from 'vitest'
import { Orchestrator } from '../../../src/engines/music/orchestration/Orchestrator.js'
import { Section } from '../../../src/engines/music/structure/SongStructure.js'
import { StylePreset } from '../../../src/engines/music/style/StylePreset.js'
import { MIDINote } from '../../../src/engines/music/core/interfaces.js'

describe('Orchestrator', () => {
    const orchestrator = new Orchestrator()

    const testSection: Section = {
        id: 'verse-1',
        index: 0,
        type: 'verse',
        startTime: 0,
        duration: 8,
        bars: 4,
        profile: {
            intensity: 0.5,
            layerDensity: 0.5,
            harmonicComplexity: 0.5,
            melodicDensity: 0.5,
            rhythmicDensity: 0.5,
            tempoMultiplier: 1.0,
            characteristics: {
                repetitive: false,
                motivic: true,
                transitional: false,
                climactic: false,
                atmospheric: false
            }
        }
    }

    const testChords = [
        { notes: [60, 64, 67], root: 60, startTime: 0, duration: 2 },
        { notes: [62, 65, 69], root: 62, startTime: 2, duration: 2 },
        { notes: [64, 67, 71], root: 64, startTime: 4, duration: 2 },
        { notes: [65, 69, 72], root: 65, startTime: 6, duration: 2 }
    ]

    const testMelody: MIDINote[] = [
        { pitch: 72, velocity: 80, startTime: 0, duration: 0.5, channel: 0 },
        { pitch: 74, velocity: 85, startTime: 0.5, duration: 0.5, channel: 0 },
        { pitch: 76, velocity: 90, startTime: 1, duration: 1, channel: 0 }
    ]

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
                mixWeight: 1,
                channel: 0
            },
            harmony: {
                enabled: true,
                octave: 4,
                velocity: 70,
                velocityVariation: 0.15,
                articulation: 'legato',
                noteDuration: 0.95,
                mixWeight: 0.7,
                channel: 1
            },
            bass: {
                enabled: true,
                octave: 2,
                velocity: 85,
                velocityVariation: 0.1,
                articulation: 'staccato',
                noteDuration: 0.8,
                mixWeight: 0.8,
                channel: 2
            },
            rhythm: {
                enabled: true,
                octave: 3,
                velocity: 75,
                velocityVariation: 0.2,
                articulation: 'staccato',
                noteDuration: 0.3,
                mixWeight: 0.6,
                channel: 9
            },
            pad: {
                enabled: true,
                octave: 4,
                velocity: 50,
                velocityVariation: 0.05,
                articulation: 'legato',
                noteDuration: 1.5,
                mixWeight: 0.4,
                channel: 3
            },
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

    describe('generateLayers', () => {
        it('should generate harmony layer when enabled', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            expect(layers.harmony).toBeDefined()
            expect(layers.harmony.length).toBeGreaterThan(0)
        })

        it('should generate bass layer when enabled', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            expect(layers.bass).toBeDefined()
            expect(layers.bass.length).toBeGreaterThan(0)
        })

        it('should generate rhythm layer when enabled', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            expect(layers.rhythm).toBeDefined()
            expect(layers.rhythm.length).toBeGreaterThan(0)
        })

        it('should generate pad layer when enabled', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            expect(layers.pad).toBeDefined()
            if (layers.pad) {
                expect(layers.pad.length).toBeGreaterThan(0)
            }
        })

        it('should not generate pad layer when disabled', () => {
            const styleNoPad: StylePreset = {
                ...baseStyle,
                layers: { ...baseStyle.layers, pad: false as const }
            }

            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                styleNoPad,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            expect(layers.pad).toBeUndefined()
        })

        it('should generate bass notes at correct octave', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            // Bass en octava 2 (config.octave = 2)
            // C2 = 36, C3 = 48
            for (const note of layers.bass) {
                expect(note.pitch).toBeGreaterThanOrEqual(24)  // C1
                expect(note.pitch).toBeLessThanOrEqual(48)     // C3
            }
        })

        it('should generate harmony notes at correct octave', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            // Harmony en octava 4 (config.octave = 4)
            // C4 = 60, C5 = 72
            for (const note of layers.harmony) {
                expect(note.pitch).toBeGreaterThanOrEqual(48)  // C3
                expect(note.pitch).toBeLessThanOrEqual(84)     // C6
            }
        })

        it('should use different channels for different layers', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            // Harmony = channel 1
            if (layers.harmony.length > 0) {
                expect(layers.harmony[0].channel).toBe(1)
            }

            // Bass = channel 2
            if (layers.bass.length > 0) {
                expect(layers.bass[0].channel).toBe(2)
            }

            // Rhythm = channel 9 (MIDI drums)
            if (layers.rhythm.length > 0) {
                expect(layers.rhythm[0].channel).toBe(9)
            }
        })

        it('should generate deterministic output with same seed', () => {
            const layers1 = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            const layers2 = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            expect(layers1.harmony.length).toBe(layers2.harmony.length)
            expect(layers1.bass.length).toBe(layers2.bass.length)
            expect(layers1.rhythm.length).toBe(layers2.rhythm.length)
        })
    })

    describe('separateIntoTracks', () => {
        it('should create separate tracks for each layer', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            const tracks = orchestrator.separateIntoTracks(testMelody, layers, baseStyle)

            expect(tracks.has('melody')).toBe(true)
            expect(tracks.has('harmony')).toBe(true)
            expect(tracks.has('bass')).toBe(true)
            expect(tracks.has('rhythm')).toBe(true)
        })

        it('should include pad track when present', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            const tracks = orchestrator.separateIntoTracks(testMelody, layers, baseStyle)

            if (layers.pad) {
                expect(tracks.has('pad')).toBe(true)
            }
        })

        it('should preserve note data in tracks', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            const tracks = orchestrator.separateIntoTracks(testMelody, layers, baseStyle)

            const melodyTrack = tracks.get('melody')
            expect(melodyTrack).toEqual(testMelody)
        })
    })

    describe('applyMixing', () => {
        it('should adjust velocity based on mixWeight', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            const tracks = orchestrator.separateIntoTracks(testMelody, layers, baseStyle)
            const mixed = orchestrator.applyMixing(tracks, baseStyle)

            // Harmony mixWeight = 0.7
            const harmonyTrack = mixed.get('harmony')
            if (harmonyTrack && harmonyTrack.length > 0) {
                const originalVelocity = layers.harmony[0].velocity
                const mixedVelocity = harmonyTrack[0].velocity
                expect(mixedVelocity).toBeLessThanOrEqual(originalVelocity)
            }

            // Pad mixWeight = 0.4
            const padTrack = mixed.get('pad')
            if (padTrack && padTrack.length > 0) {
                const originalVelocity = layers.pad![0].velocity
                const mixedVelocity = padTrack[0].velocity
                expect(mixedVelocity).toBeLessThanOrEqual(originalVelocity)
            }
        })

        it('should not modify melody track (mixWeight = 1)', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            const tracks = orchestrator.separateIntoTracks(testMelody, layers, baseStyle)
            const mixed = orchestrator.applyMixing(tracks, baseStyle)

            const melodyTrack = mixed.get('melody')
            expect(melodyTrack![0].velocity).toBe(testMelody[0].velocity)
        })

        it('should preserve all tracks after mixing', () => {
            const layers = orchestrator.generateLayers(
                testSection,
                testChords,
                testMelody,
                baseStyle,
                42,
                { entropyFactor: 30, riskThreshold: 50, punkProbability: 20 }
            )

            const tracks = orchestrator.separateIntoTracks(testMelody, layers, baseStyle)
            const mixed = orchestrator.applyMixing(tracks, baseStyle)

            expect(mixed.size).toBe(tracks.size)
        })
    })
})
