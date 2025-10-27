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
    const maxTimelineEntries = 5;

    // 🔍 MEMORY FORENSICS FUNCTIONS - NOW WITH STRUCTURED LOGGING
    const createHeapSnapshot = function (_reason = "manual") {
        try {
            if (!inspector || typeof inspector.url !== "function" || !inspector.url()) {
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
                            error: err.message
                        });
                    } else {
                        bootLogger.info('Heap snapshot created', {
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
            totalEntries: memoryTimeline.length
        });
    };

    global.forceGC = function () {
        if (global.gc) {
            const before = process.memoryUsage().heapUsed;
            global.gc();
            const after = process.memoryUsage().heapUsed;
            const freedMB = Math.round(((before - after) / 1024 / 1024) * 100) / 100;
            bootLogger.info('GC completed', { freedMB });
        } else {
            bootLogger.warn('GC not available', { requiresExposeGC: true });
        }
    };

    const runMemoryForensics = function () {
        const heapStats = v8.getHeapStatistics();
        const memUsage = process.memoryUsage();
        const heapUsagePercent = (heapStats.used_heap_size / heapStats.total_heap_size) * 100;
        const isCriticalMemory = heapUsagePercent > 85;

        if (isCriticalMemory) {
            bootLogger.warn('Critical memory detected', {
                heapUsagePercent: Math.round(heapUsagePercent * 100) / 100
            });
            createHeapSnapshot("critical-memory-detected");
        }

        bootLogger.info('Memory forensics completed', {
            heap: {
                totalMB: Math.round((heapStats.total_heap_size / 1024 / 1024) * 100) / 100,
                usedMB: Math.round((heapStats.used_heap_size / 1024 / 1024) * 100) / 100,
                usagePercent: Math.round(heapUsagePercent * 100) / 100
            },
            criticalMemory: isCriticalMemory
        });
    };

    global.runMemoryForensics = () => {
        bootLogger.debug('Memory forensics requested');
        runMemoryForensics();
    };

    // 🔥 EMERGENCY CLEANUP - SILENT UNLESS CRITICAL
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
            count: emergencyCleanupCount
        });

        if (global.gc) {
            global.gc();
            const afterGC = process.memoryUsage();
            const gcFreed = beforeCleanup.heapUsed - afterGC.heapUsed;
            totalFreed += gcFreed;
            bootLogger.info('GC completed in emergency cleanup', {
                freedMB: Math.round((gcFreed / 1024 / 1024) * 100) / 100
            });
        }

        if (Array.isArray(memoryTimeline) && memoryTimeline.length > 2) {
            const removed = memoryTimeline.length - 1;
            memoryTimeline.splice(0, removed);
            bootLogger.info('Memory timeline cleaned in emergency', { removed });
        }

        const afterCleanup = process.memoryUsage();
        const cleanupFreed = beforeCleanup.heapUsed - afterCleanup.heapUsed;
        totalFreed += cleanupFreed;

        bootLogger.info('Emergency cleanup complete', {
            totalFreedMB: Math.round((totalFreed / 1024 / 1024) * 100) / 100,
            heapAfterMB: Math.round(afterCleanup.heapUsed / 1024 / 1024)
        });

        return totalFreed > 0;
    }

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
            null,
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
    }
}

global.auditClusterMemory = () => {
    LoggerFactory.getBootLogger().debug('Manual cluster memory audit requested');
    performClusterMemoryAudit();
};

// Perform initial audit after startup
setTimeout(() => performClusterMemoryAudit(), 10000);