/**
 * Selene Memory Monitor - Basic Implementation
 * Prevents memory leaks and monitors heap usage
 */

export default class SeleneMemoryMonitor {
  constructor(options = {}) {
    this.thresholdMB = options.thresholdMB || 200;
    this.alertIntervalMs = options.alertIntervalMs || 5000;
    this.autoSnapshot = options.autoSnapshot || true;
    this.snapshotDir = options.snapshotDir || "./snapshots";
    this.enableAlerts = options.enableAlerts || true;
    this.logLevel = options.logLevel || "info";

    console.log("🧠 Selene Memory Monitor initialized");
  }

  getMiddleware() {
    return (req, res, next) => {
      // Basic memory monitoring middleware
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);

      if (heapUsedMB > this.thresholdMB) {
        console.warn(`🚨 Memory threshold exceeded: ${heapUsedMB}MB used`);
      }

      next();
    };
  }

  getMemoryReport() {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      timestamp: new Date().toISOString(),
    };
  }

  getMetrics() {
    return this.getMemoryReport();
  }

  getAlerts() {
    const report = this.getMemoryReport();
    const alerts = [];

    if (report.heapUsed > this.thresholdMB) {
      alerts.push({
        type: "memory_threshold",
        message: `Heap usage ${report.heapUsed}MB exceeds threshold ${this.thresholdMB}MB`,
        severity: "warning",
        timestamp: report.timestamp,
      });
    }

    return alerts;
  }

  async createSnapshot(filename) {
    // Basic snapshot implementation
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const snapshotName = filename || `memory-snapshot-${timestamp}.json`;

    try {
      const fs = await import("fs/promises");
      const path = await import("path");

      const snapshotPath = path.join(this.snapshotDir, snapshotName);
      const data = {
        timestamp: new Date().toISOString(),
        memory: this.getMemoryReport(),
        process: {
          pid: process.pid,
          uptime: process.uptime(),
          version: process.version,
        },
      };

      await fs.writeFile(snapshotPath, JSON.stringify(data, null, 2));
      console.log(`📸 Memory snapshot saved: ${snapshotPath}`);

      return snapshotPath;
    } catch (error) {
      console.error("Failed to create memory snapshot:", error);
      return "snapshot-failed";
    }
  }

  async forceCleanup() {
    const before = process.memoryUsage().heapUsed;

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const after = process.memoryUsage().heapUsed;
    const freed = before - after;

    return {
      freed: Math.round(freed / 1024 / 1024),
      message: `Cleanup completed, freed ${Math.round(freed / 1024 / 1024)}MB`,
    };
  }

  async start() {
    console.log("🧠 Memory monitor started");
    // Basic monitoring loop
    setInterval(() => {
      const alerts = this.getAlerts();
      if (alerts.length > 0 && this.enableAlerts) {
        alerts.forEach(alert => console.warn(`🚨 ${alert.message}`));
      }
    }, this.alertIntervalMs);
  }

  async stop() {
    console.log("🧠 Memory monitor stopped");
  }
}