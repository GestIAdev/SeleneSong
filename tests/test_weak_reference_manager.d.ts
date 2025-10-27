declare class WeakReferenceManagerTest {
    private manager;
    private results;
    constructor();
    private createTestComponent;
    /**
     * Test 1: Registro y recuperación básica de componentes
     */
    private testBasicReferenceManagement;
    /**
     * Test 2: Relaciones entre componentes
     */
    private testComponentRelationships;
    /**
     * Test 3: Detección de referencias circulares
     */
    private testCircularReferenceDetection;
    /**
     * Test 4: Garbage Collection simulation
     */
    private testGarbageCollection;
    /**
     * Test 5: Performance con muchas referencias
     */
    private testPerformanceWithManyReferences;
    /**
     * Ejecutar todos los tests
     */
    runAllTests(): Promise<void>;
    private printResults;
}
export { WeakReferenceManagerTest };
//# sourceMappingURL=test_weak_reference_manager.d.ts.map
