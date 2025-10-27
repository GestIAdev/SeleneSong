/**
 * 🎸 PRESET CATALOG
 */

import { StylePreset } from '../StylePreset.js'
import { CYBERPUNK_AMBIENT } from './cyberpunk.js'
import { INDIE_GAME_LOOP } from './indie.js'
import { NEOCLASSICAL_DRONE } from './neoclassical.js'
import { SYNTHWAVE_ACTION } from './synthwave.js'
import { LOFI_CHILL } from './lofi.js'
import { EPIC_ORCHESTRAL } from './orchestral.js'

export const PRESET_CATALOG: Record<string, StylePreset> = {
    'cyberpunk-ambient': CYBERPUNK_AMBIENT,
    'indie-game-loop': INDIE_GAME_LOOP,
    'neoclassical-drone': NEOCLASSICAL_DRONE,
    'synthwave-action': SYNTHWAVE_ACTION,
    'lofi-minimalist': LOFI_CHILL,
    'epic-orchestral': EPIC_ORCHESTRAL
}

export {
    CYBERPUNK_AMBIENT,
    INDIE_GAME_LOOP,
    NEOCLASSICAL_DRONE,
    SYNTHWAVE_ACTION,
    LOFI_CHILL,
    EPIC_ORCHESTRAL
}

