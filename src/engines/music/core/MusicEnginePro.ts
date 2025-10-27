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
import { VitalSigns } from './types.js'


export class MusicEnginePro {
    private styleEngine: StyleEngine
    private structureEngine: StructureEngine
    private harmonyEngine: HarmonyEngine
    private melodyEngine: MelodyEngine
    private vitalsEngine: VitalsIntegrationEngine
    private orchestrator: Orchestrator
    private renderer: MIDIRenderer
    
    constructor() {
        this.styleEngine = new StyleEngine()
        this.structureEngine = new StructureEngine()
        this.harmonyEngine = new HarmonyEngine()
        this.melodyEngine = new MelodyEngine(42)  // Seed inicial
        this.vitalsEngine = new VitalsIntegrationEngine()
        this.orchestrator = new Orchestrator()
        this.renderer = new MIDIRenderer()
    }
    
    async generate(
        params: MusicGenerationParams,
        vitals?: VitalSigns
    ): Promise<MusicEngineOutput> {
        const startTime = Date.now()

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
            params.duration || 120,
            modifiedStyle,
            params.seed,
            mode
        )

        // 5. Generar contenido por sección
        const allNotes: MIDINote[] = []
        const tracks = new Map<string, MIDINote[]>()

        for (const section of structure.sections) {
            // Harmony
            const harmonyOptions: any = {
                seed: params.seed + section.index,
                key: 0, // C major por defecto
                mode: modifiedStyle.musical.mode,
                complexity: params.complexity,
                voiceLeadingStrategy: 'smooth',
                tempo: modifiedStyle.musical.tempo,
                totalBars: section.bars
            }
            const chords = this.harmonyEngine.generateChordSequence(harmonyOptions)

            // Convertir chords a ResolvedChord[]
            const resolvedChords: any[] = chords.map((chord, index) => ({
                notes: chord.map(n => n.pitch),
                root: chord[0]?.pitch || 60,
                startTime: section.startTime + (index * 4), // 4 segundos por compás
                duration: 4
            }))

            // Melody
            const melodyOptions: any = {
                seed: params.seed + section.index,
                key: 0, // C major
                mode: modifiedStyle.musical.mode,
                complexity: params.complexity,
                contour: 'arched',
                tempo: modifiedStyle.musical.tempo,
                duration: section.duration,
                range: { min: 4, max: 6 } // Octavas 4-6 (C4-C6)
            }
            const melody = this.melodyEngine.generateMelody(melodyOptions)

            // Ajustar startTime de melody para incluir offset de sección
            const adjustedMelody = melody.map(note => ({
                ...note,
                startTime: note.startTime + section.startTime
            }))

            // Orchestrator layers
            const layers = this.orchestrator.generateLayers(
                section,
                resolvedChords,
                adjustedMelody,
                modifiedStyle,
                params.seed + section.index,
                mode
            )

            // Collect all notes
            allNotes.push(...adjustedMelody)
            if (layers.harmony) allNotes.push(...layers.harmony)
            if (layers.bass) allNotes.push(...layers.bass)
            if (layers.rhythm) allNotes.push(...layers.rhythm)
            if (layers.pad) allNotes.push(...layers.pad)

            // Separate into tracks
            this.addToTrack(tracks, 'Melody', adjustedMelody)
            this.addToTrack(tracks, 'Harmony', layers.harmony || [])
            this.addToTrack(tracks, 'Bass', layers.bass || [])
            this.addToTrack(tracks, 'Rhythm', layers.rhythm || [])
            if (layers.pad) this.addToTrack(tracks, 'Pad', layers.pad)
        }

        // 6. Generar Poesía (placeholder)
        const poetry = await this.generatePoetry(params.seed, structure)

        // 7. Orquestar y mezclar (Orchestrator.separateIntoTracks, Orchestrator.applyMixing)
        const separatedTracks = this.orchestrator.separateIntoTracks(
            tracks.get('Melody') || [],
            {
                harmony: tracks.get('Harmony') || [],
                bass: tracks.get('Bass') || [],
                rhythm: tracks.get('Rhythm') || [],
                pad: tracks.get('Pad')
            },
            modifiedStyle
        )
        const mixedTracks = this.orchestrator.applyMixing(separatedTracks, modifiedStyle)

        // 8. Renderizar MIDI (MIDIRenderer.renderMultiTrack)
        const midiBuffer = this.renderer.renderMultiTrack(mixedTracks, structure, modifiedStyle)

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
                }))
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
            stylePreset: result.stylePreset || 'cyberpunk-ambient',
            mode: result.mode || 'entropy'
        }
    }
    
    private addToTrack(tracks: Map<string, MIDINote[]>, trackName: string, notes: MIDINote[]): void {
        if (!tracks.has(trackName)) {
            tracks.set(trackName, [])
        }
        tracks.get(trackName)!.push(...notes)
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
}

