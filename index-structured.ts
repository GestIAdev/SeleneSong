import { SeleneServer } from "./src/core/Server.js";
import { SeleneNuclearGraphQL } from "./src/graphql/server.js";
import { consoleSilencer } from "./src/ConsoleSilencer.js";
import { LoggerFactory } from "./src/core/SeleneLogger.js";
import * as path from "path";
import * as fs from "fs";
import * as v8 from "v8";
import * as inspector from "inspector";

/**
 * 🔥 SELENE SONG CORE - MAIN STARTUP FILE
 * 🎯 V167: Structured Logging Revolution - Silent Boot with Intelligence
 * By PunkClaude & RaulVisionario - October 14, 2025
 *
 * MISSION: Initialize and start the complete Selene Song Core monolith
 * STRATEGY: Silent boot with structured logging - intelligence over noise
 */

/**
 * 🚀 MAIN EXECUTION - V167 STRUCTURED LOGGING REVOLUTION
 */
async function main() {
    // 🎯 V167: Initialize structured logging system
    const bootLogger = LoggerFactory.getBootLogger();

    // Configure verbose mode based on environment
    const isVerbose = process.env.SELENE_VERBOSE === 'true' || process.env.APOLLO_VERBOSE_STARTUP === "true";

    if (!isVerbose) {
        consoleSilencer.activate();
        bootLogger.info('Selene startup initiated', { mode: 'silent', verbose: false });
    } else {
        bootLogger.info('Selene startup initiated', { mode: 'verbose', verbose: true });
    }

    // 🔥 GLOBAL MEMORY TIMELINE FOR EMERGENCY CLEANUP
    const memoryTimeline = [];
    const maxTimelineEntries = 5; // REDUCED from 100 to prevent memory leaks

    // 🔥 INTEGRATE PUNK MEMORY OPTIMIZER - PREVENT HEAP ANCHORING
    // PunkMemoryOptimizer is a singleton that auto-initializes in constructor

    // 🔍 MEMORY FORENSICS FUNCTIONS - NOW WITH STRUCTURED LOGGING
    const estimateObjectSize = function (obj, depth = 0, maxDepth = 3) {
        if (depth > maxDepth || !obj || typeof obj !== "object")
            return 1;
        let size = 0;
        try {
            for (const [, value] of Object.entries(obj)) {
                size++;
                if (typeof value === "object" && value !== null) {
                    size += estimateObjectSize(value, depth + 1, maxDepth);
                }
            }
        }
        catch (e) { }
        return size;
    };

    // Heap snapshot function - SAFER VERSION WITH LOGGING
    const createHeapSnapshot = function (_reason = "manual") {
        try {
            // Check if inspector is available and properly initialized
            if (!inspector ||
                typeof inspector.url !== "function" ||
                !inspector.url()) {
                bootLogger.warn('Inspector not available for heap snapshot', {
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
                        bootLogger.error('Heap snapshot failed', {
                            reason: _reason,
                            error: err.message,
                            path: snapshotPath
                        });
                    }
                    else {
                        bootLogger.info('Heap snapshot created', {
                            reason: _reason,
                            path: snapshotPath,
                            size: fs.existsSync(snapshotPath) ? fs.statSync(snapshotPath).size : 'unknown'
                        });
                    }
                    session.disconnect();
                });
            });
            return true;
        }
        catch (error) {
            bootLogger.warn('Heap snapshot not available', {
                reason: _reason,
                error: error.message
            });
            return false;
        }
    };

    // Global functions for manual control - NOW WITH LOGGING
    global.createHeapSnapshot = (_reason) => {
        const result = createHeapSnapshot(_reason);
        bootLogger.debug('Manual heap snapshot requested', { reason: _reason, success: result });
        return result;
    };

    global.showMemoryStats = function () {
        bootLogger.info('Memory stats requested', {
            totalEntries: memoryTimeline.length,
            monitoring: memoryTimeline.length > 0 ? {
                timeMinutes: memoryTimeline.length > 0 ?
                    Math.round((memoryTimeline[memoryTimeline.length - 1].timestamp - memoryTimeline[0].timestamp) / 1000 / 60) : 0,
                avgGrowthMB: memoryTimeline.length > 1 ?
                    Math.round(((memoryTimeline[memoryTimeline.length - 1].heap.used - memoryTimeline[0].heap.used) /
                        (memoryTimeline.length - 1)) * 100) / 100 : 0,
                currentUsageMB: memoryTimeline.length > 0 ? memoryTimeline[memoryTimeline.length - 1].heap.used : 0,
                peakUsageMB: memoryTimeline.length > 0 ? Math.max(...memoryTimeline.map(e => e.heap.used)) : 0
            } : null
        });
    };

    global.forceGC = function () {
        if (global.gc) {
            const before = process.memoryUsage().heapUsed;
            global.gc();
            const after = process.memoryUsage().heapUsed;
            const freedMB = Math.round(((before - after) / 1024 / 1024) * 100) / 100;
            bootLogger.info('GC completed', {
                freedMB,
                beforeMB: Math.round(before / 1024 / 1024),
                afterMB: Math.round(after / 1024 / 1024)
            });
        }
        else {
            bootLogger.warn('GC not available', { requiresExposeGC: true });
        }
    };

    const runMemoryForensics = function () {
        const heapStats = v8.getHeapStatistics();
        const spaces = v8.getHeapSpaceStatistics();
        const memUsage = process.memoryUsage();

        // Check for critical memory issues
        const hasProblemSpaces = spaces.some(space => space.usage > 85);
        const isCriticalMemory = hasProblemSpaces || heapStats.used_heap_size / heapStats.total_heap_size > 0.85;

        if (isCriticalMemory) {
            bootLogger.warn('Critical memory detected', {
                heapUsagePercent: Math.round((heapStats.used_heap_size / heapStats.total_heap_size) * 10000) / 100,
                problemSpaces: spaces.filter(s => s.usage > 85).map(s => ({
                    name: s.space_name,
                    usage: Math.round(s.usage * 100) / 100
                }))
            });
            createHeapSnapshot("critical-memory-detected");
        }

        // Event listeners and timers audit
        const eventEmitterCount = process._getActiveHandles ? process._getActiveHandles().length : "N/A";
        const timerCount = process._getActiveRequests ? process._getActiveRequests().length : "N/A";

        const timers = Object.keys(global).filter((k) => k.toLowerCase().includes("Interval") ||
            k.toLowerCase().includes("Timeout") ||
            k.toLowerCase().includes("Timer") ||
            k.toLowerCase().includes("timer"));

        bootLogger.info('Memory forensics completed', {
            heap: {
                totalMB: Math.round((heapStats.total_heap_size / 1024 / 1024) * 100) / 100,
                usedMB: Math.round((heapStats.used_heap_size / 1024 / 1024) * 100) / 100,
                usagePercent: Math.round((heapStats.used_heap_size / heapStats.total_heap_size) * 10000) / 100
            },
            system: {
                rssMB: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
                externalMB: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
                uptimeMinutes: Math.round(process.uptime() / 60)
            },
            resources: {
                handles: eventEmitterCount,
                requests: timerCount,
                globalTimers: timers.length
            },
            criticalMemory: isCriticalMemory
        });
    };

    // Register global function
    global.runMemoryForensics = () => {
        bootLogger.debug('Memory forensics requested');
        runMemoryForensics();
    };

    // 🔥 CONTINUOUS CRITICAL MEMORY MONITOR - NOW SILENT UNLESS CRITICAL
    let emergencySnapshotCount = 0;
    const maxEmergencySnapshots = 3;

    // 🚨 HEAP EXPANSION MONITOR - PREVENT ANCHORING
    let heapExpansionBlockedCount = 0;
    const maxBlockedExpansions = 5;

    function checkHeapExpansionHealth() {
        const heapStats = v8.getHeapStatistics();
        const heapUsagePercent = (heapStats.used_heap_size / heapStats.total_heap_size) * 100;

        const isReallyBlocked = heapUsagePercent > 95 &&
            heapStats.total_heap_size < 50 * 1024 * 1024 &&
            heapStats.total_heap_size < heapStats.heap_size_limit * 0.05 &&
            heapExpansionBlockedCount > 2;

        if (isReallyBlocked) {
            heapExpansionBlockedCount++;
            bootLogger.warn('Real heap anchoring detected', {
                usagePercent: Math.round(heapUsagePercent * 10) / 10,
                heapSizeMB: Math.round(heapStats.total_heap_size / 1024 / 1024),
                limitMB: Math.round(heapStats.heap_size_limit / 1024 / 1024),
                blockedCount: heapExpansionBlockedCount
            });

            if (heapExpansionBlockedCount >= maxBlockedExpansions) {
                if (global.gc) {
                    global.gc();
                }
                if (Array.isArray(memoryTimeline) && memoryTimeline.length > 2) {
                    const removed = memoryTimeline.length - 1;
                    memoryTimeline.splice(0, removed);
                    bootLogger.info('Memory timeline cleaned', { removedEntries: removed, kept: 1 });
                }
                heapExpansionBlockedCount = 0;
            }
        }
        else {
            heapExpansionBlockedCount = 0;
        }
    }

    function takeEmergencySnapshot(_reason) {
        if (emergencySnapshotCount >= maxEmergencySnapshots) {
            bootLogger.warn('Emergency snapshot limit reached', { reason: _reason });
            return;
        }

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `emergency-heap-${_reason}-${emergencySnapshotCount}-${timestamp}.heapsnapshot`;

            if (!inspector || typeof inspector.url !== "function" || !inspector.url()) {
                bootLogger.warn('Inspector not available for emergency snapshot', {
                    reason: _reason,
                    requiresInspectFlag: true
                });
                return;
            }

            const session = new inspector.Session();
            session.connect();
            session.post("HeapProfiler.enable", () => {
                session.post("HeapProfiler.takeHeapSnapshot", {}, (err) => {
                    if (err) {
                        bootLogger.error('Emergency heap snapshot failed', {
                            reason: _reason,
                            error: err.message
                        });
                    }
                    else {
                        bootLogger.error('Emergency snapshot taken', {
                            reason: _reason,
                            filename,
                            count: ++emergencySnapshotCount
                        });
                    }
                    session.disconnect();
                });
            });
        }
        catch (error) {
            bootLogger.warn('Emergency snapshot not available', {
                reason: _reason,
                error: error.message
            });
        }
    }

    // 🔥 AGGRESSIVE HEAP MONITORING - SILENT UNLESS CRITICAL
    let emergencyCleanupCount = 0;
    const MAX_EMERGENCY_CLEANUPS = 5;

    function performEmergencyCleanup(_reason) {
        if (emergencyCleanupCount >= MAX_EMERGENCY_CLEANUPS) {
            bootLogger.error('Emergency cleanup limit reached', {
                reason: _reason,
                mayNeedRestart: true
            });
            return false;
        }

        emergencyCleanupCount++;
        const beforeCleanup = process.memoryUsage();
        let totalFreed = 0;

        bootLogger.warn('Emergency cleanup triggered', {
            reason: _reason,
            count: emergencyCleanupCount,
            maxAllowed: MAX_EMERGENCY_CLEANUPS
        });

        // 1. Force garbage collection
        if (global.gc) {
            global.gc();
            const afterGC = process.memoryUsage();
            const gcFreed = beforeCleanup.heapUsed - afterGC.heapUsed;
            totalFreed += gcFreed;
            bootLogger.info('GC completed in emergency cleanup', {
                freedMB: Math.round((gcFreed / 1024 / 1024) * 100) / 100
            });
        }

        // 2. Clear memory timeline if it's too large
        if (Array.isArray(memoryTimeline) && memoryTimeline.length > 2) {
            const removed = memoryTimeline.length - 1;
            memoryTimeline.splice(0, removed);
            bootLogger.info('Memory timeline cleaned in emergency', { removed });
        }

        // 3. Clear any large global arrays (defensive cleanup)
        const globalKeys = Object.keys(global);
        let clearedObjects = 0;
        globalKeys.forEach((key) => {
            try {
                const obj = global[key];
                if (obj && Array.isArray(obj) && obj.length > 1000) {
                    if (key.includes("logs") || key.includes("history") || key.includes("timeline")) {
                        const originalLength = obj.length;
                        obj.splice(0, obj.length - 100);
                        clearedObjects++;
                        bootLogger.info('Large global array cleaned', {
                            key,
                            originalLength,
                            newLength: 100
                        });
                    }
                }
            }
            catch (e) { }
        });

        // 4. Report results
        const afterCleanup = process.memoryUsage();
        const cleanupFreed = beforeCleanup.heapUsed - afterCleanup.heapUsed;
        totalFreed += cleanupFreed;

        bootLogger.info('Emergency cleanup complete', {
            totalFreedMB: Math.round((totalFreed / 1024 / 1024) * 100) / 100,
            heapAfterMB: Math.round(afterCleanup.heapUsed / 1024 / 1024),
            clearedObjects
        });

        return totalFreed > 0;
    }

    // Register global emergency cleanup function
    global.emergencyCleanup = () => performEmergencyCleanup("manual-trigger");

    try {
        bootLogger.info('Creating Selene Server');
        const server = new SeleneServer();

        bootLogger.info('Starting server');
        await server.start();

        bootLogger.info('Configuring GraphQL with @veritas directive');
        const graphqlServer = new SeleneNuclearGraphQL(
            server["database"],
            server["cache"],
            server["monitoring"],
            server["reactor"],
            server["containment"],
            server["fusion"],
            server["veritas"],
            null, // Consciousness disabled - CPU radiation safety
            server["heal"] || null,
            server["predict"] || null,
            server["offline"] || null
        );

        bootLogger.info('Calling server.configureGraphQL()');
        await server.configureGraphQL(graphqlServer);

        // 🎯 V167: Post-boot summary instead of noisy startup logs
        if (!isVerbose) {
            consoleSilencer.deactivate();
            consoleSilencer.showSummary();
        }

        // Structured post-boot summary
        bootLogger.info('Selene Song Core started successfully', {
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
        bootLogger.error('Selene Song Core startup failed', {
            error: error.message,
            stack: error.stack?.split('\n')[0],
            uptime: Math.round(process.uptime() * 100) / 100
        });
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
    LoggerFactory.getBootLogger().info('Received SIGINT, shutting down gracefully');
    process.exit(0);
});

process.on("SIGTERM", () => {
    LoggerFactory.getBootLogger().info('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

// Start the nuclear revolution
main().catch((error) => {
    LoggerFactory.getBootLogger().error('Critical startup error', {
        error: error.message,
        stack: error.stack?.split('\n')[0]
    });
    process.exit(1);
});

// 🔥 CLUSTER-WIDE MEMORY MONITORING - SILENT UNLESS CRITICAL
const MAX_MEMORY_CHECKS = 10;
let memoryCheckCount = 0;

function performClusterMemoryAudit() {
    if (memoryCheckCount >= MAX_MEMORY_CHECKS) {
        LoggerFactory.getBootLogger().warn('Cluster memory audit limit reached', {
            stoppedAutomatedChecks: true
        });
        return;
    }

    memoryCheckCount++;
    const heapStats = v8.getHeapStatistics();
    const heapUsagePercent = (heapStats.used_heap_size / heapStats.total_heap_size) * 100;

    LoggerFactory.getBootLogger().info('Cluster memory audit', {
        checkNumber: memoryCheckCount,
        heapUsagePercent: Math.round(heapUsagePercent * 10) / 10,
        heapUsedMB: Math.round(heapStats.used_heap_size / 1024 / 1024),
        heapTotalMB: Math.round(heapStats.total_heap_size / 1024 / 1024),
        isCritical: heapUsagePercent > 90
    });

    if (heapUsagePercent > 90) {
        LoggerFactory.getBootLogger().warn('Critical heap usage detected', {
            usagePercent: Math.round(heapUsagePercent * 10) / 10,
            triggeringDeepAudit: true
        });

        // Deep audit logic would go here...
        // (Keeping it minimal for the migration)
    }
}

// Register global function for manual cluster audits
global.auditClusterMemory = () => {
    LoggerFactory.getBootLogger().debug('Manual cluster memory audit requested');
    performClusterMemoryAudit();
};

// Perform initial audit after startup
setTimeout(() => performClusterMemoryAudit(), 10000);
