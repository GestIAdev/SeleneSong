/**
 * 🔧 LISTENER MANAGER V195
 * Directiva V195: Gestión de Ciclo de Vida - Fase 2
 *
 * PROPÓSITO: Sistema global para gestionar event listeners
 * y prevenir memory leaks por listeners no removidos.
 */
export interface ListenerRef {
    id: string;
    emitter: any;
    event: string;
    listener: Function;
    once: boolean;
    created: number;
    removed: boolean;
}
export interface ListenerStats {
    totalListeners: number;
    activeListeners: number;
    removedListeners: number;
    oldestListener: number | null;
    newestListener: number | null;
}
/**
 * Manager centralizado para event listeners con tracking y limpieza automática
 */
export declare class ListenerManager {
    private static instance;
    private listeners;
    private stats;
    private constructor();
    static getInstance(): ListenerManager;
    /**
     * Agrega un listener gestionado
     */
    addListener(emitter: any, event: string, listener: Function, once?: boolean, _id?: string): string;
    /**
     * Remueve un listener específico
     */
    removeListener(listenerId: string): boolean;
    /**
     * Remueve todos los listeners de un emitter específico
     */
    removeAllFromEmitter(_emitter: any): number;
    /**
     * Remueve todos los listeners activos
     */
    removeAll(): void;
    /**
     * Obtiene estadísticas de listeners
     */
    getStats(): ListenerStats;
    /**
     * Lista todos los listeners activos
     */
    listActive(): ListenerRef[];
}
export declare const listenerManager: ListenerManager;
//# sourceMappingURL=ListenerManager.d.ts.map
