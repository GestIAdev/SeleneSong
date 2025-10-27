/**
 * 🎵 MODAL PROGRESSIONS
 * Progresiones modales para jazz, world music y ambient
 */

import { ChordProgression } from '../ChordProgression.js'

export const MODAL_PROGRESSIONS: Record<string, ChordProgression> = {
    'modal-dorian': {
        id: 'modal-dorian',
        name: 'Dorian Modal Vamp',
        description: 'Vamp dorian clásico. Base del jazz modal.',
        tags: ['modal', 'dorian', 'jazz', 'vamp'],
        chords: [
            { degree: 0, quality: 'minor', extensions: [7], duration: 4, inversion: 0 },     // im7 (4 bars)
            { degree: 3, quality: 'dominant', extensions: [7], duration: 4, inversion: 0 },  // IV7 (4 bars)
            { degree: 0, quality: 'minor', extensions: [7], duration: 4, inversion: 0 }      // im7 (4 bars)
        ],
        totalBars: 12,
        voiceLeading: 'smooth',
        cyclic: true
    },

    'modal-phrygian': {
        id: 'modal-phrygian',
        name: 'Phrygian Dominant',
        description: 'Progresión frígia dominante. Atmósfera española/oriental.',
        tags: ['modal', 'phrygian', 'spanish', 'oriental'],
        chords: [
            { degree: 0, quality: 'dominant', extensions: [7, 9, 11], duration: 4, inversion: 0 }, // I7(♭9,♯11) (4 bars)
            { degree: 3, quality: 'minor', extensions: [7, 9], duration: 4, inversion: 0 },        // ivm7(♭9) (4 bars)
            { degree: 0, quality: 'dominant', extensions: [7, 9, 11], duration: 4, inversion: 0 }  // I7(♭9,♯11) (4 bars)
        ],
        totalBars: 12,
        voiceLeading: 'smooth',
        cyclic: true
    },

    'modal-lydian': {
        id: 'modal-lydian',
        name: 'Lydian Dream',
        description: 'Progresión lidia. Atmósfera soñadora y etérea.',
        tags: ['modal', 'lydian', 'dreamy', 'ethereal'],
        chords: [
            { degree: 0, quality: 'major', extensions: [6], duration: 4, inversion: 0 },       // Imaj6 (4 bars)
            { degree: 1, quality: 'minor', extensions: [7], duration: 2, inversion: 0 },       // iim7 (2 bars)
            { degree: 4, quality: 'major', extensions: [6], duration: 2, inversion: 0 },       // Vmaj6 (2 bars)
            { degree: 0, quality: 'major', extensions: [6], duration: 4, inversion: 0 }        // Imaj6 (4 bars)
        ],
        totalBars: 12,
        voiceLeading: 'smooth',
        cyclic: true
    },

    'modal-mixolydian': {
        id: 'modal-mixolydian',
        name: 'Mixolydian Groove',
        description: 'Groove mixolidio. Base del rock y funk.',
        tags: ['modal', 'mixolydian', 'groove', 'rock', 'funk'],
        chords: [
            { degree: 0, quality: 'dominant', extensions: [7], duration: 4, inversion: 0 },  // I7 (4 bars)
            { degree: 3, quality: 'dominant', extensions: [7], duration: 4, inversion: 0 },  // IV7 (4 bars)
            { degree: 0, quality: 'dominant', extensions: [7], duration: 4, inversion: 0 }   // I7 (4 bars)
        ],
        totalBars: 12,
        voiceLeading: 'parallel',
        cyclic: true
    },

    'modal-aeolian': {
        id: 'modal-aeolian',
        name: 'Aeolian Lament',
        description: 'Lamento eolio. Atmósfera melancólica y emotiva.',
        tags: ['modal', 'aeolian', 'melancholic', 'emotional'],
        chords: [
            { degree: 0, quality: 'minor', extensions: [7], duration: 4, inversion: 0 },     // im7 (4 bars)
            { degree: 4, quality: 'dominant', extensions: [7, 9], duration: 2, inversion: 0 }, // V7(♭9) (2 bars)
            { degree: 3, quality: 'minor', extensions: [7], duration: 2, inversion: 0 },     // ivm7 (2 bars)
            { degree: 0, quality: 'minor', extensions: [7], duration: 4, inversion: 0 }      // im7 (4 bars)
        ],
        totalBars: 12,
        voiceLeading: 'smooth',
        cyclic: true
    }
}
