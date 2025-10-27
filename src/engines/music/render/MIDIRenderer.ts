/**
 * 🎸 MIDI RENDERER
 */

// @ts-ignore - midi-writer-js is CommonJS, needs default import
import MidiWriterJS from 'midi-writer-js'
import { MIDINote, MIDITrack } from '../core/interfaces.js'
import { SongStructure } from '../structure/SongStructure.js'


// Extract classes from MidiWriterJS (CommonJS module)
const MidiWriter = MidiWriterJS as any

export class MIDIRenderer {
    private readonly PPQ = 128  // Pulses Per Quarter Note (midi-writer-js default)

    render(notes: MIDINote[], structure: SongStructure): Buffer {
        console.log('🎵 [MIDIRenderer] Starting render with', notes.length, 'notes')
        console.log('🔍 [MIDIRenderer] PPQ:', this.PPQ)
        
        const tempo = structure.globalTempo || 120
        console.log('🔍 [MIDIRenderer] Tempo:', tempo, 'BPM')
        
        const track = this.createTrack(notes, 'Melody', 0, 0, tempo)
        const tempoTrack = this.createTempoTrack(tempo)

        const writer = new MidiWriter.Writer([tempoTrack, track])
        console.log('🔍 [MIDIRenderer] Writer created with default PPQ (128)')
        
        const midiData = writer.buildFile()
        
        // Log raw midi-writer-js output
        console.log('🔍 [MIDIRenderer] midi-writer-js output:', JSON.stringify({
            type: midiData.constructor.name,
            length: midiData.length,
            isUint8Array: midiData instanceof Uint8Array,
            isBuffer: Buffer.isBuffer(midiData),
            first32bytes: Array.from(midiData.slice(0, 32)).map((b: any) => b.toString(16).padStart(2, '0')).join(' ')
        }))
        
        // Convert to Buffer properly - buildFile() returns Uint8Array
        let buffer = Buffer.isBuffer(midiData) 
            ? midiData 
            : Buffer.from(midiData)
        
        // Fix duplicate EoT if present (remove trailing duplicate End of Track marker)
        if (buffer.length >= 8 && buffer.slice(-8).toString('hex') === '00ff2f0000ff2f00') {
            buffer = buffer.slice(0, -4); // remove last 00 FF 2F 00
            console.log('🔧 [MIDIRenderer] Removed duplicate EoT from MIDI buffer')
        }
        
        // Deep structure analysis
        this.analyzeMIDIStructure(buffer)
        
        // Validate MIDI header
        if (buffer.length < 14 || buffer[0] !== 0x4D || buffer[1] !== 0x54 || buffer[2] !== 0x68 || buffer[3] !== 0x64) {
            console.error('❌ Invalid MIDI buffer generated:', JSON.stringify({
                length: buffer.length,
                header: buffer.slice(0, 4).toString('hex')
            }))
            throw new Error('Generated invalid MIDI buffer - missing MThd header')
        }
        
        return buffer
    }

    renderMultiTrack(
        tracks: Map<string, MIDINote[]>,
        structure: SongStructure,
        style: any
    ): Buffer {
        const midiTracks: any[] = []
        const tempo = structure.globalTempo || 120
        const tempoTrack = this.createTempoTrack(tempo)
        midiTracks.push(tempoTrack)

        let channel = 0
        for (const [layerName, notes] of Array.from(tracks.entries())) {
            const midiTrack = this.createTrack(notes, layerName, channel, this.getProgramForLayer(layerName), tempo)
            midiTracks.push(midiTrack)
            channel = (channel + 1) % 16
        }

        const writer = new MidiWriter.Writer(midiTracks)
        const midiData = writer.buildFile()
        
        // Convert to Buffer properly - buildFile() returns Uint8Array
        let buffer = Buffer.isBuffer(midiData) 
            ? midiData 
            : Buffer.from(midiData)
        
        // Fix duplicate EoT if present (remove trailing duplicate End of Track marker)
        if (buffer.length >= 8 && buffer.slice(-8).toString('hex') === '00ff2f0000ff2f00') {
            buffer = buffer.slice(0, -4); // remove last 00 FF 2F 00
            console.log('🔧 [MIDIRenderer] Removed duplicate EoT from MIDI buffer')
        }
        
        // Validate MIDI header
        if (buffer.length < 14 || buffer[0] !== 0x4D || buffer[1] !== 0x54 || buffer[2] !== 0x68 || buffer[3] !== 0x64) {
            console.error('❌ Invalid MIDI buffer generated:', JSON.stringify({
                length: buffer.length,
                header: buffer.slice(0, 4).toString('hex')
            }))
            throw new Error('Generated invalid MIDI buffer - missing MThd header')
        }
        
        return buffer
    }

    quantize(notes: MIDINote[], resolution: number = 16): MIDINote[] {
        return notes.map(note => ({
            ...note,
            startTime: Math.round(note.startTime * resolution) / resolution,
            duration: Math.round(note.duration * resolution) / resolution
        }))
    }

    private createTrack(notes: MIDINote[], name: string, channel: number, program: number, tempo: number = 120): any {
        const track = new MidiWriter.Track()

        console.log(`🔍 [MIDIRenderer] createTrack for "${name}" - Tempo: ${tempo}, Channel: ${channel}, Notes: ${notes.length}`)

        // Set track name (TrackNameEvent requiere objeto {text})
        track.addEvent(new MidiWriter.TextEvent({ text: name }))

        // Set program (instrument)
        if (program > 0) {
            track.addEvent(new MidiWriter.ProgramChangeEvent({ program }))
        }

        // Sort notes by start time
        const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime)

        // Log first 5 and last 5 notes for debugging
        console.log('🔍 [MIDIRenderer] First 5 notes (seconds):')
        sortedNotes.slice(0, 5).forEach((note, idx) => {
            console.log(`  [${idx}] pitch=${note.pitch}, startTime=${note.startTime.toFixed(3)}s, duration=${note.duration.toFixed(3)}s, velocity=${note.velocity}`)
        })
        
        if (sortedNotes.length > 5) {
            console.log('🔍 [MIDIRenderer] Last 5 notes (seconds):')
            sortedNotes.slice(-5).forEach((note, idx) => {
                console.log(`  [${sortedNotes.length - 5 + idx}] pitch=${note.pitch}, startTime=${note.startTime.toFixed(3)}s, duration=${note.duration.toFixed(3)}s, velocity=${note.velocity}`)
            })
        }

        let notesAdded = 0
        for (const note of sortedNotes) {
            // Calcular tiempo de inicio absoluto y duración en ticks
            const noteStartTicks = this.secondsToTicks(note.startTime, tempo)
            const durationTicks = this.secondsToTicks(note.duration, tempo)
            
            // Log detailed calculation for first 3 notes
            if (notesAdded < 3) {
                console.log(`🔍 [MIDIRenderer] Note ${notesAdded}:`)
                console.log(`   Input: startTime=${note.startTime}s, duration=${note.duration}s, tempo=${tempo}`)
                console.log(`   Calculated: noteStartTicks=${noteStartTicks}, durationTicks=${durationTicks}`)
                console.log(`   Formula: ticks = seconds * (tempo / 60) * PPQ = seconds * (${tempo} / 60) * ${this.PPQ}`)
                console.log(`   Check: ${note.startTime} * ${tempo / 60} * ${this.PPQ} = ${note.startTime * (tempo / 60) * this.PPQ}`)
            }
            
            // Usar tick absoluto (tiempo desde inicio del track)
            const midiNote = new MidiWriter.NoteEvent({
                pitch: this.pitchToMidiNote(note.pitch),
                duration: `T${durationTicks}`,
                tick: noteStartTicks, // Tiempo absoluto en ticks
                velocity: note.velocity,
                channel: channel
            })
            
            // Log NoteEvent params for first 3 notes
            if (notesAdded < 3) {
                console.log(`   NoteEvent params:`, JSON.stringify({
                    pitch: this.pitchToMidiNote(note.pitch),
                    duration: `T${durationTicks}`,
                    tick: noteStartTicks,
                    velocity: note.velocity,
                    channel: channel
                }))
            }
            
            track.addEvent(midiNote)
            notesAdded++
        }
        
        console.log(`✅ [MIDIRenderer] Added ${notesAdded} notes to track "${name}"`)

        return track
    }

    private createTempoTrack(tempo: number): any {
        const track = new MidiWriter.Track()
        // TempoEvent requires {bpm: number} object, not just number
        track.addEvent(new MidiWriter.TempoEvent({bpm: tempo}))
        return track
    }

    private secondsToTicks(seconds: number, tempo: number = 120): number {
        // Calcular ticks basado en tempo dinámico
        const ticksPerSecond = (this.PPQ * tempo) / 60
        const result = Math.round(seconds * ticksPerSecond)
        
        // Log for debugging (only for extreme values)
        if (isNaN(result) || !isFinite(result) || result < 0 || result > 1000000) {
            console.warn(`⚠️ [MIDIRenderer] secondsToTicks ANOMALY:`, JSON.stringify({
                seconds,
                tempo,
                PPQ: this.PPQ,
                ticksPerSecond,
                result
            }))
        }
        
        return result
    }

    private pitchToMidiNote(pitch: number): string[] {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        const octave = Math.floor(pitch / 12) + 4  // MIDI octave starts from -1, but we use 4 as base
        const noteIndex = pitch % 12
        return [noteNames[noteIndex] + octave]
    }

    private getProgramForLayer(layerName: string): number {
        const programs: Record<string, number> = {
            'Melody': 0,    // Piano
            'Harmony': 0,   // Piano
            'Bass': 32,     // Electric Bass
            'Rhythm': 25,   // Steel Drums
            'Pad': 89       // Pad Choir
        }
        return programs[layerName] || 0
    }

    // Additional private methods for manual encoding if needed
    private encodeToBuffer(data: Uint8Array): Buffer {
        return Buffer.from(data)
    }

    private encodeTrack(events: any[]): Uint8Array {
        // Placeholder for manual MIDI encoding
        // Would implement delta-time encoding, event encoding, etc.
        throw new Error('Manual encoding not implemented - using midi-writer-js')
    }

    private encodeVLQ(value: number): Uint8Array {
        // Variable Length Quantity encoding for MIDI
        const bytes: number[] = []
        let v = value
        do {
            let byte = v & 0x7F
            v >>= 7
            if (v > 0) byte |= 0x80
            bytes.push(byte)
        } while (v > 0)
        return new Uint8Array(bytes)
    }

    private encodeEvent(event: any): Uint8Array {
        // Placeholder for event encoding
        throw new Error('Event encoding not implemented - using midi-writer-js')
    }

    /**
     * Analyze MIDI structure for debugging
     */
    private analyzeMIDIStructure(buffer: Buffer): void {
        console.log('🔬 [MIDIRenderer] Deep MIDI Structure Analysis:')
        console.log('═'.repeat(80))
        
        let offset = 0
        
        // Parse MThd chunk
        if (buffer.length >= 14) {
            const mthd = buffer.slice(0, 4).toString('ascii')
            const headerLength = buffer.readUInt32BE(4)
            const format = buffer.readUInt16BE(8)
            const numTracks = buffer.readUInt16BE(10)
            const timeDivision = buffer.readUInt16BE(12)
            
            console.log('📋 MThd Header Chunk:')
            console.log('  Identifier:', mthd, `(${buffer.slice(0, 4).toString('hex')})`)
            console.log('  Header Length:', headerLength, 'bytes')
            console.log('  Format:', format, '(0=single track, 1=multi track, 2=multi song)')
            console.log('  Number of Tracks:', numTracks)
            console.log('  Time Division:', timeDivision, 'ticks per quarter note')
            
            offset = 14
        }
        
        // Parse MTrk chunks
        let trackNum = 0
        while (offset < buffer.length - 8) {
            const chunkId = buffer.slice(offset, offset + 4).toString('ascii')
            
            if (chunkId === 'MTrk') {
                const trackLength = buffer.readUInt32BE(offset + 4)
                console.log(`\n🎼 MTrk Track ${trackNum} Chunk:`)
                console.log('  Offset:', offset)
                console.log('  Identifier:', chunkId, `(${buffer.slice(offset, offset + 4).toString('hex')})`)
                console.log('  Track Length:', trackLength, 'bytes')
                
                const trackStart = offset + 8
                const trackEnd = trackStart + trackLength
                
                if (trackEnd <= buffer.length) {
                    // Show first 32 bytes of track data
                    const trackPreview = buffer.slice(trackStart, Math.min(trackStart + 32, trackEnd))
                    console.log('  First bytes:', Array.from(trackPreview).map(b => b.toString(16).padStart(2, '0')).join(' '))
                    
                    // Show last 16 bytes of track data (should contain End of Track FF 2F 00)
                    const trackSuffix = buffer.slice(Math.max(trackStart, trackEnd - 16), trackEnd)
                    console.log('  Last bytes:', Array.from(trackSuffix).map(b => b.toString(16).padStart(2, '0')).join(' '))
                    
                    // Check for End of Track marker
                    const hasEoT = trackSuffix.includes(0xFF) && 
                                   trackSuffix.includes(0x2F) && 
                                   trackSuffix.includes(0x00)
                    console.log('  Has End of Track (FF 2F 00):', hasEoT ? '✅' : '❌')
                    
                    offset = trackEnd
                } else {
                    console.log('  ⚠️ Track length exceeds buffer!')
                    break
                }
                
                trackNum++
            } else {
                console.log(`\n⚠️ Unknown chunk at offset ${offset}: ${chunkId}`)
                break
            }
        }
        
        console.log('\n' + '═'.repeat(80))
        console.log('✅ Structure analysis complete')
    }
}

