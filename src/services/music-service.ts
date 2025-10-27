/**
 * 🎸 MUSIC SERVICE
 */

import { MusicEnginePro } from '../engines/music/core/MusicEnginePro.js'
import { MusicGenerationParams, MusicEngineOutput } from '../engines/music/core/interfaces.js'

export class MusicService {
    private engine: MusicEnginePro
    
    constructor() {
        this.engine = new MusicEnginePro()
    }
    
    async generate(params: MusicGenerationParams): Promise<MusicEngineOutput> {
        return this.engine.generate(params)
    }
    
    async quickGenerate(style: string, duration: number, seed: number): Promise<MusicEngineOutput> {
        return this.engine.quickGenerate(style, duration, seed)
    }
}

