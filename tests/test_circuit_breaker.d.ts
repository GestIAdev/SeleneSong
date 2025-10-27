declare class CircuitBreakerTest {
    private results;
    constructor();
    /**
     * Simular operación que puede fallar
     */
    private createFailingOperation;
    /**
     * Simular operación fallback
     */
    private createFallbackOperation;
    /**
     * Test 1: Estados básicos del circuit breaker
     */
    private testBasicStates;
    /**
     * Test 2: Apertura de circuito por fallas
     */
    private testCircuitOpening;
    /**
     * Test 3: Recuperación automática (HALF_OPEN)
     */
    private testRecovery;
    /**
     * Test 4: Fallback functionality
     */
    private testFallback;
    /**
     * Test 5: Detección y prevención de cascadas
     */
    private testCascadePrevention;
    /**
     * Test 6: Performance monitoring
     */
    private testPerformanceMonitoring;
    /**
     * Ejecutar todos los tests
     */
    runAllTests(): Promise<void>;
    private printResults;
}
export { CircuitBreakerTest };
//# sourceMappingURL=test_circuit_breaker.d.ts.map
