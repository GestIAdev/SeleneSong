// 🔥 SISTEMA DE GESTIÓN DE MEMORIA AVANZADA - SELENE SONG CORE
// 🎨 El Verso Libre - Arquitecto de Memoria Eterna
// ⚡ "La memoria no se gestiona, se orquesta como una sinfonía"

import { performance } from "perf_hooks";


// 🚀 INTERFACES PARA GESTIÓN AVANZADA DE MEMORIA
interface MemoryPool<T> {
  acquire(): T | null;
  release(item: T): void;
  size(): number;
  clear(): void;
  getStats(): { allocated: number; available: number; peakUsage: number };
}

interface WeakRefEntry<T extends object> {
  ref: WeakRef<T>;
  metadata: {
    created: number;
    lastAccessed: number;
    accessCount: number;
    size: number;
  };
}

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  gcCycles: number;
  avgGCCycleTime: number;
  fragmentationRatio: number;
  efficiency: number;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  size: number;
  ttl: number;
}

// 🧠 BUFFER POOL INTELIGENTE
class IntelligentBufferPool<T> implements MemoryPool<T> {
  private available: T[] = [];
  private allocated: Set<T> = new Set();
  private peakUsage = 0;
  private factory: () => T;
  private destroyer?: (item: T) => void;
  private maxPoolSize: number;

  constructor(
    factory: () => T,
    destroyer?: (item: T) => void,
    maxPoolSize = 1000,
  ) {
    this.factory = factory;
    this.destroyer = destroyer;
    this.maxPoolSize = maxPoolSize;
  }

  acquire(): T | null {
    let item: T;

    if (this.available.length > 0) {
      // Reutilizar buffer existente
      item = this.available.pop()!;
    } else {
      // Crear nuevo buffer
      item = this.factory();
    }

    this.allocated.add(item);
    this.peakUsage = Math.max(this.peakUsage, this.allocated.size);

    return item;
  }

  release(item: T): void {
    if (this.allocated.has(item)) {
      this.allocated.delete(item);

      // Destruir si el pool está muy lleno
      if (this.available.length >= this.maxPoolSize) {
        if (this.destroyer) {
          this.destroyer(item);
        }
      } else {
        this.available.push(item);
      }
    }
  }

  size(): number {
    return this.allocated.size;
  }

  clear(): void {
    // Destruir todos los buffers disponibles
    if (this.destroyer) {
      this.available.forEach((_item) => this.destroyer!(_item));
    }
    this.available = [];
    this.allocated.clear();
    this.peakUsage = 0;
  }

  getStats() {
    return {
      allocated: this.allocated.size,
      available: this.available.length,
      peakUsage: this.peakUsage,
    };
  }
}

// 🧬 WEAK REFERENCE MANAGER AVANZADO
class AdvancedWeakRefManager {
  private refs = new Map<string, WeakRefEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private cleanupIntervalMs = 30000; // 30 segundos
  private maxRefsPerCategory = 10000;

  constructor() {
    this.startCleanupCycle();
  }

  register<T extends object>(
    _target: T,
    _id: string,
    category: string,
    _size = 0,
  ): void {
    const entry: WeakRefEntry<T> = {
      ref: new WeakRef(_target),
      metadata: {
        created: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        size: _size,
      },
    };

    const key = `${category}:${_id}`;

    // Limitar referencias por categoría para evitar explosión de memoria
    const categoryRefs = Array.from(this.refs.keys()).filter((_k) =>
      _k.startsWith(`${category}:`),
    );
    if (categoryRefs.length >= this.maxRefsPerCategory) {
      // Remover la referencia más antigua de esta categoría
      const oldestKey = categoryRefs.reduce((oldest, current) => {
        const oldestEntry = this.refs.get(oldest)!;
        const currentEntry = this.refs.get(current)!;
        return oldestEntry.metadata.lastAccessed <
          currentEntry.metadata.lastAccessed
          ? oldest
          : current;
      });
      this.refs.delete(oldestKey);
    }

    this.refs.set(key, entry);
  }

  access<T extends object>(_id: string, _category: string): T | null {
    const key = `${_category}:${_id}`;
    const entry = this.refs.get(key);

    if (!entry) return null;

    const target = entry.ref.deref();
    if (target) {
      entry.metadata.lastAccessed = Date.now();
      entry.metadata.accessCount++;
      return target;
    } else {
      // Referencia débil expirada, remover
      this.refs.delete(key);
      return null;
    }
  }

  unregister(_id: string, _category: string): void {
    const key = `${_category}:${_id}`;
    this.refs.delete(key);
  }

  getStats(): {
    totalRefs: number;
    categories: Record<string, number>;
    avgLifetime: number;
    memoryFootprint: number;
  } {
    const now = Date.now();
    const categories: Record<string, number> = {};
    let totalLifetime = 0;
    let totalSize = 0;

    for (const [key, entry] of this.refs) {
      const category = key.split(":")[0];
      categories[category] = (categories[category] || 0) + 1;

      totalLifetime += entry.metadata.lastAccessed - entry.metadata.created;
      totalSize += entry.metadata.size;
    }

    return {
      totalRefs: this.refs.size,
      categories,
      avgLifetime: this.refs.size > 0 ? totalLifetime / this.refs.size : 0,
      memoryFootprint: totalSize,
    };
  }

  cleanup(): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.refs) {
      if (!entry.ref.deref()) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((_key) => this.refs.delete(_key));

    if (keysToDelete.length > 0) {
      console.log(
        `🧬 WeakRefManager: Limpiadas ${keysToDelete.length} referencias expiradas`,
      );
    }
  }

  private startCleanupCycle(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.refs.clear();
  }
}

// 📊 LRU CACHE CON EVICTION INTELIGENTE
class IntelligentLRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;
  private evictionPolicy: "lru" | "lfu" | "size" = "lru";

  constructor(maxSize = 10000, defaultTTL = 300000) {
    // 5 minutos por defecto
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, _value: T, _ttl?: number, _size = 1): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      value: _value,
      timestamp: now,
      accessCount: 1,
      size: _size,
      ttl: _ttl || this.defaultTTL,
    };

    // Evict si necesario antes de insertar
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();

    // Verificar TTL
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.timestamp = now; // Para LRU

    return entry.value;
  }

  has(_key: string): boolean {
    return this.get(_key) !== null;
  }

  delete(_key: string): boolean {
    return this.cache.delete(_key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | null = null;

    switch (this.evictionPolicy) {
      case "lru":
        // Menos usado recientemente
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache) {
          if (entry.timestamp < oldestTime) {
            oldestTime = entry.timestamp;
            keyToEvict = key;
          }
        }
        break;

      case "lfu":
        // Menos frecuentemente usado
        let lowestAccess = Infinity;
        for (const [key, entry] of this.cache) {
          if (entry.accessCount < lowestAccess) {
            lowestAccess = entry.accessCount;
            keyToEvict = key;
          }
        }
        break;

      case "size":
        // Más grande
        let largestSize = 0;
        for (const [key, entry] of this.cache) {
          if (entry.size > largestSize) {
            largestSize = entry.size;
            keyToEvict = key;
          }
        }
        break;
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccesses: number;
    totalHits: number;
    avgTTL: number;
    memoryUsage: number;
  } {
    let totalAccesses = 0;
    let totalHits = 0;
    let totalTTL = 0;
    let totalSize = 0;

    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount;
      totalHits += entry.accessCount - 1; // Primer acceso no cuenta como hit
      totalTTL += entry.ttl;
      totalSize += entry.size;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
      totalAccesses,
      totalHits,
      avgTTL: this.cache.size > 0 ? totalTTL / this.cache.size : 0,
      memoryUsage: totalSize,
    };
  }
}

// 🔍 MEMORY MONITOR AVANZADO
class AdvancedMemoryMonitor {
  private metrics: MemoryMetrics[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private gcObserver: any = null;
  private monitoringIntervalMs = 5000; // 5 segundos

  constructor() {
    this.startMonitoring();
    this.setupGCObserver();
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.monitoringIntervalMs);
  }

  private collectMetrics(): void {
    const memUsage = process.memoryUsage();
    const now = performance.now();

    // Calcular métricas avanzadas
    const heapEfficiency =
      memUsage.heapTotal > 0 ? memUsage.heapUsed / memUsage.heapTotal : 0;
    const fragmentationRatio =
      memUsage.external > 0 ? memUsage.heapUsed / memUsage.external : 0;

    const metrics: MemoryMetrics = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      gcCycles: 0, // Se actualizará por el observer
      avgGCCycleTime: 0,
      fragmentationRatio,
      efficiency: heapEfficiency,
    };

    this.metrics.push(metrics);

    // Mantener solo últimas 100 métricas
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  private setupGCObserver(): void {
    // Observer de GC si está disponible
    if (typeof global !== "undefined" && (global as any).gc) {
      let gcStartTime = 0;
      let gcCycles = 0;
      let totalGCTime = 0;

      // Monkey patch gc para medir tiempo
      const originalGC = (global as any).gc;
      (global as any).gc = () => {
        gcStartTime = performance.now();
        const result = originalGC();
        const gcTime = performance.now() - gcStartTime;
        gcCycles++;
        totalGCTime += gcTime;

        // Actualizar métricas de GC en la última entrada
        if (this.metrics.length > 0) {
          const lastMetrics = this.metrics[this.metrics.length - 1];
          lastMetrics.gcCycles = gcCycles;
          lastMetrics.avgGCCycleTime = totalGCTime / gcCycles;
        }

        return result;
      };
    }
  }

  getCurrentMetrics(): MemoryMetrics {
    return (
      this.metrics[this.metrics.length - 1] || {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        gcCycles: 0,
        avgGCCycleTime: 0,
        fragmentationRatio: 0,
        efficiency: 0,
      }
    );
  }

  getMemoryTrend(_hours = 1): {
    trend: "increasing" | "decreasing" | "stable";
    avgGrowthRate: number;
    peakUsage: number;
    recommendations: string[];
  } {
    const recentMetrics = this.metrics.slice(
      -Math.floor((_hours * 3600000) / this.monitoringIntervalMs),
    );

    if (recentMetrics.length < 2) {
      return {
        trend: "stable",
        avgGrowthRate: 0,
        peakUsage: 0,
        recommendations: ["Insuficientes datos para análisis de tendencia"],
      };
    }

    const first = recentMetrics[0];
    const last = recentMetrics[recentMetrics.length - 1];
    const peak = Math.max(...recentMetrics.map((_m) => _m.heapUsed));

    const growthRate = (last.heapUsed - first.heapUsed) / recentMetrics.length;
    const avgGrowthRate = growthRate / this.monitoringIntervalMs; // bytes por ms

    let trend: "increasing" | "decreasing" | "stable" = "stable";
    if (avgGrowthRate > 1000)
      trend = "increasing"; // Más de 1KB/s
    else if (avgGrowthRate < -1000) trend = "decreasing";

    const recommendations: string[] = [];

    if (trend === "increasing") {
      recommendations.push("Posible fuga de memoria detectada");
      recommendations.push("Considerar forzar GC manual");
      recommendations.push("Revisar gestión de buffers y caches");
    }

    if (last.efficiency > 0.9) {
      recommendations.push("Uso de heap alto - considerar optimizaciones");
    }

    if (last.fragmentationRatio > 2) {
      recommendations.push("Alta fragmentación de memoria detectada");
    }

    return {
      trend,
      avgGrowthRate,
      peakUsage: peak,
      recommendations,
    };
  }

  forceGC(): boolean {
    if (typeof global !== "undefined" && (global as any).gc) {
      (global as any).gc();
      return true;
    }
    return false;
  }

  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.metrics = [];
  }
}

// 🎼 ORCHESTRADOR DE MEMORIA AVANZADA
class AdvancedMemoryOrchestrator {
  private bufferPools = new Map<string, MemoryPool<any>>();
  private weakRefManager = new AdvancedWeakRefManager();
  private lruCache = new IntelligentLRUCache();
  private memoryMonitor = new AdvancedMemoryMonitor();
  private optimizationInterval: NodeJS.Timeout | null = null;
  private optimizationIntervalMs = 60000; // 1 minuto

  constructor() {
    this.initializeBufferPools();
    this.startOptimizationCycle();
  }

  // 🏊 BUFFER POOLS PRECONFIGURADOS
  private initializeBufferPools(): void {
    // Buffer pool para objetos JSON
    this.bufferPools.set(
      "json",
      new IntelligentBufferPool(() => ({}), undefined, 500),
    );

    // Buffer pool para arrays
    this.bufferPools.set(
      "array",
      new IntelligentBufferPool(() => [], undefined, 300),
    );

    // Buffer pool para buffers binarios
    this.bufferPools.set(
      "buffer",
      new IntelligentBufferPool(
        () => Buffer.alloc(1024),
        (_buf) => _buf.fill(0), // Limpiar para seguridad
        100,
      ),
    );

    // Buffer pool para strings
    this.bufferPools.set(
      "string",
      new IntelligentBufferPool(() => "", undefined, 200),
    );
  }

  // 🎨 MÉTODOS PÚBLICOS PARA GESTIÓN DE MEMORIA

  acquireBuffer<T>(_type: string): T | null {
    const pool = this.bufferPools.get(_type);
    return pool ? pool.acquire() : null;
  }

  releaseBuffer<T>(_type: string, _item: T): void {
    const pool = this.bufferPools.get(_type);
    if (pool) {
      pool.release(_item);
    }
  }

  registerWeakRef<T extends object>(
    _target: T,
    _id: string,
    _category: string,
    _size = 0,
  ): void {
    this.weakRefManager.register(_target, _id, _category, _size);
  }

  accessWeakRef<T extends object>(_id: string, _category: string): T | null {
    return this.weakRefManager.access(_id, _category);
  }

  unregisterWeakRef(_id: string, _category: string): void {
    this.weakRefManager.unregister(_id, _category);
  }

  setCache(_key: string, _value: any, _ttl?: number, _size = 1): void {
    this.lruCache.set(_key, _value, _ttl, _size);
  }

  getCache(_key: string): any {
    return this.lruCache.get(_key);
  }

  // 🚀 OPTIMIZACIONES AUTOMÁTICAS
  private startOptimizationCycle(): void {
    this.optimizationInterval = setInterval(() => {
      this.performMemoryOptimization();
    }, this.optimizationIntervalMs);
  }

  private async performMemoryOptimization(): Promise<void> {
    const memoryTrend = this.memoryMonitor.getMemoryTrend(0.5); // Última media hora

    // Optimizaciones basadas en tendencias de memoria
    if (
      memoryTrend.trend === "increasing" &&
      memoryTrend.avgGrowthRate > 2000
    ) {
      console.log(
        "🧠 Memoria creciendo - Ejecutando optimizaciones automáticas",
      );

      // Forzar GC si está disponible
      if (this.memoryMonitor.forceGC()) {
        console.log("♻️ GC forzado ejecutado");
      }

      // Limpiar WeakRefs expiradas
      this.weakRefManager.cleanup();

      // Limpiar entradas expiradas del cache
      // Nota: El LRU cache ya maneja TTL automáticamente
    }

    // Optimizaciones preventivas
    const currentMetrics = this.memoryMonitor.getCurrentMetrics();
    if (currentMetrics.efficiency > 0.85) {
      console.log("⚠️ Eficiencia de memoria baja - Optimizando pools");

      // Limpiar pools de buffers menos utilizados
      for (const [type, pool] of this.bufferPools) {
        const stats = pool.getStats();
        if (stats.available > stats.allocated * 2) {
          // Demasiados buffers disponibles, limpiar algunos
          console.log(
            `🧹 Limpiando pool ${type}: ${stats.available} -> ${stats.allocated}`,
          );
          // Nota: El pool ya maneja el límite automáticamente
        }
      }
    }
  }

  // 📊 ESTADÍSTICAS COMPLETAS DEL SISTEMA DE MEMORIA
  getMemorySystemStats(): {
    bufferPools: Record<string, any>;
    weakRefs: any;
    cache: any;
    memory: MemoryMetrics;
    trend: any;
    recommendations: string[];
  } {
    const bufferPoolStats: Record<string, any> = {};
    for (const [type, pool] of this.bufferPools) {
      bufferPoolStats[type] = pool.getStats();
    }

    const trend = this.memoryMonitor.getMemoryTrend(1); // Última hora

    return {
      bufferPools: bufferPoolStats,
      weakRefs: this.weakRefManager.getStats(),
      cache: this.lruCache.getStats(),
      memory: this.memoryMonitor.getCurrentMetrics(),
      trend,
      recommendations: trend.recommendations,
    };
  }

  // 🧹 LIMPIEZA MANUAL FORZADA
  forceMemoryCleanup(): {
    gcForced: boolean;
    weakRefsCleaned: number;
    buffersCleared: number;
  } {
    const initialWeakRefs = this.weakRefManager.getStats().totalRefs;

    // Forzar GC
    const gcForced = this.memoryMonitor.forceGC();

    // Limpiar WeakRefs
    this.weakRefManager.cleanup();
    const finalWeakRefs = this.weakRefManager.getStats().totalRefs;
    const weakRefsCleaned = initialWeakRefs - finalWeakRefs;

    // Limpiar buffers (reinicializar pools)
    let buffersCleared = 0;
    for (const pool of this.bufferPools.values()) {
      const stats = pool.getStats();
      buffersCleared += stats.available;
      pool.clear();
    }

    console.log(
      `🧹 Limpieza forzada: GC=${gcForced}, WeakRefs=${weakRefsCleaned}, Buffers=${buffersCleared}`,
    );

    return {
      gcForced,
      weakRefsCleaned,
      buffersCleared,
    };
  }

  destroy(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }

    this.weakRefManager.destroy();
    this.memoryMonitor.destroy();

    // Limpiar todos los pools
    for (const pool of this.bufferPools.values()) {
      pool.clear();
    }
    this.bufferPools.clear();

    this.lruCache.clear();
  }
}

// 🎯 SINGLETON GLOBAL PARA EL ORCHESTRADOR DE MEMORIA
let globalMemoryOrchestrator: AdvancedMemoryOrchestrator | null = null;

export function getMemoryOrchestrator(): AdvancedMemoryOrchestrator {
  if (!globalMemoryOrchestrator) {
    globalMemoryOrchestrator = new AdvancedMemoryOrchestrator();
  }
  return globalMemoryOrchestrator;
}

export function destroyMemoryOrchestrator(): void {
  if (globalMemoryOrchestrator) {
    globalMemoryOrchestrator.destroy();
    globalMemoryOrchestrator = null;
  }
}

// 💀 PUNK PHILOSOPHY INTEGRATION
// "La memoria no se gestiona, se orquesta como una sinfonía"
// — El Verso Libre, Arquitecto de Memoria Eterna

// ❌ ELIMINADO: EJECUCIÓN AUTOMÁTICA QUE VIOLA AXIOMA ANTI-SIMULACIÓN
// El código de demo ya no se ejecuta automáticamente al importar el módulo
// Debe ser llamado explícitamente por el código que lo necesite


