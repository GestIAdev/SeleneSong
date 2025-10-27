/**
 * 🌌 EL ECO PERSISTENTE - CACHING CUÁNTICO AGRESIVO
 * By PunkClaude - Operación 3: El Eco Persistente
 *
 * MISSION: Almacenar y recuperar resultados de predicciones para máxima eficiencia
 * OBJETIVO: Minimizar computación redundante manteniendo datos frescos
 */
/**
 * 🌌 Motor de Caching Cuántico
 */
export class QuantumPredictionCache {
    config;
    cache = new Map();
    stats;
    cleanupInterval = null;
    constructor(config = {}) {
        this.config = {
            maxSize: 1000,
            defaultTTL: 300000, // 5 minutos
            ttlByType: {
                failure: 600000, // 10 minutos
                load: 180000, // 3 minutos
                behavior: 900000, // 15 minutos
                trend: 3600000 // 1 hora
            },
            enableCompression: false,
            enableStats: true,
            ...config
        };
        this.stats = {
            totalEntries: 0,
            totalHits: 0,
            totalMisses: 0,
            hitRate: 0,
            evictions: 0,
            avgResponseTime: 0,
            memoryUsage: 0
        };
        this.initializeCache();
    }
    /**
     * 🚀 Inicializar sistema de caching
     */
    initializeCache() {
        console.log('🌌 Inicializando Eco Persistente...');
        // Iniciar limpieza automática cada 30 segundos
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, 30000);
        console.log('✅ Eco Persistente activado');
    }
    /**
     * 🔍 Generar clave de caché única
     */
    generateCacheKey(type, data) {
        // Crear hash determinístico de los datos usando JSON.stringify completo
        const dataString = JSON.stringify({ type, data });
        let hash = 0;
        // Usar algoritmo de hash más robusto (djb2)
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) + hash) + char; // hash * 33 + char
            hash = hash & hash; // Convertir a 32 bits
        }
        return `cache_${type}_${Math.abs(hash).toString(36)}`;
    }
    /**
     * 💾 Almacenar resultado en caché
     */
    set(type, data, result) {
        const key = this.generateCacheKey(type, data);
        const ttl = this.config.ttlByType[type] || this.config.defaultTTL;
        const entry = {
            key,
            data,
            result,
            timestamp: Date.now(),
            ttl,
            accessCount: 0,
            lastAccessed: Date.now(),
            type
        };
        // Verificar límite de tamaño
        if (this.cache.size >= this.config.maxSize) {
            this.evictLRU();
        }
        this.cache.set(key, entry);
        this.stats.totalEntries = this.cache.size;
        this.updateMemoryUsage();
        console.log(`💾 Cacheado: ${key} (${type}) - TTL: ${ttl}ms`);
    }
    /**
     * 📖 Obtener resultado de caché
     */
    get(type, data) {
        const key = this.generateCacheKey(type, data);
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
    invalidate(type, data) {
        let invalidated = 0;
        if (type && data) {
            // Invalidar entrada específica
            const key = this.generateCacheKey(type, data);
            if (this.cache.delete(key)) {
                invalidated++;
                console.log(`🗑️ Invalidado: ${key}`);
            }
        }
        else if (type) {
            // Invalidar todas las entradas de un tipo
            for (const [key, entry] of this.cache.entries()) {
                if (entry.type === type) {
                    this.cache.delete(key);
                    invalidated++;
                }
            }
            console.log(`🗑️ Invalidado tipo ${type}: ${invalidated} entradas`);
        }
        else {
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
    performCleanup() {
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
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.stats.evictions++;
            console.log(`🚪 LRU Eviction: ${oldestKey}`);
        }
    }
    /**
     * 📊 Actualizar tasa de aciertos
     */
    updateHitRate() {
        const total = this.stats.totalHits + this.stats.totalMisses;
        this.stats.hitRate = total > 0 ? (this.stats.totalHits / total) * 100 : 0;
    }
    /**
     * 💾 Actualizar uso de memoria
     */
    updateMemoryUsage() {
        // Estimación simple basada en número de entradas
        this.stats.memoryUsage = this.cache.size * 1024; // ~1KB por entrada
    }
    /**
     * 📊 Obtener estadísticas
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * 🎛️ Obtener configuración
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 🔧 Actualizar configuración
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('🌌 Configuración del Eco actualizada');
    }
    /**
     * 📋 Obtener todas las entradas (debug)
     */
    getAllEntries() {
        return Array.from(this.cache.values());
    }
    /**
     * 🧹 Limpiar recursos
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.cache.clear();
        console.log('🧹 Eco Persistente destruido');
    }
}
export default QuantumPredictionCache;
