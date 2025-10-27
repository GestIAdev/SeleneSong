/**
 * 🎸 HARMONY ENGINE
 * Motor de armonía para generar progresiones y acordes
 */

import { SeededRandom } from '../utils/SeededRandom.js'
import { MIDINote } from '../core/interfaces.js'
import { CHORD_PROGRESSIONS } from './progressions/index.js'
import { ChordProgression, ChordDegree } from './ChordProgression.js'
import { ChordBuilder } from './ChordBuilder.js'
import { VoiceLeading } from './VoiceLeading.js'

export interface HarmonyOptions {
    seed: number
    key: number                    // Tonalidad (0-11)
    mode: string                   // Modo ('major', 'minor', etc.)
    complexity: number             // 0-1
    voiceLeadingStrategy: 'smooth' | 'contrary' | 'parallel' | 'oblique' | 'free'
    tempo: number                  // BPM
    totalBars: number              // Número total de compases
}

/**
 * Motor de armonía principal
 */
export class HarmonyEngine {
    private random: SeededRandom

    constructor(seed: number = 42) {
        this.random = new SeededRandom(seed)
    }

    /**
     * Generar secuencia de acordes
     * @param options Opciones de generación
     * @returns Secuencia de acordes MIDI
     */
    generateChordSequence(options: HarmonyOptions): MIDINote[][] {
        const { key, mode, complexity, voiceLeadingStrategy, totalBars, seed } = options

        // 🔥 DETERMINISMO: Re-inicializar random con el seed proporcionado
        this.random = new SeededRandom(seed)

        // Seleccionar progresión base según complejidad y modo
        const progression = this.selectProgression(mode, complexity)

        // Adaptar progresión a la tonalidad
        const adaptedProgression = this.adaptProgressionToKey(progression, key)

        // Generar acordes MIDI
        const chordSequence = this.buildChordSequence(adaptedProgression, totalBars)

        // Aplicar conducción de voces
        return VoiceLeading.optimizeChordSequence(chordSequence, voiceLeadingStrategy)
    }

    /**
     * Seleccionar progresión según modo y complejidad
     */
    private selectProgression(mode: string, complexity: number): ChordProgression {
        const genre = this.selectGenreForMode(mode, complexity)
        const progressions = CHORD_PROGRESSIONS[genre]

        if (!progressions) {
            // Fallback a pop si no hay progresiones para el género
            const popProgressions = Object.values(CHORD_PROGRESSIONS.pop)
            return this.random.choice(popProgressions)
        }

        const availableProgressions = Object.values(progressions)
        return this.random.choice(availableProgressions)
    }

    /**
     * Seleccionar género según modo y complejidad
     */
    private selectGenreForMode(mode: string, complexity: number): keyof typeof CHORD_PROGRESSIONS {
        if (mode === 'minor') {
            return complexity > 0.7 ? 'jazz' : complexity > 0.4 ? 'blues' : 'rock'
        } else {
            return complexity > 0.7 ? 'classical' : complexity > 0.4 ? 'modal' : 'pop'
        }
    }

    private adaptProgressionToKey(progression: ChordProgression, key: number): ChordProgression {
        return {
            ...progression,
            chords: progression.chords.map((chord: ChordDegree) => ({
                ...chord,
                degree: (chord.degree + key) % 12
            }))
        }
    }

    /**
     * Construir secuencia de acordes MIDI
     */
    private buildChordSequence(progression: ChordProgression, totalBars: number): MIDINote[][] {
        const sequence: MIDINote[][] = []
        let currentBar = 0

        // Repetir progresión hasta completar los compases requeridos
        while (currentBar < totalBars) {
            for (const chord of progression.chords) {
                if (currentBar >= totalBars) break

                // chord.degree es grado de escala (0-11), NO añadir octava aquí
                // El Orchestrator se encarga de ajustar a la octava correcta
                const midiChord = ChordBuilder.buildChord(
                    chord.degree,
                    chord.quality
                )

                // Aplicar duración del acorde (en segundos, NO ticks)
                const durationSeconds = chord.duration * 4 // duration en compases, 1 compás = 4 segundos @ 60 BPM
                const startTime = currentBar * 4 // Asumiendo 4/4 time

                sequence.push(midiChord.map(note => ({
                    ...note,
                    startTime,
                    duration: durationSeconds
                })))

                currentBar += chord.duration
            }

            // Si la progresión es cíclica y no hemos completado, continuar
            if (!progression.cyclic && currentBar < totalBars) {
                break
            }
        }

        return sequence
    }

    /**
     * Generar acompañamiento armónico
     * @param chordSequence Secuencia de acordes
     * @param style Estilo ('block', 'arpeggio', 'broken')
     * @returns Notas de acompañamiento
     */
    generateAccompaniment(
        chordSequence: MIDINote[][],
        style: 'block' | 'arpeggio' | 'broken' = 'block'
    ): MIDINote[] {
        const accompaniment: MIDINote[] = []

        for (const chord of chordSequence) {
            switch (style) {
                case 'block':
                    accompaniment.push(...this.generateBlockChords(chord))
                    break
                case 'arpeggio':
                    accompaniment.push(...this.generateArpeggios(chord))
                    break
                case 'broken':
                    accompaniment.push(...this.generateBrokenChords(chord))
                    break
            }
        }

        return accompaniment
    }

    /**
     * Generar acordes bloque (todos juntos)
     */
    private generateBlockChords(chord: MIDINote[]): MIDINote[] {
        return chord.map(note => ({
            ...note,
            velocity: 70, // Más suave para acompañamiento
            channel: 1    // Canal diferente para acompañamiento
        }))
    }

    /**
     * Generar arpegios
     */
    private generateArpeggios(chord: MIDINote[]): MIDINote[] {
        const arpeggio: MIDINote[] = []
        const duration = chord[0]?.duration ?? 480
        const startTime = chord[0]?.startTime ?? 0
        const noteDuration = duration / chord.length

        chord.forEach((note, index) => {
            arpeggio.push({
                ...note,
                startTime: startTime + (index * noteDuration),
                duration: noteDuration,
                velocity: 60,
                channel: 1
            })
        })

        return arpeggio
    }

    /**
     * Generar acordes rotos
     */
    private generateBrokenChords(chord: MIDINote[]): MIDINote[] {
        const broken: MIDINote[] = []
        const duration = chord[0]?.duration ?? 480
        const startTime = chord[0]?.startTime ?? 0
        const pattern = [0, 2, 1, 2] // Patrón de acordes rotos

        pattern.forEach((index, patternIndex) => {
            const note = chord[index % chord.length]
            if (note) {
                broken.push({
                    ...note,
                    startTime: startTime + (patternIndex * duration / pattern.length),
                    duration: duration / pattern.length,
                    velocity: 65,
                    channel: 1
                })
            }
        })

        return broken
    }

    /**
     * Modificar complejidad de una secuencia
     * @param sequence Secuencia original
     * @param targetComplexity Complejidad objetivo (0-1)
     * @returns Secuencia modificada
     */
    modifyComplexity(sequence: MIDINote[][], targetComplexity: number): MIDINote[][] {
        if (targetComplexity < 0.3) {
            // Simplificar: reducir a tríadas básicas
            return sequence.map(chord =>
                chord.slice(0, 3).map(note => ({ ...note, pitch: note.pitch % 12 + 48 }))
            )
        } else if (targetComplexity > 0.7) {
            // Complicar: agregar extensiones y alteraciones
            return sequence.map(chord => {
                const root = chord[0]?.pitch ?? 60
                return ChordBuilder.buildExtendedChord(
                    root % 12,
                    'dominant',
                    [7, 9, 11]
                ).map(note => ({
                    ...note,
                    startTime: chord[0]?.startTime ?? 0,
                    duration: chord[0]?.duration ?? 480
                }))
            })
        }

        return sequence // Mantener complejidad media
    }
}

