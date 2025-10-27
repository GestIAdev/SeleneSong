/**
 * 🔧 LIMITED BUFFER V194
 * Directiva V194: Cirugía del Panteón - Fix #2
 *
 * PROPÓSITO: Prevenir buffer overflows implementando buffers con límite
 * máximo y rotación automática para todos los componentes Selene
 */
export interface BufferOptions {
    maxSize: number;
    onOverflow?: "rotate" | "reject" | "compress";
    onItemRemoved?: (item: any) => void;
    compressionRatio?: number;
    warningThreshold?: number;
}
export interface BufferStats {
    currentSize: number;
    maxSize: number;
    totalPushed: number;
    totalRemoved: number;
    overflowCount: number;
    lastAccess: number;
    compressionEvents: number;
}
export declare class LimitedBuffer<T> {
    private buffer;
    private readonly options;
    private stats;
    private readonly id;
    constructor(id: string, options: BufferOptions);
    /**
     * Añadir elemento al buffer con gestión de overflow
     */
    push(item: T): boolean;
    /**
     * Manejar overflow según estrategia configurada
     */
    private handleOverflow;
    /**
     * Rotar buffer: eliminar el más antiguo, añadir el nuevo
     */
    private handleRotateOverflow;
    /**
     * Rechazar nuevo elemento cuando está lleno
     */
    private handleRejectOverflow;
    /**
     * Comprimir buffer cuando está lleno
     */
    private handleCompressOverflow;
    /**
     * Obtener elemento por índice
     */
    get(_index: number): T | undefined;
    /**
     * Obtener todos los elementos
     */
    getAll(): readonly T[];
    /**
     * Obtener los últimos N elementos
     */
    getLast(_count: number): readonly T[];
    /**
     * Obtener los primeros N elementos
     */
    getFirst(_count: number): readonly T[];
    /**
     * Buscar elementos que cumplan condición
     */
    find(_predicate: (item: T, index: number) => boolean): T | undefined;
    /**
     * Filtrar elementos que cumplan condición
     */
    filter(_predicate: (item: T, index: number) => boolean): readonly T[];
    /**
     * Mapear elementos
     */
    map<U>(_mapper: (item: T, index: number) => U): U[];
    /**
     * Limpiar buffer completamente
     */
    clear(): void;
    /**
     * Remover elementos que cumplan condición
     */
    removeWhere(_predicate: (item: T, index: number) => boolean): number;
    /**
     * Remover elementos más antiguos que cierto tiempo
     */
    removeOlderThan(_maxAge: number, _getTimestamp: (item: T) => number): number;
    /**
     * Obtener tamaño actual
     */
    size(): number;
    /**
     * Verificar si está vacío
     */
    isEmpty(): boolean;
    /**
     * Verificar si está lleno
     */
    isFull(): boolean;
    /**
     * Obtener porcentaje de uso
     */
    getUsagePercentage(): number;
    /**
     * Obtener estadísticas del buffer
     */
    getStats(): BufferStats;
    /**
     * Redimensionar el buffer (cambiar límite máximo)
     */
    resize(newMaxSize: number): void;
    /**
     * Obtener representación JSON para debugging
     */
    toJSON(): any;
}
/**
 * Factory para crear buffers con configuraciones predefinidas
 */
export declare class BufferFactory {
    /**
     * Buffer para logs con rotación automática
     */
    static createLogBuffer<T>(_id: string, _maxSize?: number): LimitedBuffer<T>;
    /**
     * Buffer para eventos con compresión
     */
    static createEventBuffer<T>(_id: string, _maxSize?: number): LimitedBuffer<T>;
    /**
     * Buffer para cache con rechazo
     */
    static createCacheBuffer<T>(_id: string, _maxSize?: number): LimitedBuffer<T>;
    /**
     * Buffer para métricas con rotación
     */
    static createMetricsBuffer<T>(_id: string, _maxSize?: number): LimitedBuffer<T>;
}
export default LimitedBuffer;
//# sourceMappingURL=LimitedBuffer.d.ts.map
