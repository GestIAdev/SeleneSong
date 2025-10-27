import { MusicalConsensusRecorder } from './dist/src/swarm/music/MusicalConsensusRecorder.js';

const recorder = new MusicalConsensusRecorder();
const stats = recorder.exportProfileStats();

console.log('=== REALTIME PROFILE STATS EXPORT ===');
console.log(JSON.stringify(stats, null, 2));