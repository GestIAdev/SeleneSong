/**
 * 🔧 TTL CACHE V194
 * Directiva V194: Cirugía del Panteón - Fix #3
 *
 * PROPÓSITO: Implementar cache con Time-To-Live automático
 * para prevenir acumulación infinita de datos en memoria
 */
export class TTLCache {
    constructor(id, options) {
        this.cache = new Map();
        this.cleanupTimer = null;
        this.id = id;
        this.options = {
            defaultTTL: options.defaultTTL,
            maxSize: options.maxSize || null,
            cleanupInterval: options.cleanupInterval || 60000, // 1 minuto por defecto
            onExpire: options.onExpire || (() => { }),
            onEvict: options.onEvict || (() => { }),
        };
        this.stats = {
            maxSize: this.options.maxSize,
            hits: 0,
            misses: 0,
            expires: 0,
            evictions: 0,
        };
        this.startCleanupTimer();
        console.log(`💾 TTLCache[${this.id}]: Creado con TTL ${this.options.defaultTTL}ms, maxSize: ${this.options.maxSize || "unlimited"}`);
    }
    /**
     * Almacenar valor en cache con TTL específico o por defecto
     */
    set(key, _value, ttl) {
        const now = Date.now();
        const actualTTL = ttl !== undefined ? ttl : this.options.defaultTTL;
        const expires = now + actualTTL;
        // Si existe, limpiar entrada previa
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // Verificar límite de tamaño
        if (this.options.maxSize !== null &&
            this.cache.size >= this.options.maxSize) {
            this.evictOldestEntry();
        }
        const entry = {
            _value,
            expires,
            created: now,
            accessed: now,
            accessCount: 0,
        };
        this.cache.set(key, entry);
        console.log(`💾 TTLCache[${this.id}]: Set ${String(key)} (expires in ${actualTTL}ms)`);
    }
    /**
     * Obtener valor del cache
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return undefined;
        }
        const now = Date.now();
        // Verificar si ha expirado
        if (now >= entry.expires) {
            this.cache.delete(key);
            this.stats.expires++;
            this.options.onExpire(String(key), entry.value);
            this.stats.misses++;
            console.log(`⏰ TTLCache[${this.id}]: ${String(key)} expiró`);
            return undefined;
        }
        // Actualizar estadísticas de acceso
        entry.accessed = now;
        entry.accessCount++;
        this.stats.hits++;
        return entry.value;
    }
    /**
     * Verificar si existe una clave (sin afectar estadísticas de acceso)
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        // Verificar expiración sin actualizar accessed
        if (Date.now() >= entry.expires) {
            this.cache.delete(key);
            this.stats.expires++;
            this.options.onExpire(String(key), entry.value);
            return false;
        }
        return true;
    }
    /**
     * Eliminar entrada del cache
     */
    delete(key) {
        const entry = this.cache.get(key);
        if (entry) {
            this.cache.delete(key);
            console.log(`🗑️ TTLCache[${this.id}]: ${String(key)} eliminado manualmente`);
            return true;
        }
        return false;
    }
    /**
     * Limpiar todo el cache
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`🧹 TTLCache[${this.id}]: Cache limpiado (${size} entradas removidas)`);
    }
    /**
     * Obtener todas las claves válidas (no expiradas)
     */
    keys() {
        this.cleanupExpired();
        return Array.from(this.cache.keys());
    }
    /**
     * Obtener todos los valores válidos (no expirados)
     */
    values() {
        this.cleanupExpired();
        return Array.from(this.cache.values()).map((_entry) => _entry.value);
    }
    /**
     * Obtener todas las entradas válidas como [key, value]
     */
    entries() {
        this.cleanupExpired();
        return Array.from(this.cache.entries()).map(([key, entry]) => [
            key,
            entry.value,
        ]);
    }
    /**
     * Obtener el tamaño actual del cache (sin entradas expiradas)
     */
    size() {
        this.cleanupExpired();
        return this.cache.size;
    }
    /**
     * Verificar si el cache está vacío
     */
    isEmpty() {
        return this.size() === 0;
    }
    /**
     * Verificar si el cache está lleno
     */
    isFull() {
        if (this.options.maxSize === null)
            return false;
        return this.size() >= this.options.maxSize;
    }
    /**
     * Obtener tiempo restante hasta expiración (en ms)
     */
    getTTL(_key) {
        const entry = this.cache.get(_key);
        if (!entry)
            return null;
        const remaining = entry.expires - Date.now();
        return remaining > 0 ? remaining : null;
    }
    /**
     * Renovar TTL de una entrada existente
     */
    refresh(key, ttl) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        const now = Date.now();
        if (now >= entry.expires) {
            this.cache.delete(key);
            this.stats.expires++;
            this.options.onExpire(String(key), entry.value);
            return false;
        }
        const actualTTL = ttl !== undefined ? ttl : this.options.defaultTTL;
        entry.expires = now + actualTTL;
        entry.accessed = now;
        console.log(`🔄 TTLCache[${this.id}]: ${String(key)} TTL renovado (+${actualTTL}ms)`);
        return true;
    }
    /**
     * Obtener información detallada de una entrada
     */
    getEntryInfo(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        const now = Date.now();
        if (now >= entry.expires) {
            this.cache.delete(key);
            this.stats.expires++;
            this.options.onExpire(String(key), entry.value);
            return null;
        }
        return {
            expires: entry.expires,
            created: entry.created,
            accessed: entry.accessed,
            accessCount: entry.accessCount,
        };
    }
    /**
     * Limpiar entradas expiradas
     */
    cleanupExpired() {
        const now = Date.now();
        let expiredCount = 0;
        for (const [key, entry] of Array.from(this.cache.entries())) {
            if (now >= entry.expires) {
                this.cache.delete(key);
                this.stats.expires++;
                this.options.onExpire(String(key), entry.value);
                expiredCount++;
            }
        }
        if (expiredCount > 0) {
            console.log(`⏰ TTLCache[${this.id}]: ${expiredCount} entradas expiradas limpiadas`);
        }
        return expiredCount;
    }
    /**
     * Expulsar la entrada más antigua para hacer espacio
     */
    evictOldestEntry() {
        if (this.cache.size === 0)
            return;
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, entry] of Array.from(this.cache.entries())) {
            if (entry.created < oldestTime) {
                oldestTime = entry.created;
                oldestKey = key;
            }
        }
        if (oldestKey !== null) {
            const entry = this.cache.get(oldestKey);
            this.cache.delete(oldestKey);
            this.stats.evictions++;
            this.options.onEvict(String(oldestKey), entry.value);
            console.log(`🚪 TTLCache[${this.id}]: ${String(oldestKey)} expulsado por límite de tamaño`);
        }
    }
    /**
     * Iniciar timer de limpieza automática
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanupExpired();
        }, this.options.cleanupInterval);
    }
    /**
     * Detener timer de limpieza
     */
    stopCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
    /**
     * Obtener estadísticas del cache
     */
    getStats() {
        this.cleanupExpired();
        let oldestEntry = null;
        let newestEntry = null;
        for (const entry of Array.from(this.cache.values())) {
            if (oldestEntry === null || entry.created < oldestEntry) {
                oldestEntry = entry.created;
            }
            if (newestEntry === null || entry.created > newestEntry) {
                newestEntry = entry.created;
            }
        }
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
        return {
            size: this.cache.size,
            maxSize: this.options.maxSize,
            hits: this.stats.hits,
            misses: this.stats.misses,
            expires: this.stats.expires,
            evictions: this.stats.evictions,
            hitRate: Math.round(hitRate * 100) / 100,
            oldestEntry,
            newestEntry,
        };
    }
    /**
     * Resetear estadísticas
     */
    resetStats() {
        this.stats = {
            maxSize: this.options.maxSize,
            hits: 0,
            misses: 0,
            expires: 0,
            evictions: 0,
        };
        console.log(`📊 TTLCache[${this.id}]: Estadísticas reseteadas`);
    }
    /**
     * Obtener entradas próximas a expirar
     */
    getExpiringEntries(_withinMs) {
        const now = Date.now();
        const threshold = now + _withinMs;
        const expiring = [];
        for (const [key, entry] of Array.from(this.cache.entries())) {
            if (entry.expires <= threshold && entry.expires > now) {
                const timeLeft = entry.expires - now;
                expiring.push([key, entry.value, timeLeft]);
            }
        }
        return expiring.sort((_a, _b) => _a[2] - _b[2]); // Ordenar por tiempo restante
    }
    /**
     * Extender TTL de entradas que están por expirar
     */
    extendExpiringEntries(_withinMs, extensionMs) {
        const expiring = this.getExpiringEntries(_withinMs);
        for (const [key] of expiring) {
            this.refresh(key, extensionMs);
        }
        if (expiring.length > 0) {
            console.log(`🔄 TTLCache[${this.id}]: ${expiring.length} entradas extendidas (+${extensionMs}ms)`);
        }
        return expiring.length;
    }
    /**
     * Cerrar cache y limpiar recursos
     */
    close() {
        this.stopCleanupTimer();
        this.clear();
        console.log(`🔒 TTLCache[${this.id}]: Cache cerrado`);
    }
    /**
     * Representación JSON para debugging
     */
    toJSON() {
        return {
            id: this.id,
            options: this.options,
            stats: this.getStats(),
            sampleEntries: Array.from(this.cache.entries())
                .slice(0, 3)
                .map(([key, entry]) => ({
                key: String(key),
                created: new Date(entry.created).toISOString(),
                expires: new Date(entry.expires).toISOString(),
                accessCount: entry.accessCount,
            })),
        };
    }
}
/**
 * Factory para crear caches TTL con configuraciones predefinidas
 */
export class TTLCacheFactory {
    /**
     * Cache rápido para datos temporales (1 segundo)
     */
    static createFastCache(_id) {
        return new TTLCache(_id, {
            defaultTTL: 1000, // 1 segundo
            maxSize: 1000,
            cleanupInterval: 60 * 1000, // 1 minuto
        });
    }
    /**
     * Cache de sesión para datos de usuario (30 minutos)
     */
    static createSessionCache(_id) {
        return new TTLCache(_id, {
            defaultTTL: 30 * 60 * 1000, // 30 minutos
            maxSize: 500,
            cleanupInterval: 5 * 60 * 1000, // 5 minutos
        });
    }
    /**
     * Cache de larga duración para datos estáticos (2 horas)
     */
    static createLongCache(_id) {
        return new TTLCache(_id, {
            defaultTTL: 2 * 60 * 60 * 1000, // 2 horas
            maxSize: 2000,
            cleanupInterval: 10 * 60 * 1000, // 10 minutos
        });
    }
    /**
     * Cache sin límite de tamaño para casos especiales
     */
    static createUnlimitedCache(_id, ttlMs) {
        return new TTLCache(_id, {
            defaultTTL: ttlMs,
            cleanupInterval: Math.min(ttlMs / 10, 60 * 1000), // 10% del TTL o máximo 1 minuto
        });
    }
}
export default TTLCache;
//# sourceMappingURL=TTLCache.js.map