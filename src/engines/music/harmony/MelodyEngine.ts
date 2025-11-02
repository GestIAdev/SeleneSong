/**
 * 🎵 MELODY ENGINE
 * Motor de melodía para generar líneas melódicas
 */

import { SeededRandom } from '../utils/SeededRandom.js'
import { MIDINote } from '../core/interfaces.js'
import { MelodicContour } from '../core/types.js'
import { Section } from '../structure/SongStructure.js' // ✅ IMPORTAR SECTION


export type MotifTransformation =
    | 'retrograde'
    | 'inversion'
    | 'augmentation'
    | 'diminution'
    | 'transposition'
    | 'rhythmDisplacement'
    | 'fragmentation'

export interface MelodyOptions {
    seed: number
    section: Section               // ✅ AÑADIR SECTION COMPLETA
    key: number                    // Tonalidad (0-11)
    mode: string                   // Modo ('major', 'minor', etc.)
    complexity: number             // 0-1
    contour: MelodicContour        // Contorno melódico
    range: { min: number, max: number } // Rango de octavas
    // ❌ ELIMINADOS: tempo, duration (están en section)
}

/**
 * Motor de melodía principal
 */
export class MelodyEngine {
    private random: SeededRandom

    constructor(seed: number = 42) {
        this.random = new SeededRandom(seed)
    }

    /**
     * Generar melodía completa
     * ✅ REFACTORIZADO: Recibe section completa, respeta section.duration
     * @param options Opciones de generación
     * @returns Notas melódicas MIDI
     */
    generateMelody(options: MelodyOptions): MIDINote[] {
        const { section, key, mode, complexity, contour, range, seed } = options

        // ✅ USAR section.duration, section.tempo DIRECTAMENTE
        const duration = section.duration
        const tempo = section.profile?.tempoMultiplier
            ? (section.profile.tempoMultiplier * 120)  // TODO: Obtener tempo base de StylePreset
            : 120 // Fallback

        // 🔥 DETERMINISMO: Re-inicializar random con el seed proporcionado
        this.random = new SeededRandom(seed)

        // Generar motivo base
        const motif = this.generateMotif(key, mode, complexity, tempo)

        // Aplicar transformaciones según complejidad
        const transformedMotif = this.applyTransformations(motif, complexity)

        // Desarrollar motivo en frase completa
        const phrase = this.developPhrase(transformedMotif, duration, tempo, contour)

        // Aplicar contorno melódico
        const contouredPhrase = this.applyContour(phrase, contour, range)

        // ✅ AJUSTAR startTime para incluir offset de sección
        const melody = contouredPhrase.map(note => ({
            ...note,
            startTime: note.startTime + section.startTime
        }))

        // ✅ VALIDACIÓN: Asegurar que no excedemos section.duration
        const sectionEnd = section.startTime + section.duration
        const lastNote = melody[melody.length - 1]
        if (lastNote && (lastNote.startTime + lastNote.duration) > sectionEnd) {
            const excess = (lastNote.startTime + lastNote.duration) - sectionEnd
            console.warn(`[MELODY DEBUG] Last note exceeds section end by ${excess.toFixed(2)}s, truncating`)
            lastNote.duration = Math.max(0.1, lastNote.duration - excess)
        }

        // 🔍 DEBUG: Log first 5 notes después de contour
        console.log(`[MELODY DEBUG] Section ${section.index}: Generated ${melody.length} notes, duration: ${duration.toFixed(2)}s`)
        melody.slice(0, 5).forEach((note, i) => {
            console.log(`  [${i}] pitch=${note.pitch}, startTime=${note.startTime.toFixed(3)}s, duration=${note.duration.toFixed(3)}s`)
        })

        return melody
    }

    /**
     * Generar motivo melódico base
     */
    private generateMotif(key: number, mode: string, complexity: number, tempo: number): MIDINote[] {
        const motifLength = complexity > 0.7 ? 8 : complexity > 0.4 ? 6 : 4
        const motif: MIDINote[] = []

        // Escala base según modo
        const scale = this.getScaleForMode(key, mode)
        let currentTime = 0

        for (let i = 0; i < motifLength; i++) {
            const pitch = this.random.choice(scale) + (4 * 12) // Octava 4
            const durationSeconds = this.getFibonacciDuration(i, motifLength, 'verse')
            // Calculate velocity with musical intelligence
            const baseVelocity = 80
            const contourVelocity = this.calculateDynamicVelocity(i, motifLength)
            const accentVelocity = (i % 4 === 0) ? 15 : 0 // Accent downbeats
            const microVariation = this.random.nextInt(-5, 5)

            const velocity = Math.min(127, Math.max(40, 
                baseVelocity + contourVelocity + accentVelocity + microVariation
            ))

            motif.push({
                pitch,
                velocity,
                startTime: currentTime,
                duration: durationSeconds // ✅ duration EN SEGUNDOS
            })

            currentTime += durationSeconds
        }

        return motif
    }

    /**
     * Obtener escala para modo específico
     */
    private getScaleForMode(key: number, mode: string): number[] {
        const scales: Record<string, number[]> = {
            'major': [0, 2, 4, 5, 7, 9, 11],
            'minor': [0, 2, 3, 5, 7, 8, 10],
            'dorian': [0, 2, 3, 5, 7, 9, 10],
            'phrygian': [0, 1, 3, 5, 7, 8, 10],
            'lydian': [0, 2, 4, 6, 7, 9, 11],
            'mixolydian': [0, 2, 4, 5, 7, 9, 10],
            'pentatonic': [0, 2, 4, 7, 9],
            'blues': [0, 3, 5, 6, 7, 10]
        }

        const intervals = scales[mode] || scales['major']
        return intervals.map(interval => key + interval)
    }

    /**
     * Obtener duración basada en secuencia Fibonacci
     */
    private getFibonacciDuration(position: number, totalLength: number, context: 'intro' | 'verse' | 'climax' | 'outro' = 'verse'): number {
        // Context-aware duration pools
        const durationPools: Record<string, number[]> = {
            intro: [1.0, 1.5, 2.0, 3.0],        // Notas largas, espaciadas
            verse: [0.5, 0.75, 1.0, 1.5],       // Variedad moderada
            climax: [0.25, 0.5, 0.75, 1.0],     // Notas más rápidas
            outro: [1.5, 2.0, 3.0, 4.0]         // Muy largas, decayendo
        }
        
        const durations = durationPools[context]
        
        // Use Fibonacci for organic variation within context
        const fib = [1, 1, 2, 3, 5, 8]
        const fibIndex = position % fib.length
        const durationIndex = fib[fibIndex] % durations.length
        
        // Add micro-variation (±10%) for humanization
        const baseDuration = durations[durationIndex]
        const microVariation = 1 + (this.random.next() * 0.2 - 0.1) // Usa SeededRandom
        
        return baseDuration * microVariation
    }

    /**
     * Calculate dynamic velocity based on melodic contour
     * Higher notes = louder (natural tendency)
     * Creates musical phrasing
     */
    private calculateDynamicVelocity(position: number, totalLength: number): number {
        const progress = position / (totalLength - 1)
        
        // Crescendo to middle, diminuendo after
        if (progress < 0.5) {
            return progress * 40 // +0 to +20
        } else {
            return (1 - progress) * 40 // +20 to +0
        }
    }

    /**
     * Aplicar transformaciones al motivo
     */
    private applyTransformations(motif: MIDINote[], complexity: number): MIDINote[] {
        let transformed = [...motif]

        if (complexity > 0.3) {
            transformed = this.applyRetrograde(transformed)
        }

        if (complexity > 0.5) {
            transformed = this.applyInversion(transformed)
        }

        if (complexity > 0.7) {
            transformed = this.applyAugmentation(transformed)
        }

        return transformed
    }

    /**
     * Desarrollo del motivo en frase completa
     */
    private developPhrase(motif: MIDINote[], duration: number, tempo: number, contour: MelodicContour): MIDINote[] {
        const phrase: MIDINote[] = []
        const motifDurationSeconds = motif.reduce((sum, note) => sum + note.duration, 0)
        const repetitions = Math.ceil(duration / motifDurationSeconds)

        let currentTime = 0
        for (let i = 0; i < repetitions; i++) {
            const transformedMotif = this.transformMotifForRepetition(motif, i, contour)
            
            // Ajustar startTime de cada nota
            for (const note of transformedMotif) {
                phrase.push({
                    ...note,
                    startTime: currentTime + note.startTime
                })
            }
            
            currentTime += motifDurationSeconds
        }

        // Filtrar notas que excedan duration
        return phrase.filter(note => note.startTime < duration)
    }

    /**
     * Transformar motivo para repetición
     */
    private transformMotifForRepetition(motif: MIDINote[], repetition: number, contour: MelodicContour): MIDINote[] {
        const transformations: MotifTransformation[] = ['retrograde', 'inversion', 'augmentation', 'diminution']

        if (repetition === 0) return motif // Primera repetición sin transformación

        const transformation = transformations[repetition % transformations.length]
        return this.applyMotifTransformation(motif, transformation)
    }

    /**
     * Aplicar transformación específica al motivo
     */
    applyMotifTransformation(motif: MIDINote[], transformation: MotifTransformation): MIDINote[] {
        switch (transformation) {
            case 'retrograde':
                return this.applyRetrograde(motif)
            case 'inversion':
                return this.applyInversion(motif)
            case 'augmentation':
                return this.applyAugmentation(motif)
            case 'diminution':
                return this.applyDiminution(motif)
            case 'transposition':
                return this.applyTransposition(motif, this.random.nextInt(-7, 7))
            case 'rhythmDisplacement':
                return this.applyRhythmDisplacement(motif)
            case 'fragmentation':
                return this.applyFragmentation(motif)
            default:
                return motif
        }
    }

    /**
     * Retrograde: invertir orden de notas
     */
    private applyRetrograde(motif: MIDINote[]): MIDINote[] {
        const reversed = [...motif].reverse()
        let currentTime = 0
        
        return reversed.map(note => {
            const retrogradeNote = {
                ...note,
                startTime: currentTime
            }
            currentTime += note.duration
            return retrogradeNote
        })
    }

    /**
     * Inversion: invertir intervalos
     */
    private applyInversion(motif: MIDINote[]): MIDINote[] {
        if (motif.length === 0) return motif

        const pivot = motif[0].pitch
        return motif.map(note => ({
            ...note,
            pitch: pivot - (note.pitch - pivot)
        }))
    }

    /**
     * Augmentation: alargar duraciones
     */
    private applyAugmentation(motif: MIDINote[]): MIDINote[] {
        let currentTime = 0
        return motif.map(note => {
            const augmentedNote = {
                ...note,
                startTime: currentTime,
                duration: note.duration * 2
            }
            currentTime += augmentedNote.duration
            return augmentedNote
        })
    }

    /**
     * Diminution: acortar duraciones
     */
    private applyDiminution(motif: MIDINote[]): MIDINote[] {
        let currentTime = 0
        return motif.map(note => {
            const diminishedNote = {
                ...note,
                startTime: currentTime,
                duration: Math.max(0.125, note.duration / 2) // Mínimo 0.125 segundos
            }
            currentTime += diminishedNote.duration
            return diminishedNote
        })
    }

    /**
     * Transposition: transponer por semitonos
     */
    private applyTransposition(motif: MIDINote[], semitones: number): MIDINote[] {
        return motif.map(note => ({
            ...note,
            pitch: note.pitch + semitones
        }))
    }

    /**
     * Rhythm displacement: desplazar ritmos
     */
    private applyRhythmDisplacement(motif: MIDINote[]): MIDINote[] {
        const displaced: MIDINote[] = []
        let timeOffset = 0

        for (let i = 0; i < motif.length; i++) {
            const note = motif[i]
            const nextNote = motif[(i + 1) % motif.length]
            const displacement = (nextNote.startTime - note.startTime) * 0.25 // 25% displacement

            displaced.push({
                ...note,
                startTime: note.startTime + timeOffset
            })

            timeOffset += displacement
        }

        return displaced
    }

    /**
     * Fragmentation: dividir notas en fragmentos
     */
    private applyFragmentation(motif: MIDINote[]): MIDINote[] {
        const fragmented: MIDINote[] = []

        for (const note of motif) {
            // Dividir cada nota en 2-3 fragmentos
            const fragments = this.random.nextInt(2, 4)
            const fragmentDuration = note.duration / fragments

            for (let i = 0; i < fragments; i++) {
                fragmented.push({
                    ...note,
                    startTime: note.startTime + (i * fragmentDuration),
                    duration: fragmentDuration,
                    velocity: note.velocity - 10 // Más suave
                })
            }
        }

        return fragmented
    }

    /**
     * Aplicar contorno melódico
     */
    private applyContour(phrase: MIDINote[], contour: MelodicContour, range: { min: number, max: number }): MIDINote[] {
        const contouredPhrase = [...phrase]
        const totalNotes = contouredPhrase.length

        for (let i = 0; i < totalNotes; i++) {
            const progress = i / (totalNotes - 1) // 0 to 1
            const targetOctave = this.calculateContourShift(contour, progress, range)
            
            // Extraer nota (0-11) y reemplazar octava
            const noteClass = contouredPhrase[i].pitch % 12
            contouredPhrase[i].pitch = noteClass + (targetOctave * 12)
        }

        return contouredPhrase
    }

    /**
     * Calcular shift de octava según contorno
     */
    private calculateContourShift(contour: MelodicContour, progress: number, range: { min: number, max: number }): number {
        const { min, max } = range
        let shift = 0

        switch (contour) {
            case 'ascending':
                shift = min + (progress * (max - min))
                break
            case 'descending':
                shift = max - (progress * (max - min))
                break
            case 'arched':
                // Asymmetric arch (golden ratio peak at ~0.618)
                const peakPosition = 0.618 // Golden ratio for natural climax
                const ascent = progress < peakPosition
                const phase = ascent ? progress / peakPosition : (1 - progress) / (1 - peakPosition)
                
                // Ease-in-out curve (more natural than linear)
                const easedPhase = phase < 0.5 
                    ? 2 * phase * phase 
                    : 1 - Math.pow(-2 * phase + 2, 2) / 2
                
                shift = ascent
                    ? min + easedPhase * (max - min)
                    : min + easedPhase * (max - min)
                break
            case 'valley':
                shift = progress < 0.5
                    ? max - (progress * 2 * (max - min))
                    : min + ((progress - 0.5) * 2 * (max - min))
                break
            case 'wave':
                // Multiple waves with controlled amplitude
                const waveFrequency = 3 // 3 ciclos completos
                const waveAmplitude = 0.6 // Solo 60% del rango (evita extremos)
                const centerOctave = (min + max) / 2
                shift = centerOctave + Math.sin(progress * Math.PI * 2 * waveFrequency) * (max - min) * waveAmplitude
                break
            case 'static':
            default:
                shift = (min + max) / 2
                break
        }

        return Math.round(shift)
    }
}
