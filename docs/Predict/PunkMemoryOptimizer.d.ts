/**
 * ⚡ PUNK MEMORY OPTIMIZER V193
 * Directiva V192: Optimización de Memoria Crítica
 *
 * Implementa estrategias agresivas de garbage collection y limpieza
 * para resolver los 58 memory leaks detectados en la Prueba del Panteón
 */
import { EventEmitter } from "events";
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
export declare class PunkMemoryOptimizer extends EventEmitter {
    private gcInterval;
    private monitoringInterval;
    private baselineMetrics;
    private leakThreshold;
    constructor();
    /**
     * Configura garbage collection inteligente (permitir expansión natural del heap)
     */
    private setupAggressiveGC;
    /**
     * Inicia monitoreo continuo de memoria
     */
    private startMemoryMonitoring;
    /**
     * Obtiene métricas actuales de memoria
     */
    private getCurrentMetrics;
    /**
     * Detecta posibles memory leaks
     */
    private detectMemoryLeak;
    /**
     * Maneja detección de memory leak (solo si es realmente crítico)
     */
    private handleMemoryLeak;
    /**
     * Realiza limpieza inteligente de memoria (solo cuando es crítico)
     */
    private performAggressiveCleanup;
    /**
     * Limpia buffers no utilizados
     */
    private clearUnusedBuffers;
    /**
     * Limpia event listeners huérfanos
     */
    private clearOrphanedListeners;
    /**
     * Obtiene estadísticas detalladas de memoria
     */
    getDetailedStats(): MemoryLeakDetection;
    /**
     * Optimiza memoria para un componente específico
     */
    optimizeComponent(componentName: string, component: any): void;
    /**
     * Rompe referencias circulares
     */
    private breakCircularReferences;
    /**
     * Limpia propiedades no utilizadas
     */
    private cleanUnusedProperties;
    /**
     * Ejecuta optimización completa del sistema
     */
    performFullSystemOptimization(): Promise<void>;
    /**
     * Método público para activar limpieza agresiva (usado por tests de estabilidad)
     */
    triggerAggressiveCleanup(): void;
    /**
     * Detiene el optimizador
     */
    stop(): void;
}
export declare const punkMemoryOptimizer: PunkMemoryOptimizer;
export default punkMemoryOptimizer;
//# sourceMappingURL=PunkMemoryOptimizer.d.ts.map
