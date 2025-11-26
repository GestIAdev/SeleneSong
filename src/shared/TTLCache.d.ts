/**
 * 🔧 TTL CACHE V194
 * Directiva V194: Cirugía del Panteón - Fix #3
 *
 * PROPÓSITO: Implementar cache con Time-To-Live automático
 * para prevenir acumulación infinita de datos en memoria
 */
export interface TTLCacheOptions {
    defaultTTL: number;
    maxSize?: number;
    cleanupInterval?: number;
    onExpire?: (key: string, value: any) => void;
    onEvict?: (key: string, value: any) => void;
}
export interface CacheEntry<V> {
    value: V;
    expires: number;
    created: number;
    accessed: number;
    accessCount: number;
}
export interface CacheStats {
    size: number;
    maxSize: number | null;
    hits: number;
    misses: number;
    expires: number;
    evictions: number;
    hitRate: number;
    oldestEntry: number | null;
    newestEntry: number | null;
}
export declare class TTLCache<K, V> {
    private cache;
    private readonly options;
    private stats;
    private cleanupTimer;
    private readonly id;
    constructor(id: string, options: TTLCacheOptions);
    /**
     * Almacenar valor en cache con TTL específico o por defecto
     */
    set(key: K, _value: V, ttl?: number): void;
    /**
     * Obtener valor del cache
     */
    get(key: K): V | undefined;
    /**
     * Verificar si existe una clave (sin afectar estadísticas de acceso)
     */
    has(key: K): boolean;
    /**
     * Eliminar entrada del cache
     */
    delete(key: K): boolean;
    /**
     * Limpiar todo el cache
     */
    clear(): void;
    /**
     * Obtener todas las claves válidas (no expiradas)
     */
    keys(): K[];
    /**
     * Obtener todos los valores válidos (no expirados)
     */
    values(): V[];
    /**
     * Obtener todas las entradas válidas como [key, value]
     */
    entries(): [K, V][];
    /**
     * Obtener el tamaño actual del cache (sin entradas expiradas)
     */
    size(): number;
    /**
     * Verificar si el cache está vacío
     */
    isEmpty(): boolean;
    /**
     * Verificar si el cache está lleno
     */
    isFull(): boolean;
    /**
     * Obtener tiempo restante hasta expiración (en ms)
     */
    getTTL(_key: K): number | null;
    /**
     * Renovar TTL de una entrada existente
     */
    refresh(key: K, ttl?: number): boolean;
    /**
     * Obtener información detallada de una entrada
     */
    getEntryInfo(key: K): Omit<CacheEntry<V>, "value"> | null;
    /**
     * Limpiar entradas expiradas
     */
    private cleanupExpired;
    /**
     * Expulsar la entrada más antigua para hacer espacio
     */
    private evictOldestEntry;
    /**
     * Iniciar timer de limpieza automática
     */
    private startCleanupTimer;
    /**
     * Detener timer de limpieza
     */
    private stopCleanupTimer;
    /**
     * Obtener estadísticas del cache
     */
    getStats(): CacheStats;
    /**
     * Resetear estadísticas
     */
    resetStats(): void;
    /**
     * Obtener entradas próximas a expirar
     */
    getExpiringEntries(_withinMs: number): [K, V, number][];
    /**
     * Extender TTL de entradas que están por expirar
     */
    extendExpiringEntries(_withinMs: number, extensionMs: number): number;
    /**
     * Cerrar cache y limpiar recursos
     */
    close(): void;
    /**
     * Representación JSON para debugging
     */
    toJSON(): any;
}
/**
 * Factory para crear caches TTL con configuraciones predefinidas
 */
export declare class TTLCacheFactory {
    /**
     * Cache rápido para datos temporales (1 segundo)
     */
    static createFastCache<K, V>(_id: string): TTLCache<K, V>;
    /**
     * Cache de sesión para datos de usuario (30 minutos)
     */
    static createSessionCache<K, V>(_id: string): TTLCache<K, V>;
    /**
     * Cache de larga duración para datos estáticos (2 horas)
     */
    static createLongCache<K, V>(_id: string): TTLCache<K, V>;
    /**
     * Cache sin límite de tamaño para casos especiales
     */
    static createUnlimitedCache<K, V>(_id: string, ttlMs: number): TTLCache<K, V>;
}
export default TTLCache;
//# sourceMappingURL=TTLCache.d.ts.map
