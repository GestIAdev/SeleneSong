/**
 * 🎸 STYLE PRESET - INTERFACE
 */

import { ModalScale } from '../core/interfaces.js'
import { ModeConfig } from '../core/types.js'

// Identidad
export interface StylePreset {
    id: string                      // 'cyberpunk-ambient', 'indie-game-loop'
    name: string                    // 'Cyberpunk Ambient'
    description: string             // 'Atmósfera oscura y espaciosa...'
    tags: string[]                  // ['ambient', 'dark', 'electronic']

    // Parámetros Musicales Core
    musical: MusicalParameters

    // Configuración de Capas
    layers: LayerConfiguration

    // Textura y Densidad
    texture: TextureProfile

    // Comportamiento Temporal
    temporal: TemporalBehavior

    // Overrides de Modo (opcional)
    modeOverrides?: Partial<ModeConfig>
}

// Parámetros Musicales Fundamentales
export interface MusicalParameters {
    // Modo/Escala
    mode: ModalScale                // 'major', 'minor', 'dorian', 'phrygian', etc.
    scalePattern?: number[]         // [0,2,4,5,7,9,11] para override custom

    // Tempo y Métrica
    tempo: number                   // BPM (40-200)
    timeSignature: [number, number] // [4, 4] = 4/4, [3, 4] = 3/4, [7, 8] = 7/8

    // Rango de Tonalidad
    rootRange: [number, number]     // [48, 60] = C3 a C4 (rango de tónica)

    // Características Armónicas
    harmonic: HarmonicStyle

    // Características Melódicas
    melodic: MelodicStyle

    // Características Rítmicas
    rhythmic: RhythmicStyle
}

// Estilo Armónico
export interface HarmonicStyle {
    // Tipo de progresión preferida
    progressionType: 'tonal' | 'modal' | 'chromatic' | 'atonal' | 'quartal'

    // Complejidad de acordes
    chordComplexity: 'triads' | 'seventh' | 'extended' | 'clusters'

    // Densidad armónica (acordes por compás)
    density: number                 // 0.25 = 1 acorde cada 4 compases, 2 = 2 por compás

    // Preferencia de inversiones
    inversionProbability: number    // 0-1 (0 = root position, 1 = siempre invertido)

    // Disonancia permitida
    dissonanceLevel: number         // 0-1 (0 = consonante, 1 = máxima tensión)

    // Modulación entre secciones
    modulationStrategy: 'none' | 'relative' | 'parallel' | 'chromatic' | 'modal'
}

// Estilo Melódico
export interface MelodicStyle {
    // Rango melódico (en octavas sobre la raíz)
    range: [number, number]         // [0, 2] = 2 octavas desde root

    // Contorno preferido
    contourPreference: 'ascending' | 'descending' | 'arched' | 'wave' | 'random'

    // Densidad de notas
    noteDensity: number             // 0-1 (0 = espaciado, 1 = muy denso)

    // Uso de silencios
    restProbability: number         // 0-1 (probabilidad de silencios)

    // Ornamentación
    ornamentation: 'none' | 'minimal' | 'moderate' | 'heavy'

    // Repetición de motivos
    motifRepetition: number         // 0-1 (0 = siempre nuevo, 1 = muy repetitivo)
}

// Estilo Rítmico
export interface RhythmicStyle {
    // División rítmica base
    baseDivision: number            // 4 = cuartos, 8 = octavos, 16 = dieciseisavos

    // Complejidad rítmica
    complexity: 'simple' | 'moderate' | 'complex' | 'polyrhythmic'

    // Swing/Groove
    swing: number                   // 0-1 (0 = straight, 1 = heavy swing)

    // Síncopa
    syncopation: number             // 0-1 (0 = on-beat, 1 = máxima síncopa)

    // Densidad de capas rítmicas
    layerDensity: number            // 1-5 (cantidad de capas percusivas)
}

// Configuración de Capas
export interface LayerConfiguration {
    melody: LayerConfig | false     // false = sin melodía
    harmony: LayerConfig | false
    bass: LayerConfig | false
    rhythm: LayerConfig | false
    pad: LayerConfig | false        // Capa atmosférica
    lead: LayerConfig | false       // Lead adicional
}

// Config de una capa individual
export interface LayerConfig {
    enabled: boolean

    // Rango MIDI
    octave: number                  // 3 = C3-B3, 4 = C4-B4
    range?: [number, number]        // Override de rango específico

    // Dinámica
    velocity: number                // 0-127 (volumen base)
    velocityVariation: number       // 0-1 (cuánto varía la velocity)

    // Articulación
    articulation: 'staccato' | 'legato' | 'normal'
    noteDuration: number            // Multiplicador de duración (0.5 = mitad, 2 = doble)

    // Peso en la mezcla
    mixWeight: number               // 0-1 (importancia relativa)

    // MIDI channel/instrument
    channel?: number                // 0-15 (para multi-channel MIDI)
    program?: number                // 0-127 (program change para GM)
}

// Perfil de Textura
export interface TextureProfile {
    // Densidad global
    density: 'sparse' | 'medium' | 'dense' | 'ultra-dense'

    // Espaciado vertical (rango de alturas simultáneas)
    verticalSpacing: number         // 0-1 (0 = cerrado, 1 = amplio)

    // Capas activas simultáneas
    activeLayersRange: [number, number]  // [2, 4] = entre 2 y 4 capas activas

    // Transparencia (silencios/espacios)
    transparency: number            // 0-1 (0 = continuo, 1 = muy espaciado)
}

// Comportamiento Temporal
export interface TemporalBehavior {
    // Evolución de tempo
    tempoEvolution: 'static' | 'accelerando' | 'ritardando' | 'rubato'
    tempoVariation: number          // 0-1 (cantidad de variación)

    // Evolución de intensidad
    intensityArc: 'flat' | 'crescendo' | 'diminuendo' | 'wave' | 'dramatic'

    // Fade in/out
    fadeIn: number                  // Segundos
    fadeOut: number                 // Segundos

    // Loopable
    loopable: boolean               // Si true, final conecta con inicio
}

// Resolved Style (resultado de resolver preset)
export interface ResolvedStyle {
    preset: StylePreset
    effectiveParams: any // TODO: definir
}

