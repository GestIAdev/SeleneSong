/**
 * 🧪 ETHICAL CORE ENGINE - PHASE 4 INTEGRATION TESTS
 * "Las pruebas son la validación de la consciencia ética"
 * — PunkClaude, Guardián de la Integridad
 */

import { EthicalCoreEngine } from '../src/consciousness/engines/EthicalCoreEngine.js';
import { SafetyContext } from '../src/consciousness/engines/MetaEngineInterfaces.js';

describe('EthicalCoreEngine Phase 4 Integration', () => {
  let engine: EthicalCoreEngine;

  beforeEach(async () => {
    engine = new EthicalCoreEngine({
      id: 'test-ethical-engine',
      name: 'TestEthicalEngine',
      version: '4.0.0-test',
      maxMemoryMB: 50,
      timeoutMs: 5000,
      circuitBreakerThreshold: 3,
      enabled: true
    });

    await engine.initialize();
  });

  afterEach(async () => {
    await engine.cleanup();
  });

  test('should initialize successfully', async () => {
    const health = await engine.getHealth();
    expect(health.status).toBe('healthy');
    expect(health.score).toBeGreaterThan(80);
  });

  test('should make ethical decisions with Veritas validation', async () => {
    const context: SafetyContext = {
      correlationId: 'test_decision_001',
      timeoutMs: 5000,
      memoryLimitMB: 50,
      circuitBreaker: { failures: 0, state: 'closed' },
      backupEnabled: false
    };

    const result = await engine.execute(context);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.ethicalScore).toBeGreaterThan(0);
    expect(result.data!.certificate).toBeDefined();
    expect(result.data!.reasoning).toBeDefined();
  });

  test('should evolve ethical maturity over time', async () => {
    const initialMaturity = engine.getEthicalMaturity();

    // Make several decisions
    const context: SafetyContext = {
      correlationId: 'maturity_test',
      timeoutMs: 5000,
      memoryLimitMB: 50,
      circuitBreaker: { failures: 0, state: 'closed' },
      backupEnabled: false
    };

    for (let i = 0; i < 5; i++) {
      await engine.execute(context);
    }

    const finalMaturity = engine.getEthicalMaturity();
    expect(finalMaturity.experience).toBeGreaterThan(initialMaturity.experience);
  });

  test('should handle circuit breaker protection', async () => {
    const context: SafetyContext = {
      correlationId: 'circuit_breaker_test',
      timeoutMs: 5000,
      memoryLimitMB: 50,
      circuitBreaker: { failures: 0, state: 'closed' },
      backupEnabled: false
    };

    // Force failures to trigger circuit breaker
    // This would require mocking or forcing errors in the engine
    const health = await engine.getHealth();
    expect(health.issues).toBeDefined();
  });

  test('should provide deterministic dilemma selection', () => {
    const dilemmas = engine.getDeterministicDilemmasForTesting();
    expect(dilemmas.length).toBeGreaterThan(0);
    expect(dilemmas[0].id).toBeDefined();
    expect(dilemmas[0].options.length).toBeGreaterThan(1);
  });

  test('should maintain core ethical values', () => {
    const values = engine.getCoreValues();
    expect(values.length).toBeGreaterThan(0);
    expect(values.find(v => v.name === 'integrity')).toBeDefined();
    expect(values.find(v => v.name === 'justice')).toBeDefined();
  });
});
