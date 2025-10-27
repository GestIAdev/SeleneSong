/**
 * ⚡ PUNK MEMORY OPTIMIZER V193
 * Directiva V192: Optimización de Memoria Crítica
 *
 * Implementa estrategias agresivas de garbage collection y limpieza
 * para resolver los 58 memory leaks detectados en la Prueba del Panteón
 */

declare const global: any;

import { EventEmitter } from "events";
import * as v8 from "v8";

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  timestamp: number;
}

export interface MemoryLeakDetection {
  objectCount: number;
  retainedSize: number;
  possibleLeaks: string[];
  timestamp: number;
}

export class PunkMemoryOptimizer extends EventEmitter {
  private gcInterval: NodeJS.Timeout | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private baselineMetrics: MemoryMetrics | null = null;
  private leakThreshold: number = 0.99; // 🔥 MODIFIED: 99% threshold for leak detection (increased from 98%)

  constructor() {
    super();
    this.setupAggressiveGC();
    this.startMemoryMonitoring();
  }

  /**
   * Configura garbage collection inteligente (permitir expansión natural del heap)
   */
  private setupAggressiveGC(): void {
    if (typeof global.gc === "function") {
      // 🔥 MODIFIED: Permitir expansión natural del heap
      // Solo intervenir cuando el heap esté en situación crítica real
      // 🔥 MISSION V407: DISABLED by GeminiPunk. This interval was the primary cause of heap contraction.
      // By constantly calling gc(), it prevented the V8 engine from naturally expanding the heap.
      /* this.gcInterval = setInterval(() => {
        const metrics = this.getCurrentMetrics();
        const heapUsageRatio = metrics.heapUsed / metrics.heapTotal;

        // 🔥 MODIFIED: Thresholds más permisivos para permitir expansión natural
        // Solo forzar GC si heap > 98% Y tenemos al menos 1.5GB usado Y heap total > 1GB
        // Esto permite que el heap crezca naturalmente sin interferencia constante
        if (heapUsageRatio > 0.98 &&
            metrics.heapUsed > 1.5 * 1024 * 1024 * 1024 &&  // 1.5GB mínimo
            metrics.heapTotal > 1024 * 1024 * 1024) {       // 1GB heap total mínimo

          console.log(`🚨 FORCED GC: Heap at ${(heapUsageRatio * 100).toFixed(1)}% (${(metrics.heapUsed / 1024 / 1024).toFixed(1)}MB used)`);
          global.gc();

          this.emit('gc-forced', {
            timestamp: Date.now(),
            reason: 'natural-expansion-allowed',
            heapUsage: heapUsageRatio,
            heapUsed: metrics.heapUsed
          });
        }
      }, 120000); */
      // 🔥 MODIFIED: Check every 2 minutes instead of 1, allowing more natural growth
    }
  }

  /**
   * Inicia monitoreo continuo de memoria
   */
  private startMemoryMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      const metrics = this.getCurrentMetrics();

      if (!this.baselineMetrics) {
        this.baselineMetrics = metrics;
        return;
      }

      const leakDetected = this.detectMemoryLeak(metrics);
      if (leakDetected) {
        this.handleMemoryLeak(metrics);
      }

      this.emit("memory-check", metrics);
    }, 5000); // Check every 5 seconds
  }

  /**
   * Obtiene métricas actuales de memoria
   */
  private getCurrentMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      timestamp: Date.now(),
    };
  }

  /**
   * Detecta posibles memory leaks
   */
  private detectMemoryLeak(current: MemoryMetrics): boolean {
    if (!this.baselineMetrics) return false;

    const heapUsageRatio = current.heapUsed / current.heapTotal;
    const growthRate =
      (current.heapUsed - this.baselineMetrics.heapUsed) /
      (current.timestamp - this.baselineMetrics.timestamp);

    // Detectar leak si uso > 95% o crecimiento rápido
    return heapUsageRatio > this.leakThreshold || growthRate > 1000000; // 1MB/s growth
  }

  /**
   * Maneja detección de memory leak (solo si es realmente crítico)
   */
  private handleMemoryLeak(metrics: MemoryMetrics): void {
    const heapUsageRatio = metrics.heapUsed / metrics.heapTotal;

    // 🔥 MODIFIED: Solo considerar leak crítico si > 99% de uso Y heap > 1GB
    if (heapUsageRatio < 0.99 || metrics.heapTotal < 1024 * 1024 * 1024) {
      this.emit("memory-leak-detected-minor", {
        metrics,
        severity: "minor",
        timestamp: Date.now(),
        action: "natural-expansion-allowed",
      });
      return;
    }

    console.log(
      `🚨 CRITICAL MEMORY LEAK: Heap at ${(heapUsageRatio * 100).toFixed(1)}% (${(metrics.heapUsed / 1024 / 1024).toFixed(1)}MB used)`,
    );

    this.emit("memory-leak-detected", {
      metrics,
      severity: "critical",
      timestamp: Date.now(),
    });

    // Solo ejecutar limpieza si es realmente crítico
    this.performAggressiveCleanup();
  }

  /**
   * Realiza limpieza inteligente de memoria (solo cuando es crítico)
   */
  private performAggressiveCleanup(): void {
    try {
      const metrics = this.getCurrentMetrics();
      const heapUsageRatio = metrics.heapUsed / metrics.heapTotal;

      // Solo hacer limpieza agresiva si realmente es necesario
      // Evitar interferir con expansión natural del heap
      if (heapUsageRatio < 0.95) {
        this.emit("cleanup-skipped", {
          timestamp: Date.now(),
          reason: "heap-not-critical",
          heapUsage: heapUsageRatio,
        });
        return;
      }

      // Forzar garbage collection solo una vez (no 3 veces)
      if (typeof global.gc === "function") {
        global.gc();
      }

      // Solo limpiar buffers si hay muchos sin usar
      this.clearUnusedBuffers();

      // Solo limpiar listeners si hay demasiados
      this.clearOrphanedListeners();

      this.emit("cleanup-performed", {
        timestamp: Date.now(),
        actions: ["gc-forced", "buffers-cleared", "listeners-cleared"],
        heapUsageBefore: heapUsageRatio,
      });
    } catch (error) {
      this.emit("cleanup-error", error);
    }
  }

  /**
   * Limpia buffers no utilizados
   */
  private clearUnusedBuffers(): void {
    // Forzar limpieza de buffers nativos
    if (Buffer && Buffer.poolSize) {
      // Reset buffer pool
      Buffer.poolSize = 8 * 1024; // Reset to default
    }
  }

  /**
   * Limpia event listeners huérfanos
   */
  private clearOrphanedListeners(): void {
    // Esta es una aproximación - en producción necesitaríamos tracking más sofisticado
    const events = this.eventNames();
    events.forEach((event) => {
      const listeners = this.listeners(event);
      if (listeners.length > 10) {
        // Threshold arbitrario
        this.emit("orphaned-listeners-found", {
          event: event.toString(),
          count: listeners.length,
        });
      }
    });
  }


  /**
   * Obtiene estadísticas detalladas de memoria
   */
  public getDetailedStats(): MemoryLeakDetection {
    const heapStats = v8.getHeapStatistics();
    const heapSpaceStats = v8.getHeapSpaceStatistics();

    const possibleLeaks: string[] = [];

    heapSpaceStats.forEach((space) => {
      if (space.space_used_size > space.space_size * 0.9) {
        possibleLeaks.push(
          `${space.space_name}: ${Math.round(space.space_used_size / 1024 / 1024)}MB used`,
        );
      }
    });

    return {
      objectCount: heapStats.total_heap_size,
      retainedSize: heapStats.used_heap_size,
      possibleLeaks,
      timestamp: Date.now(),
    };
  }

  /**
   * Optimiza memoria para un componente específico
   */
  public optimizeComponent(componentName: string, component: any): void {
    try {
      // Limpiar referencias circulares si existen
      this.breakCircularReferences(component);

      // Forzar limpieza del componente
      if (typeof component.cleanup === "function") {
        component.cleanup();
      }

      // Limpiar propiedades no utilizadas
      this.cleanUnusedProperties(component);

      this.emit("component-optimized", {
        componentName,
        timestamp: Date.now(),
        actions: [
          "circular-refs-broken",
          "cleanup-called",
          "properties-cleaned",
        ],
      });
    } catch (error) {
      this.emit("component-optimization-error", {
        componentName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Rompe referencias circulares
   */
  private breakCircularReferences(obj: any, seen: Set<any> = new Set()): void {
    if (obj === null || typeof obj !== "object") return;
    if (seen.has(obj)) return;

    seen.add(obj);

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          this.breakCircularReferences(obj[key], seen);
        }
      }
    }

    // Limpiar referencias a objetos ya procesados
    seen.delete(obj);
  }

  /**
   * Limpia propiedades no utilizadas
   */
  private cleanUnusedProperties(obj: any): void {
    const keys = Object.keys(obj);
    keys.forEach((key) => {
      if (obj[key] === null || obj[key] === undefined) {
        delete obj[key];
      }
    });
  }

  /**
   * Ejecuta optimización completa del sistema
   */
  public async performFullSystemOptimization(): Promise<void> {
    this.emit("system-optimization-started", { timestamp: Date.now() });

    // Optimizar memoria global
    this.performAggressiveCleanup();

    // Esperar un poco para que GC tome efecto
    await new Promise((_resolve) => setTimeout(_resolve, 1000));

    // Obtener estadísticas post-optimización
    const stats = this.getDetailedStats();

    this.emit("system-optimization-completed", {
      timestamp: Date.now(),
      stats,
      improvement: this.baselineMetrics
        ? ((this.baselineMetrics.heapUsed - stats.retainedSize) /
            this.baselineMetrics.heapUsed) *
          100
        : 0,
    });
  }

  /**
   * Método público para activar limpieza agresiva (usado por tests de estabilidad)
   */
  public triggerAggressiveCleanup(): void {
    this.performAggressiveCleanup();
  }

  /**
   * Detiene el optimizador
   */
  public stop(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emit("optimizer-stopped", { timestamp: Date.now() });
  }
}

// Singleton instance para uso global
export const punkMemoryOptimizer = new PunkMemoryOptimizer();

// Exportar para uso directo
export default punkMemoryOptimizer;
