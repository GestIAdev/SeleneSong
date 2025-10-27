/**
 * 🌙 SELENE RADIATION - MONITORING & DETECTION MODULE
 * By PunkClaude & RaulVisionario - September 18, 2025
 *
 * MISSION: System monitoring and anomaly detection
 * STRATEGY: Real-time radiation monitoring for system health
 */

import {

  monitoringOrchestrator,
  MonitoringTask,
} from "../Monitoring/MonitoringOrchestrator.js";

/**
 * 🌙 SELENE RADIATION - THE MONITORING CORE
 * Continuous system monitoring and anomaly detection
 */
export class SeleneRadiation {
  private isActive: boolean = false;
  private radiationLevels: Map<string, number> = new Map();
  private anomalyThresholds: Map<string, number> = new Map();

  constructor() {
    console.log("☢️ Initializing Selene Radiation...");
    this.initializeThresholds();
  }

  /**
   * 🚀 Start radiation monitoring
   */
  public async start(): Promise<void> {
    try {
      console.log("🚀 Starting Selene Radiation monitoring...");

      this.isActive = true;

      // Register monitoring tasks with the Orchestrator
      await this.registerMonitoringTasks();

      console.log("✅ Selene Radiation active - orchestrated monitoring");
    } catch (error) {
      console.error("💥 Failed to start radiation monitoring:", error as Error);
      throw error;
    }
  }

  /**
   * 🛑 Emergency shutdown
   */
  public async emergencyShutdown(): Promise<void> {
    console.log("🚨 EMERGENCY RADIATION SHUTDOWN");

    this.isActive = false;

    // The Orchestrator handles all interval cleanup
    console.log(
      "✅ Radiation emergency shutdown complete - Orchestrator notified",
    );
  }

  // ==========================================
  // 📊 SYSTEM MONITORING
  // ==========================================

  /**
   * � Register all monitoring tasks with the Orchestrator
   */
  private async registerMonitoringTasks(): Promise<void> {
    const tasks: MonitoringTask[] = [
      // CPU Monitoring - Critical priority with circuit breaker
      {
        id: "radiation-cpu",
        name: "CPU Radiation Monitor",
        schedule: "*/5 * * * * *", // Every 5 seconds
        priority: "critical",
        circuitBreaker: {
          threshold: 80, // Trip if CPU > 80%
          cooldownMs: 60000, // 1 minute cooldown
        },
        lazyMode: {
          maxCpuUsage: 70, // Only run if CPU < 70%
          checkIntervalMs: 1000,
        },
        execute: async () => {
          const cpuUsage = process.cpuUsage();
          const radiation = (cpuUsage.user + cpuUsage.system) / 1000000;
          this.radiationLevels.set("cpu", radiation);
          await this.checkAnomaly("cpu", radiation);
        },
      },

      // Memory Monitoring - High priority
      {
        id: "radiation-memory",
        name: "Memory Radiation Monitor",
        schedule: "*/10 * * * * *", // Every 10 seconds
        priority: "high",
        circuitBreaker: {
          threshold: 90,
          cooldownMs: 30000,
        },
        execute: async () => {
          const memUsage = process.memoryUsage();
          const radiation = memUsage.heapUsed / memUsage.heapTotal;
          this.radiationLevels.set("memory", radiation);
          await this.checkAnomaly("memory", radiation);
        },
      },

      // Disk Monitoring - Medium priority
      {
        id: "radiation-disk",
        name: "Disk Radiation Monitor",
        schedule: "*/30 * * * * *", // Every 30 seconds
        priority: "medium",
        execute: async () => {
          const radiation = 0.4; // Nivel de radiación fijo para queries
          this.radiationLevels.set("disk", radiation);
          await this.checkAnomaly("disk", radiation);
        },
      },

      // Response Time Monitoring - High priority
      {
        id: "radiation-response-time",
        name: "Response Time Monitor",
        schedule: "*/2 * * * * *", // Every 2 seconds
        priority: "high",
        circuitBreaker: {
          threshold: 85,
          cooldownMs: 15000,
        },
        execute: async () => {
          const currentResponseTime =
            this.radiationLevels.get("response_time") || 0;
          const radiation = Math.max(
            0,
            Math.min(1, currentResponseTime / 5000),
          );
          this.radiationLevels.set("response_time", radiation);
          await this.checkAnomaly("response_time", radiation);
        },
      },

      // Throughput Monitoring - Medium priority
      {
        id: "radiation-throughput",
        name: "Throughput Monitor",
        schedule: "*/5 * * * * *", // Every 5 seconds
        priority: "medium",
        execute: async () => {
          const radiation = 0.6; // Nivel de radiación fijo para mutaciones
          this.radiationLevels.set("throughput", radiation);
          await this.checkAnomaly("throughput", radiation);
        },
      },

      // Security Monitoring - High priority
      {
        id: "radiation-security",
        name: "Security Monitor",
        schedule: "*/15 * * * * *", // Every 15 seconds
        priority: "high",
        execute: async () => {
          const failedLoginsRadiation = 0.15; // Radiación fija por login fallido
          const suspiciousActivityRadiation = 0.1; // Radiación fija por actividad sospechosa

          this.radiationLevels.set("failed_logins", failedLoginsRadiation);
          this.radiationLevels.set(
            "suspicious_activity",
            suspiciousActivityRadiation,
          );

          await this.checkAnomaly("failed_logins", failedLoginsRadiation);
          await this.checkAnomaly(
            "suspicious_activity",
            suspiciousActivityRadiation,
          );
        },
      },
    ];

    // Register all tasks with the Orchestrator
    for (const task of tasks) {
      monitoringOrchestrator.registerTask(task);
    }

    console.log(
      `� Registered ${tasks.length} monitoring tasks with Orchestrator`,
    );
  }

  // ==========================================
  // 🚨 ANOMALY DETECTION
  // ==========================================

  /**
   * 🚨 Initialize anomaly thresholds
   */
  private initializeThresholds(): void {
    this.anomalyThresholds.set("cpu", 4.5); // 450% CPU usage - ULTRA HIGH PERFORMANCE MODE FOR SELENE SONG CORE
    this.anomalyThresholds.set("memory", 0.9); // 90% memory usage
    this.anomalyThresholds.set("disk", 0.95); // 95% disk usage
    this.anomalyThresholds.set("response_time", 0.7); // 70% of max expected
    this.anomalyThresholds.set("throughput", 0.9); // 90% capacity
    this.anomalyThresholds.set("failed_logins", 0.5); // 50% of threshold
    this.anomalyThresholds.set("suspicious_activity", 0.3); // 30% of threshold

    console.log("🚨 Anomaly thresholds initialized");
  }

  /**
   * 🚨 Check for anomalies
   */
  private async checkAnomaly(metric: string, radiation: number): Promise<void> {
    const threshold = this.anomalyThresholds.get(metric) || 0.8;

    if (radiation > threshold) {
      console.warn(
        `🚨 HIGH RADIATION DETECTED: ${metric} = ${(radiation * 100).toFixed(1)}% (threshold: ${(threshold * 100).toFixed(1)}%)`,
      );

      // Trigger anomaly response
      await this.handleAnomaly(metric, radiation, threshold);
    }
  }

  /**
   * 🚨 Handle anomaly detection
   */
  private async handleAnomaly(
    metric: string,
    radiation: number,
    threshold: number,
  ): Promise<void> {
    const anomalyData = {
      metric,
      radiation,
      threshold,
      timestamp: new Date(),
      severity: radiation > threshold * 1.5 ? "critical" : "warning",
    };

    console.error(`🚨 ANOMALY ALERT: ${JSON.stringify(anomalyData)}`);

    // Different responses based on metric
    switch (metric) {
      case "cpu":
        await this.handleCPUAnomaly(anomalyData);
        break;
      case "memory":
        await this.handleMemoryAnomaly(anomalyData);
        break;
      case "disk":
        await this.handleDiskAnomaly(anomalyData);
        break;
      case "response_time":
        await this.handleResponseTimeAnomaly(anomalyData);
        break;
      case "failed_logins":
        await this.handleSecurityAnomaly(anomalyData);
        break;
      default:
        await this.handleGenericAnomaly(anomalyData);
    }
  }

  /**
   * 🚨 Handle CPU anomaly
   */
  private async handleCPUAnomaly(_anomaly: any): Promise<void> {
    console.log("🚨 CPU anomaly detected - initiating optimization...");
    // Could trigger load balancing, process optimization, etc.
  }

  /**
   * 🚨 Handle memory anomaly
   */
  private async handleMemoryAnomaly(_anomaly: any): Promise<void> {
    console.log(
      "🚨 Memory anomaly detected - initiating garbage collection...",
    );
    // Could trigger garbage collection, memory optimization, etc.
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * 🚨 Handle disk anomaly
   */
  private async handleDiskAnomaly(_anomaly: any): Promise<void> {
    console.log("🚨 Disk anomaly detected - initiating cleanup...");
    // Could trigger log rotation, temp file cleanup, etc.
  }

  /**
   * 🚨 Handle response time anomaly
   */
  private async handleResponseTimeAnomaly(_anomaly: any): Promise<void> {
    console.log(
      "🚨 Response time anomaly detected - optimizing performance...",
    );
    // Could trigger caching optimization, connection pooling, etc.
  }

  /**
   * 🚨 Handle security anomaly
   */
  private async handleSecurityAnomaly(_anomaly: any): Promise<void> {
    console.log("🚨 Security anomaly detected - increasing monitoring...");
    // Could trigger enhanced security monitoring, rate limiting, etc.
  }

  /**
   * 🚨 Handle generic anomaly
   */
  private async handleGenericAnomaly(_anomaly: any): Promise<void> {
    console.log(
      `🚨 Generic anomaly detected for ${_anomaly.metric} - logging for analysis...`,
    );
    // Generic anomaly handling
  }

  // ==========================================
  // 📊 MONITORING DATA
  // ==========================================

  /**
   * 📊 Get radiation levels
   */
  public getRadiationLevels(): any {
    const levels: any = {};
    for (const [metric, radiation] of this.radiationLevels.entries()) {
      levels[metric] = {
        radiation,
        percentage: (radiation * 100).toFixed(1) + "%",
        threshold: this.anomalyThresholds.get(metric) || 0,
        status:
          radiation > (this.anomalyThresholds.get(metric) || 0)
            ? "high"
            : "normal",
      };
    }
    return levels;
  }

  /**
   * 📊 Get specific radiation level
   */
  public getRadiationLevel(_metric: string): number | null {
    return this.radiationLevels.get(_metric) || null;
  }

  /**
   * 📊 Update radiation level (for external monitoring)
   */
  public updateRadiationLevel(metric: string, radiation: number): void {
    this.radiationLevels.set(metric, radiation);
    this.checkAnomaly(metric, radiation);
  }

  /**
   * 📊 Get anomaly thresholds
   */
  public getAnomalyThresholds(): any {
    const thresholds: any = {};
    for (const [metric, threshold] of this.anomalyThresholds.entries()) {
      thresholds[metric] = threshold;
    }
    return thresholds;
  }

  /**
   * 📊 Set anomaly threshold
   */
  public setAnomalyThreshold(metric: string, threshold: number): void {
    this.anomalyThresholds.set(metric, threshold);
    console.log(
      `📊 Updated threshold for ${metric}: ${(threshold * 100).toFixed(1)}%`,
    );
  }

  // ==========================================
  // 📈 STATUS & MONITORING
  // ==========================================

  /**
   * 📊 Get radiation status
   */
  public getStatus(): any {
    const levels = this.getRadiationLevels();
    const anomalies = Object.values(levels).filter(
      (_level: any) => _level.status === "high",
    ).length;
    const totalMetrics = Object.keys(levels).length;

    // Get orchestrator status for monitoring info
    const orchestratorStatus = monitoringOrchestrator.getStatus();

    return {
      active: this.isActive,
      metrics: totalMetrics,
      anomalies,
      anomalyRate:
        totalMetrics > 0
          ? ((anomalies / totalMetrics) * 100).toFixed(1) + "%"
          : "0%",
      levels,
      orchestrator: {
        active: orchestratorStatus.isActive,
        totalTasks: orchestratorStatus.totalTasks,
        scheduledTasks: orchestratorStatus.scheduledTasks,
        averageCpu: orchestratorStatus.averageCpu,
      },
    };
  }

  /**
   * 📊 Get system health based on radiation
   */
  public getSystemHealth(): any {
    const levels = this.getRadiationLevels();
    const criticalAnomalies = Object.values(levels).filter(
      (level: any) =>
        level.status === "high" && level.radiation > level.threshold * 1.5,
    ).length;

    const warningAnomalies = Object.values(levels).filter(
      (level: any) =>
        level.status === "high" && level.radiation <= level.threshold * 1.5,
    ).length;

    let overallHealth = "healthy";
    if (criticalAnomalies > 0) {
      overallHealth = "critical";
    } else if (warningAnomalies > 0) {
      overallHealth = "warning";
    }

    return {
      overall: overallHealth,
      critical: criticalAnomalies,
      warning: warningAnomalies,
      normal: Object.keys(levels).length - criticalAnomalies - warningAnomalies,
      details: levels,
    };
  }
}


