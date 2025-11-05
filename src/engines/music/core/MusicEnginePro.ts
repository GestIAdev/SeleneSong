/**
 * 🎸 MUSIC ENGINE PRO - API PRINCIPAL
 */

import { MusicGenerationParams, MusicEngineOutput, MIDINote } from './interfaces.js'
import { StyleEngine } from '../style/StyleEngine.js'
import { StructureEngine } from '../structure/StructureEngine.js'
import { HarmonyEngine } from '../harmony/HarmonyEngine.js'
import { MelodyEngine } from '../harmony/MelodyEngine.js'
import { VitalsIntegrationEngine } from '../vitals/VitalsIntegrationEngine.js'
import { Orchestrator } from '../orchestration/Orchestrator.js'
import { MIDIRenderer } from '../render/MIDIRenderer.js'
import { DrumPatternEngine } from '../rhythm/DrumPatternEngine.js'
import { VitalSigns } from './types.js'
import {
    InstrumentSelection,
    StylePreset,
    SonicPalette,    // 🎸 FASE 5.9
    VibeType,        // 🎸 FASE 5.9
    InstrumentRole   // 🎸 FASE 5.9
} from '../style/StylePreset.js'


// 🎨 SCHERZO SÓNICO - Fase 4.1: Metadata de Track para JSON
export interface TrackMetadata {
    empiricalIndex: number      // Índice empírico (0, 2, 4, 5, 7 - workaround Bug C)
    trackType: string            // 'melody', 'harmony', 'bass', 'rhythm', 'pad'
    instrumentKey: string        // 'melody/pluck/MAX' o 'rythm/hard-kick1'
    instrumentType: 'multisample' | 'oneshot'
}


export class MusicEnginePro {
    private styleEngine: StyleEngine
    private structureEngine: StructureEngine
    private harmonyEngine: HarmonyEngine
    private melodyEngine: MelodyEngine
    private vitalsEngine: VitalsIntegrationEngine
    private orchestrator: Orchestrator
    private renderer: MIDIRenderer
    private drumEngine: DrumPatternEngine | null = null
    
    // 🎸 FASE 5.9: PALETA SÓNICA DETERMINISTA
    // Creada UNA VEZ al inicio de generate(), contiene instrumentos fijos (harmony/melody)
    // y pools dinámicos (rhythm/bass) para toda la canción
    private sonicPalette: SonicPalette | null = null
    
    constructor() {
        this.styleEngine = new StyleEngine()
        this.structureEngine = new StructureEngine()
        this.harmonyEngine = new HarmonyEngine()
        this.melodyEngine = new MelodyEngine(42)  // Seed inicial
        this.vitalsEngine = new VitalsIntegrationEngine()
        this.orchestrator = new Orchestrator()
        this.renderer = new MIDIRenderer()
        // drumEngine se crea en generate() cuando conocemos el tempo
    }
    
    async generate(
        params: MusicGenerationParams,
        vitals?: VitalSigns
    ): Promise<MusicEngineOutput> {
        const startTime = Date.now()

        // Set deterministic seed for all engines
        this.renderer.setSeed(params.seed || 42)

        // 1. Resolver modo (ModeManager) - por ahora usar entropy como default
        const mode: any = {
            entropyFactor: 50,
            riskThreshold: 50,
            punkProbability: 50
        }

        // 2. Resolver estilo (StyleEngine.resolveStyle)
        const resolvedStyle = this.styleEngine.resolveStyle(params, mode, vitals)
        const stylePreset = resolvedStyle.preset

        // 3. Aplicar Vitales (VitalsIntegrationEngine.applyVitalsToStyle)
        const modifiedStyle = vitals
            ? this.vitalsEngine.applyVitalsToStyle(stylePreset, vitals)
            : stylePreset

        // 4. Generar estructura (StructureEngine.generateStructure)
        const structure = this.structureEngine.generateStructure(
            params.targetDuration || params.duration || 120,
            modifiedStyle,
            params.seed,
            mode
        )

        // 🔥 BUG #25 FIX: Crear DrumPatternEngine UNA SOLA VEZ (no en cada sección)
        const tempo = modifiedStyle.musical.tempo
        if (!this.drumEngine || this.drumEngine['tempo'] !== tempo) {
            this.drumEngine = new DrumPatternEngine(tempo, params.seed || 42)
            console.log(`🔧 [MUSIC ENGINE PRO] DrumPatternEngine created (tempo=${tempo}, seed=${params.seed || 42})`)
        }

        // 🎸 FASE 5.9: CREAR PALETA SÓNICA DETERMINISTA (UNA SOLA VEZ)
        // Decide vibe global (chill/dubchill), elige instrumentos fijos (harmony/melody),
        // y copia pools dinámicos (rhythm/bass) para toda la canción
        this.sonicPalette = this.createSonicPalette(params.seed || 42, modifiedStyle)

        // 5. Generar contenido por sección (ARQUITECTURA RADICAL: Section como SSOT)
        const allNotes: MIDINote[] = []
        const tracks = new Map<string, MIDINote[]>()
        
        // 🎨 SCHERZO SÓNICO - Fase 4.1: Rastrear selección de instrumentos por sección
        const instrumentSelections = new Map<string, InstrumentSelection[]>()
        instrumentSelections.set('melody', [])
        instrumentSelections.set('harmony', [])
        instrumentSelections.set('bass', [])
        instrumentSelections.set('rhythm', [])
        instrumentSelections.set('pad', [])

        for (const section of structure.sections) {
            // 🎨 SCHERZO SÓNICO - Fase 4.1: Seleccionar instrumentos dinámicamente
            const melodyInstrument = this.selectInstrumentForSection(section, 'melody', modifiedStyle)
            const harmonyInstrument = this.selectInstrumentForSection(section, 'harmony', modifiedStyle)
            const bassInstrument = this.selectInstrumentForSection(section, 'bass', modifiedStyle)
            const rhythmInstrument = this.selectInstrumentForSection(section, 'rhythm', modifiedStyle)
            const padInstrument = this.selectInstrumentForSection(section, 'pad', modifiedStyle)
            
            // Rastrear selecciones (necesario para construir metadata JSON después)
            instrumentSelections.get('melody')!.push(melodyInstrument)
            instrumentSelections.get('harmony')!.push(harmonyInstrument)
            instrumentSelections.get('bass')!.push(bassInstrument)
            instrumentSelections.get('rhythm')!.push(rhythmInstrument)
            instrumentSelections.get('pad')!.push(padInstrument)
            
            // ✅ PASO 1: Generar Harmony PRIMERO (para calcular densidad real)
            const harmonyOptions: any = {
                seed: params.seed + section.index,
                section: section, // ✅ PASAR SECTION COMPLETA
                key: 0, // C major por defecto
                mode: modifiedStyle.musical.mode,
                complexity: params.complexity,
                voiceLeadingStrategy: 'smooth'
                // ❌ NO pasar tempo, totalBars - están en section
            }
            const chords = this.harmonyEngine.generateChordSequence(harmonyOptions)

            // ✅ PASO 2: Convertir chords a ResolvedChord[]
            const resolvedChords: any[] = this.convertToResolvedChords(chords, section)

            // ✅ PASO 3: Generar Melody
            const melodyOptions: any = {
                seed: params.seed + section.index,
                section: section, // ✅ PASAR SECTION COMPLETA
                key: 0, // C major
                mode: modifiedStyle.musical.mode,
                complexity: params.complexity,
                contour: 'arched',
                range: { min: 4, max: 6 } // Octavas 4-6 (C4-C6)
                // ❌ NO pasar tempo, duration - están en section
            }
            // 🎸 FRENTE #5.2: Desestructurar MelodyResult { notes, instrumentKey }
            const melodyResult = this.melodyEngine.generateMelody(melodyOptions)
            const melody = melodyResult.notes
            const melodyInstrumentKey = melodyResult.instrumentKey

            // ✅ PASO 4: Calcular TOTALLOAD REAL (basado en notas generadas)
            const harmonyDensity = chords.flat().length / section.duration // notas/segundo
            const melodyDensity = melody.length / section.duration // notas/segundo
            const totalLoad = harmonyDensity + melodyDensity
            console.log(`[MUSIC ENGINE] Section ${section.index} (${section.type}): harmonyDensity=${harmonyDensity.toFixed(2)}, melodyDensity=${melodyDensity.toFixed(2)}, totalLoad=${totalLoad.toFixed(2)}`)

            // ✅ PASO 5: Generar capas (Orchestrator usa totalLoad REAL)
            const layers = this.orchestrator.generateLayers(
                section,
                resolvedChords,
                melody, // ✅ NO ajustar startTime aquí - Orchestrator lo respeta
                modifiedStyle,
                params.seed + section.index,
                mode,
                totalLoad, // ✅ PASAR CARGA REAL
                this.drumEngine // 🔥 BUG #25 FIX: Pasar instancia única
            )

            // ✅ PASO 6: Recopilar todas las notas
            allNotes.push(...melody) // ✅ Melody ya tiene startTime correcto
            if (layers.harmony) allNotes.push(...layers.harmony)
            if (layers.bass) allNotes.push(...layers.bass)
            if (layers.rhythm) allNotes.push(...layers.rhythm)
            if (layers.pad) allNotes.push(...layers.pad)

            // 🔧 FASE 3.10 (Contrato Definitivo): Nombres simples lowercase (sin ::)
            // El formato :: falló. Backend DEBE escribir nombres simples que el frontend entienda.
            // 
            // FORMATO: "tracktype" (lowercase, una palabra, sin separadores)
            // - melody, harmony, bass, pad, rhythm
            // El frontend seleccionará el instrumento dinámicamente basado en este nombre.
            
            this.addToTrack(tracks, 'melody', melody)
            this.addToTrack(tracks, 'harmony', layers.harmony || [])
            this.addToTrack(tracks, 'bass', layers.bass || [])
            this.addToTrack(tracks, 'rhythm', layers.rhythm || [])
            if (layers.pad) {
                this.addToTrack(tracks, 'pad', layers.pad)
            }
        }

        // Generate transition fills between sections
        for (let i = 0; i < structure.sections.length - 1; i++) {
            const currentSection = structure.sections[i]
            const nextSection = structure.sections[i + 1]
            
            // Generate transition fill
            const transitionFill = this.generateTransitionFill(
                currentSection,
                nextSection,
                [] // chords array (pasar los acordes relevantes)
            )
            
            allNotes.push(...transitionFill)
        }

        // 6. Generar Poesía (placeholder)
        const poetry = await this.generatePoetry(params.seed, structure)

        // 7. Orquestar y mezclar (Orchestrator.separateIntoTracks, Orchestrator.applyMixing)
        // 🔧 FASE 3.11 (Reparación del Ensamblaje): Leer tracks con nombres lowercase
        // Bug: Escribíamos 'melody' pero leíamos 'Melody' → undefined → 0 notas al MIDIRenderer
        const melodyTrack = tracks.get('melody') || []
        
        const separatedTracks = this.orchestrator.separateIntoTracks(
            melodyTrack,
            {
                harmony: tracks.get('harmony') || [],
                bass: tracks.get('bass') || [],
                rhythm: tracks.get('rhythm') || [],
                pad: tracks.get('pad')
            },
            modifiedStyle
        )
        
        const mixedTracks = this.orchestrator.applyMixing(separatedTracks, modifiedStyle)

        // 8. Renderizar MIDI (MIDIRenderer.renderMultiTrack)
        const midiBuffer = this.renderer.renderMultiTrack(mixedTracks, structure, modifiedStyle)

        // 🎨 SCHERZO SÓNICO - Fase 4.1: Construir Metadata JSON
        // Mapping empírico: [melody=0, skip=1, harmony=2, skip=3, bass=4, rhythm=5, skip=6, pad=7]
        const trackMetadata: TrackMetadata[] = []
        const empiricalMapping: { [key: string]: number } = {
            'melody': 0,
            'harmony': 2,
            'bass': 4,
            'rhythm': 5,
            'pad': 7
        }
        
        // Para cada layer, usar el PRIMER instrumento seleccionado (sección intro)
        // El frontend usará esto como el instrumento para todo el track
        // (En el futuro, podríamos soportar cambios de instrumento por sección)
        const layerOrder: Array<'melody' | 'harmony' | 'bass' | 'rhythm' | 'pad'> = [
            'melody', 'harmony', 'bass', 'rhythm', 'pad'
        ]
        
        for (const layer of layerOrder) {
            const selections = instrumentSelections.get(layer) || []
            if (selections.length === 0) {
                console.log(`⚠️ [MusicEnginePro] No hay selección de instrumento para layer '${layer}', saltando metadata.`)
                continue
            }
            
            // Usar el primer instrumento seleccionado (intro/primera sección)
            const firstSelection = selections[0]
            const empiricalIndex = empiricalMapping[layer]
            
            // 🥁 FASE 5.2: Incluir samples map si es drumkit
            const metadataEntry: any = {
                empiricalIndex,
                trackType: layer,
                instrumentKey: firstSelection.key,
                instrumentType: firstSelection.type
            }
            
            if (firstSelection.type === 'drumkit' && firstSelection.samples) {
                metadataEntry.samples = firstSelection.samples
                console.log(`🥁 [MusicEnginePro] Drumkit metadata: ${firstSelection.key} con ${Object.keys(firstSelection.samples).length} samples`)
            }
            
            trackMetadata.push(metadataEntry)
            
            console.log(`📊 [MusicEnginePro] Metadata: Track ${empiricalIndex} (${layer}) → ${firstSelection.key} (${firstSelection.type})`)
        }

        // 9. Construir MusicEngineOutput
        const output: MusicEngineOutput = {
            midi: {
                buffer: midiBuffer,
                notes: allNotes,
                tracks: Array.from(mixedTracks.values()).map((track, index) => ({
                    id: `track-${index}`,
                    name: Array.from(mixedTracks.keys())[index],
                    channel: index,
                    notes: track,
                    volume: 100
                })),
                // 🎨 SCHERZO SÓNICO - Fase 4.1: Añadir metadata JSON
                trackMetadata
            },
            poetry,
            metadata: {
                duration: structure.totalDuration,
                tempo: structure.globalTempo,
                key: 'C', // TODO: derivar de rootRange
                mode: modifiedStyle.musical.mode,
                structure: structure.sections.map(s => s.type).join('-'),
                stylePreset: params.stylePreset || 'default',
                seed: params.seed,
                timestamp: params.seed * 1000  // Timestamp determinista basado en seed
            },
            analysis: {
                complexity: params.complexity,
                intensity: vitals?.stress || 0.5,
                harmony: vitals?.harmony || 0.5,
                motifDevelopment: 'fibonacci-based',
                progressionUsed: 'I-V-vi-IV'
            }
        }

        // 10. Persistir (placeholder)
        await this.persistOutput(output)

        // 11. Reportar métricas
        await this.reportMetrics(startTime, output)

        return output
    }
    
    async generateFromConsensus(result: any): Promise<MusicEngineOutput> {
        const params = this.consensusToParams(result)
        return this.generate(params)
    }
    
    async quickGenerate(
        style: string,
        duration: number,
        seed: number
    ): Promise<MusicEngineOutput> {
        const params: MusicGenerationParams = {
            seed,
            beauty: 0.5,
            complexity: 0.5,
            duration,
            stylePreset: style
        }
        
        return this.generate(params)
    }
    
    private consensusToParams(result: any): MusicGenerationParams {
        // Convertir resultado de ConsensusResult a MusicGenerationParams
        // Usar timestamp + process.pid para seed determinista (Axioma Anti-Simulación)
        return {
            seed: result.seed || (Date.now() + (process.pid || 0)),
            beauty: result.beauty || 0.5,
            complexity: result.complexity || 0.5,
            duration: result.duration || 120,
            stylePreset: result.stylePreset || 'cyberpunkpreset',  // 🎨 FASE 4.4 - Reparación "Gregoriano"
            mode: result.mode || 'entropy'
        }
    }
    
    /**
     * � FASE 5.9: CREAR PALETA SÓNICA DETERMINISTA
     * 
     * Crea la paleta completa de instrumentos para la canción:
     * - Decide el VIBE global (chill vs dubchill) basado en seed
     * - Elige UN instrumento de harmony (se queda toda la canción)
     * - Elige UN instrumento de melody (se queda toda la canción)
     * - Copia los pools completos de rhythm/bass (para elegir según intensity)
     * 
     * LLAMAR UNA SOLA VEZ al inicio de generate(), antes del loop de secciones.
     */
    private createSonicPalette(seed: number, preset: StylePreset): SonicPalette {
        if (!preset.instruments) {
            console.log(`⚠️ [MusicEnginePro] Preset '${preset.id}' no tiene configuración de instrumentos. Usando fallback.`)
            return {
                vibe: 'chill',
                harmonyInstrument: { key: 'default', type: 'oneshot' },
                melodyInstrument: { key: 'default', type: 'oneshot' },
                rhythmPalette: [],
                bassPalette: []
            }
        }

        // Acceder al PRNG (ya seteado en generate())
        // ⚠️ MIDIRenderer.random es private, pero lo accedemos con bracket notation
        const prng = this.renderer['random']
        
        // Validar que el PRNG esté inicializado
        if (!prng || typeof prng.next !== 'function') {
            console.error(`❌ [MusicEnginePro] PRNG no inicializado. Usando fallback con vibe 'chill'.`)
            return {
                vibe: 'chill',
                harmonyInstrument: { key: 'default', type: 'oneshot' },
                melodyInstrument: { key: 'default', type: 'oneshot' },
                rhythmPalette: preset.instruments.rhythm_chill || [],
                bassPalette: preset.instruments.bass_chill || []
            }
        }

        // 1. Decidir VIBE global (50/50 chill vs dubchill basado en seed)
        const vibe: VibeType = prng.next() < 0.5 ? 'chill' : 'dubchill'
        console.log(`🎸 [MusicEnginePro] VIBE GLOBAL decidido (seed=${seed}): ${vibe}`)

        // 2. Elegir harmony (según vibe)
        const harmonyPool = vibe === 'chill' 
            ? (preset.instruments.harmony_chill || [])
            : (preset.instruments.harmony_dubchill || [])
        const harmonyInstrument = harmonyPool.length > 0
            ? prng.choice(harmonyPool)
            : { key: 'default-harmony', type: 'oneshot' as const }

        // 3. Elegir melody (según vibe)
        const melodyPool = vibe === 'chill'
            ? (preset.instruments.melody_chill || [])
            : (preset.instruments.melody_dubchill || [])
        const melodyInstrument = melodyPool.length > 0
            ? prng.choice(melodyPool)
            : { key: 'default-melody', type: 'oneshot' as const }

        // 4. Copiar pools completos para rhythm/bass (según vibe)
        const rhythmPalette = vibe === 'chill'
            ? (preset.instruments.rhythm_chill || [])
            : (preset.instruments.rhythm_dubchill || [])
        const bassPalette = vibe === 'chill'
            ? (preset.instruments.bass_chill || [])
            : (preset.instruments.bass_dubchill || [])

        console.log(`🎨 [MusicEnginePro] PALETA CREADA:`)
        console.log(`  → Harmony: ${harmonyInstrument.key} (${harmonyInstrument.type})`)
        console.log(`  → Melody: ${melodyInstrument.key} (${melodyInstrument.type})`)
        console.log(`  → Rhythm pool: ${rhythmPalette.length} instrumentos`)
        console.log(`  → Bass pool: ${bassPalette.length} instrumentos`)

        return {
            vibe,
            harmonyInstrument,
            melodyInstrument,
            rhythmPalette,
            bassPalette
        }
    }

    /**
     * 🎨 SCHERZO SÓNICO - Fase 4.1: Selección Dinámica de Instrumentos
     * 🎸 FASE 5.9: REFACTORIZADO para usar SonicPalette
     * 
     * COMPORTAMIENTO:
     * - Harmony/Melody: SIEMPRE retornar el instrumento fijo de la paleta (no cambia)
     * - Rhythm/Bass: Elegir del pool según intensity de la sección (cambia dinámicamente)
     * 
     * @param section - Sección actual (contiene intensity en profile)
     * @param layer - Layer musical ('melody', 'harmony', 'bass', 'rhythm', 'pad')
     * @param stylePreset - Preset de estilo con arsenal de instrumentos
     * @returns InstrumentSelection con key y type, o fallback
     */
    private selectInstrumentForSection(
        section: any,
        layer: 'melody' | 'harmony' | 'bass' | 'rhythm' | 'pad',
        stylePreset: StylePreset
    ): InstrumentSelection {
        // 🎸 FASE 5.9: Verificar que la paleta esté creada
        if (!this.sonicPalette) {
            console.log(`⚠️ [MusicEnginePro] sonicPalette NO CREADA. Llamar createSonicPalette() primero.`)
            return { key: 'default', type: 'oneshot' }
        }

        const intensity = section.profile?.intensity ?? 0.5
        const sectionType = section.type
        
        // � FASE 5.9: IDENTIDAD ESTÁTICA - Harmony y Melody NO CAMBIAN
        if (layer === 'harmony') {
            console.log(`🎨 [MusicEnginePro] Section '${sectionType}' (intensity=${intensity.toFixed(2)}): ${layer} → ${this.sonicPalette.harmonyInstrument.key} (FIJO)`)
            return this.sonicPalette.harmonyInstrument
        }
        
        if (layer === 'melody') {
            console.log(`🎨 [MusicEnginePro] Section '${sectionType}' (intensity=${intensity.toFixed(2)}): ${layer} → ${this.sonicPalette.melodyInstrument.key} (FIJO)`)
            return this.sonicPalette.melodyInstrument
        }
        
        // � FASE 5.9: ENERGÍA DINÁMICA - Rhythm y Bass CAMBIAN según intensity
        let selectionPool: InstrumentSelection[] = []
        
        if (layer === 'bass') {
            selectionPool = this.sonicPalette.bassPalette
        } else if (layer === 'rhythm') {
            selectionPool = this.sonicPalette.rhythmPalette
        } else if (layer === 'pad') {
            // PAD: Lógica legacy (no está en paleta todavía)
            const padInstruments = stylePreset.instruments?.pad || []
            selectionPool = padInstruments
        }
        
        // ⚠️ VALIDACIÓN: Pool vacío
        if (!selectionPool || selectionPool.length === 0) {
            console.log(`⚠️ [MusicEnginePro] No hay instrumentos disponibles para layer '${layer}'. Usando fallback.`)
            return { key: 'default', type: 'oneshot' }
        }
        
        // � SELECCIÓN DETERMINISTA según intensity
        // Mapear intensity [0-1] a índice en el pool
        const index = Math.floor(intensity * selectionPool.length)
        const clampedIndex = Math.min(index, selectionPool.length - 1)
        const selection = selectionPool[clampedIndex]
        
        console.log(`🎨 [MusicEnginePro] Section '${sectionType}' (intensity=${intensity.toFixed(2)}): ${layer} → ${selection.key} (${selection.type}) [pool index ${clampedIndex}/${selectionPool.length}]`)
        
        return selection
    }
    
    private addToTrack(tracks: Map<string, MIDINote[]>, trackName: string, notes: MIDINote[]): void {
        if (!tracks.has(trackName)) {
            tracks.set(trackName, [])
        }
        tracks.get(trackName)!.push(...notes)
    }
    
    /**
     * ✅ HELPER: Convertir MIDINote[][] (chords del HarmonyEngine) a ResolvedChord[]
     * Respeta section.duration y section.bars para calcular tiempos correctos
     */
    private convertToResolvedChords(chords: MIDINote[][], section: any): any[] {
        const secondsPerBar = section.duration / section.bars
        
        return chords.map((chord, index) => {
            // Calcular startTime basado en la posición del acorde
            // Si el acorde ya tiene startTime (del HarmonyEngine), usarlo
            // Si no, calcularlo como offset dentro de la sección
            const chordStartTime = chord[0]?.startTime ?? (section.startTime + (index * secondsPerBar))
            const chordDuration = chord[0]?.duration ?? secondsPerBar
            
            return {
                notes: chord.map(n => n.pitch),
                root: chord[0]?.pitch || 60,
                startTime: chordStartTime,
                duration: chordDuration
            }
        })
    }
    
    private async generatePoetry(seed: number, structure: any): Promise<{ verses: string[]; fullText: string; theme: string; mood: string }> {
        // Placeholder - implementar generación de poesía
        console.log(`Generating poetry with seed ${seed} for structure with ${structure.sections.length} sections`)
        const verses = [
            `Verse 1: Generated with seed ${seed}`,
            `Verse 2: Structure has ${structure.sections.length} sections`,
            `Verse 3: Musical journey unfolds`
        ]
        return {
            verses,
            fullText: verses.join('\n'),
            theme: 'musical-journey',
            mood: 'contemplative'
        }
    }
    
    private async persistOutput(output: MusicEngineOutput): Promise<void> {
        // Placeholder - implementar persistencia (Redis, filesystem, etc.)
        console.log(`Persisting output with ${output.midi.notes.length} notes`)
    }
    
    private async reportMetrics(startTime: number, output: MusicEngineOutput): Promise<void> {
        const duration = Date.now() - startTime
        console.log(`Generation completed in ${duration}ms`)
        console.log(`Generated ${output.midi.notes.length} notes across ${output.midi.tracks.length} tracks`)
    }

    /**
     * Generate transition fills between sections
     */
    private generateTransitionFill(
        fromSection: any,
        toSection: any,
        chords: any[]
    ): MIDINote[] {
        const fillNotes: MIDINote[] = []
        const transitionStart = fromSection.startTime + fromSection.duration - 2 // Last 2 seconds
        const transitionDuration = 2 // 2 seconds fill
        
        // Drum fill (snare roll)
        for (let t = 0; t < transitionDuration; t += 0.125) { // 16th notes
            fillNotes.push({
                pitch: 38, // Snare
                velocity: 60 + Math.floor(t / transitionDuration * 40), // Crescendo
                startTime: transitionStart + t,
                duration: 0.1,
                channel: 9
            })
        }
        
        // Cymbal crash at transition point
        fillNotes.push({
            pitch: 49, // Crash cymbal
            velocity: 100,
            startTime: fromSection.startTime + fromSection.duration,
            duration: 3.0, // Long ring
            channel: 9
        })
        
        return fillNotes
    }
}

