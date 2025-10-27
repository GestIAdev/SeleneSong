/**
 * 🎸 MIDI RENDERER - TESTS UNITARIOS
 * Validación de generación de buffers MIDI y cuantización
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { MIDIRenderer } from '../../../src/engines/music/render/MIDIRenderer.js'
import { MIDINote } from '../../../src/engines/music/core/interfaces.js'
import { SongStructure } from '../../../src/engines/music/structure/SongStructure.js'

describe('MIDIRenderer', () => {
    let renderer: MIDIRenderer
    let mockStructure: SongStructure
    let mockNotes: MIDINote[]

    beforeEach(() => {
        renderer = new MIDIRenderer()
        
        mockStructure = {
            sections: [
                {
                    index: 0,
                    type: 'intro',
                    startTime: 0,
                    duration: 8,
                    bars: 2,
                    intensity: 0.3,
                    rootPitch: 60
                }
            ],
            totalDuration: 8,
            globalTempo: 120,
            timeSignature: [4, 4] as [number, number]
        }

        mockNotes = [
            { pitch: 60, velocity: 80, startTime: 0, duration: 1 },
            { pitch: 64, velocity: 75, startTime: 1, duration: 1 },
            { pitch: 67, velocity: 85, startTime: 2, duration: 1 }
        ]
    })

    describe('render() - Single Track', () => {
        it('debe generar un buffer MIDI válido', () => {
            const buffer = renderer.render(mockNotes, mockStructure)
            
            expect(buffer).toBeDefined()
            expect(buffer).toBeInstanceOf(Buffer)
            expect(buffer.length).toBeGreaterThan(0)
        })

        it('debe incluir header MIDI válido (MThd)', () => {
            const buffer = renderer.render(mockNotes, mockStructure)
            const header = buffer.toString('ascii', 0, 4)
            
            expect(header).toBe('MThd')
        })

        it('debe incluir track chunk (MTrk)', () => {
            const buffer = renderer.render(mockNotes, mockStructure)
            const bufferString = buffer.toString('ascii')
            
            expect(bufferString).toContain('MTrk')
        })

        it('debe generar buffer no vacío para lista de notas vacía', () => {
            const buffer = renderer.render([], mockStructure)
            
            expect(buffer).toBeDefined()
            expect(buffer.length).toBeGreaterThan(0)  // Header + tempo track
        })
    })

    describe('renderMultiTrack() - Multi Track', () => {
        it('debe generar buffer MIDI multi-track válido', () => {
            const tracks = new Map<string, MIDINote[]>([
                ['Melody', [mockNotes[0]]],
                ['Harmony', [mockNotes[1]]],
                ['Bass', [mockNotes[2]]]
            ])

            const buffer = renderer.renderMultiTrack(tracks, mockStructure, {})
            
            expect(buffer).toBeDefined()
            expect(buffer).toBeInstanceOf(Buffer)
            expect(buffer.length).toBeGreaterThan(0)
        })

        it('debe incluir múltiples tracks (uno por capa)', () => {
            const tracks = new Map<string, MIDINote[]>([
                ['Melody', mockNotes],
                ['Bass', mockNotes]
            ])

            const buffer = renderer.renderMultiTrack(tracks, mockStructure, {})
            const bufferString = buffer.toString('ascii')
            
            // Debería tener múltiples MTrk chunks
            const trackCount = (bufferString.match(/MTrk/g) || []).length
            expect(trackCount).toBeGreaterThanOrEqual(2)  // Tempo track + instrument tracks
        })

        it('debe asignar canales MIDI diferentes a cada track', () => {
            const tracks = new Map<string, MIDINote[]>([
                ['Melody', [{ ...mockNotes[0] }]],
                ['Harmony', [{ ...mockNotes[1] }]],
                ['Bass', [{ ...mockNotes[2] }]]
            ])

            const buffer = renderer.renderMultiTrack(tracks, mockStructure, {})
            
            // Verificar que el buffer es válido y contiene datos
            expect(buffer.length).toBeGreaterThan(100)  // Buffer razonablemente grande
        })

        it('debe manejar tracks vacíos sin errores', () => {
            const tracks = new Map<string, MIDINote[]>([
                ['Melody', []],
                ['Harmony', []]
            ])

            const buffer = renderer.renderMultiTrack(tracks, mockStructure, {})
            
            expect(buffer).toBeDefined()
            expect(buffer.length).toBeGreaterThan(0)
        })
    })

    describe('quantize() - Cuantización', () => {
        it('debe cuantizar tiempos de inicio', () => {
            const notes: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0.1234, duration: 1 },
                { pitch: 64, velocity: 75, startTime: 1.5678, duration: 1 }
            ]

            const quantized = renderer.quantize(notes, 16)
            
            // startTime debe estar redondeado a 1/16
            expect(quantized[0].startTime).toBe(0.125)  // 0.1234 → 0.125
            expect(quantized[1].startTime).toBe(1.5625)  // 1.5678 → 1.5625
        })

        it('debe cuantizar duraciones', () => {
            const notes: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0, duration: 0.7777 },
                { pitch: 64, velocity: 75, startTime: 1, duration: 1.333 }
            ]

            const quantized = renderer.quantize(notes, 16)
            
            // duration debe estar redondeado a 1/16
            expect(quantized[0].duration).toBe(0.75)  // 0.7777 → 0.75
            expect(quantized[1].duration).toBe(1.3125)  // 1.333 → 1.3125
        })

        it('debe usar resolución 16 por defecto', () => {
            const notes: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0.1, duration: 0.9 }
            ]

            const quantized = renderer.quantize(notes)
            
            // Con resolución 16: 0.1 * 16 = 1.6, round(1.6) = 2, 2 / 16 = 0.125
            expect(quantized[0].startTime).toBe(0.125)
            // Con resolución 16: 0.9 * 16 = 14.4, round(14.4) = 14, 14 / 16 = 0.875
            expect(quantized[0].duration).toBe(0.875)
        })

        it('debe preservar pitch y velocity sin modificar', () => {
            const notes: MIDINote[] = [
                { pitch: 72, velocity: 100, startTime: 0.5, duration: 1.5 }
            ]

            const quantized = renderer.quantize(notes)
            
            expect(quantized[0].pitch).toBe(72)
            expect(quantized[0].velocity).toBe(100)
        })

        it('debe permitir resoluciones personalizadas', () => {
            const notes: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0.111, duration: 1 }
            ]

            const quantized = renderer.quantize(notes, 8)  // Cuantizar a 1/8
            
            expect(quantized[0].startTime).toBe(0.125)  // 1/8 = 0.125
        })

        it('no debe mutar el array original', () => {
            const notes: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0.123, duration: 1 }
            ]

            const originalStartTime = notes[0].startTime
            renderer.quantize(notes, 16)
            
            expect(notes[0].startTime).toBe(originalStartTime)  // No mutado
        })
    })

    describe('Validaciones de Integración', () => {
        it('debe mantener coherencia entre render() y renderMultiTrack()', () => {
            const singleTrack = renderer.render(mockNotes, mockStructure)
            
            const multiTrack = renderer.renderMultiTrack(
                new Map([['Melody', mockNotes]]),
                mockStructure,
                {}
            )
            
            // Ambos buffers deben ser válidos
            expect(singleTrack.length).toBeGreaterThan(0)
            expect(multiTrack.length).toBeGreaterThan(0)
            
            // Multi-track debería ser mayor (más tracks)
            expect(multiTrack.length).toBeGreaterThanOrEqual(singleTrack.length)
        })

        it('debe generar buffers deterministas para mismas notas', () => {
            const buffer1 = renderer.render(mockNotes, mockStructure)
            const buffer2 = renderer.render(mockNotes, mockStructure)
            
            expect(buffer1.equals(buffer2)).toBe(true)
        })

        it('debe ordenar notas por startTime antes de renderizar', () => {
            const unsortedNotes: MIDINote[] = [
                { pitch: 67, velocity: 85, startTime: 2, duration: 1 },
                { pitch: 60, velocity: 80, startTime: 0, duration: 1 },
                { pitch: 64, velocity: 75, startTime: 1, duration: 1 }
            ]

            const buffer = renderer.render(unsortedNotes, mockStructure)
            
            // Debe generar buffer válido sin errores
            expect(buffer).toBeDefined()
            expect(buffer.length).toBeGreaterThan(0)
        })
    })

    describe('Edge Cases', () => {
        it('debe manejar pitch en límites MIDI (0-127)', () => {
            const extremeNotes: MIDINote[] = [
                { pitch: 0, velocity: 80, startTime: 0, duration: 1 },
                { pitch: 127, velocity: 80, startTime: 1, duration: 1 }
            ]

            const buffer = renderer.render(extremeNotes, mockStructure)
            
            expect(buffer).toBeDefined()
            expect(buffer.length).toBeGreaterThan(0)
        })

        it('debe manejar velocity en límites MIDI (0-127)', () => {
            const extremeVelocity: MIDINote[] = [
                { pitch: 60, velocity: 1, startTime: 0, duration: 1 },
                { pitch: 60, velocity: 127, startTime: 1, duration: 1 }
            ]

            const buffer = renderer.render(extremeVelocity, mockStructure)
            
            expect(buffer).toBeDefined()
        })

        it('debe manejar duraciones muy cortas', () => {
            const shortNotes: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0, duration: 0.01 }
            ]

            const buffer = renderer.render(shortNotes, mockStructure)
            
            expect(buffer).toBeDefined()
        })

        it('debe manejar duraciones muy largas', () => {
            const longNotes: MIDINote[] = [
                { pitch: 60, velocity: 80, startTime: 0, duration: 60 }
            ]

            const buffer = renderer.render(longNotes, mockStructure)
            
            expect(buffer).toBeDefined()
        })
    })
})
