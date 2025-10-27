/**
 * 🎸 STRUCTURE ENGINE
 * Genera estructura de canción adaptada a duración y estilo
 */

import { SongStructure, Section, SectionProfile, Transition } from './SongStructure.js'
import { StylePreset } from '../style/StylePreset.js'
import { SeededRandom } from '../utils/SeededRandom.js'
import { SectionType } from '../core/types.js'

export class StructureEngine {

    /**
     * Generar estructura completa
     */
    generateStructure(
        duration: number,
        style: StylePreset,
        seed: number,
        modeConfig: any
    ): SongStructure {
        const prng = new SeededRandom(seed)

        // 1. Determinar forma según duración
        const form = this.selectForm(duration, style, prng)

        // 2. Calcular duraciones de secciones
        const sections = this.calculateSectionDurations(form, duration, style, prng)

        // 3. Asignar perfiles a cada sección
        const profiledSections = sections.map(section =>
            this.assignProfile(section, style, modeConfig, prng)
        )

        // 4. Generar transiciones
        const finalSections = this.generateTransitions(
            profiledSections,
            style,
            prng
        )

        return {
            totalDuration: duration,
            sections: finalSections,
            globalTempo: style.musical.tempo,
            timeSignature: style.musical.timeSignature,
            transitionStyle: style.temporal.loopable ? 'smooth' : 'silence'
        }
    }

    /**
     * Seleccionar forma musical según duración
     */
    private selectForm(
        duration: number,
        style: StylePreset,
        prng: SeededRandom
    ): SectionType[] {
        // Duraciones cortas (< 60s)
        if (duration < 60) {
            if (style.temporal.loopable) {
                // Loop simple: A-B-A o A-A-B
                return prng.next() < 0.5
                    ? ['verse', 'chorus', 'verse']
                    : ['verse', 'verse', 'chorus']
            } else {
                // Pieza corta: Intro-A-Outro
                return ['intro', 'verse', 'outro']
            }
        }

        // Duraciones medias (60-120s)
        else if (duration < 120) {
            // Forma canción clásica: Intro-Verse-Chorus-Verse-Chorus-Outro
            return ['intro', 'verse', 'chorus', 'verse', 'chorus', 'outro']
        }

        // Duraciones largas (120-180s)
        else if (duration < 180) {
            // Forma extendida con puente
            return [
                'intro',
                'verse',
                'chorus',
                'verse',
                'chorus',
                'bridge',
                'chorus',
                'outro'
            ]
        }

        // Duraciones muy largas (180s+)
        else {
            // Forma compleja con interludios
            return [
                'intro',
                'verse',
                'pre-chorus',
                'chorus',
                'interlude',
                'verse',
                'pre-chorus',
                'chorus',
                'bridge',
                'buildup',
                'chorus',
                'outro'
            ]
        }
    }

    /**
     * Calcular duraciones usando Fibonacci escalado
     */
    private calculateSectionDurations(
        form: SectionType[],
        totalDuration: number,
        style: StylePreset,
        prng: SeededRandom
    ): Section[] {
        // Generar secuencia Fibonacci según cantidad de secciones
        const fibSequence = this.generateFibonacci(form.length)
        const totalFib = fibSequence.reduce((a, b) => a + b, 0)

        // Reservar tiempo para fade in/out
        const fadeTime = style.temporal.fadeIn + style.temporal.fadeOut
        const usableDuration = totalDuration - fadeTime

        // Escalar Fibonacci a duración real
        const sections: Section[] = []
        let currentTime = style.temporal.fadeIn

        for (let i = 0; i < form.length; i++) {
            const proportion = fibSequence[i] / totalFib
            const sectionDuration = usableDuration * proportion

            // Calcular compases (redondeando a compás completo)
            const beatsPerBar = style.musical.timeSignature[0]
            const bpm = style.musical.tempo
            const secondsPerBar = (60 / bpm) * beatsPerBar
            const bars = Math.max(1, Math.round(sectionDuration / secondsPerBar))

            // Ajustar duración a compases completos
            const adjustedDuration = bars * secondsPerBar

            sections.push({
                id: `${form[i]}-${i}`,
                type: form[i],
                index: i,
                startTime: currentTime,
                duration: adjustedDuration,
                bars,
                profile: null as any, // Se asigna después
                transition: null as any
            })

            currentTime += adjustedDuration
        }

        return sections
    }

    /**
     * Asignar perfil musical a sección
     */
    private assignProfile(
        section: Section,
        style: StylePreset,
        mode: any,
        prng: SeededRandom
    ): Section {
        const type = section.type
        let profile: SectionProfile

        // Perfiles por tipo de sección
        switch (type) {
            case 'intro':
                profile = {
                    intensity: 0.3,
                    layerDensity: 0.4,
                    harmonicComplexity: 0.3,
                    melodicDensity: 0.4,
                    rhythmicDensity: 0.2,
                    tempoMultiplier: 1.0,
                    characteristics: {
                        repetitive: false,
                        motivic: true,
                        transitional: false,
                        climactic: false,
                        atmospheric: true
                    }
                }
                break

            case 'verse':
                profile = {
                    intensity: 0.5,
                    layerDensity: 0.6,
                    harmonicComplexity: 0.5,
                    melodicDensity: 0.7,
                    rhythmicDensity: 0.6,
                    tempoMultiplier: 1.0,
                    characteristics: {
                        repetitive: true,
                        motivic: true,
                        transitional: false,
                        climactic: false,
                        atmospheric: false
                    }
                }
                break

            case 'chorus':
                profile = {
                    intensity: 0.9,
                    layerDensity: 0.9,
                    harmonicComplexity: 0.6,
                    melodicDensity: 0.8,
                    rhythmicDensity: 0.9,
                    tempoMultiplier: 1.0,
                    characteristics: {
                        repetitive: true,
                        motivic: true,
                        transitional: false,
                        climactic: true,
                        atmospheric: false
                    }
                }
                break

            case 'bridge':
                profile = {
                    intensity: 0.7,
                    layerDensity: 0.7,
                    harmonicComplexity: 0.8,
                    melodicDensity: 0.6,
                    rhythmicDensity: 0.5,
                    tempoMultiplier: 0.9,
                    modulation: {
                        type: 'relative',
                        targetRoot: 5  // Modular a quinta
                    },
                    characteristics: {
                        repetitive: false,
                        motivic: false,
                        transitional: true,
                        climactic: false,
                        atmospheric: false
                    }
                }
                break

            case 'outro':
                profile = {
                    intensity: 0.4,
                    layerDensity: 0.5,
                    harmonicComplexity: 0.4,
                    melodicDensity: 0.3,
                    rhythmicDensity: 0.3,
                    tempoMultiplier: 0.95,
                    characteristics: {
                        repetitive: false,
                        motivic: true,
                        transitional: false,
                        climactic: false,
                        atmospheric: true
                    }
                }
                break

            // ... otros tipos de sección

            default:
                profile = {
                    intensity: 0.6,
                    layerDensity: 0.6,
                    harmonicComplexity: 0.5,
                    melodicDensity: 0.6,
                    rhythmicDensity: 0.6,
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

        // Aplicar influencia de modo
        const punkFactor = mode.punkProbability / 100
        profile.intensity *= (1 + punkFactor * 0.3)
        profile.layerDensity *= (1 + punkFactor * 0.2)
        profile.rhythmicDensity *= (1 + punkFactor * 0.4)

        return {
            ...section,
            profile
        }
    }

    /**
     * Generar secuencia Fibonacci
     */
    private generateFibonacci(length: number): number[] {
        if (length === 0) return []
        if (length === 1) return [1]
        if (length === 2) return [1, 1]

        const fib = [1, 1]
        for (let i = 2; i < length; i++) {
            fib.push(fib[i-1] + fib[i-2])
        }
        return fib
    }

    /**
     * Generar transiciones entre secciones
     */
    private generateTransitions(
        sections: Section[],
        style: StylePreset,
        prng: SeededRandom
    ): Section[] {
        for (let i = 0; i < sections.length - 1; i++) {
            const current = sections[i]
            const next = sections[i + 1]

            // Determinar tipo de transición según contexto
            let transitionType: Transition['type'] = 'direct'

            if (current.type === 'verse' && next.type === 'chorus') {
                transitionType = prng.next() < 0.5 ? 'buildup' : 'direct'
            } else if (current.type === 'bridge' && next.type === 'chorus') {
                transitionType = 'buildup'
            } else if (current.type === 'chorus' && next.type === 'outro') {
                transitionType = 'fade'
            } else if (next.type === 'breakdown') {
                transitionType = 'breakdown'
            }

            current.transition = {
                type: transitionType,
                duration: transitionType === 'direct' ? 0 : 1.0,
                characteristics: {
                    crescendo: transitionType === 'buildup',
                    accelerando: transitionType === 'buildup' && prng.next() < 0.3,
                    fillPattern: transitionType === 'buildup' ? 'drum' : undefined
                }
            }
        }

        return sections
    }
}

