/**
 * 🔧 COMPONENT LIFECYCLE MANAGER V194
 * Directiva V194: Cirugía del Panteón - Fix #1
 *
 * PROPÓSITO: Gestión automática del lifecycle de componentes Selene
 * para prevenir event listener leaks y referencias circulares
 */
import { timerManager } from "./TimerManager";
export class ComponentLifecycleManager {
    constructor() {
        this.registeredComponents = new Map();
        this.eventListeners = new Map();
        this.timers = new Map();
        this.cleanupCallbacks = new Map();
        // Configuración de límites de seguridad
        this.MAX_LISTENERS_PER_COMPONENT = 50;
        this.MAX_TIMERS_PER_COMPONENT = 10;
        this.CLEANUP_INTERVAL = 60000; // 1 minuto
        this.cleanupInterval = null;
        this.startPeriodicCleanup();
    }
    static getInstance() {
        if (!ComponentLifecycleManager.instance) {
            ComponentLifecycleManager.instance = new ComponentLifecycleManager();
        }
        return ComponentLifecycleManager.instance;
    }
    /**
     * Registra un componente para gestión de lifecycle
     */
    registerComponent(component) {
        const id = component.getId();
        if (this.registeredComponents.has(id)) {
            console.warn(`⚠️ ComponentLifecycleManager: Componente ${id} ya registrado. Limpiando instancia previa.`);
            this.unregisterComponent(id);
        }
        this.registeredComponents.set(id, component);
        this.eventListeners.set(id, new Set());
        this.timers.set(id, new Set());
        this.cleanupCallbacks.set(id, new Set());
        console.log(`✅ ComponentLifecycleManager: Componente ${id} registrado`);
    }
    /**
     * Registra un event listener con cleanup automático
     */
    registerEventListener(componentId, emitter, event, listener) {
        const listeners = this.eventListeners.get(componentId);
        if (!listeners) {
            throw new Error(`Componente ${componentId} no registrado`);
        }
        // Verificar límite de listeners
        if (listeners.size >= this.MAX_LISTENERS_PER_COMPONENT) {
            console.warn(`⚠️ ComponentLifecycleManager: Componente ${componentId} ha alcanzado el límite de listeners (${this.MAX_LISTENERS_PER_COMPONENT})`);
            return;
        }
        const registry = {
            event,
            listener,
            emitter,
            timestamp: Date.now(),
        };
        listeners.add(registry);
        emitter.on(event, listener);
        console.log(`🔗 ComponentLifecycleManager: Listener registrado - ${componentId}:${event}`);
    }
    /**
     * Registra un timer con cleanup automático
     */
    registerTimer(componentId, timer, type) {
        const timers = this.timers.get(componentId);
        if (!timers) {
            throw new Error(`Componente ${componentId} no registrado`);
        }
        // Verificar límite de timers
        if (timers.size >= this.MAX_TIMERS_PER_COMPONENT) {
            console.warn(`⚠️ ComponentLifecycleManager: Componente ${componentId} ha alcanzado el límite de timers (${this.MAX_TIMERS_PER_COMPONENT})`);
            clearTimeout(timer);
            return;
        }
        const registry = {
            id: timer,
            type,
            created: Date.now(),
        };
        timers.add(registry);
        console.log(`⏰ ComponentLifecycleManager: Timer registrado - ${componentId}:${type}`);
    }
    /**
     * Registra callback de cleanup personalizado
     */
    registerCleanupCallback(componentId, _callback) {
        const callbacks = this.cleanupCallbacks.get(componentId);
        if (!callbacks) {
            throw new Error(`Componente ${componentId} no registrado`);
        }
        callbacks.add(_callback);
        console.log(`🧹 ComponentLifecycleManager: Cleanup callback registrado - ${componentId}`);
    }
    /**
     * Desregistra y limpia un componente completamente
     */
    async unregisterComponent(componentId) {
        console.log(`🔥 ComponentLifecycleManager: Iniciando cleanup de ${componentId}`);
        // 1. Limpiar event listeners
        await this.cleanupEventListeners(componentId);
        // 2. Limpiar timers
        await this.cleanupTimers(componentId);
        // 3. Ejecutar callbacks de cleanup
        await this.executeCleanupCallbacks(componentId);
        // 4. Llamar al cleanup del componente
        const component = this.registeredComponents.get(componentId);
        if (component) {
            try {
                await component.cleanup();
            }
            catch (error) {
                console.error(`❌ ComponentLifecycleManager: Error en cleanup de ${componentId}:`, error);
            }
        }
        // 5. Limpiar registros
        this.registeredComponents.delete(componentId);
        this.eventListeners.delete(componentId);
        this.timers.delete(componentId);
        this.cleanupCallbacks.delete(componentId);
        console.log(`✅ ComponentLifecycleManager: Cleanup completo de ${componentId}`);
    }
    /**
     * Limpia event listeners de un componente
     */
    async cleanupEventListeners(componentId) {
        const listeners = this.eventListeners.get(componentId);
        if (!listeners)
            return;
        let cleaned = 0;
        for (const registry of Array.from(listeners)) {
            try {
                // Verificar que el emitter tenga el método removeListener antes de usarlo
                if (registry.emitter &&
                    typeof registry.emitter.removeListener === "function") {
                    registry.emitter.removeListener(registry.event, registry.listener);
                    cleaned++;
                }
                else if (registry.emitter &&
                    typeof registry.emitter.off === "function") {
                    // Fallback para emitters que usan .off() en lugar de .removeListener()
                    registry.emitter.off(registry.event, registry.listener);
                    cleaned++;
                }
                else {
                    console.warn(`⚠️ ComponentLifecycleManager: Emitter no tiene método removeListener o off para evento ${registry.event}`);
                }
            }
            catch (error) {
                console.error(`❌ ComponentLifecycleManager: Error removiendo listener ${registry.event}:`, error);
            }
        }
        listeners.clear();
        console.log(`🧹 ComponentLifecycleManager: ${cleaned} listeners limpiados de ${componentId}`);
    }
    /**
     * Limpia timers de un componente
     */
    async cleanupTimers(componentId) {
        const timers = this.timers.get(componentId);
        if (!timers)
            return;
        let cleaned = 0;
        for (const registry of Array.from(timers)) {
            try {
                clearTimeout(registry.id);
                clearInterval(registry.id);
                cleaned++;
            }
            catch (error) {
                console.error(`❌ ComponentLifecycleManager: Error limpiando timer:`, error);
            }
        }
        timers.clear();
        console.log(`⏰ ComponentLifecycleManager: ${cleaned} timers limpiados de ${componentId}`);
    }
    /**
     * Ejecuta callbacks de cleanup personalizados
     */
    async executeCleanupCallbacks(componentId) {
        const callbacks = this.cleanupCallbacks.get(componentId);
        if (!callbacks)
            return;
        let executed = 0;
        for (const callback of Array.from(callbacks)) {
            try {
                await callback();
                executed++;
            }
            catch (error) {
                console.error(`❌ ComponentLifecycleManager: Error ejecutando cleanup callback:`, error);
            }
        }
        callbacks.clear();
        console.log(`🧹 ComponentLifecycleManager: ${executed} cleanup callbacks ejecutados de ${componentId}`);
    }
    /**
     * Cleanup periódico automático
     */
    startPeriodicCleanup() {
        this.cleanupInterval = timerManager.setInterval(() => {
            this.performPeriodicCleanup();
        }, this.CLEANUP_INTERVAL, "component_lifecycle_cleanup");
    }
    /**
     * Ejecuta cleanup periódico de recursos huérfanos
     */
    performPeriodicCleanup() {
        const now = Date.now();
        const oldThreshold = now - 5 * 60 * 1000; // 5 minutos
        console.log("🔄 ComponentLifecycleManager: Ejecutando cleanup periódico...");
        for (const [componentId, listeners] of Array.from(this.eventListeners)) {
            // Limpiar listeners antiguos (más de 5 minutos sin actividad)
            const staleListeners = Array.from(listeners).filter((_l) => _l.timestamp < oldThreshold);
            for (const stale of staleListeners) {
                try {
                    stale.emitter.removeListener(stale.event, stale.listener);
                    listeners.delete(stale);
                    console.log(`🧹 Listener obsoleto removido: ${componentId}:${stale.event}`);
                }
                catch (error) {
                    console.error("Error removiendo listener obsoleto:", error);
                }
            }
        }
        // Reportar estado
        const totalComponents = this.registeredComponents.size;
        const totalListeners = Array.from(this.eventListeners.values()).reduce((_sum, _set) => _sum + _set.size, 0);
        const totalTimers = Array.from(this.timers.values()).reduce((_sum, _set) => _sum + _set.size, 0);
        console.log(`📊 ComponentLifecycleManager Estado: ${totalComponents} componentes, ${totalListeners} listeners, ${totalTimers} timers`);
    }
    /**
     * Shutdown completo del manager
     */
    async shutdown() {
        console.log("🔥 ComponentLifecycleManager: Iniciando shutdown completo...");
        // Detener cleanup periódico
        if (this.cleanupInterval) {
            timerManager.clear(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        // Cleanup de todos los componentes
        const componentIds = Array.from(this.registeredComponents.keys());
        for (const componentId of componentIds) {
            await this.unregisterComponent(componentId);
        }
        console.log("✅ ComponentLifecycleManager: Shutdown completo");
    }
    /**
     * Obtener estadísticas del manager
     */
    getStats() {
        const stats = {
            totalComponents: this.registeredComponents.size,
            totalListeners: 0,
            totalTimers: 0,
            componentDetails: {},
        };
        for (const [componentId, listeners] of Array.from(this.eventListeners)) {
            const timers = this.timers.get(componentId) || new Set();
            const callbacks = this.cleanupCallbacks.get(componentId) || new Set();
            stats.totalListeners += listeners.size;
            stats.totalTimers += timers.size;
            stats.componentDetails[componentId] = {
                listeners: listeners.size,
                timers: timers.size,
                callbacks: callbacks.size,
            };
        }
        return stats;
    }
}
// Singleton global para fácil acceso
export const lifecycleManager = ComponentLifecycleManager.getInstance();
// Cleanup automático en shutdown del proceso
process.on("SIGINT", async () => {
    await lifecycleManager.shutdown();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    await lifecycleManager.shutdown();
    process.exit(0);
});
export default lifecycleManager;
//# sourceMappingURL=ComponentLifecycleManager.js.map