/**
 * 🧠 SELENE MEMORY MONITOR
 * Advanced memory leak detection and monitoring system
 * By PunkGrok - October 7, 2025
 */

import fs from 'fs';
import path from 'path';
import v8 from 'v8';

class SeleneMemoryMonitor {
  constructor(options = {}) {
    this.options = {
      thresholdMB: options.thresholdMB || 200,
      alertIntervalMs: options.alertIntervalMs || 5000,
      autoSnapshot: options.autoSnapshot !== false,
      snapshotDir: options.snapshotDir || './snapshots',
      enableAlerts: options.enableAlerts !== false,
      logLevel: options.logLevel || 'info',
      ...options
    };

    this.alerts = [];
    this.snapshots = [];
    this.isRunning = false;
    this.monitorInterval = null;
    this.lastMemoryUsage = process.memoryUsage();

    // Ensure snapshot directory exists
    if (this.options.autoSnapshot) {
      try {
        if (!fs.existsSync(this.options.snapshotDir)) {
          fs.mkdirSync(this.options.snapshotDir, { recursive: true });
        }
      } catch (error) {
        console.warn('⚠️ Failed to create snapshot directory:', error.message);
      }
    }

    console.log('🧠 Selene Memory Monitor initialized with options:', this.options);
  }

  /**
   * Get Express middleware for memory monitoring
   */
  getMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      // Add memory info to response
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const memoryDelta = {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
        };

        // Log memory usage for requests
        if (this.options.logLevel === 'debug') {
          console.log(`🧠 Request memory delta:`, {
            method: req.method,
            path: req.path,
            duration,
            memoryDelta
          });
        }

        // Check for memory leaks
        if (memoryDelta.heapUsed > this.options.thresholdMB * 1024 * 1024) {
          this.addAlert({
            type: 'memory_leak_suspected',
            message: `High memory usage detected: ${Math.round(memoryDelta.heapUsed / 1024 / 1024)}MB increase`,
            details: { memoryDelta, request: `${req.method} ${req.path}` },
            timestamp: new Date().toISOString()
          });
        }
      });

      next();
    };
  }

  /**
   * Get current memory report
   */
  getMemoryReport() {
    const memUsage = process.memoryUsage();
    const report = {
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        heapUsedPercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      v8: {
        heapStatistics: v8.getHeapStatistics(),
        heapSpaceStatistics: v8.getHeapSpaceStatistics()
      },
      alerts: this.alerts.length,
      snapshots: this.snapshots.length
    };

    return report;
  }

  /**
   * Get memory metrics
   */
  getMetrics() {
    const current = process.memoryUsage();
    const metrics = {
      rss: current.rss,
      heapUsed: current.heapUsed,
      heapTotal: current.heapTotal,
      external: current.external,
      timestamp: Date.now()
    };

    return metrics;
  }

  /**
   * Get active alerts
   */
  getAlerts() {
    return this.alerts.slice(-10); // Return last 10 alerts
  }

  /**
   * Add an alert
   */
  addAlert(alert) {
    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    if (this.options.enableAlerts) {
      console.warn('🚨 MEMORY ALERT:', alert);
    }
  }

  /**
   * Create a heap snapshot
   */
  async createSnapshot(snapshotName) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = snapshotName || `heap-${timestamp}.heapsnapshot`;
      const filepath = path.join(this.options.snapshotDir, filename);

      // In Node.js, we can use v8.writeHeapSnapshot
      const snapshotPath = v8.writeHeapSnapshot(filepath);

      this.snapshots.push({
        name: filename,
        path: snapshotPath,
        timestamp: new Date().toISOString(),
        size: fs.statSync(snapshotPath).size
      });

      console.log(`📸 Heap snapshot created: ${snapshotPath}`);
      return snapshotPath;
    } catch (error) {
      console.error('💥 Failed to create heap snapshot:', error);
      return null;
    }
  }

  /**
   * Force garbage collection and cleanup
   */
  async forceCleanup() {
    try {
      if (global.gc) {
        global.gc();
        console.log('🧹 Forced garbage collection completed');

        const before = this.lastMemoryUsage;
        const after = process.memoryUsage();

        const freed = {
          rss: before.rss - after.rss,
          heapUsed: before.heapUsed - after.heapUsed,
          heapTotal: before.heapTotal - after.heapTotal,
          external: before.external - after.external
        };

        this.lastMemoryUsage = after;

        return {
          freed: {
            rss: Math.round(freed.rss / 1024 / 1024),
            heapUsed: Math.round(freed.heapUsed / 1024 / 1024),
            heapTotal: Math.round(freed.heapTotal / 1024 / 1024),
            external: Math.round(freed.external / 1024 / 1024)
          },
          message: 'Cleanup completed successfully'
        };
      } else {
        return {
          freed: { rss: 0, heapUsed: 0, heapTotal: 0, external: 0 },
          message: 'Garbage collection not available (run with --expose-gc)'
        };
      }
    } catch (error) {
      console.error('💥 Cleanup failed:', error);
      return {
        freed: { rss: 0, heapUsed: 0, heapTotal: 0, external: 0 },
        message: `Cleanup failed: ${error.message}`
      };
    }
  }

  /**
   * Start monitoring
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🧠 Memory monitoring started');

    this.monitorInterval = setInterval(() => {
      try {
        const current = process.memoryUsage();
        const heapUsedMB = Math.round(current.heapUsed / 1024 / 1024);

        // Check threshold
        if (heapUsedMB > this.options.thresholdMB) {
          this.addAlert({
            type: 'memory_threshold_exceeded',
            message: `Memory usage exceeded threshold: ${heapUsedMB}MB > ${this.options.thresholdMB}MB`,
            details: { current, threshold: this.options.thresholdMB },
            timestamp: new Date().toISOString()
          });

          // Auto snapshot if enabled
          if (this.options.autoSnapshot) {
            this.createSnapshot();
          }
        }

        this.lastMemoryUsage = current;
      } catch (error) {
        console.error('💥 Memory monitoring error:', error);
      }
    }, this.options.alertIntervalMs);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    console.log('🧠 Memory monitoring stopped');

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }
}

export default SeleneMemoryMonitor;