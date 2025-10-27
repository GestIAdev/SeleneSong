/**
 * 🎸 ORCHESTRATOR
 * Separa notas en tracks y aplica mixing
 */

import { MIDINote } from '../core/interfaces.js'
import { Section } from '../structure/SongStructure.js'
import { StylePreset, LayerConfig } from '../style/StylePreset.js'
import { ModeConfig } from '../core/types.js'
import { SeededRandom } from '../utils/SeededRandom.js'

/**
 * ACORDE RESUELTO
 */
interface ResolvedChord {
    notes: number[]      // Pitches MIDI
    root: number         // Root pitch
    startTime: number    // Start time in seconds
    duration: number     // Duration in seconds
}

/**
 * CAPAS DE ORQUESTACIÓN
 */
interface OrchestrationLayers {
    harmony: MIDINote[]     // Acordes
    bass: MIDINote[]        // Línea de bajo
    rhythm: MIDINote[]      // Percusión/ritmo
    pad?: MIDINote[]        // Pad atmosférico (opcional)
}

/**
 * ORCHESTRATOR CLASS
 */
export class Orchestrator {

    /**
     * Generar capas adicionales
     */
    generateLayers(
        section: Section,
        chords: ResolvedChord[],
        melody: MIDINote[],
        style: StylePreset,
        seed: number,
        mode: ModeConfig
    ): OrchestrationLayers {
        const prng = new SeededRandom(seed + section.index * 10000)

        // Generar capa de armonía (acordes)
        const harmony = this.generateHarmonyLayer(
            chords,
            style.layers.harmony,
            section,
            prng
        )

        // Generar línea de bajo
        const bass = this.generateBassLayer(
            chords,
            style.layers.bass,
            section,
            prng
        )

        // Generar capa rítmica
        const rhythm = this.generateRhythmLayer(
            chords,
            style.layers.rhythm,
            section,
            style.musical.tempo,
            prng
        )

        // Generar pad si está habilitado
        const pad = style.layers.pad ? this.generatePadLayer(chords, style.layers.pad, section, prng) : undefined

        return { harmony, bass, rhythm, pad }
    }

    /**
     * Generar capa de armonía
     */
    private generateHarmonyLayer(
        chords: ResolvedChord[],
        config: LayerConfig | false,
        section: Section,
        prng: SeededRandom
    ): MIDINote[] {
        if (!config) return []

        const notes: MIDINote[] = []

        for (const chord of chords) {
            // Generar nota por cada voz del acorde
            for (const pitch of chord.notes) {
                // Ajustar a octava de la capa
                // pitch es relativo a la tónica (0-11), config.octave es la octava absoluta
                const adjustedPitch = pitch + config.octave * 12

                // Velocity con variación
                const baseVelocity = config.velocity
                const variation = config.velocityVariation * 127
                const velocity = baseVelocity + (prng.next() * variation * 2 - variation)

                // Duración según articulación
                let duration = chord.duration * config.noteDuration
                if (config.articulation === 'staccato') {
                    duration *= 0.5
                } else if (config.articulation === 'legato') {
                    duration *= 1.2  // Overlap con siguiente nota
                }

                notes.push({
                    pitch: Math.max(0, Math.min(127, adjustedPitch)),
                    velocity: Math.max(0, Math.min(127, Math.floor(velocity))),
                    startTime: chord.startTime,
                    duration,
                    channel: config.channel || 1
                })
            }
        }

        return notes
    }

    /**
     * Generar línea de bajo
     */
    private generateBassLayer(
        chords: ResolvedChord[],
        config: LayerConfig | false,
        section: Section,
        prng: SeededRandom
    ): MIDINote[] {
        if (!config) return []

        const notes: MIDINote[] = []

        for (const chord of chords) {
            // Bajo toca la fundamental del acorde
            // chord.root ya es MIDI absoluto (48-84), ajustar a octava de bajo
            const bassPitch = (chord.root % 12) + config.octave * 12

            // Velocity
            const velocity = config.velocity + (prng.next() * config.velocityVariation * 127 - config.velocityVariation * 64)

            // Duración
            let duration = chord.duration * config.noteDuration
            if (config.articulation === 'staccato') {
                duration *= 0.7
            }

            notes.push({
                pitch: Math.max(0, Math.min(127, bassPitch)),
                velocity: Math.max(0, Math.min(127, Math.floor(velocity))),
                startTime: chord.startTime,
                duration,
                channel: config.channel || 2
            })
        }

        return notes
    }

    /**
     * Generar capa rítmica
     */
    private generateRhythmLayer(
        chords: ResolvedChord[],
        config: LayerConfig | false,
        section: Section,
        tempo: number,
        prng: SeededRandom
    ): MIDINote[] {
        if (!config) return []

        const notes: MIDINote[] = []
        const secondsPerBeat = 60 / tempo

        // Determinar densidad rítmica desde profile
        const density = section.profile.rhythmicDensity
        const subdivision = density > 0.7 ? 0.25 : (density > 0.4 ? 0.5 : 1.0)  // 16th, 8th, quarter

        // Generar notas rítmicas a lo largo de la sección
        let currentTime = section.startTime
        const endTime = section.startTime + section.duration

        while (currentTime < endTime) {
            // Pitch de percusión (MIDI drums: 36-81)
            const drumPitch = 36 + Math.floor(prng.next() * 10)  // Kicks, snares, hats

            // Velocity con variación (humanización)
            const velocity = config.velocity + (prng.next() * config.velocityVariation * 127 - config.velocityVariation * 64)

            // Duración corta (staccato)
            const duration = secondsPerBeat * subdivision * 0.3

            notes.push({
                pitch: drumPitch,
                velocity: Math.max(0, Math.min(127, Math.floor(velocity))),
                startTime: currentTime,
                duration,
                channel: 9  // MIDI channel 10 (drums)
            })

            currentTime += secondsPerBeat * subdivision
        }

        return notes
    }

    /**
     * Generar pad atmosférico
     */
    private generatePadLayer(
        chords: ResolvedChord[],
        config: LayerConfig,
        section: Section,
        prng: SeededRandom
    ): MIDINote[] {
        const notes: MIDINote[] = []

        for (const chord of chords) {
            // Pad toca todas las notas del acorde en registro medio
            for (const pitch of chord.notes) {
                const adjustedPitch = pitch + (config.octave - 4) * 12

                notes.push({
                    pitch: Math.max(0, Math.min(127, adjustedPitch)),
                    velocity: config.velocity,  // Sin variación (pad suave)
                    startTime: chord.startTime,
                    duration: chord.duration * config.noteDuration,  // Muy largo
                    channel: config.channel || 3
                })
            }
        }

        return notes
    }

    /**
     * Separar en tracks
     */
    separateIntoTracks(
        melody: MIDINote[],
        layers: OrchestrationLayers,
        style: StylePreset
    ): Map<string, MIDINote[]> {
        const tracks = new Map<string, MIDINote[]>()

        tracks.set('melody', melody)
        tracks.set('harmony', layers.harmony)
        tracks.set('bass', layers.bass)
        tracks.set('rhythm', layers.rhythm)

        if (layers.pad) {
            tracks.set('pad', layers.pad)
        }

        return tracks
    }

    /**
     * Aplicar mixing
     */
    applyMixing(
        tracks: Map<string, MIDINote[]>,
        style: StylePreset
    ): Map<string, MIDINote[]> {
        const mixed = new Map<string, MIDINote[]>()

        for (const [trackName, notes] of Array.from(tracks.entries())) {
            const layerConfig = this.getLayerConfig(trackName, style)
            if (!layerConfig) {
                mixed.set(trackName, notes)
                continue
            }

            // Aplicar mixWeight (ajustar velocity global)
            const mixedNotes = notes.map(note => ({
                ...note,
                velocity: Math.floor(note.velocity * layerConfig.mixWeight)
            }))

            mixed.set(trackName, mixedNotes)
        }

        return mixed
    }

    private getLayerConfig(trackName: string, style: StylePreset): LayerConfig | false {
        switch (trackName) {
            case 'melody': return style.layers.melody
            case 'harmony': return style.layers.harmony
            case 'bass': return style.layers.bass
            case 'rhythm': return style.layers.rhythm
            case 'pad': return style.layers.pad || false
            default: return false
        }
    }
}

