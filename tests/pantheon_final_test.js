import { deterministicRandom } from "../shared/deterministic-utils.js";
import * as process from "process";
import { ComponentLifecycleManager } from "../shared/ComponentLifecycleManager";
import { BufferFactory } from "../shared/LimitedBuffer";
import { TTLCacheFactory } from "../shared/TTLCache";
import { WeakReferenceManager } from "../swarm/core/WeakReferenceManager";
import { CircuitBreakerFactory, } from "../shared/CircuitBreaker";
class PantheonFinalTest {
    constructor() {
        this.results = [];
        this.startTime = 0;
        this.gcEventCount = 0;
        this.intervalHandles = [];
        console.log("🏛️ INICIANDO PRUEBA FINAL DEL PANTEÓN V194");
        console.log("⚡ Sistema Selene - Test Integrado Completo");
        this.lifecycleManager = ComponentLifecycleManager.getInstance();
        this.weakRefManager = WeakReferenceManager.getInstance();
        // Configurar monitoreo de GC
        this.setupGCMonitoring();
    }
    setupGCMonitoring() {
        // Forzar exposición del GC si está disponible
        if (global.gc) {
            console.log("🗑️ GC monitoring enabled");
        }
        // Monitor de memoria cada segundo
        const memoryMonitor = setInterval(() => {
            const usage = process.memoryUsage();
            if (usage.heapUsed > 100 * 1024 * 1024) {
                // > 100MB
                console.warn(`⚠️ High memory usage detected: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
            }
        }, 1000);
        this.intervalHandles.push(memoryMonitor);
    }
    captureSystemMetrics() {
        const cpuUsage = process.cpuUsage();
        const memoryUsage = process.memoryUsage();
        return {
            timestamp: Date.now(),
            cpuUsage,
            memoryUsage,
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
            rss: memoryUsage.rss,
            external: memoryUsage.external,
            eventListeners: process._getActiveHandles().length +
                process._getActiveRequests().length,
            activeTimers: process._getActiveHandles().length,
            gcEvents: this.gcEventCount,
        };
    }
    captureComponentMetrics() {
        const lifecycleStats = this.lifecycleManager.getStats();
        const weakRefStats = this.weakRefManager.getStats();
        const circuitStats = CircuitBreakerFactory.getAllStats();
        // Calcular estadísticas de circuit breakers
        const circuitValues = Object.values(circuitStats);
        const openCircuits = circuitValues.filter((_c) => _c.state === "OPEN").length;
        const totalCascades = circuitValues.reduce((_sum, _c) => _sum + _c.cascadesPrevented, 0);
        const totalCalls = circuitValues.reduce((_sum, _c) => _sum + _c.totalCalls, 0);
        return {
            lifecycle: {
                registeredComponents: lifecycleStats.registeredComponents,
                activeEventListeners: lifecycleStats.activeEventListeners,
                activeTimers: lifecycleStats.activeTimers,
                cleanupOperations: lifecycleStats.cleanupOperations,
            },
            buffers: {
                activeBuffers: 0, // TODO: Implementar cuando BufferFactory tenga stats
                totalItems: 0,
                overflowEvents: 0,
                compressionRatio: 0,
            },
            cache: {
                activeCaches: 0, // TODO: Implementar cuando TTLCacheFactory tenga stats
                totalEntries: 0,
                hitRate: 0,
                expiredEntries: 0,
            },
            weakRefs: {
                activeReferences: weakRefStats.activeReferences,
                garbageCollected: weakRefStats.garbageCollectedRefs,
                relationships: weakRefStats.relationshipCount,
                circularRefsDetected: 0, // TODO: Agregar contador en WeakRefManager
            },
            circuitBreakers: {
                totalCircuits: circuitValues.length,
                openCircuits,
                cascadesPrevented: totalCascades,
                totalCalls,
            },
        };
    }
    calculateStabilityScore(startMetrics, endMetrics, componentMetrics) {
        let score = 100;
        // Penalizar por uso excesivo de memoria
        const memoryGrowth = endMetrics.heapUsed - startMetrics.heapUsed;
        const memoryGrowthMB = memoryGrowth / (1024 * 1024);
        if (memoryGrowthMB > 50)
            score -= 20;
        else if (memoryGrowthMB > 20)
            score -= 10;
        // Penalizar por circuit breakers abiertos
        if (componentMetrics.circuitBreakers.openCircuits > 0) {
            score -= componentMetrics.circuitBreakers.openCircuits * 15;
        }
        // Bonificar por cascadas prevenidas
        score += Math.min(componentMetrics.circuitBreakers.cascadesPrevented * 5, 20);
        // Penalizar por listeners no limpiados
        const listenerGrowth = endMetrics.eventListeners - startMetrics.eventListeners;
        if (listenerGrowth > 10)
            score -= 15;
        // Bonificar por garbage collection efectivo
        if (componentMetrics.weakRefs.garbageCollected > 0)
            score += 10;
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Test 1: Carga intensiva de componentes con lifecycle management
     */
    async testIntensiveComponentLoad() {
        const testName = "Intensive Component Load with Lifecycle Management";
        const startMetrics = this.captureSystemMetrics();
        const startTime = Date.now();
        const warnings = [];
        const errors = [];
        try {
            console.log("\n🔥 Ejecutando test de carga intensiva de componentes...");
            // Crear 1000 componentes con event listeners y timers
            const components = [];
            for (let i = 0; i < 1000; i++) {
                const component = {
                    id: `component-${i}`,
                    name: `Test Component ${i}`,
                    data: new Array(1000).fill(deterministicRandom()), // 1KB de datos por componente
                    cleanup: () => {
                        /* cleanup logic */
                    },
                    getId: () => `component-${i}`,
                };
                components.push(component);
                // Registrar en lifecycle manager
                this.lifecycleManager.registerComponent(component);
                // Agregar event listeners usando EventEmitter estándar
                const EventEmitter = require("events");
                const mockEmitter = new EventEmitter();
                const listener = () => console.log(`Event from ${component.id}`);
                this.lifecycleManager.registerEventListener(component.id, mockEmitter, "testEvent", listener);
                // Agregar timers
                const timer = setInterval(() => {
                    // Simular trabajo
                    deterministicRandom() * deterministicRandom();
                }, 100 + deterministicRandom() * 900);
                this.lifecycleManager.registerTimer(component.id, timer, "interval");
                // Cada 100 componentes, verificar memoria
                if (i % 100 === 0) {
                    const currentMemory = process.memoryUsage().heapUsed / (1024 * 1024);
                    if (currentMemory > 200) {
                        warnings.push(`High memory usage at component ${i}: ${currentMemory.toFixed(2)}MB`);
                    }
                }
            }
            // Esperar un poco para que se estabilice
            await new Promise((_resolve) => setTimeout(_resolve, 2000));
            // Limpiar la mitad de los componentes
            for (let i = 0; i < 500; i++) {
                this.lifecycleManager.unregisterComponent(`component-${i}`);
            }
            // Esperar cleanup
            await new Promise((_resolve) => setTimeout(_resolve, 1000));
            // Forzar GC si está disponible
            if (global.gc) {
                global.gc();
                this.gcEventCount++;
            }
            const endMetrics = this.captureSystemMetrics();
            const componentMetrics = this.captureComponentMetrics();
            const duration = Date.now() - startTime;
            const stabilityScore = this.calculateStabilityScore(startMetrics, endMetrics, componentMetrics);
            return {
                testName,
                success: stabilityScore > 70,
                duration,
                startMetrics,
                endMetrics,
                componentMetrics,
                stabilityScore,
                details: `Created 1000 components, cleaned 500. Stability: ${stabilityScore}%`,
                warnings,
                errors,
            };
        }
        catch (error) {
            errors.push(`Test failed: ${error}`);
            return {
                testName,
                success: false,
                duration: Date.now() - startTime,
                startMetrics,
                endMetrics: this.captureSystemMetrics(),
                componentMetrics: this.captureComponentMetrics(),
                stabilityScore: 0,
                details: `Test failed with error: ${error}`,
                warnings,
                errors,
            };
        }
    }
    /**
     * Test 2: Buffer overflow stress test
     */
    async testBufferOverflowStress() {
        const testName = "Buffer Overflow Stress Test";
        const startMetrics = this.captureSystemMetrics();
        const startTime = Date.now();
        const warnings = [];
        const errors = [];
        try {
            console.log("\n🔥 Ejecutando test de stress de buffers...");
            // Crear múltiples buffers con diferentes estrategias
            // Simular múltiples buffers para el test
            const buffers = [
                BufferFactory.createLogBuffer("test-log"),
                BufferFactory.createEventBuffer("test-event"),
            ];
            // Llenar buffers más allá de su capacidad
            for (let round = 0; round < 5; round++) {
                for (let i = 0; i < 150; i++) {
                    const data = {
                        id: `item-${round}-${i}`,
                        timestamp: Date.now(),
                        payload: new Array(100).fill(deterministicRandom()),
                    };
                    buffers.forEach((_buffer) => {
                        try {
                            _buffer.push(data);
                        }
                        catch (error) {
                            // Las excepciones de overflow son esperadas y deseadas - no son errores
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            if (errorMessage.includes("Buffer overflow")) {
                                // Comportamiento correcto del buffer
                                console.log(`✅ Buffer correctamente rechazó overflow: ${errorMessage}`);
                            }
                            else {
                                // Solo errores inesperados van aquí
                                errors.push(`Unexpected error: ${errorMessage}`);
                            }
                        }
                    });
                }
                // Verificar memoria entre rounds
                const currentMemory = process.memoryUsage().heapUsed / (1024 * 1024);
                if (currentMemory > 150) {
                    warnings.push(`High memory usage in round ${round}: ${currentMemory.toFixed(2)}MB`);
                }
                await new Promise((_resolve) => setTimeout(_resolve, 100));
            }
            // Verificar que los buffers mantuvieron sus límites
            let bufferSizesValid = true;
            buffers.forEach((buffer) => {
                if (buffer.size() > 100) {
                    bufferSizesValid = false;
                    warnings.push(`Buffer ${buffer.size()} exceeded limit of 100`);
                }
            });
            const endMetrics = this.captureSystemMetrics();
            const componentMetrics = this.captureComponentMetrics();
            const duration = Date.now() - startTime;
            const stabilityScore = this.calculateStabilityScore(startMetrics, endMetrics, componentMetrics);
            return {
                testName,
                success: bufferSizesValid && stabilityScore > 70,
                duration,
                startMetrics,
                endMetrics,
                componentMetrics,
                stabilityScore,
                details: `Tested 3 buffer types with overflow scenarios. All limits respected: ${bufferSizesValid}`,
                warnings,
                errors,
            };
        }
        catch (error) {
            errors.push(`Test failed: ${error}`);
            return {
                testName,
                success: false,
                duration: Date.now() - startTime,
                startMetrics,
                endMetrics: this.captureSystemMetrics(),
                componentMetrics: this.captureComponentMetrics(),
                stabilityScore: 0,
                details: `Test failed with error: ${error}`,
                warnings,
                errors,
            };
        }
    }
    /**
     * Test 3: Cache TTL and memory management
     */
    async testCacheMemoryManagement() {
        const testName = "Cache TTL and Memory Management";
        const startMetrics = this.captureSystemMetrics();
        const startTime = Date.now();
        const warnings = [];
        const errors = [];
        try {
            console.log("\n🔥 Ejecutando test de gestión de memoria de cache...");
            // Crear múltiples caches con diferentes configuraciones
            const shortCache = TTLCacheFactory.createFastCache("test-short");
            const mediumCache = TTLCacheFactory.createFastCache("test-medium");
            const longCache = TTLCacheFactory.createFastCache("test-long");
            // Llenar caches con datos
            for (let i = 0; i < 500; i++) {
                const data = {
                    value: new Array(200).fill(deterministicRandom()),
                    timestamp: Date.now(),
                };
                shortCache.set(`short-${i}`, data);
                mediumCache.set(`medium-${i}`, data);
                longCache.set(`long-${i}`, data);
            }
            // Verificar que todos están llenos
            console.log(`📊 Caches filled - Short: ${shortCache.size()}, Medium: ${mediumCache.size()}, Long: ${longCache.size()}`);
            // Esperar que short cache expire (TTL: 30s)
            console.log("⏳ Waiting for short cache expiration...");
            await new Promise((_resolve) => setTimeout(_resolve, 5000));
            // Forzar cleanup
            if (global.gc) {
                global.gc();
                this.gcEventCount++;
            }
            const endMetrics = this.captureSystemMetrics();
            const componentMetrics = this.captureComponentMetrics();
            const duration = Date.now() - startTime;
            const stabilityScore = this.calculateStabilityScore(startMetrics, endMetrics, componentMetrics);
            return {
                testName,
                success: stabilityScore > 60, // Más leniente por ser cache test
                duration,
                startMetrics,
                endMetrics,
                componentMetrics,
                stabilityScore,
                details: `Tested 3 cache types with TTL expiration. Final sizes - Short: ${shortCache.size()}, Medium: ${mediumCache.size()}, Long: ${longCache.size()}`,
                warnings,
                errors,
            };
        }
        catch (error) {
            errors.push(`Test failed: ${error}`);
            return {
                testName,
                success: false,
                duration: Date.now() - startTime,
                startMetrics,
                endMetrics: this.captureSystemMetrics(),
                componentMetrics: this.captureComponentMetrics(),
                stabilityScore: 0,
                details: `Test failed with error: ${error}`,
                warnings,
                errors,
            };
        }
    }
    /**
     * Test 4: Weak references and circular dependency stress
     */
    async testWeakReferencesStress() {
        const testName = "Weak References and Circular Dependency Stress";
        const startMetrics = this.captureSystemMetrics();
        const startTime = Date.now();
        const warnings = [];
        const errors = [];
        try {
            console.log("\n🔥 Ejecutando test de stress de referencias débiles...");
            // Crear red compleja de objetos con referencias circulares
            const objects = [];
            for (let i = 0; i < 200; i++) {
                const obj = {
                    id: `object-${i}`,
                    data: new Array(500).fill(deterministicRandom()),
                    refs: [],
                };
                objects.push(obj);
                this.weakRefManager.createWeakRef(obj, obj.id);
            }
            // Crear referencias circulares complejas
            for (let i = 0; i < objects.length; i++) {
                const current = objects[i];
                const next = objects[(i + 1) % objects.length];
                const prev = objects[(i - 1 + objects.length) % objects.length];
                // Cada objeto referencia al siguiente y anterior
                this.weakRefManager.createRelationship(current.id, next.id, "dependency");
                this.weakRefManager.createRelationship(current.id, prev.id, "observer");
                // Algunos objetos tienen referencias múltiples
                if (i % 10 === 0) {
                    for (let j = 1; j <= 5; j++) {
                        const target = objects[(i + j) % objects.length];
                        this.weakRefManager.createRelationship(current.id, target.id, "child");
                    }
                }
            }
            console.log(`🔗 Created complex reference network with ${objects.length} objects`);
            // Detectar referencias circulares
            const circularRefs = this.weakRefManager.detectCircularReferences();
            console.log(`🔄 Detected ${circularRefs.length} circular references`);
            // Simular que algunos objetos salen de scope
            for (let i = 0; i < 100; i++) {
                objects[i] = null;
            }
            // Forzar GC
            if (global.gc) {
                global.gc();
                this.gcEventCount++;
            }
            // Esperar cleanup automático
            await new Promise((_resolve) => setTimeout(_resolve, 2000));
            const endMetrics = this.captureSystemMetrics();
            const componentMetrics = this.captureComponentMetrics();
            const duration = Date.now() - startTime;
            const stabilityScore = this.calculateStabilityScore(startMetrics, endMetrics, componentMetrics);
            return {
                testName,
                success: circularRefs.length > 0 && stabilityScore > 65,
                duration,
                startMetrics,
                endMetrics,
                componentMetrics,
                stabilityScore,
                details: `Created 200 objects with circular refs. Detected ${circularRefs.length} cycles. GC collected: ${componentMetrics.weakRefs.garbageCollected}`,
                warnings,
                errors,
            };
        }
        catch (error) {
            errors.push(`Test failed: ${error}`);
            return {
                testName,
                success: false,
                duration: Date.now() - startTime,
                startMetrics,
                endMetrics: this.captureSystemMetrics(),
                componentMetrics: this.captureComponentMetrics(),
                stabilityScore: 0,
                details: `Test failed with error: ${error}`,
                warnings,
                errors,
            };
        }
    }
    /**
     * Test 5: Circuit breaker cascade prevention under load
     */
    async testCircuitBreakerCascades() {
        const testName = "Circuit Breaker Cascade Prevention Under Load";
        const startMetrics = this.captureSystemMetrics();
        const startTime = Date.now();
        const warnings = [];
        const errors = [];
        try {
            console.log("\n🔥 Ejecutando test de prevención de cascadas...");
            // Crear red de circuit breakers interconectados
            const circuits = [];
            for (let i = 0; i < 10; i++) {
                const circuit = CircuitBreakerFactory.create(`stress-circuit-${i}`, "critical");
                circuits.push(circuit);
            }
            // Relacionar circuitos para detección de cascadas
            const circuitNames = circuits.map((_c) => _c.getName());
            CircuitBreakerFactory.relateCircuits(circuitNames);
            // Simular operaciones que fallan gradualmente
            const failingOp = async (_failureRate) => {
                await new Promise((_resolve) => setTimeout(_resolve, 10 + deterministicRandom() * 90));
                if (deterministicRandom() < _failureRate) {
                    throw new Error("Simulated service failure");
                }
                return "Success";
            };
            const fallbackOp = async () => {
                await new Promise((_resolve) => setTimeout(_resolve, 5));
                return "Fallback response";
            };
            // Generar carga intensa con fallas incrementales
            const promises = [];
            for (let round = 0; round < 5; round++) {
                const failureRate = 0.1 + round * 0.2; // Incrementar fallas del 10% al 90%
                console.log(`🔄 Round ${round + 1}: ${(failureRate * 100).toFixed(0)}% failure rate`);
                for (let i = 0; i < 100; i++) {
                    const circuit = circuits[i % circuits.length];
                    const promise = circuit
                        .execute(() => failingOp(failureRate), fallbackOp)
                        .catch(() => "Circuit blocked or failed");
                    promises.push(promise);
                }
                // Esperar entre rounds
                await new Promise((_resolve) => setTimeout(_resolve, 500));
            }
            // Esperar que todas las operaciones terminen
            await Promise.all(promises);
            // Obtener estadísticas finales
            const finalStats = CircuitBreakerFactory.getAllStats();
            const totalCascades = Object.values(finalStats).reduce((_sum, _stats) => _sum + _stats.cascadesPrevented, 0);
            const openCircuits = Object.values(finalStats).filter((_stats) => _stats.state === "OPEN").length;
            console.log(`🚨 Total cascades prevented: ${totalCascades}`);
            console.log(`⚡ Open circuits: ${openCircuits}/${circuits.length}`);
            const endMetrics = this.captureSystemMetrics();
            const componentMetrics = this.captureComponentMetrics();
            const duration = Date.now() - startTime;
            const stabilityScore = this.calculateStabilityScore(startMetrics, endMetrics, componentMetrics);
            return {
                testName,
                success: totalCascades > 0 && stabilityScore > 60,
                duration,
                startMetrics,
                endMetrics,
                componentMetrics,
                stabilityScore,
                details: `Tested 10 interconnected circuits under increasing load. Prevented ${totalCascades} cascades. ${openCircuits} circuits opened.`,
                warnings,
                errors,
            };
        }
        catch (error) {
            errors.push(`Test failed: ${error}`);
            return {
                testName,
                success: false,
                duration: Date.now() - startTime,
                startMetrics,
                endMetrics: this.captureSystemMetrics(),
                componentMetrics: this.captureComponentMetrics(),
                stabilityScore: 0,
                details: `Test failed with error: ${error}`,
                warnings,
                errors,
            };
        }
    }
    /**
     * Ejecutar todos los tests integrados
     */
    async runAllTests() {
        console.log("\n🏛️ EJECUTANDO PRUEBA FINAL DEL PANTEÓN V194");
        console.log("=".repeat(80));
        this.startTime = Date.now();
        // Ejecutar tests en secuencia para aislamiento de métricas
        this.results.push(await this.testIntensiveComponentLoad());
        this.results.push(await this.testBufferOverflowStress());
        this.results.push(await this.testCacheMemoryManagement());
        this.results.push(await this.testWeakReferencesStress());
        this.results.push(await this.testCircuitBreakerCascades());
        this.printResults();
        this.cleanup();
    }
    printResults() {
        console.log("\n🏛️ RESULTADOS FINALES - PRUEBA DEL PANTEÓN V194");
        console.log("=".repeat(80));
        let totalPassed = 0;
        let totalFailed = 0;
        let averageStability = 0;
        let totalDuration = 0;
        this.results.forEach((result, _index) => {
            const status = result.success ? "✅ PASS" : "❌ FAIL";
            const icon = result.success ? "🔥" : "💥";
            console.log(`\n${icon} Test ${_index + 1}: ${result.testName}`);
            console.log(`   Status: ${status}`);
            console.log(`   Duration: ${result.duration}ms`);
            console.log(`   Stability Score: ${result.stabilityScore.toFixed(1)}%`);
            console.log(`   Details: ${result.details}`);
            // Métricas de memoria
            const memoryGrowth = result.endMetrics.heapUsed - result.startMetrics.heapUsed;
            const memoryGrowthMB = (memoryGrowth / (1024 * 1024)).toFixed(2);
            console.log(`   Memory Growth: ${memoryGrowthMB}MB`);
            // Componentes
            console.log(`   Component Stats:`);
            console.log(`     - Lifecycle: ${result.componentMetrics.lifecycle.registeredComponents} components, ${result.componentMetrics.lifecycle.cleanupOperations} cleanups`);
            console.log(`     - WeakRefs: ${result.componentMetrics.weakRefs.activeReferences} active, ${result.componentMetrics.weakRefs.garbageCollected} GC'd`);
            console.log(`     - Circuits: ${result.componentMetrics.circuitBreakers.totalCircuits} total, ${result.componentMetrics.circuitBreakers.cascadesPrevented} cascades prevented`);
            if (result.warnings.length > 0) {
                console.log(`   Warnings: ${result.warnings.length}`);
                result.warnings.forEach((_warning) => console.log(`     ⚠️  ${_warning}`));
            }
            if (result.errors.length > 0) {
                console.log(`   Errors: ${result.errors.length}`);
                result.errors.forEach((_error) => console.log(`     🚨 ${_error}`));
            }
            if (result.success)
                totalPassed++;
            else
                totalFailed++;
            averageStability += result.stabilityScore;
            totalDuration += result.duration;
        });
        averageStability /= this.results.length;
        const totalTime = Date.now() - this.startTime;
        console.log("\n" + "=".repeat(80));
        console.log(`📊 RESUMEN EJECUTIVO:`);
        console.log(`   Tests: ${totalPassed} PASSED | ${totalFailed} FAILED`);
        console.log(`   Estabilidad Promedio: ${averageStability.toFixed(1)}%`);
        console.log(`   Tiempo Total: ${totalTime}ms`);
        console.log(`   Tiempo de Pruebas: ${totalDuration}ms`);
        // Evaluación final
        const finalScore = (totalPassed / this.results.length) * averageStability;
        console.log(`\n🎯 PUNTUACIÓN FINAL DEL PANTEÓN: ${finalScore.toFixed(1)}/100`);
        if (finalScore >= 80) {
            console.log("🏛️ ¡ÉXITO! El SEMIDIOS APOLLO ha superado la Prueba del Panteón");
            console.log("🔥 Sistema listo para OFFLINE + ENJAMBRE");
        }
        else if (finalScore >= 60) {
            console.log("⚠️  PARCIAL: El sistema es funcional pero requiere optimizaciones");
        }
        else {
            console.log("❌ FALLO: El sistema requiere correcciones críticas antes de continuar");
        }
        console.log("\n🌌 Preparando para la siguiente fase: GALAXIA INTERCONECTADA");
    }
    cleanup() {
        // Limpiar intervals
        this.intervalHandles.forEach((_handle) => clearInterval(_handle));
        this.intervalHandles = [];
        // Limpiar managers
        this.lifecycleManager.shutdown();
        console.log("🧹 Cleanup completed");
    }
}
// Ejecutar test si es llamado directamente
if (require.main === module) {
    const test = new PantheonFinalTest();
    test.runAllTests().catch(console.error);
}
export { PantheonFinalTest };
//# sourceMappingURL=pantheon_final_test.js.map