/**
 * 🎯 REDIS COMMAND LISTENER - STANDALONE PROCESS
 * DIRECTIVA 11.2: Isolated listener process for FORJA 10.0
 */

import { RedisCommandListener } from "./dist/core/RedisCommandListener.js";

async function main() {
  console.log('🎯 Starting Redis Command Listener (Isolated Process)');

  try {
    await RedisCommandListener.startRedisCommandListener();
    console.log('✅ Redis Command Listener started successfully');
  } catch (error) {
    console.error('❌ Failed to start Redis Command Listener:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Critical error in Redis Listener:', error);
  process.exit(1);
});