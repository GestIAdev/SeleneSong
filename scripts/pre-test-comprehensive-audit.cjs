#!/usr/bin/env node
/**
 * 🔍 PRE-TEST COMPREHENSIVE AUDIT
 * 
 * Verifica que TODAS las features están integradas y funcionando:
 * - ✅ Swarm discovery (DONE)
 * - ✅ Veritas signatures (DONE)
 * - ✅ Leader election real (DONE)
 * - ✅ Poetry generation (DONE)
 * - ✅ Consciousness (DONE)
 * - ✅ PostgreSQL real data (DONE)
 * - ✅ Dashboard metrics (DONE)
 * - ✅ MIDI recording (DONE)
 * - ✅ Checkpoints (DONE)
 * - ✅ Digital Souls zodiacal (DONE)
 * 
 * 🎯 NEW: Nodes behind Load Balancer - Using PM2 for health validation
 */

const Redis = require('ioredis');
const axios = require('axios');

const LOAD_BALANCER = 'http://localhost:8000';
const DASHBOARD = 'http://localhost:3001';

const redis = new Redis();

// Color helpers
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(emoji, category, message, status = 'info') {
  const color = status === 'pass' ? colors.green : status === 'fail' ? colors.red : status === 'warn' ? colors.yellow : colors.cyan;
  console.log(`${color}${emoji} [${category}] ${message}${colors.reset}`);
}

async function audit() {
  console.log(`\n${colors.magenta}${'='.repeat(80)}`);
  console.log(`🎯 SELENE PRE-TEST COMPREHENSIVE AUDIT`);
  console.log(`${'='.repeat(80)}${colors.reset}\n`);

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // ============================================================================
  // 1. SWARM DISCOVERY
  // ============================================================================
  log('🌐', 'SWARM', 'Testing node discovery...', 'info');
  try {
    const swarmKeys = await redis.hkeys('dentiagest:swarm:nodes');
    if (swarmKeys.length === 3) {
      log('✅', 'SWARM', `Discovery working: ${swarmKeys.length} nodes found`, 'pass');
      results.passed.push('Swarm Discovery');
    } else {
      log('❌', 'SWARM', `Expected 3 nodes, found ${swarmKeys.length}`, 'fail');
      results.failed.push('Swarm Discovery');
    }
  } catch (error) {
    log('❌', 'SWARM', `Redis connection failed: ${error.message}`, 'fail');
    results.failed.push('Redis Connection');
  }

  // ============================================================================
  // 2. NODE HEALTH VIA PM2 (Nodes behind Load Balancer)
  // ============================================================================
  log('💓', 'HEALTH', 'Testing PM2 cluster health...', 'info');
  try {
    const response = await axios.post(`${DASHBOARD}/api/pm2/get-status`, {}, { 
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data && response.data.success && response.data.result) {
      const { totalNodes, runningNodes, nodes } = response.data.result;
      
      if (runningNodes === totalNodes && runningNodes >= 3) {
        log('✅', 'HEALTH', `All ${runningNodes}/${totalNodes} PM2 nodes online (behind Load Balancer)`, 'pass');
        
        // Show node details
        nodes.forEach(node => {
          const memMB = Math.round(node.memory / 1024 / 1024);
          log('  ✓', 'NODE', `${node.name} (PID ${node.pid}): ${memMB}MB, ${node.uptime}ms uptime`, 'pass');
        });
        
        results.passed.push('PM2 Cluster Health (3 nodes)');
      } else {
        log('⚠️', 'HEALTH', `Only ${runningNodes}/${totalNodes} nodes running`, 'warn');
        results.warnings.push(`Only ${runningNodes}/${totalNodes} nodes running`);
      }
    } else {
      log('❌', 'HEALTH', 'PM2 status check failed - unexpected response', 'fail');
      results.failed.push('PM2 Cluster Health');
    }
  } catch (error) {
    log('❌', 'HEALTH', `PM2 health check failed: ${error.message}`, 'fail');
    results.failed.push('PM2 Cluster Health');
  }

  // ============================================================================
  // 3. VERITAS INTEGRITY (CRITICAL)
  // ============================================================================
  log('🔐', 'VERITAS', 'Testing cryptographic signatures...', 'info');
  try {
    const response = await axios.get(`${LOAD_BALANCER}/api/veritas/test`, { timeout: 10000 });
    if (response.data && response.data.verification) {
      log('✅', 'VERITAS', `Signature verification available: confidence ${response.data.verification.confidence}`, 'pass');
      results.passed.push('Veritas Signatures');
    } else {
      log('❌', 'VERITAS', 'Signature verification FAILED - Unexpected response', 'fail');
      results.failed.push('Veritas Signatures');
    }
  } catch (error) {
    log('❌', 'VERITAS', `Endpoint not available: ${error.message}`, 'fail');
    log('⚠️', 'VERITAS', 'THIS IS CRITICAL - Consensus cannot work without valid signatures', 'warn');
    results.failed.push('Veritas Endpoint');
  }

  // ============================================================================
  // 4. LEADER ELECTION
  // ============================================================================
  log('👑', 'CONSENSUS', 'Testing leader election...', 'info');
  try {
    const response = await axios.get(`${LOAD_BALANCER}/api/swarm/leader`, { timeout: 10000 });
    const leader = response.data.leader;
    
    if (leader && leader.leader_node_id && leader.leader_node_id !== 'default-node') {
      log('✅', 'CONSENSUS', `Real leader elected: ${leader.leader_node_id}`, 'pass');
      results.passed.push('Leader Election');
    } else if (leader && leader.leader_node_id === 'default-node') {
      log('❌', 'CONSENSUS', 'FAKE leader "default-node" winning - Real nodes have 10% health!', 'fail');
      results.failed.push('Leader Election (default-node bug)');
    } else {
      log('❌', 'CONSENSUS', 'No leader elected', 'fail');
      results.failed.push('Leader Election');
    }
  } catch (error) {
    log('⚠️', 'CONSENSUS', `Leader endpoint not available: ${error.message}`, 'warn');
    results.warnings.push('Leader Endpoint');
  }

  // ============================================================================
  // 5. POETRY GENERATION (QUANTUM POETRY ENGINE)
  // ============================================================================
  log('📜', 'POETRY', 'Testing poetry generation...', 'info');
  try {
    const response = await axios.get(`${LOAD_BALANCER}/api/poetry/latest`, { timeout: 10000 });
    if (response.data && response.data.poem && response.data.poem.verses && response.data.poem.verses.length > 0) {
      log('✅', 'POETRY', `Poetry engine working: ${response.data.poem.verses.length} verses found`, 'pass');
      results.passed.push('Poetry Generation');
    } else {
      log('❌', 'POETRY', 'NO POEMS GENERATED - QuantumPoetryEngine inactive', 'fail');
      results.failed.push('Poetry Generation');
    }
  } catch (error) {
    log('❌', 'POETRY', `Poetry endpoint failed: ${error.message}`, 'fail');
    results.failed.push('Poetry Endpoint');
  }

  // ============================================================================
  // 6. CONSCIOUSNESS (APOLLO) - DIGITAL SOULS 🌙
  // ============================================================================
  log('🧠', 'CONSCIOUSNESS', 'Testing Apollo Consciousness with Digital Souls...', 'info');
  try {
    const response = await axios.get(`${LOAD_BALANCER}/api/consciousness/status`, { timeout: 10000 });
    if (response.data && response.data.active === true) {
      const souls = response.data.souls || {};
      const features = response.data.features || {};
      
      log('✅', 'CONSCIOUSNESS', `Consciousness ACTIVE with ${souls.total_souls || 0} Digital Souls`, 'pass');
      
      if (souls.total_souls > 0) {
        log('  🌙', 'SOULS', `Avg: Consciousness ${(souls.average_consciousness * 100).toFixed(1)}%, Creativity ${(souls.average_creativity * 100).toFixed(1)}%, Harmony ${(souls.average_harmony * 100).toFixed(1)}%`, 'pass');
        log('  🎭', 'MOOD', `Collective Mood: ${souls.collective_mood}`, 'pass');
      }
      
      // Validate consciousness features
      const expectedFeatures = ['digital_souls', 'procedural_zodiac', 'consciousness_learning', 'heartbeat_emotional', 'consensus_symphony'];
      const activeFeatures = expectedFeatures.filter(f => features[f]);
      
      if (activeFeatures.length === expectedFeatures.length) {
        log('  ✨', 'FEATURES', `All ${activeFeatures.length} consciousness features active`, 'pass');
        results.passed.push('Apollo Consciousness (Full Features)');
      } else {
        log('  ⚠️', 'FEATURES', `Only ${activeFeatures.length}/${expectedFeatures.length} features active`, 'warn');
        results.passed.push('Apollo Consciousness (Partial)');
        results.warnings.push(`Missing features: ${expectedFeatures.filter(f => !features[f]).join(', ')}`);
      }
    } else {
      log('❌', 'CONSCIOUSNESS', 'Consciousness is INACTIVE - This should not happen!', 'fail');
      results.failed.push('Consciousness INACTIVE');
    }
  } catch (error) {
    log('❌', 'CONSCIOUSNESS', `Consciousness endpoint failed: ${error.message}`, 'fail');
    results.failed.push('Consciousness Endpoint');
  }

  // ============================================================================
  // 7. MIDI RECORDING (MUSICAL CONSENSUS)
  // ============================================================================
  log('🎵', 'MIDI', 'Testing MIDI recording...', 'info');
  try {
    const response = await axios.get(`${LOAD_BALANCER}/api/midi/recordings`, { timeout: 10000 });
    if (response.data && response.data.recordings) {
      log('✅', 'MIDI', `MIDI recording active: ${response.data.recordings.notes_recorded} notes recorded`, 'pass');
      results.passed.push('MIDI Recording');
    } else {
      log('⚠️', 'MIDI', 'MIDI recorder not active', 'warn');
      results.warnings.push('MIDI Inactive');
    }
  } catch (error) {
    log('❌', 'MIDI', `MIDI endpoint failed: ${error.message}`, 'fail');
    results.failed.push('MIDI Endpoint');
  }

  // ============================================================================
  // 8. POSTGRESQL REAL DATA
  // ============================================================================
  log('🗄️', 'DATABASE', 'Testing PostgreSQL integration...', 'info');
  try {
    const response = await axios.get(`${LOAD_BALANCER}/api/db/test`, { timeout: 10000 });
    if (response.data && response.data.connected === true) {
      log('✅', 'DATABASE', 'PostgreSQL connected and operational', 'pass');
      results.passed.push('PostgreSQL Connection');
    } else {
      log('❌', 'DATABASE', 'PostgreSQL connection failed', 'fail');
      results.failed.push('PostgreSQL');
    }
  } catch (error) {
    log('❌', 'DATABASE', `Database endpoint failed: ${error.message}`, 'fail');
    results.failed.push('Database Endpoint');
  }

  // ============================================================================
  // 9. DASHBOARD METRICS
  // ============================================================================
  log('📊', 'DASHBOARD', 'Testing dashboard metrics...', 'info');
  try {
    const response = await axios.get('http://localhost:3001/api/metrics/swarm', { timeout: 5000 });
    if (response.data && response.data.nodes) {
      log('✅', 'DASHBOARD', `Dashboard receiving metrics: ${response.data.nodes.length} nodes`, 'pass');
      results.passed.push('Dashboard Metrics');
    } else {
      log('⚠️', 'DASHBOARD', 'Dashboard not receiving complete metrics', 'warn');
      results.warnings.push('Dashboard Metrics Incomplete');
    }
  } catch (error) {
    log('❌', 'DASHBOARD', `Dashboard not running: ${error.message}`, 'fail');
    results.failed.push('Dashboard');
  }

  // ============================================================================
  // 10. DIGITAL SOULS (ZODIACAL MOONS)
  // ============================================================================
  log('🌙', 'SOULS', 'Testing Digital Souls...', 'info');
  try {
    const response = await axios.get(`${LOAD_BALANCER}/api/souls/active`, { timeout: 10000 });
    if (response.data && response.data.souls) {
      log('✅', 'SOULS', `Digital Souls endpoint operational: ${response.data.count} souls active`, 'pass');
      results.passed.push('Digital Souls');
    } else {
      log('⚠️', 'SOULS', 'Digital Souls endpoint available but no souls active yet', 'warn');
      results.warnings.push('Digital Souls (not yet populated)');
    }
  } catch (error) {
    log('❌', 'SOULS', `Souls endpoint failed: ${error.message}`, 'fail');
    results.failed.push('Souls Endpoint');
  }

  // ============================================================================
  // 11. CHECKPOINTS
  // ============================================================================
  log('💾', 'CHECKPOINTS', 'Testing checkpoint system...', 'info');
  try {
    const response = await axios.get(`${LOAD_BALANCER}/api/checkpoints/list`, { timeout: 10000 });
    if (response.data && response.data.checkpoints && response.data.checkpoints.length > 0) {
      log('✅', 'CHECKPOINTS', `Checkpoints working: ${response.data.checkpoints.length} found`, 'pass');
      results.passed.push('Checkpoints');
    } else {
      log('⚠️', 'CHECKPOINTS', 'Checkpoints endpoint operational but no checkpoints yet', 'warn');
      results.warnings.push('No Checkpoints (system ready)');
    }
  } catch (error) {
    log('❌', 'CHECKPOINTS', `Checkpoints endpoint failed: ${error.message}`, 'fail');
    results.failed.push('Checkpoints Endpoint');
  }

  // ============================================================================
  // 12. MEMORY BET - CAFETERA TEST ☕
  // ============================================================================
  log('☕', 'MEMORY', 'Testing memory efficiency (300MB bet)...', 'info');
  try {
    const response = await axios.get(`${DASHBOARD}/api/data`, { timeout: 5000 });
    if (response.data && response.data.pm2Cluster && response.data.pm2Cluster.memoryBet) {
      const { won, peakNode, peakMB } = response.data.pm2Cluster.memoryBet;
      const { totalNodes, runningNodes } = response.data.pm2Cluster.status;
      
      if (won) {
        log('✅', 'MEMORY', `MEMORY BET WON! Peak: ${peakMB}MB on ${peakNode} (${runningNodes} nodes < 300MB)`, 'pass');
        log('  ☕', 'CAFETERA', `¡Selene Full Moon corre en una cafetera con ${runningNodes} nodos!`, 'pass');
        results.passed.push('Memory Efficiency (< 300MB)');
      } else {
        log('❌', 'MEMORY', `Memory bet LOST! Peak: ${peakMB}MB exceeds 300MB limit`, 'fail');
        results.failed.push('Memory Efficiency');
      }
    } else {
      log('⚠️', 'MEMORY', 'Memory bet data not available', 'warn');
      results.warnings.push('Memory Bet (no data)');
    }
  } catch (error) {
    log('❌', 'MEMORY', `Memory bet check failed: ${error.message}`, 'fail');
    results.failed.push('Memory Bet Check');
  }

  // ============================================================================
  // FINAL REPORT
  // ============================================================================
  console.log(`\n${colors.magenta}${'='.repeat(80)}`);
  console.log(`📋 AUDIT SUMMARY`);
  console.log(`${'='.repeat(80)}${colors.reset}\n`);

  console.log(`${colors.green}✅ PASSED (${results.passed.length}):`);
  results.passed.forEach(item => console.log(`   - ${item}`));
  console.log(colors.reset);

  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  WARNINGS (${results.warnings.length}):`);
    results.warnings.forEach(item => console.log(`   - ${item}`));
    console.log(colors.reset);
  }

  if (results.failed.length > 0) {
    console.log(`${colors.red}❌ FAILED (${results.failed.length}):`);
    results.failed.forEach(item => console.log(`   - ${item}`));
    console.log(colors.reset);
  }

  const totalTests = results.passed.length + results.warnings.length + results.failed.length;
  const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);
  
  console.log(`\n${colors.cyan}📊 READINESS SCORE: ${passRate}%${colors.reset}`);
  
  if (passRate >= 80) {
    console.log(`${colors.green}✅ READY FOR PRE-TEST${colors.reset}\n`);
  } else if (passRate >= 60) {
    console.log(`${colors.yellow}⚠️  NEEDS FIXES BEFORE PRE-TEST${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ NOT READY - CRITICAL FIXES REQUIRED${colors.reset}\n`);
  }

  await redis.disconnect();
  process.exit(results.failed.length > 0 ? 1 : 0);
}

audit().catch(error => {
  console.error(`${colors.red}💥 AUDIT CRASHED: ${error.message}${colors.reset}`);
  process.exit(1);
});
