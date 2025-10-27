#!/usr/bin/env ts-node
declare class PantheonSilentTest {
    private lifecycleManager;
    private weakRefManager;
    private silentMode;
    constructor();
    private setSilentMode;
    private captureSystemMetrics;
    private captureComponentMetrics;
    private calculateStabilityScore;
    /**
     * Test 1: Component Lifecycle (Silencioso)
     */
    private testComponentLifecycleSilent;
    /**
     * Test 2: Buffer Limits (Silencioso)
     */
    private testBufferLimitsSilent;
    /**
     * Test 3: TTL Cache (Silencioso)
     */
    private testTTLCacheSilent;
    /**
     * Test 4: Weak References (Silencioso)
     */
    private testWeakReferencesSilent;
    /**
     * Test 5: Circuit Breakers (Silencioso)
     */
    private testCircuitBreakersSilent;
    /**
     * Ejecutar todos los tests
     */
    runAllTests(): Promise<void>;
}
export { PantheonSilentTest };
//# sourceMappingURL=pantheon_silent_test.d.ts.map
