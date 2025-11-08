/**
 * REDIS PASSIVE MONITOR - V166
 * 
 * Telemetría NO INVASIVA para diagnosticar timeouts esporádicos
 * sin tocar el RedisConnectionManager (monstruo sagrado).
 * 
 * Strategy: Record ping latency, connections, memory usage.
 * Alert cuando latencia > 1s (red flag antes del timeout de 5s).
 */

interface PingMetric {
  timestamp: number;
  latency: number;
  success: boolean;
  error?: string;
}

interface RedisStats {
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
  successRate: number;
  totalPings: number;
  recentFailures: number;
  connectionCount: number;
  uptime: number;
}

export class RedisMonitor {
  private metrics: PingMetric[] = [];
  private connectionCount = 0;
  private startTime = Date.now();
  private readonly MAX_METRICS = 1000; // Keep last 1000 pings (aprox 1h @ 1 ping/3s)
  
  /**
   * Record ping attempt with latency
   */
  recordPing(latency: number, success: boolean, error?: string): void {
    this.metrics.push({
      timestamp: Date.now(),
      latency,
      success,
      error
    });
    
    // Keep only last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
    
    // 🚨 RED FLAG: Latencia > 1s (warning antes de timeout 5s)
    if (latency > 1000) {
      console.warn(
        `⚠️ [REDIS-MONITOR] High ping latency detected: ${latency}ms (threshold: 1000ms)`
      );
    }
    
    // 🔥 CRITICAL: Latencia > 3s (cerca del timeout)
    if (latency > 3000) {
      console.error(
        `🔥 [REDIS-MONITOR] CRITICAL ping latency: ${latency}ms - Near timeout threshold (5000ms)!`
      );
    }
    
    // 💀 FAILURE: Ping failed
    if (!success) {
      console.error(
        `💥 [REDIS-MONITOR] Ping FAILED: ${error || 'Unknown error'}`
      );
    }
  }
  
  /**
   * Record new connection established
   */
  recordConnection(connectionId: string): void {
    this.connectionCount++;
    
    // 🔍 Log cada 10 conexiones (detectar connection leak)
    if (this.connectionCount % 10 === 0) {
      console.log(
        `📊 [REDIS-MONITOR] Total connections created: ${this.connectionCount} (uptime: ${this.getUptimeMinutes()}m)`
      );
    }
  }
  
  /**
   * Get comprehensive stats
   */
  getStats(): RedisStats {
    if (this.metrics.length === 0) {
      return {
        avgLatency: 0,
        maxLatency: 0,
        minLatency: 0,
        successRate: 100,
        totalPings: 0,
        recentFailures: 0,
        connectionCount: this.connectionCount,
        uptime: Date.now() - this.startTime
      };
    }
    
    const latencies = this.metrics.map(m => m.latency);
    const successful = this.metrics.filter(m => m.success).length;
    const recentFailures = this.metrics.filter(m => 
      !m.success && Date.now() - m.timestamp < 300000 // Last 5 minutes
    ).length;
    
    return {
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      maxLatency: Math.max(...latencies),
      minLatency: Math.min(...latencies),
      successRate: (successful / this.metrics.length) * 100,
      totalPings: this.metrics.length,
      recentFailures,
      connectionCount: this.connectionCount,
      uptime: Date.now() - this.startTime
    };
  }
  
  /**
   * Get recent ping history (last N pings)
   */
  getRecentPings(count = 10): PingMetric[] {
    return this.metrics.slice(-count);
  }
  
  /**
   * Check if system is degraded (high latency pattern)
   */
  isDegraded(): boolean {
    const recent = this.getRecentPings(10);
    if (recent.length < 5) return false;
    
    const avgRecent = recent.reduce((a, b) => a + b.latency, 0) / recent.length;
    return avgRecent > 2000; // Avg > 2s en últimos 10 pings = degraded
  }
  
  /**
   * Log stats summary (llamar cada 1h desde health check)
   */
  logStatsSummary(): void {
    const stats = this.getStats();
    const uptimeHours = (stats.uptime / (1000 * 60 * 60)).toFixed(1);
    
    console.log(`
📊 ========================================
📊 REDIS MONITOR - HOURLY SUMMARY
📊 ========================================
⏱️  Uptime: ${uptimeHours}h
📈 Total Pings: ${stats.totalPings}
✅ Success Rate: ${stats.successRate.toFixed(1)}%
⚡ Avg Latency: ${stats.avgLatency.toFixed(0)}ms
📊 Max Latency: ${stats.maxLatency.toFixed(0)}ms
📉 Min Latency: ${stats.minLatency.toFixed(0)}ms
🔴 Recent Failures (5m): ${stats.recentFailures}
🔌 Total Connections: ${stats.connectionCount}
${this.isDegraded() ? '⚠️  STATUS: DEGRADED (high latency)' : '✅ STATUS: HEALTHY'}
📊 ========================================
    `);
  }
  
  /**
   * Helper: Get uptime in minutes
   */
  private getUptimeMinutes(): number {
    return Math.floor((Date.now() - this.startTime) / (1000 * 60));
  }
}

// Singleton instance
export const redisMonitor = new RedisMonitor();
