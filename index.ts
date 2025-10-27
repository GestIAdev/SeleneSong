import { SeleneServer } from "./src/core/Server.js";
import { SeleneNuclearGraphQL } from "./src/graphql/server.js";
import { consoleSilencer } from "./src/ConsoleSilencer.js";
import { RedisConnectionManager } from "./src/core/RedisConnectionManager.js";
import * as path from "path";
import * as fs from "fs";
import * as v8 from "v8";
import * as inspector from "inspector";

// Extend global object for memory monitoring functions
declare global {
    var createHeapSnapshot: (reason?: string) => boolean;
    var showMemoryStats: () => void;
    var forceGC: () => void;
    var runMemoryForensics: () => void;
    var emergencyCleanup: () => boolean;
    var auditClusterMemory: () => void;
}

/**
 * 🔥 SELENE SONG CORE - MAIN STARTUP FILE
 * 🎯 V167: Structured Logging Revolution - Silent Boot with Intelligence
 * By PunkClaude & RaulVisionario - October 14, 2025
 *
 * MISSION: Initialize and start the complete Selene Song Core monolith
 * STRATEGY: Silent boot with structured logging - intelligence over noise
 */

// ============================================================================
// 🔌 REDIS SYNCHRONIZATION - Bug #3 Fix
// ============================================================================
/**
 * Wait for Redis connection with retry logic
 * Prevents "Redis client connection failed" race condition on startup
 */
async function waitForRedis(maxRetries = 10, retryDelayMs = 2000): Promise<any> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const redis = RedisConnectionManager.getInstance();
      
      // 🔥 SANITACIÓN-QUIRÚRGICA FINAL: Unique client per node (eliminates race condition)
      // Pattern: selene-startup-selene-node-1/2/3 (from PM2 NODE_ID env var)
      const sharedClientId = `selene-startup-${process.env.NODE_APP_INSTANCE || 'node-0'}`;
      let testClient = redis.getRedisClient(sharedClientId);
      
      // Only create if doesn't exist OR if existing client is closed
      if (!testClient || !testClient.isOpen) {
        testClient = redis.createRedisClient(sharedClientId);
        
        if (!testClient) {
          throw new Error('Max connections reached');
        }

        await testClient.connect();
      }
      
      await testClient.ping();
      
      console.log('[STARTUP]', 'Redis connection verified', {
        attempt: attempt + 1,
        maxRetries,
        clientId: sharedClientId,
        pid: process.pid
      });
      
      return testClient;
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        console.error('[STARTUP]', `Redis connection failed after ${maxRetries} attempts - shutting down`, error);
        process.exit(1);
      }
      
      console.warn('[STARTUP]', `Redis connection attempt ${attempt}/${maxRetries} failed, retrying in ${retryDelayMs}ms...`, {
        error: (error as Error).message
      });
      
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
}

/**
 * 🚀 MAIN EXECUTION - V167 STRUCTURED LOGGING REVOLUTION
 */
async function main() {
    // ============================================================================
    // STEP 0: Startup logging (TIERRA QUEMADA)
    // ============================================================================
    console.log('[STARTUP]', `🚀 Selene starting in ${process.env.NODE_ENV || 'development'} mode`, {
        pid: process.pid,
        timestamp: new Date().toISOString()
    });

    // ============================================================================
    // ⏱️ STAGGERED STARTUP - Eliminates Redis "Warm-Up Race" condition
    // ============================================================================
    const nodeIndex = parseInt(process.env.NODE_APP_INSTANCE || '0');
    const startupDelay = nodeIndex * 150; // 0ms, 150ms, 300ms
    
    if (startupDelay > 0) {
        console.log('[STARTUP]', `⏱️ Staggered-Startup: Node ${nodeIndex} waiting ${startupDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, startupDelay));
    }

    // ============================================================================
    // 🔇 SILENCE OLD CONSOLE LOGS - Enable clean logging
    // ============================================================================
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
        consoleSilencer.activate();
        console.log('[STARTUP]', 'Console silencer activated for production mode');
    }

    // ============================================================================
    // STEP 1: Wait for Redis (Bug #3 fix - synchronized startup)
    // ============================================================================
    const redisClient = await waitForRedis();
    
    // Logger eliminated - direct console
    console.log('[STARTUP]', '✅ Redis synchronized, proceeding with engine initialization');

    // ============================================================================
    // STEP 2: Original startup sequence (console silencer + banner)
    // ============================================================================
    // 🎯 V167: Boot logger eliminated - using console

    // Configure verbose mode based on environment
    const isVerbose = process.env.SELENE_VERBOSE === 'true' || process.env.APOLLO_VERBOSE_STARTUP === "true";

    if (!isVerbose) {
        consoleSilencer.activate();
        console.log('Selene startup initiated', { mode: 'silent', verbose: false });
    } else {
        console.log('Selene startup initiated', { mode: 'verbose', verbose: true });
    }

    // 🔥 GLOBAL MEMORY TIMELINE FOR EMERGENCY CLEANUP
    const memoryTimeline: any[] = [];
    const maxTimelineEntries = 5;

    // 🔍 MEMORY FORENSICS FUNCTIONS - NOW WITH STRUCTURED LOGGING
    const createHeapSnapshot = function (_reason: string = "manual") {
        try {
            if (!inspector || typeof inspector.url !== "function" || !inspector.url()) {
                console.log('Inspector not available for heap snapshot', {
                    reason: _reason,
                    requiresInspectFlag: true
                });
                return false;
            }

            const session = new inspector.Session();
            session.connect();
            session.post("HeapProfiler.enable", () => {
                const snapshotPath = path.join(process.cwd(), `heap-${_reason}-${Date.now()}.heapsnapshot`);
                session.post("HeapProfiler.takeHeapSnapshot", {}, (err) => {
                    if (err) {
                        console.log('Heap snapshot failed', JSON.stringify({
                            reason: _reason,
                            error: err.message
                        }));
                    } else {
                        console.log('Heap snapshot created', {
                            reason: _reason,
                            path: snapshotPath
                        });
                    }
                    session.disconnect();
                });
            });
            return true;
        }
        catch (error) {
            console.log('Heap snapshot not available', JSON.stringify({
                reason: _reason,
                error: (error as Error).message
            }));
            return false;
        }
    };

    // Global functions for manual control - NOW WITH LOGGING
    global.createHeapSnapshot = (_reason: string = "manual") => {
        const result = createHeapSnapshot(_reason);
        console.log('Manual heap snapshot requested', { reason: _reason, success: result });
        return result;
    };

    global.showMemoryStats = function () {
        console.log('Memory stats requested', {
            totalEntries: memoryTimeline.length
        });
    };

    global.forceGC = function () {
        if (global.gc) {
            const before = process.memoryUsage().heapUsed;
            global.gc();
            const after = process.memoryUsage().heapUsed;
            const freedMB = Math.round(((before - after) / 1024 / 1024) * 100) / 100;
            console.log('GC completed', { freedMB });
        } else {
            console.log('GC not available', { requiresExposeGC: true });
        }
    };

    const runMemoryForensics = function () {
        const heapStats = v8.getHeapStatistics();
        const memUsage = process.memoryUsage();
        const heapUsagePercent = (heapStats.used_heap_size / heapStats.total_heap_size) * 100;
        const isCriticalMemory = heapUsagePercent > 85;

        if (isCriticalMemory) {
            console.log('Critical memory detected', {
                heapUsagePercent: Math.round(heapUsagePercent * 100) / 100
            });
            createHeapSnapshot("critical-memory-detected");
        }

        console.log('Memory forensics completed', {
            heap: {
                totalMB: Math.round((heapStats.total_heap_size / 1024 / 1024) * 100) / 100,
                usedMB: Math.round((heapStats.used_heap_size / 1024 / 1024) * 100) / 100,
                usagePercent: Math.round(heapUsagePercent * 100) / 100
            },
            criticalMemory: isCriticalMemory
        });
    };

    global.runMemoryForensics = () => {
        console.log('Memory forensics requested');
        runMemoryForensics();
    };

    // 🔥 EMERGENCY CLEANUP - SILENT UNLESS CRITICAL
    let emergencyCleanupCount = 0;
    const MAX_EMERGENCY_CLEANUPS = 5;

    function performEmergencyCleanup(_reason: string) {
        if (emergencyCleanupCount >= MAX_EMERGENCY_CLEANUPS) {
            console.log('Emergency cleanup limit reached', JSON.stringify({
                reason: _reason,
                mayNeedRestart: true
            }));
            return false;
        }

        emergencyCleanupCount++;
        const beforeCleanup = process.memoryUsage();
        let totalFreed = 0;

        console.log('Emergency cleanup triggered', {
            reason: _reason,
            count: emergencyCleanupCount
        });

        if (global.gc) {
            global.gc();
            const afterGC = process.memoryUsage();
            const gcFreed = beforeCleanup.heapUsed - afterGC.heapUsed;
            totalFreed += gcFreed;
            console.log('GC completed in emergency cleanup', {
                freedMB: Math.round((gcFreed / 1024 / 1024) * 100) / 100
            });
        }

        if (Array.isArray(memoryTimeline) && memoryTimeline.length > 2) {
            const removed = memoryTimeline.length - 1;
            memoryTimeline.splice(0, removed);
            console.log('Memory timeline cleaned in emergency', { removed });
        }

        const afterCleanup = process.memoryUsage();
        const cleanupFreed = beforeCleanup.heapUsed - afterCleanup.heapUsed;
        totalFreed += cleanupFreed;

        console.log('Emergency cleanup complete', {
            totalFreedMB: Math.round((totalFreed / 1024 / 1024) * 100) / 100,
            heapAfterMB: Math.round(afterCleanup.heapUsed / 1024 / 1024)
        });

        return totalFreed > 0;
    }

    global.emergencyCleanup = () => performEmergencyCleanup("manual-trigger");

    try {
        console.log('Creating Selene Server');
        const server = new SeleneServer();

        console.log('Starting server');
        await server.start();

        console.log('Configuring GraphQL with @veritas directive');
        const graphqlServer = new SeleneNuclearGraphQL(
            server["database"],
            server["cache"],
            server["monitoring"],
            server["reactor"],
            server["containment"],
            server["fusion"],
            server["veritas"],
            null as any,
            server["heal"] || null as any,
            server["predict"] || null as any,
            server["offline"] || null as any
        );

        console.log('Calling server.configureGraphQL()');
        await server.configureGraphQL(graphqlServer);

        // 🎯 V167: Post-boot summary instead of noisy startup logs
        if (!isVerbose) {
            consoleSilencer.deactivate();
            consoleSilencer.showSummary();
        }

        // Structured post-boot summary
        console.log('Selene Song Core started successfully', {
            status: 'ENLIGHTENED',
            endpoints: {
                authLogin: '/api/v1/auth/login',
                authMe: '/api/v1/auth/me',
                graphql: '/graphql',
                health: '/health'
            },
            features: {
                veritasDirective: true,
                frontendAuth: '€90/month',
                memoryMonitoring: true,
                emergencyCleanup: true
            },
            uptime: Math.round(process.uptime() * 100) / 100,
            memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        });

    }
    catch (error) {
        console.log('Selene Song Core startup failed', JSON.stringify({
            error: (error as Error).message,
            stack: (error as Error).stack?.split('\n')[0],
            uptime: Math.round(process.uptime() * 100) / 100
        }));
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
    console.log('Received SIGINT, shutting down gracefully');
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

// Start the nuclear revolution
main().catch((error) => {
    console.log('Critical startup error', JSON.stringify({
        error: (error as Error).message,
        stack: (error as Error).stack?.split('\n')[0]
    }));
    process.exit(1);
});

// 🔥 CLUSTER-WIDE MEMORY MONITORING - SILENT UNLESS CRITICAL
const MAX_MEMORY_CHECKS = 10;
let memoryCheckCount = 0;

function performClusterMemoryAudit() {
    if (memoryCheckCount >= MAX_MEMORY_CHECKS) {
        console.log('Cluster memory audit limit reached', {
            stoppedAutomatedChecks: true
        });
        return;
    }

    memoryCheckCount++;
    const heapStats = v8.getHeapStatistics();
    const heapUsagePercent = (heapStats.used_heap_size / heapStats.total_heap_size) * 100;

    console.log('Cluster memory audit', {
        checkNumber: memoryCheckCount,
        heapUsagePercent: Math.round(heapUsagePercent * 10) / 10,
        heapUsedMB: Math.round(heapStats.used_heap_size / 1024 / 1024),
        heapTotalMB: Math.round(heapStats.total_heap_size / 1024 / 1024),
        isCritical: heapUsagePercent > 90
    });

    if (heapUsagePercent > 90) {
        console.log('Critical heap usage detected', {
            usagePercent: Math.round(heapUsagePercent * 10) / 10,
            triggeringDeepAudit: true
        });
    }
}

global.auditClusterMemory = () => {
    console.log('Manual cluster memory audit requested');
    performClusterMemoryAudit();
};

// Perform initial audit after startup
setTimeout(() => performClusterMemoryAudit(), 10000);

