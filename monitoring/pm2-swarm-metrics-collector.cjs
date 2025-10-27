/**
 * 🚀 PM2 SWARM METRICS COLLECTOR
 * TRACK 4: PM2 Integration for Real Swarm Metrics
 *
 * Collects real-time metrics from PM2-managed Selene processes:
 * - %CPU usage across all swarm nodes
 * - %HEAP memory usage per process
 * - Event Loop Latency measurements
 * - Latency P95 calculations
 * - Process health and status
 */

const pm2 = require('pm2');

class PM2SwarmMetricsCollector {
  constructor(options = {}) {
    this.swarmProcessNames = options.swarmProcessNames || [
      'selene-node-1',
      'selene-node-2',
      'selene-node-3',
      'apollo-load-balancer'
    ];
    this.updateInterval = options.updateInterval || 2000; // 2 seconds
    this.maxLatencySamples = options.maxLatencySamples || 100;
    this.latencySamples = [];
    this.isConnected = false;
    this.metrics = {
      cpu: { total: 0, average: 0, processes: {} },
      memory: { total: 0, average: 0, processes: {} },
      eventLoop: { latency: 0, p95: 0, status: 'unknown' },
      processes: {},
      health: { overall: 'unknown', issues: [] }
    };
  }

  /**
   * Connect to PM2 and start collecting metrics
   */
  async connect() {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          console.error('❌ Failed to connect to PM2:', err);
          reject(err);
          return;
        }

        console.log('🔗 Connected to PM2 for swarm metrics collection');
        this.isConnected = true;

        // Start metrics collection
        this.startMetricsCollection();
        resolve();
      });
    });
  }

  /**
   * Start periodic metrics collection
   */
  startMetricsCollection() {
    this.collectionInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error('❌ Error collecting PM2 metrics:', error);
      }
    }, this.updateInterval);
  }

  /**
   * Collect comprehensive metrics from all swarm processes
   */
  async collectMetrics() {
    try {
      // Get process list from PM2
      const processes = await this.getProcessList();

      // Filter to only swarm processes
      const swarmProcesses = processes.filter(proc =>
        this.swarmProcessNames.includes(proc.name)
      );

      if (swarmProcesses.length === 0) {
        console.warn('⚠️ No swarm processes found in PM2');
        return;
      }

      // Calculate aggregate metrics
      await this.calculateAggregateMetrics(swarmProcesses);

      // Measure event loop latency
      this.measureEventLoopLatency();

      // Update health status
      this.updateHealthStatus(swarmProcesses);

    } catch (error) {
      console.error('❌ Error in metrics collection:', error);
    }
  }

  /**
   * Get process list from PM2
   */
  getProcessList() {
    return new Promise((resolve, reject) => {
      pm2.list((err, processList) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(processList);
      });
    });
  }

  /**
   * Calculate aggregate CPU, memory, and other metrics
   */
  async calculateAggregateMetrics(processes) {
    let totalCpu = 0;
    let totalMemory = 0;
    const processMetrics = {};

    for (const proc of processes) {
      const procName = proc.name;

      // CPU usage (monit.cpu from PM2)
      const cpuUsage = proc.monit ? proc.monit.cpu : 0;
      totalCpu += cpuUsage;

      // Memory usage in MB and percentage
      const memoryMB = proc.monit ? Math.round(proc.monit.memory / 1024 / 1024) : 0;
      const memoryPercent = this.calculateMemoryPercentage(proc);

      totalMemory += memoryMB;

      // Store individual process metrics
      processMetrics[procName] = {
        cpu: cpuUsage,
        memoryMB: memoryMB,
        memoryPercent: memoryPercent,
        status: proc.pm2_env ? proc.pm2_env.status : 'unknown',
        pid: proc.pid,
        uptime: proc.pm2_env ? proc.pm2_env.pm_uptime : null,
        restarts: proc.pm2_env ? proc.pm2_env.restart_time : 0
      };
    }

    // Calculate averages
    const avgCpu = processes.length > 0 ? totalCpu / processes.length : 0;
    const avgMemory = processes.length > 0 ? totalMemory / processes.length : 0;

    // Update metrics object
    this.metrics.cpu = {
      total: totalCpu,
      average: avgCpu,
      processes: processMetrics
    };

    this.metrics.memory = {
      total: totalMemory,
      average: avgMemory,
      processes: processMetrics
    };

    this.metrics.processes = processMetrics;
  }

  /**
   * Calculate memory percentage for a process
   */
  calculateMemoryPercentage(proc) {
    if (!proc.monit || !proc.monit.memory) return 0;

    // Get total system memory (this is approximate)
    const os = require('os');
    const totalSystemMemory = os.totalmem();
    const processMemory = proc.monit.memory;

    return Math.round((processMemory / totalSystemMemory) * 100 * 100) / 100; // Round to 2 decimals
  }

  /**
   * Measure event loop latency across swarm
   */
  measureEventLoopLatency() {
    const start = performance.now();

    // Use setImmediate to measure event loop delay
    setImmediate(() => {
      const latency = performance.now() - start;

      // Store latency sample
      this.latencySamples.push(latency);
      if (this.latencySamples.length > this.maxLatencySamples) {
        this.latencySamples.shift(); // Keep only recent samples
      }

      // Calculate current latency and P95
      const currentLatency = latency;
      const p95Latency = this.calculateP95(this.latencySamples);

      // Update metrics
      this.metrics.eventLoop = {
        latency: Math.round(currentLatency * 100) / 100, // Round to 2 decimals
        p95: Math.round(p95Latency * 100) / 100,
        status: this.getLatencyStatus(currentLatency)
      };
    });
  }

  /**
   * Calculate P95 latency from samples
   */
  calculateP95(samples) {
    if (samples.length === 0) return 0;

    const sorted = [...samples].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  /**
   * Get latency status based on current latency
   */
  getLatencyStatus(latency) {
    if (latency < 10) return 'excellent';
    if (latency < 25) return 'good';
    if (latency < 50) return 'warning';
    return 'critical';
  }

  /**
   * Update overall health status
   */
  updateHealthStatus(processes) {
    const issues = [];
    let overallHealth = 'healthy';

    // Check process statuses
    const runningProcesses = processes.filter(p =>
      p.pm2_env && p.pm2_env.status === 'online'
    );

    if (runningProcesses.length < processes.length) {
      issues.push(`${processes.length - runningProcesses.length} processes not running`);
      overallHealth = 'degraded';
    }

    // Check high CPU usage
    const highCpuProcesses = processes.filter(p =>
      p.monit && p.monit.cpu > 80
    );

    if (highCpuProcesses.length > 0) {
      issues.push(`${highCpuProcesses.length} processes with high CPU usage`);
      if (overallHealth === 'healthy') overallHealth = 'warning';
    }

    // Check high memory usage
    const highMemoryProcesses = processes.filter(p =>
      this.calculateMemoryPercentage(p) > 80
    );

    if (highMemoryProcesses.length > 0) {
      issues.push(`${highMemoryProcesses.length} processes with high memory usage`);
      if (overallHealth === 'healthy') overallHealth = 'warning';
    }

    // Check event loop latency
    if (this.metrics.eventLoop.status === 'critical') {
      issues.push('Critical event loop latency detected');
      overallHealth = 'critical';
    } else if (this.metrics.eventLoop.status === 'warning' && overallHealth === 'healthy') {
      overallHealth = 'warning';
    }

    this.metrics.health = {
      overall: overallHealth,
      issues: issues
    };
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      swarmProcessCount: Object.keys(this.metrics.processes).length
    };
  }

  /**
   * Get detailed process metrics
   */
  getProcessMetrics() {
    return {
      processes: this.metrics.processes,
      summary: {
        totalCpu: this.metrics.cpu.total,
        averageCpu: this.metrics.cpu.average,
        totalMemoryMB: this.metrics.memory.total,
        averageMemoryMB: this.metrics.memory.average,
        eventLoopLatency: this.metrics.eventLoop.latency,
        eventLoopP95: this.metrics.eventLoop.p95,
        healthStatus: this.metrics.health.overall,
        activeProcesses: Object.values(this.metrics.processes).filter(p => p.status === 'online').length,
        totalProcesses: Object.keys(this.metrics.processes).length
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get current swarm metrics
   */
  async getSwarmMetrics() {
    if (!this.isConnected) {
      throw new Error('PM2 collector not connected');
    }

    // Ensure we have fresh metrics
    await this.collectMetrics();

    return {
      swarmCpuUsage: this.metrics.cpu.average,
      swarmHeapUsage: this.metrics.memory.average,
      eventLoopP95: this.metrics.eventLoop.p95,
      processes: Object.values(this.metrics.processes),
      healthStatus: this.metrics.health,
      timestamp: Date.now()
    };
  }

  /**
   * Disconnect from PM2
   */
  async disconnect() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    return new Promise((resolve) => {
      pm2.disconnect(() => {
        console.log('🔌 Disconnected from PM2');
        this.isConnected = false;
        resolve();
      });
    });
  }

  /**
   * Force refresh metrics
   */
  async refresh() {
    await this.collectMetrics();
  }
}

module.exports = PM2SwarmMetricsCollector;