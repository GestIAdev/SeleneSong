/**
 * 🎸 CHORD BUILDER TESTS
 * Tests unitarios para ChordBuilder
 */

import { describe, it, expect } from 'vitest'
import { ChordBuilder } from '../../../src/engines/music/harmony/ChordBuilder.js'

describe('ChordBuilder', () => {
    describe('buildChord - 9 Chord Qualities', () => {
        it('debe construir acorde major [0,4,7]', () => {
            const chord = ChordBuilder.buildChord(60, 'major') // C major
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([60, 64, 67]) // C, E, G
        })

        it('debe construir acorde minor [0,3,7]', () => {
            const chord = ChordBuilder.buildChord(60, 'minor') // C minor
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([60, 63, 67]) // C, Eb, G
        })

        it('debe construir acorde diminished [0,3,6]', () => {
            const chord = ChordBuilder.buildChord(60, 'diminished') // C diminished
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([60, 63, 66]) // C, Eb, Gb
        })

        it('debe construir acorde augmented [0,4,8]', () => {
            const chord = ChordBuilder.buildChord(60, 'augmented') // C augmented
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([60, 64, 68]) // C, E, G#
        })

        it('debe construir acorde dominant [0,4,7,10]', () => {
            const chord = ChordBuilder.buildChord(60, 'dominant') // C7
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([60, 64, 67, 70]) // C, E, G, Bb
        })

        it('debe construir acorde half-diminished [0,3,6,10]', () => {
            const chord = ChordBuilder.buildChord(60, 'half-diminished') // Cm7b5
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([60, 63, 66, 70]) // C, Eb, Gb, Bb
        })

        it('debe construir acorde sus2 [0,2,7]', () => {
            const chord = ChordBuilder.buildChord(60, 'sus2') // Csus2
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([60, 62, 67]) // C, D, G
        })

        it('debe construir acorde sus4 [0,5,7]', () => {
            const chord = ChordBuilder.buildChord(60, 'sus4') // Csus4
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([60, 65, 67]) // C, F, G
        })

        it('debe construir acorde power [0,7]', () => {
            const chord = ChordBuilder.buildChord(60, 'power') // C5
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([60, 67]) // C, G
        })
    })

    describe('buildChordWithInversion', () => {
        it('debe aplicar primera inversión correctamente', () => {
            const chord = ChordBuilder.buildChordWithInversion(60, 'major', 1)
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([64, 67, 72]) // E, G, C (una octava arriba)
        })

        it('debe aplicar segunda inversión correctamente', () => {
            const chord = ChordBuilder.buildChordWithInversion(60, 'major', 2)
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toEqual([67, 72, 76]) // G, C, E (octavas arriba)
        })
    })

    describe('buildExtendedChord', () => {
        it('debe agregar extensión 7 correctamente', () => {
            const chord = ChordBuilder.buildExtendedChord(60, 'major', [7])
            const pitches = chord.map(note => note.pitch)
            expect(pitches).toContain(67) // Debe incluir séptima (G)
        })

        it('debe agregar múltiples extensiones', () => {
            const chord = ChordBuilder.buildExtendedChord(60, 'major', [7, 9])
            const pitches = chord.map(note => note.pitch)
            expect(pitches.length).toBeGreaterThanOrEqual(4) // Al menos 3 notas base + extensiones
        })
    })

    describe('buildComplexChord', () => {
        it('debe construir acorde con octava específica', () => {
            const chord = ChordBuilder.buildComplexChord(0, 'major', { octave: 5 })
            const pitches = chord.map(note => note.pitch)
            expect(pitches[0]).toBe(60) // C en octava 5
        })

        it('debe aplicar extensiones + inversión + octava', () => {
            const chord = ChordBuilder.buildComplexChord(0, 'dominant', {
                extensions: [9],
                inversion: 1,
                octave: 4
            })
            expect(chord.length).toBeGreaterThanOrEqual(4) // Debe tener notas base + extensiones
        })
    })

    describe('getChordName', () => {
        it('debe generar nombre correcto para major', () => {
            const name = ChordBuilder.getChordName(0, 'major')
            expect(name).toBe('C')
        })

        it('debe generar nombre correcto para minor', () => {
            const name = ChordBuilder.getChordName(0, 'minor')
            expect(name).toBe('Cm')
        })

        it('debe generar nombre correcto para dominant con extensiones', () => {
            const name = ChordBuilder.getChordName(0, 'dominant', [9])
            expect(name).toBe('C79')
        })

        it('debe incluir alteraciones en el nombre', () => {
            const name = ChordBuilder.getChordName(0, 'dominant', [9], { 9: -1 })
            expect(name).toContain('♭9')
        })
    })
})
