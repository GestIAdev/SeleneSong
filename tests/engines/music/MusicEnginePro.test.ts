/**
 * 🎸 MUSIC ENGINE PRO - TESTS DE INTEGRACIÓN
 * Validación end-to-end del flujo completo de generación
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { MusicEnginePro } from '../../../src/engines/music/core/MusicEnginePro.js'
import { MusicGenerationParams, MusicEngineOutput } from '../../../src/engines/music/core/interfaces.js'
import { VitalSigns } from '../../../src/engines/music/core/types.js'

describe('MusicEnginePro - Integración E2E', () => {
    let engine: MusicEnginePro
    let baseParams: MusicGenerationParams

    beforeEach(() => {
        engine = new MusicEnginePro()
        
        baseParams = {
            seed: 42,
            beauty: 0.7,
            complexity: 0.6,
            duration: 30,
            stylePreset: 'cyberpunk-ambient'
        }
    })

    describe('generate() - Flujo Completo', () => {
        it('debe generar output completo sin errores', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output).toBeDefined()
            expect(output.midi).toBeDefined()
            expect(output.poetry).toBeDefined()
            expect(output.metadata).toBeDefined()
            expect(output.analysis).toBeDefined()
        })

        it('debe generar buffer MIDI no vacío', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output.midi.buffer).toBeDefined()
            expect(output.midi.buffer.length).toBeGreaterThan(0)
        })

        it('debe generar notas MIDI', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output.midi.notes).toBeDefined()
            expect(Array.isArray(output.midi.notes)).toBe(true)
            expect(output.midi.notes.length).toBeGreaterThan(0)
        })

        it('debe generar tracks MIDI (multi-track)', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output.midi.tracks).toBeDefined()
            expect(Array.isArray(output.midi.tracks)).toBe(true)
            expect(output.midi.tracks.length).toBeGreaterThan(0)
        })

        it('debe incluir metadata coherente', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output.metadata.seed).toBe(baseParams.seed)
            expect(output.metadata.stylePreset).toBe(baseParams.stylePreset)
            expect(output.metadata.duration).toBeGreaterThan(0)
            expect(output.metadata.tempo).toBeGreaterThan(0)
            expect(output.metadata.key).toBeDefined()
            expect(output.metadata.mode).toBeDefined()
        })

        it('debe incluir análisis de complejidad', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output.analysis.complexity).toBe(baseParams.complexity)
            expect(output.analysis.intensity).toBeGreaterThanOrEqual(0)
            expect(output.analysis.intensity).toBeLessThanOrEqual(1)
            expect(output.analysis.harmony).toBeGreaterThanOrEqual(0)
            expect(output.analysis.harmony).toBeLessThanOrEqual(1)
        })
    })

    describe('DETERMINISMO - Mismo Seed = Mismo Output', () => {
        it('debe generar mismo buffer MIDI con mismo seed', async () => {
            const output1 = await engine.generate({ ...baseParams, seed: 1000 })
            const output2 = await engine.generate({ ...baseParams, seed: 1000 })
            
            expect(output1.midi.buffer.equals(output2.midi.buffer)).toBe(true)
        })

        it('debe generar misma cantidad de notas con mismo seed', async () => {
            const output1 = await engine.generate({ ...baseParams, seed: 2000 })
            const output2 = await engine.generate({ ...baseParams, seed: 2000 })
            
            expect(output1.midi.notes.length).toBe(output2.midi.notes.length)
        })

        it('debe generar mismo metadata con mismo seed', async () => {
            const output1 = await engine.generate({ ...baseParams, seed: 3000 })
            const output2 = await engine.generate({ ...baseParams, seed: 3000 })
            
            expect(output1.metadata.structure).toBe(output2.metadata.structure)
            expect(output1.metadata.mode).toBe(output2.metadata.mode)
        })

        it('debe generar buffers DIFERENTES con seeds diferentes', async () => {
            const output1 = await engine.generate({ ...baseParams, seed: 4000 })
            const output2 = await engine.generate({ ...baseParams, seed: 5000 })
            
            expect(output1.midi.buffer.equals(output2.midi.buffer)).toBe(false)
        })
    })

    describe('VITALS INTEGRATION - Influencia Emocional', () => {
        it('debe generar música sin vitals (fallback)', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output).toBeDefined()
            expect(output.midi.notes.length).toBeGreaterThan(0)
        })

        it('debe aplicar vitals al estilo (stress alto)', async () => {
            const vitals: VitalSigns = {
                stress: 0.9,
                harmony: 0.3,
                creativity: 0.5
            }
            
            const output = await engine.generate(baseParams, vitals)
            
            expect(output.analysis.intensity).toBeGreaterThanOrEqual(0.8)
        })

        it('debe aplicar vitals al estilo (harmony alto)', async () => {
            const vitals: VitalSigns = {
                stress: 0.2,
                harmony: 0.9,
                creativity: 0.5
            }
            
            const output = await engine.generate(baseParams, vitals)
            
            expect(output.analysis.harmony).toBeGreaterThanOrEqual(0.8)
        })

        it('debe reflejar stress en análisis', async () => {
            const vitals: VitalSigns = {
                stress: 0.75,
                harmony: 0.5,
                creativity: 0.5
            }
            
            const output = await engine.generate(baseParams, vitals)
            
            expect(output.analysis.intensity).toBe(vitals.stress)
        })

        it('debe reflejar harmony en análisis', async () => {
            const vitals: VitalSigns = {
                stress: 0.5,
                harmony: 0.85,
                creativity: 0.5
            }
            
            const output = await engine.generate(baseParams, vitals)
            
            expect(output.analysis.harmony).toBe(vitals.harmony)
        })
    })

    describe('MODES - Entropy, Risk, Punk', () => {
        it('debe generar con mode=entropy (default)', async () => {
            const params: MusicGenerationParams = {
                ...baseParams,
                mode: 'entropy'
            }
            
            const output = await engine.generate(params)
            
            expect(output).toBeDefined()
            expect(output.midi.notes.length).toBeGreaterThan(0)
        })

        it('debe generar con mode=risk', async () => {
            const params: MusicGenerationParams = {
                ...baseParams,
                mode: 'risk'
            }
            
            const output = await engine.generate(params)
            
            expect(output).toBeDefined()
            expect(output.midi.notes.length).toBeGreaterThan(0)
        })

        it('debe generar con mode=punk', async () => {
            const params: MusicGenerationParams = {
                ...baseParams,
                mode: 'punk'
            }
            
            const output = await engine.generate(params)
            
            expect(output).toBeDefined()
            expect(output.midi.notes.length).toBeGreaterThan(0)
        })
    })

    describe('ADAPTERS - generateFromConsensus, quickGenerate', () => {
        it('quickGenerate() debe funcionar con API simplificada', async () => {
            const output = await engine.quickGenerate('indie-game-loop', 20, 999)
            
            expect(output).toBeDefined()
            expect(output.midi.buffer.length).toBeGreaterThan(0)
            expect(output.metadata.seed).toBe(999)
            expect(output.metadata.stylePreset).toBe('indie-game-loop')
        })

        it('quickGenerate() debe usar valores por defecto para beauty/complexity', async () => {
            const output = await engine.quickGenerate('lofi-minimalist', 15, 777)
            
            expect(output.analysis.complexity).toBe(0.5)
        })

        it('generateFromConsensus() debe convertir result a params', async () => {
            const consensusResult = {
                seed: 12345,
                beauty: 0.8,
                complexity: 0.7,
                duration: 25,
                stylePreset: 'synthwave-action',
                mode: 'punk'
            }
            
            const output = await engine.generateFromConsensus(consensusResult)
            
            expect(output).toBeDefined()
            expect(output.metadata.seed).toBe(consensusResult.seed)
            expect(output.metadata.stylePreset).toBe(consensusResult.stylePreset)
        })

        it('generateFromConsensus() debe usar fallbacks si faltan campos', async () => {
            const incompleteResult = {
                // Solo seed
                seed: 55555
            }
            
            const output = await engine.generateFromConsensus(incompleteResult)
            
            expect(output).toBeDefined()
            expect(output.metadata.seed).toBe(55555)
            expect(output.analysis.complexity).toBe(0.5)  // Default
        })

        it('generateFromConsensus() debe generar seed determinista si falta', async () => {
            const resultWithoutSeed = {}
            
            const output = await engine.generateFromConsensus(resultWithoutSeed)
            
            expect(output).toBeDefined()
            expect(output.metadata.seed).toBeGreaterThan(0)
            // Seed debe ser determinista (timestamp + pid), no Math.random()
        })
    })

    describe('POETRY INTEGRATION - Coherencia MIDI+Poetry', () => {
        it('debe generar poetry junto con MIDI', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output.poetry).toBeDefined()
            expect(output.poetry.verses).toBeDefined()
            expect(Array.isArray(output.poetry.verses)).toBe(true)
            expect(output.poetry.fullText).toBeDefined()
        })

        it('poetry debe tener theme y mood', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output.poetry.theme).toBeDefined()
            expect(output.poetry.mood).toBeDefined()
            expect(typeof output.poetry.theme).toBe('string')
            expect(typeof output.poetry.mood).toBe('string')
        })

        it('poetry fullText debe ser concatenación de verses', async () => {
            const output = await engine.generate(baseParams)
            
            const expectedFullText = output.poetry.verses.join('\n')
            expect(output.poetry.fullText).toBe(expectedFullText)
        })
    })

    describe('PARAMETROS VARIABLES - Duration, Complexity, Beauty', () => {
        it('debe generar música más larga con duration mayor', async () => {
            const short = await engine.generate({ ...baseParams, duration: 10 })
            const long = await engine.generate({ ...baseParams, duration: 60 })
            
            expect(short.metadata.duration).toBeLessThan(long.metadata.duration)
        })

        it('debe reflejar complexity en análisis', async () => {
            const simple = await engine.generate({ ...baseParams, complexity: 0.2 })
            const complex = await engine.generate({ ...baseParams, complexity: 0.9 })
            
            expect(simple.analysis.complexity).toBe(0.2)
            expect(complex.analysis.complexity).toBe(0.9)
        })

        it('debe aceptar parámetros avanzados (tempo, rootPitch)', async () => {
            const params: MusicGenerationParams = {
                ...baseParams,
                advanced: {
                    tempo: 140,
                    rootPitch: 72
                }
            }
            
            const output = await engine.generate(params)
            
            expect(output).toBeDefined()
        })
    })

    describe('MULTI-TRACK OUTPUT - Capas Separadas', () => {
        it('debe generar múltiples tracks (Melody, Harmony, Bass, etc.)', async () => {
            const output = await engine.generate(baseParams)
            
            expect(output.midi.tracks.length).toBeGreaterThanOrEqual(3)
        })

        it('cada track debe tener id, name, channel', async () => {
            const output = await engine.generate(baseParams)
            
            for (const track of output.midi.tracks) {
                expect(track.id).toBeDefined()
                expect(track.name).toBeDefined()
                expect(track.channel).toBeGreaterThanOrEqual(0)
                expect(track.channel).toBeLessThan(16)
            }
        })

        it('cada track debe tener notas', async () => {
            const output = await engine.generate(baseParams)
            
            for (const track of output.midi.tracks) {
                expect(track.notes).toBeDefined()
                expect(Array.isArray(track.notes)).toBe(true)
            }
        })

        it('tracks deben tener volumen configurado', async () => {
            const output = await engine.generate(baseParams)
            
            for (const track of output.midi.tracks) {
                expect(track.volume).toBeGreaterThan(0)
                expect(track.volume).toBeLessThanOrEqual(127)
            }
        })
    })

    describe('EDGE CASES Y ROBUSTEZ', () => {
        it('debe manejar duration muy corta (5 segundos)', async () => {
            const output = await engine.generate({ ...baseParams, duration: 5 })
            
            expect(output).toBeDefined()
            expect(output.midi.notes.length).toBeGreaterThan(0)
        })

        it('debe manejar duration muy larga (180 segundos)', async () => {
            const output = await engine.generate({ ...baseParams, duration: 180 })
            
            expect(output).toBeDefined()
            expect(output.metadata.duration).toBeGreaterThan(150)
        })

        it('debe manejar complexity=0 (mínima)', async () => {
            const output = await engine.generate({ ...baseParams, complexity: 0 })
            
            expect(output).toBeDefined()
            expect(output.analysis.complexity).toBe(0)
        })

        it('debe manejar complexity=1 (máxima)', async () => {
            const output = await engine.generate({ ...baseParams, complexity: 1 })
            
            expect(output).toBeDefined()
            expect(output.analysis.complexity).toBe(1)
        })

        it('debe manejar beauty=0 (mínima)', async () => {
            const output = await engine.generate({ ...baseParams, beauty: 0 })
            
            expect(output).toBeDefined()
        })

        it('debe manejar beauty=1 (máxima)', async () => {
            const output = await engine.generate({ ...baseParams, beauty: 1 })
            
            expect(output).toBeDefined()
        })

        it('debe manejar seed=0', async () => {
            const output = await engine.generate({ ...baseParams, seed: 0 })
            
            expect(output).toBeDefined()
            expect(output.metadata.seed).toBe(0)
        })

        it('debe manejar seed muy grande', async () => {
            const largeSeed = 999999999
            const output = await engine.generate({ ...baseParams, seed: largeSeed })
            
            expect(output).toBeDefined()
            expect(output.metadata.seed).toBe(largeSeed)
        })
    })

    describe('PERFORMANCE Y TIEMPO DE EJECUCIÓN', () => {
        it('debe generar en menos de 10 segundos (canción 30s)', async () => {
            const startTime = Date.now()
            await engine.generate(baseParams)
            const duration = Date.now() - startTime
            
            expect(duration).toBeLessThan(10000)  // < 10 segundos
        }, 15000)  // Timeout de 15 segundos

        it('debe ser más rápido para duraciones cortas', async () => {
            const startShort = Date.now()
            await engine.generate({ ...baseParams, duration: 10 })
            const durationShort = Date.now() - startShort
            
            const startLong = Date.now()
            await engine.generate({ ...baseParams, duration: 120 })
            const durationLong = Date.now() - startLong
            
            expect(durationShort).toBeLessThan(durationLong)
        }, 30000)
    })
})
