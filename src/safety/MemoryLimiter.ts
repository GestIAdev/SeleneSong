/**
 * 🧠 LIMITADOR DE MEMORIA - CONTROL DE RECURSOS
 * "La conciencia conoce sus límites"
 */


export interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

export class MemoryLimiter {
  private memoryLimit: number;
  private warningThreshold: number = 0.8; // 80%

  constructor(memoryLimitMB: number = 512) {
    this.memoryLimit = memoryLimitMB * 1024 * 1024; // Convertir a bytes
  }

  /**
   * 📊 OBTIENE ESTADÍSTICAS ACTUALES DE MEMORIA
   */
  getMemoryStats(): MemoryStats {
    const memUsage = process.memoryUsage();
    const used = memUsage.heapUsed;
    const total = memUsage.heapTotal;
    const percentage = used / this.memoryLimit;

    return {
      used,
      total,
      limit: this.memoryLimit,
      percentage
    };
  }

  /**
   * ⚠️ VERIFICA SI SE ALCANZÓ EL LÍMITE DE MEMORIA
   */
  isLimitReached(): boolean {
    const stats = this.getMemoryStats();
    return stats.used >= this.memoryLimit;
  }

  /**
   * 🚨 VERIFICA SI SE ALCANZÓ EL UMBRAL DE ADVERTENCIA
   */
  isWarningThresholdReached(): boolean {
    const stats = this.getMemoryStats();
    return stats.percentage >= this.warningThreshold;
  }

  /**
   * 🛑 VERIFICA SI SE PUEDE CONTINUAR UNA OPERACIÓN
   */
  canContinue(): boolean {
    return !this.isLimitReached();
  }

  /**
   * 📈 MONITOREA EL USO DE MEMORIA DURANTE UNA OPERACIÓN
   */
  async monitorOperation<T>(
    operation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    const beforeStats = this.getMemoryStats();

    try {
      const result = await operation();
      const afterStats = this.getMemoryStats();

      const memoryDelta = afterStats.used - beforeStats.used;
      if (memoryDelta > 0) {
        console.log(`📈 ${operationName} increased memory usage by ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);
      }

      return result;
    } catch (error) {
      const afterStats = this.getMemoryStats();
      console.error(`💥 ${operationName} failed. Memory usage: ${(afterStats.used / 1024 / 1024).toFixed(2)} MB`);
      throw error;
    }
  }

  /**
   * 🔄 LIBERA MEMORIA FORZANDO RECOLECCIÓN DE BASURA
   */
  forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
    } else {
      console.warn('⚠️ Garbage collection not available. Run with --expose-gc flag.');
    }
  }

  /**
   * 📊 REPORTE DETALLADO DE MEMORIA
   */
  getDetailedReport(): string {
    const stats = this.getMemoryStats();
    const warning = this.isWarningThresholdReached();
    const critical = this.isLimitReached();

    return `
🧠 MEMORY REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Used:     ${(stats.used / 1024 / 1024).toFixed(2)} MB
Total:    ${(stats.total / 1024 / 1024).toFixed(2)} MB
Limit:    ${(stats.limit / 1024 / 1024).toFixed(2)} MB
Usage:    ${(stats.percentage * 100).toFixed(1)}%
Status:   ${critical ? '🚨 CRITICAL' : warning ? '⚠️ WARNING' : '✅ OK'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
}


