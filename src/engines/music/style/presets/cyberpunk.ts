/**
 * 🎸 PRESET: CYBERPUNK AMBIENT
 * Atmósfera oscura y espaciosa con texturas sintéticas. Blade Runner meets Ghost in the Shell.
 */

import { StylePreset } from '../StylePreset.js'

export const CYBERPUNK_AMBIENT: StylePreset = {
    id: 'cyberpunk-ambient',
    name: 'Cyberpunk Ambient',
    description: 'Atmósfera oscura y espaciosa con texturas sintéticas. Blade Runner meets Ghost in the Shell.',
    tags: ['ambient', 'dark', 'electronic', 'atmospheric', 'slow'],

    musical: {
        mode: 'phrygian',           // Escala oscura, misteriosa
        tempo: 70,                  // Lento, atmosférico
        timeSignature: [4, 4],
        rootRange: [36, 48],        // Registro grave (C2-C3)

        harmonic: {
            progressionType: 'modal',
            chordComplexity: 'extended',    // 9nas, 11vas
            density: 0.25,                  // Acordes largos, sostenidos
            inversionProbability: 0.7,      // Inversiones frecuentes
            dissonanceLevel: 0.6,           // Tensión moderada-alta
            modulationStrategy: 'modal'     // Cambios modales sutiles
        },

        melodic: {
            range: [1, 3],                  // 3 octavas
            contourPreference: 'wave',      // Ondulante
            noteDensity: 0.3,               // Espaciado
            restProbability: 0.4,           // Muchos silencios
            ornamentation: 'minimal',
            motifRepetition: 0.7            // Repetitivo (hipnótico)
        },

        rhythmic: {
            baseDivision: 8,
            complexity: 'simple',
            swing: 0,
            syncopation: 0.2,
            layerDensity: 2                 // Minimal percusión
        }
    },

    layers: {
        melody: {
            enabled: true,
            octave: 5,
            velocity: 40,                   // Suave
            velocityVariation: 0.2,
            articulation: 'legato',
            noteDuration: 2.0,              // Notas largas
            mixWeight: 0.6
        },
        harmony: {
            enabled: true,
            octave: 3,
            velocity: 30,
            velocityVariation: 0.1,
            articulation: 'legato',
            noteDuration: 4.0,              // Pads largos
            mixWeight: 0.8
        },
        bass: {
            enabled: true,
            octave: 2,
            velocity: 35,
            velocityVariation: 0.15,
            articulation: 'normal',
            noteDuration: 3.0,
            mixWeight: 0.5
        },
        rhythm: false,                      // Sin percusión
        pad: {
            enabled: true,
            octave: 4,
            velocity: 25,                   // Muy suave (fondo)
            velocityVariation: 0.05,
            articulation: 'legato',
            noteDuration: 8.0,              // Drones
            mixWeight: 0.4
        },
        lead: false
    },

    texture: {
        density: 'sparse',
        verticalSpacing: 0.8,               // Amplio
        activeLayersRange: [2, 3],
        transparency: 0.6                   // Mucho espacio
    },

    temporal: {
        tempoEvolution: 'static',
        tempoVariation: 0.05,
        intensityArc: 'wave',               // Sube y baja suavemente
        fadeIn: 4.0,
        fadeOut: 6.0,
        loopable: true
    }
}

