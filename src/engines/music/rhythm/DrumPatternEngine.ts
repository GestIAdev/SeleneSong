/**
 * 🥁 DRUM PATTERN ENGINE - STRUCTURED RHYTHM
 * 
 * Reemplaza la lógica caótica de drums con patrones estructurados profesionales.
 * Cada sección (intro, verse, chorus, bridge, outro) tiene su propio patrón con groove real.
 * 
 * MATANDO: Bug #24 (Drums Caóticos)
 * 
 * FEATURES:
 * - ✅ 5 patrones base (intro/verse/chorus/bridge/outro)
 * - ✅ Fills automáticos en transiciones
 * - ✅ Mapeo General MIDI Standard (kick=36, snare=38, etc.)
 * - ✅ Subdivisiones precisas (16th notes)
 * - ✅ Variación de velocidad (ghost notes, accents)
 * - ✅ 100% determinista (SeededRandom)
 * 
 * AUTHOR: PunkClaude + Radwulf + Architect
 * DATE: 2025-11-02
 */

import { MIDINote } from '../core/interfaces.js'
import { Section } from '../structure/SongStructure.js'
import { SeededRandom } from '../utils/SeededRandom.js'

// Pattern definition
interface DrumPattern {
    bars: number
    notes: DrumNote[]
}

interface DrumNote {
    beat: number      // 1-based beat position (1, 1.5, 2, 2.5, etc.)
    midi: number      // MIDI note number (36=kick, 38=snare, etc.)
    velocity: number  // 0-127 MIDI velocity
}

export class DrumPatternEngine {
    private patterns: Record<string, DrumPattern>
    private tempo: number
    private prng: SeededRandom

    constructor(tempo: number, seed: number = 12345) {
        this.tempo = tempo
        this.prng = new SeededRandom(seed)
        this.patterns = this.loadPatterns()
    }

    /**
     * Definir patrones estructurados por sección
     */
    private loadPatterns(): Record<string, DrumPattern> {
        return {
            // PATTERN 1: INTRO (Minimal pero audible)
            intro: {
                bars: 4,
                notes: [
                    // Bar 1: Hi-hats cada beat
                    { beat: 1, midi: 42, velocity: 80 },   // HH closed (beat 1)
                    { beat: 2, midi: 42, velocity: 70 },   // HH closed (beat 2)
                    { beat: 3, midi: 42, velocity: 75 },   // HH closed (beat 3)
                    { beat: 4, midi: 42, velocity: 70 }    // HH closed (beat 4)
                ]
            },

            // PATTERN 2: VERSE (Basic Groove)
            verse: {
                bars: 4,
                notes: [
                    // Beat 1
                    { beat: 1, midi: 36, velocity: 110 },  // Kick (más fuerte)
                    { beat: 1, midi: 42, velocity: 80 },   // HH closed
                    { beat: 1.5, midi: 42, velocity: 60 }, // HH closed
                    
                    // Beat 2
                    { beat: 2, midi: 42, velocity: 70 },   // HH closed
                    { beat: 2.5, midi: 38, velocity: 95 }, // Snare (más fuerte)
                    { beat: 2.5, midi: 42, velocity: 60 }, // HH closed
                    
                    // Beat 3
                    { beat: 3, midi: 36, velocity: 105 },  // Kick
                    { beat: 3, midi: 42, velocity: 80 },   // HH closed
                    { beat: 3.5, midi: 42, velocity: 60 }, // HH closed
                    
                    // Beat 4
                    { beat: 4, midi: 42, velocity: 70 },   // HH closed
                    { beat: 4.5, midi: 38, velocity: 90 }, // Snare
                    { beat: 4.5, midi: 46, velocity: 75 }  // HH open (más fuerte)
                ]
            },

            // PATTERN 3: CHORUS (Complex)
            chorus: {
                bars: 4,
                notes: [
                    // Beat 1 - Fuerte con crash
                    { beat: 1, midi: 36, velocity: 120 },  // Kick (máximo)
                    { beat: 1, midi: 49, velocity: 110 },  // Crash (fuerte)
                    { beat: 1, midi: 42, velocity: 90 },   // HH closed
                    { beat: 1.5, midi: 42, velocity: 70 }, // HH closed
                    
                    // Beat 2
                    { beat: 2, midi: 42, velocity: 80 },   // HH closed
                    { beat: 2.5, midi: 38, velocity: 110 },// Snare (fuerte)
                    { beat: 2.5, midi: 39, velocity: 100 },// Clap (layered)
                    { beat: 2.5, midi: 42, velocity: 70 }, // HH closed
                    
                    // Beat 3 - Ghost kick
                    { beat: 3, midi: 36, velocity: 115 },  // Kick
                    { beat: 3, midi: 42, velocity: 90 },   // HH closed
                    { beat: 3.25, midi: 36, velocity: 95 },// Kick (ghost)
                    { beat: 3.5, midi: 42, velocity: 70 }, // HH closed
                    
                    // Beat 4 - Con tom
                    { beat: 4, midi: 42, velocity: 80 },   // HH closed
                    { beat: 4.5, midi: 38, velocity: 105 },// Snare
                    { beat: 4.5, midi: 46, velocity: 85 }, // HH open
                    { beat: 4.75, midi: 50, velocity: 95 } // Tom high
                ]
            },

            // PATTERN 4: BRIDGE (Break/Sparse)
            bridge: {
                bars: 4,
                notes: [
                    // Minimal - solo percusión suave pero audible
                    { beat: 1, midi: 70, velocity: 85 },   // Shaker (más fuerte)
                    { beat: 2, midi: 70, velocity: 80 },   // Shaker
                    { beat: 3, midi: 54, velocity: 75 },   // Tambourine (más fuerte)
                    { beat: 4, midi: 70, velocity: 80 }    // Shaker
                ]
            },

            // PATTERN 5: BUILDUP (Cyberpunk Glitchy - espaciado)
            // ✅ BUG #24 FIX: Buildup cyberpunk (glitchy/espaciado), no metralleta
            buildup: {
                bars: 4,
                notes: [
                    // Bar 1: Kick + Hi-Hat espaciado
                    { beat: 1, midi: 36, velocity: 105 },  // Kick
                    { beat: 1, midi: 42, velocity: 75 },   // HH closed
                    { beat: 2.5, midi: 38, velocity: 90 }, // Snare
                    { beat: 3.5, midi: 36, velocity: 100 },// Kick
                    { beat: 4, midi: 42, velocity: 70 },   // HH closed
                    
                    // Bar 2: Añadir crash y clap
                    { beat: 5, midi: 49, velocity: 95 },   // Crash (glitch)
                    { beat: 6.5, midi: 39, velocity: 85 }, // Clap
                    { beat: 7.5, midi: 36, velocity: 105 },// Kick
                    
                    // Bar 3-4: Repetir con variación
                    { beat: 9, midi: 36, velocity: 110 },  // Kick
                    { beat: 10.5, midi: 38, velocity: 95 },// Snare
                    { beat: 11.5, midi: 49, velocity: 100 },// Crash
                    { beat: 13, midi: 36, velocity: 115 }, // Kick final
                    { beat: 14.5, midi: 38, velocity: 100 }// Snare final
                ]
            },

            // PATTERN 6: OUTRO (Fade)
            outro: {
                bars: 4,
                notes: [
                    // Mismo que verse pero con velocidades iniciales altas (fade gradual automático)
                    { beat: 1, midi: 36, velocity: 110 },  // Kick
                    { beat: 1, midi: 42, velocity: 80 },   // HH closed
                    { beat: 2.5, midi: 38, velocity: 95 }, // Snare
                    { beat: 3, midi: 36, velocity: 105 },  // Kick
                    { beat: 4.5, midi: 46, velocity: 75 }  // HH open
                ]
            }
        }
    }

    /**
     * Generar notas de drums para una sección completa
     */
    generateForSection(section: Section, baseVelocity: number = 60): MIDINote[] {
        const patternName = this.selectPattern(section.type)
        const pattern = this.patterns[patternName]
        
        if (!pattern) {
            console.warn(`⚠️  [DrumPatternEngine] No pattern for section: ${section.type}`)
            return []
        }

        const notes: MIDINote[] = []
        const beatDuration = (60 / this.tempo) // Segundos por beat (4/4)
        const barDuration = beatDuration * 4   // 4 beats por bar

        // Calcular cuántas repeticiones del patrón necesitamos
        const patternDuration = barDuration * pattern.bars
        const numRepeats = Math.ceil(section.duration / patternDuration)

        // Generar notas para cada repetición
        for (let repeat = 0; repeat < numRepeats; repeat++) {
            const repeatOffset = repeat * patternDuration

            pattern.notes.forEach(note => {
                const noteTime = section.startTime + repeatOffset + ((note.beat - 1) * beatDuration)
                
                // No agregar notas que excedan la duración de la sección
                if (noteTime < section.startTime + section.duration) {
                    // Aplicar fade en outro
                    let velocity = note.velocity
                    if (patternName === 'outro') {
                        const fadeProgress = (noteTime - section.startTime) / section.duration
                        velocity = note.velocity * (1 - fadeProgress * 0.6) // Fade 60%
                    }

                    // ✅ BUG #31 FIX FINAL: NO normalizar velocities PRO del patrón
                    // Los patrones ya tienen velocities profesionales (80-120 MIDI)
                    // baseVelocity (config.velocity * 127) causaba doble normalización:
                    // kick=110 MIDI → (110/127)*59 = 51 MIDI (pérdida de 59 puntos!)
                    // 
                    // AHORA: Usar velocities del patrón directamente (ya son MIDI 0-127)
                    const scaledVelocity = Math.floor(velocity)

                    notes.push({
                        pitch: note.midi,
                        velocity: Math.max(1, Math.min(127, scaledVelocity)),
                        startTime: noteTime,
                        duration: 0.1, // Percusión = corta
                        channel: 9     // Channel 9 = drums
                    })
                }
            })
        }

        // Agregar fill al final si corresponde
        if (this.shouldAddFill(section)) {
            const fillNotes = this.generateFill(section, baseVelocity)
            notes.push(...fillNotes)
        }

        console.log(`🥁 [DrumPatternEngine] Generated ${notes.length} notes for ${section.type} (${patternName})`)
        return notes
    }

    /**
     * Seleccionar patrón según tipo de sección
     */
    private selectPattern(sectionType: string): string {
        const mapping: Record<string, string> = {
            'intro': 'intro',
            'verse': 'verse',
            'pre-chorus': 'verse',     // Usar verse pattern
            'chorus': 'chorus',
            'interlude': 'bridge',
            'bridge': 'bridge',
            'buildup': 'buildup',      // ✅ BUG #24 FIX: Patrón específico glitchy (no chorus)
            'outro': 'outro'
        }
        
        return mapping[sectionType] || 'verse' // Default: verse
    }

    /**
     * Determinar si agregar fill de transición
     */
    private shouldAddFill(section: Section): boolean {
        // ✅ BUG #24 FIX: NO añadir fill en buildup (ya tiene chorus pattern complejo)
        // Agregar fill solo antes de chorus o al final de verse
        return section.type === 'verse' || 
               section.type === 'pre-chorus'
    }

    /**
     * Generar fill de transición (último bar de la sección)
     */
    private generateFill(section: Section, baseVelocity: number): MIDINote[] {
        const beatDuration = (60 / this.tempo)
        const fillStart = section.startTime + section.duration - (beatDuration * 4) // Último bar

        // Fill clásico: kick → tom high → tom mid → tom low → kick+crash → snare
        const fillPattern = [
            { offset: 0, midi: 36, velocity: 1.0 },              // Kick (máximo)
            { offset: 0.5, midi: 50, velocity: 0.9 },            // Tom high
            { offset: 1, midi: 47, velocity: 0.95 },             // Tom mid
            { offset: 1.5, midi: 45, velocity: 1.0 },            // Tom low (máximo)
            { offset: 2, midi: 36, velocity: 1.0 },              // Kick (máximo)
            { offset: 2, midi: 49, velocity: 1.0 },              // Crash (máximo)
            { offset: 3, midi: 38, velocity: 1.0 },              // Snare final (máximo)
        ]

        return fillPattern.map(note => ({
            pitch: note.midi,
            velocity: Math.floor(note.velocity * baseVelocity),
            startTime: fillStart + (note.offset * beatDuration),
            duration: 0.1,
            channel: 9
        }))
    }

    /**
     * Set new seed for deterministic generation
     */
    setSeed(seed: number): void {
        this.prng = new SeededRandom(seed)
    }
}
