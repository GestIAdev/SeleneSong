declare class PantheonFinalTest {
    private results;
    private lifecycleManager;
    private weakRefManager;
    private startTime;
    private gcEventCount;
    private intervalHandles;
    constructor();
    private setupGCMonitoring;
    private captureSystemMetrics;
    private captureComponentMetrics;
    private calculateStabilityScore;
    /**
     * Test 1: Carga intensiva de componentes con lifecycle management
     */
    private testIntensiveComponentLoad;
    /**
     * Test 2: Buffer overflow stress test
     */
    private testBufferOverflowStress;
    /**
     * Test 3: Cache TTL and memory management
     */
    private testCacheMemoryManagement;
    /**
     * Test 4: Weak references and circular dependency stress
     */
    private testWeakReferencesStress;
    /**
     * Test 5: Circuit breaker cascade prevention under load
     */
    private testCircuitBreakerCascades;
    /**
     * Ejecutar todos los tests integrados
     */
    runAllTests(): Promise<void>;
    private printResults;
    private cleanup;
}
export { PantheonFinalTest };
//# sourceMappingURL=pantheon_final_test.d.ts.map
