/**
 * 🌌 EL ECO PERSISTENTE - CACHING CUÁNTICO AGRESIVO
 * By PunkClaude - Operación 3: El Eco Persistente
 *
 * MISSION: Almacenar y recuperar resultados de predicciones para máxima eficiencia
 * OBJETIVO: Minimizar computación redundante manteniendo datos frescos
 */


export interface CacheConfig {
  maxSize: number; // Tamaño máximo de entradas en caché
  maxMemoryBytes?: number; // 🔥 PHASE 2.1.4b: Hard memory cap in bytes (50MB default)
  defaultTTL: number; // TTL por defecto en ms
  ttlByType: {
    // TTL específico por tipo de predicción
    failure: number;
    load: number;
    behavior: number;
    trend: number;
  };
  enableCompression: boolean; // Comprimir datos grandes
  enableStats: boolean; // Recolectar estadísticas
}

export interface CacheEntry {
  key: string;
  data: any;
  result: any;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  type: "failure" | "load" | "behavior" | "trend";
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  evictions: number;
  avgResponseTime: number;
  memoryUsage: number;
}

/**
 * 🌌 Motor de Caching Cuántico
 */
export class QuantumPredictionCache {
  private config: CacheConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // 🔥 PHASE 2.1.4b FIX #6: Memory-aware caching
  private currentMemoryBytes: number = 0;
  private readonly MAX_MEMORY_BYTES: number;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      maxMemoryBytes: 50 * 1024 * 1024, // 🔥 PHASE 2.1.4b: 50MB default
      defaultTTL: 300000, // 5 minutos
      ttlByType: {
        failure: 600000, // 10 minutos
        load: 180000, // 3 minutos
        behavior: 900000, // 15 minutos
        trend: 3600000, // 1 hora
      },
      enableCompression: false,
      enableStats: true,
      ...config,
    };

    // 🔥 PHASE 2.1.4b: Initialize memory limit
    this.MAX_MEMORY_BYTES = this.config.maxMemoryBytes || 50 * 1024 * 1024;

    this.stats = {
      totalEntries: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      evictions: 0,
      avgResponseTime: 0,
      memoryUsage: 0,
    };

    this.initializeCache();
  }

  /**
   * 🚀 Inicializar sistema de caching
   */
  private initializeCache(): void {
    console.log("🌌 Inicializando Eco Persistente...");

    // Iniciar limpieza automática cada 30 segundos
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 30000);

    console.log("✅ Eco Persistente activado");
  }

  /**
   * 🔍 Generar clave de caché única
   */
  private generateCacheKey(type: string, _data: any): string {
    // Crear hash determinístico de los datos usando JSON.stringify completo
    const dataString = JSON.stringify({ type, _data });
    let hash = 0;

    // Usar algoritmo de hash más robusto (djb2)
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) + hash + char; // hash * 33 + char
      hash = hash & hash; // Convertir a 32 bits
    }

    return `cache_${type}_${Math.abs(hash).toString(36)}`;
  }

  /**
   * 💾 Almacenar resultado en caché
   * 🔥 PHASE 2.1.4b: Memory-aware eviction (50MB hard cap)
   */
  set(
    type: "failure" | "load" | "behavior" | "trend",
    data: any,
    _result: any,
  ): void {
    const key = this.generateCacheKey(type, data);
    const ttl = this.config.ttlByType[type] || this.config.defaultTTL;

    const entry: CacheEntry = {
      key,
      data,
      result: _result, // Fixed: was _result, should be result
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      type,
    };

    // 🔥 PHASE 2.1.4b: Memory-aware eviction
    const entrySize = this.estimateEntrySize(entry);

    // Evict LRU entries until we have space (memory-based)
    while (
      this.currentMemoryBytes + entrySize > this.MAX_MEMORY_BYTES &&
      this.cache.size > 0
    ) {
      this.evictLRU();
    }

    // Also enforce entry count limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    // Add entry and update memory tracking
    this.cache.set(key, entry);
    this.currentMemoryBytes += entrySize;
    this.stats.totalEntries = this.cache.size;
    this.updateMemoryUsage();

    console.log(
      `💾 Cacheado: ${key} (${type}) - TTL: ${ttl}ms, Size: ${Math.round(entrySize / 1024)}KB, Total: ${Math.round(this.currentMemoryBytes / 1024 / 1024)}MB/${Math.round(this.MAX_MEMORY_BYTES / 1024 / 1024)}MB`
    );
  }

  /**
   * 🔥 PHASE 2.1.4b: Estimate entry size in bytes
   * Uses JSON.stringify length × 2 (UTF-16 overhead)
   */
  private estimateEntrySize(entry: CacheEntry): number {
    try {
      const jsonStr = JSON.stringify(entry);
      return jsonStr.length * 2; // UTF-16 uses 2 bytes per char
    } catch {
      return 1024; // Default to 1KB if estimation fails
    }
  }

  /**
   * 📖 Obtener resultado de caché
   */
  get(_type: string, _data: any): any | null {
    const key = this.generateCacheKey(_type, _data);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.totalMisses++;
      this.updateHitRate();
      return null;
    }

    // Verificar si expiró
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.totalMisses++;
      this.updateHitRate();
      console.log(`⏰ Cache expirado: ${key}`);
      return null;
    }

    // Actualizar estadísticas
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.totalHits++;
    this.updateHitRate();

    console.log(`🎯 Cache hit: ${key} (accesos: ${entry.accessCount})`);
    return entry.result;
  }

  /**
   * 🗑️ Invalidar entradas específicas
   */
  invalidate(type?: string, data?: any): number {
    let invalidated = 0;

    if (type && data) {
      // Invalidar entrada específica
      const key = this.generateCacheKey(type, data);
      if (this.cache.delete(key)) {
        invalidated++;
        console.log(`🗑️ Invalidado: ${key}`);
      }
    } else if (type) {
      // Invalidar todas las entradas de un tipo
      for (const [key, entry] of this.cache.entries()) {
        if (entry.type === type) {
          this.cache.delete(key);
          invalidated++;
        }
      }
      console.log(`🗑️ Invalidado tipo ${type}: ${invalidated} entradas`);
    } else {
      // Invalidar todo
      invalidated = this.cache.size;
      this.cache.clear();
      console.log(`🗑️ Cache completamente invalidado: ${invalidated} entradas`);
    }

    this.stats.totalEntries = this.cache.size;
    this.updateMemoryUsage();
    return invalidated;
  }

  /**
   * 🧹 Limpiar entradas expiradas
   */
  private performCleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Limpieza automática: ${cleaned} entradas expiradas`);
      this.stats.totalEntries = this.cache.size;
      this.updateMemoryUsage();
    }
  }

  /**
   * 🚪 LRU Eviction
   */
  /**
   * 🚪 Evitar LRU (Least Recently Used)
   * 🔥 PHASE 2.1.4b: Track memory on eviction
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    let oldestEntry: CacheEntry | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
        oldestEntry = entry;
      }
    }

    if (oldestKey && oldestEntry) {
      // 🔥 PHASE 2.1.4b: Subtract evicted entry's memory
      const entrySize = this.estimateEntrySize(oldestEntry);
      this.currentMemoryBytes -= entrySize;

      this.cache.delete(oldestKey);
      this.stats.evictions++;
      console.log(`🚪 LRU Eviction: ${oldestKey} (freed ${Math.round(entrySize / 1024)}KB)`);
    }
  }

  /**
   * 📊 Actualizar tasa de aciertos
   */
  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses;
    this.stats.hitRate = total > 0 ? (this.stats.totalHits / total) * 100 : 0;
  }

  /**
   * 💾 Actualizar uso de memoria
   */
  private updateMemoryUsage(): void {
    // Estimación simple basada en número de entradas
    this.stats.memoryUsage = this.cache.size * 1024; // ~1KB por entrada
  }

  /**
   * 📊 Obtener estadísticas
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 🎛️ Obtener configuración
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * 🔧 Actualizar configuración
   */
  updateConfig(_newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ..._newConfig };
    console.log("🌌 Configuración del Eco actualizada");
  }

  /**
   * 📋 Obtener todas las entradas (debug)
   */
  getAllEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  /**
   * 🧹 Limpiar recursos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.cache.clear();
    console.log("🧹 Eco Persistente destruido");
  }
}

export default QuantumPredictionCache;


