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
     * ✅ REFACTORIZADO: Recibe totalLoad REAL calculado por MusicEnginePro
     */
    generateLayers(
        section: Section,
        chords: ResolvedChord[],
        melody: MIDINote[],
        style: StylePreset,
        seed: number,
        mode: ModeConfig,
        totalLoad: number = 0  // ✅ RECIBIR CARGA REAL (calculada por MusicEnginePro)
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

        // ✅ YA NO CALCULAR harmonyDensity/padDensity aquí
        // Usar totalLoad pasado desde MusicEnginePro
        const pad = style.layers.pad ? this.generatePadLayer(chords, style.layers.pad, section, prng) : []

        // Generar capa rítmica CONSCIENTE de la carga de otras capas
        const rhythm = this.generateRhythmLayer(
            chords,
            style.layers.rhythm,
            section,
            style.musical.tempo,
            prng,
            totalLoad  // ✅ USAR CARGA REAL
        )

        // REGLA DE ACTIVIDAD MÍNIMA: Asegurar que al menos una capa esté siempre activa
        const layers = { harmony, bass, rhythm, pad: pad.length > 0 ? pad : undefined }
        const guaranteedLayers = this.ensureMinimumActivity(layers, section, style, prng)

        return guaranteedLayers
    }

    /**
     * Generar capa de armonía
     * ✅ REFACTORIZADO: Trunca notas que excedan section.duration (Bug #23)
     */
    private generateHarmonyLayer(
        chords: ResolvedChord[],
        config: LayerConfig | false,
        section: Section,
        prng: SeededRandom
    ): MIDINote[] {
        if (!config) return []

        const notes: MIDINote[] = []
        const totalChords = chords.length
        const sectionEndTime = section.startTime + section.duration

        for (let chordIndex = 0; chordIndex < chords.length; chordIndex++) {
            const chord = chords[chordIndex]
            
            // NUEVO: Musical phrasing (crescendo/diminuendo)
            const phraseProgress = chordIndex / (totalChords - 1)
            const phrasingDynamic = this.calculatePhrasingDynamic(phraseProgress, section.type)
            
            for (const pitch of chord.notes) {
                // Ajustar a octava de la capa
                // pitch es relativo a la tónica (0-11), config.octave es la octava absoluta
                const adjustedPitch = pitch + config.octave * 12

                // NUEVO: Velocity con contexto musical
                const baseVelocity = config.velocity * 127 // Convert 0-1 to MIDI
                const variation = config.velocityVariation * 127
                const randomVariation = prng.next() * variation * 2 - variation
                const velocity = baseVelocity + phrasingDynamic + randomVariation

                // Duración según articulación
                let duration = chord.duration * config.noteDuration
                if (config.articulation === 'staccato') {
                    duration *= 0.5
                } else if (config.articulation === 'legato') {
                    duration *= 1.2  // Overlap con siguiente nota
                }

                // ✅ CIRUGÍA ANTI-ÓRGANO: Truncar DESPUÉS de calcular duration final
                // LÍMITE MUSICAL: Máximo 8 segundos por nota (evitar "Órgano de Iglesia")
                const noteStartTime = chord.startTime
                let noteEndTime = noteStartTime + duration
                
                // Primero: límite absoluto de 8s
                if (duration > 8.0) {
                    duration = 8.0
                    noteEndTime = noteStartTime + duration
                    console.log(`[HARMONY LIMIT] Section ${section.index}: Note limited to 8.0s (was longer)`)
                }
                
                // Segundo: truncar si excede sección
                if (noteEndTime > sectionEndTime) {
                    const oldDuration = duration
                    duration = Math.max(0.1, sectionEndTime - noteStartTime)
                    console.log(`[HARMONY TRUNCATE] Section ${section.index}: Note truncated from ${oldDuration.toFixed(2)}s to ${duration.toFixed(2)}s`)
                }
                
                // Validar que la nota inicia dentro de la sección
                if (noteStartTime >= sectionEndTime) {
                    console.log(`[HARMONY SKIP] Section ${section.index}: Note at ${noteStartTime.toFixed(2)}s skipped (after section end ${sectionEndTime.toFixed(2)}s)`)
                    continue // Descartar nota fuera de sección
                }

                notes.push({
                    pitch: Math.max(0, Math.min(127, adjustedPitch)),
                    velocity: Math.max(0, Math.min(127, Math.floor(velocity))),
                    startTime: noteStartTime,
                    duration,
                    channel: config.channel || 1
                })
            }
        }

        return notes
    }

    /**
     * Generar línea de bajo
     * ✅ REFACTORIZADO: Trunca notas que excedan section.duration (Bug #23)
     */
    private generateBassLayer(
        chords: ResolvedChord[],
        config: LayerConfig | false,
        section: Section,
        prng: SeededRandom
    ): MIDINote[] {
        if (!config) return []

        const notes: MIDINote[] = []
        const sectionEndTime = section.startTime + section.duration

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

            // ✅ CIRUGÍA ANTI-ÓRGANO: Truncar DESPUÉS de calcular duration final
            // LÍMITE MUSICAL: Máximo 8 segundos por nota (evitar "Órgano de Iglesia")
            const noteStartTime = chord.startTime
            let noteEndTime = noteStartTime + duration
            
            // Primero: límite absoluto de 8s
            if (duration > 8.0) {
                duration = 8.0
                noteEndTime = noteStartTime + duration
                console.log(`[BASS LIMIT] Section ${section.index}: Note limited to 8.0s (was longer)`)
            }
            
            // Segundo: truncar si excede sección
            if (noteEndTime > sectionEndTime) {
                const oldDuration = duration
                duration = Math.max(0.1, sectionEndTime - noteStartTime)
                console.log(`[BASS TRUNCATE] Section ${section.index}: Note truncated from ${oldDuration.toFixed(2)}s to ${duration.toFixed(2)}s`)
            }
            
            // Validar que la nota inicia dentro de la sección
            if (noteStartTime >= sectionEndTime) {
                console.log(`[BASS SKIP] Section ${section.index}: Note at ${noteStartTime.toFixed(2)}s skipped (after section end ${sectionEndTime.toFixed(2)}s)`)
                continue // Descartar nota fuera de sección
            }

            notes.push({
                pitch: Math.max(0, Math.min(127, bassPitch)),
                velocity: Math.max(0, Math.min(127, Math.floor(velocity))),
                startTime: noteStartTime,
                duration,
                channel: config.channel || 2
            })
        }

        return notes
    }

    /**
     * Generar capa rítmica
     * ✅ REFACTORIZADO: Usa totalLoad REAL directamente
     */
    private generateRhythmLayer(
        chords: ResolvedChord[],
        config: LayerConfig | false,
        section: Section,
        tempo: number,
        prng: SeededRandom,
        totalLoad: number = 0  // ✅ RECIBIR CARGA REAL
    ): MIDINote[] {
        if (!config) return []

        const notes: MIDINote[] = []
        const secondsPerBeat = 60 / tempo
        const density = section.profile.rhythmicDensity
        
        // ✅ USAR totalLoad DIRECTAMENTE (sin calcular harmonyDensity/padDensity)
        console.log(`[RHYTHM DEBUG] Section ${section.index}, density: ${density}, totalLoad: ${totalLoad.toFixed(2)}`)
        
        // NUEVO: Drum kit mapping (GM Standard)
        const KICK = 36
        const SNARE = 38
        const CLOSED_HIHAT = 42
        const OPEN_HIHAT = 46
        const CRASH = 49
        
        // OPTIMIZACIÓN: Subdivision consciente de la carga (umbrales más agresivos)
        // Si hay mucha actividad en harmony/melody, simplificar el ritmo para evitar sobrecarga
        let subdivision: number
        if (totalLoad > 1.5) { // Alta carga: ritmo muy simple
            subdivision = 1.0
            console.log(`[RHYTHM DEBUG] High load detected (${totalLoad.toFixed(2)}), forcing simple rhythm (subdivision: ${subdivision})`)
        } else if (totalLoad > 0.8) { // Carga media: ritmo moderado
            subdivision = 0.5
            console.log(`[RHYTHM DEBUG] Medium load detected (${totalLoad.toFixed(2)}), using moderate rhythm (subdivision: ${subdivision})`)
        } else if (density > 0.7) { // Baja carga: usar densidad normal
            subdivision = 0.25
            console.log(`[RHYTHM DEBUG] Low load, high density (${density}), using complex rhythm (subdivision: ${subdivision})`)
        } else if (density > 0.4) {
            subdivision = 0.5
            console.log(`[RHYTHM DEBUG] Low load, medium density (${density}), using moderate rhythm (subdivision: ${subdivision})`)
        } else {
            subdivision = 1.0
            console.log(`[RHYTHM DEBUG] Low load, low density (${density}), using simple rhythm (subdivision: ${subdivision})`)
        }
        
        let currentTime = section.startTime
        const endTime = section.startTime + section.duration
        let beatNumber = 0

        while (currentTime < endTime) {
            // NUEVO: Musical drum pattern
            const isDownbeat = beatNumber % 4 === 0
            const isBackbeat = beatNumber % 4 === 2
            const isOffbeat = beatNumber % 2 === 1
            
            // Kick on downbeats (1 and 3)
            if (isDownbeat && prng.next() > 0.1) { // 90% probability
                // [RHYTHM DEBUG] Comentado para limpieza de logs
                notes.push({
                    pitch: KICK,
                    velocity: Math.floor(config.velocity * 127 + 20), // Kicks louder
                    startTime: currentTime,
                    duration: secondsPerBeat * 0.3,
                    channel: 9
                })
            }
            
            // Snare on backbeats (2 and 4)
            if (isBackbeat && prng.next() > 0.05) { // 95% probability
                // [RHYTHM DEBUG] Comentado para limpieza de logs
                notes.push({
                    pitch: SNARE,
                    velocity: Math.floor(config.velocity * 127 + 10),
                    startTime: currentTime,
                    duration: secondsPerBeat * 0.2,
                    channel: 9
                })
            }
            
            // Hi-hats on every subdivision (density-dependent)
            if (density > 0.3 && prng.next() > 0.2) { // 80% probability
                // [RHYTHM DEBUG] Comentado para limpieza de logs
                const hihat = isOffbeat ? OPEN_HIHAT : CLOSED_HIHAT
                notes.push({
                    pitch: hihat,
                    velocity: Math.floor(config.velocity * 127 - 20), // Hihats softer
                    startTime: currentTime,
                    duration: secondsPerBeat * subdivision * 0.5,
                    channel: 9
                })
            }
            
            currentTime += secondsPerBeat * subdivision
            beatNumber++
        }

        console.log(`[RHYTHM DEBUG] Generated ${notes.length} rhythm notes`)
        return notes
    }

    /**
     * Generar pad atmosférico
     * ✅ REFACTORIZADO: Respeta section.duration (no excede límite) + Truncamiento adicional
     */
    private generatePadLayer(
        chords: ResolvedChord[],
        config: LayerConfig,
        section: Section,  // ✅ RECIBIR SECTION
        prng: SeededRandom
    ): MIDINote[] {
        const notes: MIDINote[] = []
        const sectionEndTime = section.startTime + section.duration

        for (const chord of chords) {
            // OPTIMIZACIÓN: Pad solo toca tónica y quinta (no todo el acorde)
            // Para evitar redundancia con harmony y reducir carga
            const root = chord.root
            const fifth = root + 7 // Quinta del acorde

            // Notas del pad: solo tónica y quinta
            const padNotes = [root, fifth]

            for (const pitch of padNotes) {
                const adjustedPitch = pitch + (config.octave - 4) * 12

                // ✅ DURACIÓN RESPETANDO SECTION
                // Pad puede durar largo tiempo, pero NO exceder section.duration
                const timeLeftInSection = section.startTime + section.duration - chord.startTime
                const maxPadDuration = Math.min(chord.duration, timeLeftInSection)
                const desiredLongDuration = 8 + prng.next() * 8 // 8-16 segundos
                let actualDuration = Math.min(desiredLongDuration, maxPadDuration)

                // ✅ CIRUGÍA ANTI-ÓRGANO: Doble validación - truncar DESPUÉS de calcular actualDuration
                // LÍMITE MUSICAL: Máximo 8 segundos por nota (evitar "Órgano de Iglesia")
                const noteStartTime = chord.startTime
                let noteEndTime = noteStartTime + actualDuration
                
                // Primero: límite absoluto de 8s
                if (actualDuration > 8.0) {
                    actualDuration = 8.0
                    noteEndTime = noteStartTime + actualDuration
                    console.log(`[PAD LIMIT] Section ${section.index}: Note limited to 8.0s (was longer)`)
                }
                
                // Segundo: truncar si excede sección
                if (noteEndTime > sectionEndTime) {
                    const oldDuration = actualDuration
                    actualDuration = Math.max(0.1, sectionEndTime - noteStartTime)
                    console.log(`[PAD TRUNCATE] Section ${section.index}: Note truncated from ${oldDuration.toFixed(2)}s to ${actualDuration.toFixed(2)}s`)
                }
                
                // Validar que la nota inicia dentro de la sección
                if (noteStartTime >= sectionEndTime) {
                    console.log(`[PAD SKIP] Section ${section.index}: Note at ${noteStartTime.toFixed(2)}s skipped (after section end ${sectionEndTime.toFixed(2)}s)`)
                    continue // Descartar nota fuera de sección
                }

                notes.push({
                    pitch: Math.max(0, Math.min(127, adjustedPitch)),
                    velocity: config.velocity,  // Sin variación (pad suave)
                    startTime: noteStartTime,
                    duration: actualDuration, // ✅ NO EXCEDE SECTION (doblemente validado)
                    channel: config.channel || 3
                })
            }
        }

        console.log(`[PAD DEBUG] Section ${section.index}: Generated ${notes.length} pad notes`)

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

    /**
     * Calculate dynamic shaping based on phrase position and section type
     */
    private calculatePhrasingDynamic(progress: number, sectionType: string): number {
        switch (sectionType) {
            case 'intro':
                // Fade in gradually
                return progress * 20 // +0 to +20
                
            case 'buildup':
                // Crescendo to climax
                return progress * 30 // +0 to +30
                
            case 'climax':
                // Stay loud, slight variations
                return 25 + Math.sin(progress * Math.PI * 4) * 5 // 20-30
                
            case 'breakdown':
                // Sudden drop, then gradual recovery
                return progress < 0.3 ? -20 : (progress - 0.3) * 20 // -20 to +10
                
            case 'outro':
                // Fade out
                return (1 - progress) * 20 // +20 to +0
                
            default:
                return 0
        }
    }

    /**
     * REGLA DE ACTIVIDAD MÍNIMA: Asegurar que al menos una capa esté siempre activa
     * Previene silencios no deseados en la composición
     */
    private ensureMinimumActivity(
        layers: OrchestrationLayers,
        section: Section,
        style: StylePreset,
        prng: SeededRandom
    ): OrchestrationLayers {
        const sectionStart = section.startTime
        const sectionEnd = section.startTime + section.duration

        // Recopilar todas las notas activas por tiempo
        const activeTimes = new Map<number, boolean>()

        // Función helper para marcar tiempos activos
        const markActiveTime = (notes: MIDINote[], channel: number) => {
            notes.forEach(note => {
                const start = Math.floor(note.startTime * 100) / 100 // Redondear a centésimas
                const end = Math.floor((note.startTime + note.duration) * 100) / 100
                for (let t = start; t <= end; t += 0.01) { // Marcar cada 10ms
                    activeTimes.set(t, true)
                }
            })
        }

        // Marcar tiempos activos para cada capa
        if (layers.harmony) markActiveTime(layers.harmony, 1)
        if (layers.bass) markActiveTime(layers.bass, 2)
        if (layers.rhythm) markActiveTime(layers.rhythm, 9)
        if (layers.pad) markActiveTime(layers.pad, 3)

        // Encontrar silencios (huecos de más de 2 segundos)
        const silentPeriods: Array<{start: number, end: number}> = []
        let currentSilentStart: number | null = null

        for (let t = sectionStart; t <= sectionEnd; t += 0.01) {
            const isActive = activeTimes.get(Math.floor(t * 100) / 100) || false

            if (!isActive && currentSilentStart === null) {
                currentSilentStart = t
            } else if (isActive && currentSilentStart !== null) {
                const silentDuration = t - currentSilentStart
                if (silentDuration >= 2.0) { // Silencio de 2+ segundos
                    silentPeriods.push({start: currentSilentStart, end: t})
                }
                currentSilentStart = null
            }
        }

        // Si hay silencios al final, cerrarlos
        if (currentSilentStart !== null) {
            const silentDuration = sectionEnd - currentSilentStart
            if (silentDuration >= 2.0) {
                silentPeriods.push({start: currentSilentStart, end: sectionEnd})
            }
        }

        console.log(`[ACTIVITY DEBUG] Section ${section.index}: Found ${silentPeriods.length} silent periods >= 2s`)

        // Si no hay silencios problemáticos, devolver capas originales
        if (silentPeriods.length === 0) {
            return layers
        }

        // Rellenar silencios con actividad mínima (preferir Pad, luego Rhythm)
        const resultLayers = { ...layers }

        for (const silentPeriod of silentPeriods) {
            const duration = silentPeriod.end - silentPeriod.start

            // Intentar agregar Pad primero (más atmosférico)
            if (style.layers.pad && style.layers.pad.enabled && (!resultLayers.pad || resultLayers.pad.length === 0)) {
                console.log(`[ACTIVITY DEBUG] Filling silence ${silentPeriod.start}s-${silentPeriod.end}s with Pad`)
                const padNotes = this.generateMinimumPadActivity(
                    silentPeriod.start,
                    duration,
                    style.layers.pad,
                    prng
                )
                resultLayers.pad = padNotes
            }
            // Si no hay Pad configurado/enabled, usar Rhythm
            else if (style.layers.rhythm && style.layers.rhythm.enabled) {
                console.log(`[ACTIVITY DEBUG] Filling silence ${silentPeriod.start}s-${silentPeriod.end}s with Rhythm`)
                const rhythmNotes = this.generateMinimumRhythmActivity(
                    silentPeriod.start,
                    duration,
                    style.layers.rhythm,
                    style.musical.tempo,
                    prng
                )
                if (!resultLayers.rhythm) resultLayers.rhythm = []
                resultLayers.rhythm.push(...rhythmNotes)
            }
        }

        return resultLayers
    }

    /**
     * Generar actividad mínima de Pad para rellenar silencios
     */
    private generateMinimumPadActivity(
        startTime: number,
        duration: number,
        config: LayerConfig,
        prng: SeededRandom
    ): MIDINote[] {
        const notes: MIDINote[] = []

        // Nota de dron simple (tónica de la tonalidad base, asumiendo C=60)
        const dronePitch = 60 + config.octave * 12 // C4 como base

        notes.push({
            pitch: Math.max(0, Math.min(127, dronePitch)),
            velocity: Math.floor(config.velocity * 127 * 0.3), // Muy suave
            startTime,
            duration,
            channel: config.channel || 3
        })

        return notes
    }

    /**
     * Generar actividad mínima de Rhythm para rellenar silencios
     */
    private generateMinimumRhythmActivity(
        startTime: number,
        duration: number,
        config: LayerConfig,
        tempo: number,
        prng: SeededRandom
    ): MIDINote[] {
        const notes: MIDINote[] = []
        const secondsPerBeat = 60 / tempo

        // Patrón rítmico mínimo: kick cada 2 beats
        let currentTime = startTime
        const endTime = startTime + duration

        while (currentTime < endTime) {
            // Kick suave cada 2 beats
            if (prng.next() > 0.3) { // 70% probability
                notes.push({
                    pitch: 36, // Kick
                    velocity: Math.floor(config.velocity * 127 * 0.4), // Moderadamente suave
                    startTime: currentTime,
                    duration: secondsPerBeat * 0.3,
                    channel: 9
                })
            }

            currentTime += secondsPerBeat * 2 // Cada 2 beats
        }

        return notes
    }
}

