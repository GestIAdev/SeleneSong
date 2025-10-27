#!/usr/bin/env ts-node
declare class PantheonPerfectionistTest {
    private lifecycleManager;
    private weakRefManager;
    private forensicData;
    constructor();
    private captureSystemMetrics;
    private captureComponentMetrics;
    private calculateStabilityScore;
    /**
     * Test 1: Component Lifecycle (PERFECCIONISTA)
     */
    private testComponentLifecyclePerfect;
    /**
     * Test 2: Buffer Limits (PERFECCIONISTA)
     */
    private testBufferLimitsPerfect;
    /**
     * Test 3: TTL Cache (PERFECCIONISTA)
     */
    private testTTLCachePerfect;
    /**
     * Test 4: Weak References (PERFECCIONISTA)
     */
    private testWeakReferencesPerfect;
    /**
     * Test 5: Circuit Breakers (PERFECCIONISTA)
     */
    private testCircuitBreakersPerfect;
    /**
     * Generar reporte forense completo
     */
    private generateForensicReport;
    /**
     * Ejecutar suite completa y generar reporte
     */
    runPerfectionistSuite(): Promise<void>;
}
export { PantheonPerfectionistTest };
//# sourceMappingURL=pantheon_perfectionist_test.d.ts.map
