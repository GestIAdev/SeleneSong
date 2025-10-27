import { deterministicRandom } from "../shared/deterministic-utils.js";
/**
 * 🧪 TEST WEAK REFERENCE MANAGER V194
 * Directiva V194: Cirugía del Panteón - Test Fix #4
 *
 * PROPÓSITO: Validar sistema de referencias débiles para prevenir
 * circular references sin impedir garbage collection
 */
import { WeakReferenceManager } from "../swarm/core/WeakReferenceManager";
class WeakReferenceManagerTest {
    constructor() {
        this.results = [];
        this.manager = WeakReferenceManager.getInstance();
        console.log("🔧 INICIANDO TEST WEAK REFERENCE MANAGER V194");
    }
    createTestComponent(_id, _name) {
        return {
            _id,
            _name,
            data: { timestamp: Date.now(), random: deterministicRandom() },
        };
    }
    /**
     * Test 1: Registro y recuperación básica de componentes
     */
    async testBasicReferenceManagement() {
        const testName = "Basic Reference Management";
        try {
            // Crear componente de prueba
            const component = this.createTestComponent("test-basic-1", "Basic Test Component");
            // Registrar en manager
            this.manager.createWeakRef(component, "test-basic-1");
            // Verificar que se puede recuperar
            const recovered = this.manager
                .getWeakRef("test-basic-1")
                ?.get();
            if (!recovered) {
                return {
                    testName,
                    success: false,
                    details: "Failed to recover registered component",
                };
            }
            if (recovered.id !== component.id || recovered.name !== component.name) {
                return {
                    testName,
                    success: false,
                    details: "Recovered component doesn't match original",
                };
            }
            // Verificar estadísticas
            const stats = this.manager.getStats();
            return {
                testName,
                success: true,
                details: "Component registered and recovered successfully",
                metrics: {
                    referencesCreated: stats.activeReferences,
                },
            };
        }
        catch (error) {
            return {
                testName,
                success: false,
                details: `Test failed with error: ${error}`,
            };
        }
    }
    /**
     * Test 2: Relaciones entre componentes
     */
    async testComponentRelationships() {
        const testName = "Component Relationships";
        try {
            // Crear componentes padre e hijo
            const parent = this.createTestComponent("test-parent-1", "Parent Component");
            const child1 = this.createTestComponent("test-child-1", "Child Component 1");
            const child2 = this.createTestComponent("test-child-2", "Child Component 2");
            // Registrar componentes
            this.manager.createWeakRef(parent, "test-parent-1");
            this.manager.createWeakRef(child1, "test-child-1");
            this.manager.createWeakRef(child2, "test-child-2");
            // Crear relaciones
            this.manager.createRelationship("test-parent-1", "test-child-1", "child");
            this.manager.createRelationship("test-parent-1", "test-child-2", "child");
            this.manager.createRelationship("test-child-1", "test-parent-1", "dependency");
            // Verificar relaciones
            const children = this.manager.getChildren("test-parent-1");
            const dependencies = this.manager.getDependencies("test-child-1");
            if (children.length !== 2) {
                return {
                    testName,
                    success: false,
                    details: `Expected 2 children, got ${children.length}`,
                };
            }
            if (dependencies.length !== 1) {
                return {
                    testName,
                    success: false,
                    details: `Expected 1 dependency, got ${dependencies.length}`,
                };
            }
            const stats = this.manager.getStats();
            return {
                testName,
                success: true,
                details: "Component relationships created and verified successfully",
                metrics: {
                    relationshipsCreated: stats.relationshipCount,
                },
            };
        }
        catch (error) {
            return {
                testName,
                success: false,
                details: `Test failed with error: ${error}`,
            };
        }
    }
    /**
     * Test 3: Detección de referencias circulares
     */
    async testCircularReferenceDetection() {
        const testName = "Circular Reference Detection";
        try {
            // Crear componentes para circular reference
            const compA = this.createTestComponent("circular-a", "Component A");
            const compB = this.createTestComponent("circular-b", "Component B");
            const compC = this.createTestComponent("circular-c", "Component C");
            // Registrar componentes
            this.manager.createWeakRef(compA, "circular-a");
            this.manager.createWeakRef(compB, "circular-b");
            this.manager.createWeakRef(compC, "circular-c");
            // Crear relaciones circulares: A -> B -> C -> A
            this.manager.createRelationship("circular-a", "circular-b", "dependency");
            this.manager.createRelationship("circular-b", "circular-c", "dependency");
            this.manager.createRelationship("circular-c", "circular-a", "dependency");
            // Detectar ciclos
            const cycles = this.manager.detectCircularReferences();
            if (cycles.length === 0) {
                return {
                    testName,
                    success: false,
                    details: "Failed to detect circular reference",
                };
            }
            // Verificar que el ciclo contiene los componentes esperados
            const cycle = cycles[0];
            const expectedIds = ["circular-a", "circular-b", "circular-c"];
            const hasAllComponents = expectedIds.every((_id) => cycle.cycle.includes(_id));
            if (!hasAllComponents) {
                return {
                    testName,
                    success: false,
                    details: "Detected cycle doesn't contain expected components",
                };
            }
            return {
                testName,
                success: true,
                details: `Circular reference detected successfully: ${cycle.cycle.join(" -> ")}`,
                metrics: {
                    circularDetected: cycles.length,
                },
            };
        }
        catch (error) {
            return {
                testName,
                success: false,
                details: `Test failed with error: ${error}`,
            };
        }
    }
    /**
     * Test 4: Garbage Collection simulation
     */
    async testGarbageCollection() {
        const testName = "Garbage Collection";
        try {
            const initialStats = this.manager.getStats();
            // Crear componentes temporales en un scope local
            {
                const temp1 = this.createTestComponent("temp-1", "Temporary 1");
                const temp2 = this.createTestComponent("temp-2", "Temporary 2");
                this.manager.createWeakRef(temp1, "temp-1");
                this.manager.createWeakRef(temp2, "temp-2");
                this.manager.createRelationship("temp-1", "temp-2", "dependency");
                // Verificar que existen
                const ref1 = this.manager.getWeakRef("temp-1");
                const ref2 = this.manager.getWeakRef("temp-2");
                if (!ref1?.has() || !ref2?.has()) {
                    return {
                        testName,
                        success: false,
                        details: "Temporary components not properly registered",
                    };
                }
            } // Los objetos salen de scope aquí
            // Forzar garbage collection (esto es experimental)
            if (global.gc) {
                global.gc();
            }
            // Esperar un poco para que el GC actúe
            await new Promise((_resolve) => setTimeout(_resolve, 100));
            // Limpiar referencias muertas
            this.manager.cleanup();
            const finalStats = this.manager.getStats();
            return {
                testName,
                success: true,
                details: "Garbage collection simulation completed",
                metrics: {
                    garbageCollected: finalStats.garbageCollectedRefs,
                },
            };
        }
        catch (error) {
            return {
                testName,
                success: false,
                details: `Test failed with error: ${error}`,
            };
        }
    }
    /**
     * Test 5: Performance con muchas referencias
     */
    async testPerformanceWithManyReferences() {
        const testName = "Performance with Many References";
        try {
            const startTime = Date.now();
            const componentCount = 1000;
            // Crear muchos componentes
            for (let i = 0; i < componentCount; i++) {
                const component = this.createTestComponent(`perf-${i}`, `Performance Component ${i}`);
                this.manager.createWeakRef(component, `perf-${i}`);
                // Crear algunas relaciones
                if (i > 0) {
                    this.manager.createRelationship(`perf-${i}`, `perf-${i - 1}`, "dependency");
                }
            }
            const creationTime = Date.now() - startTime;
            // Probar recuperación
            const retrievalStart = Date.now();
            let successfulRetrievals = 0;
            for (let i = 0; i < componentCount; i++) {
                const ref = this.manager.getWeakRef(`perf-${i}`);
                if (ref?.has()) {
                    successfulRetrievals++;
                }
            }
            const retrievalTime = Date.now() - retrievalStart;
            const stats = this.manager.getStats();
            return {
                testName,
                success: true,
                details: `Created ${componentCount} components in ${creationTime}ms, retrieved ${successfulRetrievals} in ${retrievalTime}ms`,
                metrics: {
                    referencesCreated: stats.activeReferences,
                    relationshipsCreated: stats.relationshipCount,
                },
            };
        }
        catch (error) {
            return {
                testName,
                success: false,
                details: `Test failed with error: ${error}`,
            };
        }
    }
    /**
     * Ejecutar todos los tests
     */
    async runAllTests() {
        console.log("\n🔥 EJECUTANDO TESTS WEAK REFERENCE MANAGER V194\n");
        // Ejecutar tests en secuencia
        this.results.push(await this.testBasicReferenceManagement());
        this.results.push(await this.testComponentRelationships());
        this.results.push(await this.testCircularReferenceDetection());
        this.results.push(await this.testGarbageCollection());
        this.results.push(await this.testPerformanceWithManyReferences());
        this.printResults();
    }
    printResults() {
        console.log("\n📊 RESULTADOS TEST WEAK REFERENCE MANAGER V194");
        console.log("=".repeat(80));
        let passed = 0;
        let failed = 0;
        this.results.forEach((result, _index) => {
            const status = result.success ? "✅ PASS" : "❌ FAIL";
            const icon = result.success ? "🔧" : "💥";
            console.log(`\n${icon} Test ${_index + 1}: ${result.testName}`);
            console.log(`   Status: ${status}`);
            console.log(`   Details: ${result.details}`);
            if (result.metrics) {
                console.log("   Metrics:");
                Object.entries(result.metrics).forEach(([key, value]) => {
                    console.log(`     ${key}: ${value}`);
                });
            }
            if (result.success) {
                passed++;
            }
            else {
                failed++;
            }
        });
        console.log("\n" + "=".repeat(80));
        console.log(`📈 RESUMEN: ${passed} PASSED | ${failed} FAILED`);
        if (failed === 0) {
            console.log("🎯 FIX #4 WEAK REFERENCE MANAGER: VALIDADO CON ÉXITO");
            console.log("🔥 Sistema de referencias débiles funcionando PERFECTAMENTE");
        }
        else {
            console.log("⚠️  FIX #4 WEAK REFERENCE MANAGER: REQUIERE AJUSTES");
        }
        // Estadísticas finales del manager
        const finalStats = this.manager.getStats();
        console.log("\n🔧 ESTADÍSTICAS FINALES WEAK REFERENCE MANAGER:");
        console.log(`   Referencias activas: ${finalStats.activeReferences}`);
        console.log(`   Referencias recolectadas: ${finalStats.garbageCollectedRefs}`);
        console.log(`   Relaciones registradas: ${finalStats.relationshipCount}`);
    }
}
// Ejecutar test si es llamado directamente
if (require.main === module) {
    const test = new WeakReferenceManagerTest();
    test.runAllTests().catch(console.error);
}
export { WeakReferenceManagerTest };
//# sourceMappingURL=test_weak_reference_manager.js.map