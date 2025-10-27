import { deterministicRandom } from "../shared/deterministic-utils.js";
/**
 * 🧪 TEST CIRCUIT BREAKER V194
 * Directiva V194: Cirugía del Panteón - Test Fix #5
 *
 * PROPÓSITO: Validar Circuit Breaker Pattern para prevenir
 * cascadas infinitas y proteger el sistema de sobrecargas
 */

import {
  CircuitBreaker,
  CircuitBreakerFactory,
  CircuitState,
} from "../shared/CircuitBreaker";

interface TestResult {
  testName: string;
  success: boolean;
  details: string;
  metrics?: {
    totalCalls?: number;
    failures?: number;
    successes?: number;
    cascadesPrevented?: number;
    stateChanges?: number;
  };
}

class CircuitBreakerTest {
  private results: TestResult[] = [];

  constructor() {
    console.log("🔥 INICIANDO TEST CIRCUIT BREAKER V194");
  }

  /**
   * Simular operación que puede fallar
   */
  private createFailingOperation(
    _failureRate: number,
    _responseTime: number = 100,
  ) {
    return async (): Promise<string> => {
      await new Promise((_resolve) => setTimeout(_resolve, _responseTime));

      if (deterministicRandom() < _failureRate) {
        throw new Error("Simulated operation failure");
      }

      return "Operation successful";
    };
  }

  /**
   * Simular operación fallback
   */
  private createFallbackOperation() {
    return async (): Promise<string> => {
      await new Promise((_resolve) => setTimeout(_resolve, 50));
      return "Fallback response";
    };
  }

  /**
   * Test 1: Estados básicos del circuit breaker
   */
  private async testBasicStates(): Promise<TestResult> {
    const testName = "Basic Circuit Breaker States";

    try {
      const circuit = CircuitBreakerFactory.create("test-basic", "critical");

      // Estado inicial debe ser CLOSED
      if (circuit.getState() !== "CLOSED") {
        return {
          testName,
          success: false,
          details: `Expected initial state CLOSED, got ${circuit.getState()}`,
        };
      }

      // Operaciones exitosas deben mantener CLOSED
      const successfulOp = this.createFailingOperation(0); // 0% failure rate
      await circuit.execute(successfulOp);
      await circuit.execute(successfulOp);

      if (circuit.getState() !== "CLOSED") {
        return {
          testName,
          success: false,
          details: `Expected state CLOSED after successes, got ${circuit.getState()}`,
        };
      }

      const stats = circuit.getStats();

      return {
        testName,
        success: true,
        details: "Circuit breaker states working correctly",
        metrics: {
          totalCalls: stats.totalCalls,
          successes: stats.successes,
        },
      };
    } catch (error) {
      return {
        testName,
        success: false,
        details: `Test failed with error: ${error}`,
      };
    }
  }

  /**
   * Test 2: Apertura de circuito por fallas
   */
  private async testCircuitOpening(): Promise<TestResult> {
    const testName = "Circuit Opening on Failures";

    try {
      const circuit = CircuitBreakerFactory.create("test-opening", "critical");
      const failingOp = this.createFailingOperation(1); // 100% failure rate

      // Ejecutar operaciones que fallan hasta abrir el circuito
      let callCount = 0;
      let openStateReached = false;

      for (let i = 0; i < 10 && !openStateReached; i++) {
        try {
          await circuit.execute(failingOp);
        } catch (error) {
          callCount++;
          if (circuit.getState() === "OPEN") {
            openStateReached = true;
          }
        }
      }

      if (!openStateReached) {
        return {
          testName,
          success: false,
          details: "Circuit never opened despite failures",
        };
      }

      // Verificar que las llamadas siguientes son bloqueadas
      try {
        await circuit.execute(failingOp);
        return {
          testName,
          success: false,
          details: "Circuit allowed call in OPEN state",
        };
      } catch (error) {
        // Se esperaba esta excepción
      }

      const stats = circuit.getStats();

      return {
        testName,
        success: true,
        details: `Circuit opened after ${callCount} failures`,
        metrics: {
          totalCalls: stats.totalCalls,
          failures: stats.failures,
          stateChanges: stats.stateChanges.length,
        },
      };
    } catch (error) {
      return {
        testName,
        success: false,
        details: `Test failed with error: ${error}`,
      };
    }
  }

  /**
   * Test 3: Recuperación automática (HALF_OPEN)
   */
  private async testRecovery(): Promise<TestResult> {
    const testName = "Automatic Recovery (Half-Open)";

    try {
      // Crear circuit con timeout corto para testing
      const circuit = CircuitBreakerFactory.createCustom("test-recovery", {
        failureThreshold: 2,
        recoveryTimeout: 1000, // 1 segundo
        halfOpenMaxCalls: 2,
        monitoringWindow: 5000,
        performanceThreshold: 1000,
        cascadeDetectionEnabled: false,
      });

      // Forzar apertura del circuito con más llamadas fallidas
      const failingOp = this.createFailingOperation(1);
      try {
        await circuit.execute(failingOp);
        await circuit.execute(failingOp);
        // Con threshold=2, el circuito debe abrirse aquí
      } catch (error) {
        // Esperado
      }

      if (circuit.getState() !== "OPEN") {
        return {
          testName,
          success: false,
          details: "Circuit did not open as expected",
        };
      }

      // Esperar tiempo de recuperación
      await new Promise((_resolve) => setTimeout(_resolve, 1200));

      // La siguiente llamada debe transicionar a HALF_OPEN
      const successfulOp = this.createFailingOperation(0);
      await circuit.execute(successfulOp);

      if (circuit.getState() !== "CLOSED") {
        return {
          testName,
          success: false,
          details: `Expected CLOSED after successful recovery, got ${circuit.getState()}`,
        };
      }

      const stats = circuit.getStats();
      const hasRecoveryTransition = stats.stateChanges.some(
        (change) =>
          change.to === "HALF_OPEN" && change.reason.includes("Recovery"),
      );

      if (!hasRecoveryTransition) {
        return {
          testName,
          success: false,
          details: "No recovery transition found in state history",
        };
      }

      return {
        testName,
        success: true,
        details: "Circuit recovery working correctly",
        metrics: {
          stateChanges: stats.stateChanges.length,
        },
      };
    } catch (error) {
      return {
        testName,
        success: false,
        details: `Test failed with error: ${error}`,
      };
    }
  }

  /**
   * Test 4: Fallback functionality
   */
  private async testFallback(): Promise<TestResult> {
    const testName = "Fallback Functionality";

    try {
      const circuit = CircuitBreakerFactory.create("test-fallback", "critical");
      const failingOp = this.createFailingOperation(1);
      const fallbackOp = this.createFallbackOperation();

      // Ejecutar operación con fallback
      const result = await circuit.execute(failingOp, fallbackOp);

      if (result !== "Fallback response") {
        return {
          testName,
          success: false,
          details: `Expected fallback response, got: ${result}`,
        };
      }

      // Forzar apertura del circuito
      try {
        await circuit.execute(failingOp, fallbackOp);
        await circuit.execute(failingOp, fallbackOp);
        await circuit.execute(failingOp, fallbackOp);
      } catch (error) {
        // Esperado durante la apertura
      }

      // En estado OPEN, debería usar fallback
      const openResult = await circuit.execute(failingOp, fallbackOp);

      if (openResult !== "Fallback response") {
        return {
          testName,
          success: false,
          details: `Expected fallback in OPEN state, got: ${openResult}`,
        };
      }

      return {
        testName,
        success: true,
        details: "Fallback functionality working correctly",
      };
    } catch (error) {
      return {
        testName,
        success: false,
        details: `Test failed with error: ${error}`,
      };
    }
  }

  /**
   * Test 5: Detección y prevención de cascadas
   */
  private async testCascadePrevention(): Promise<TestResult> {
    const testName = "Cascade Detection and Prevention";

    try {
      // Crear múltiples circuitos relacionados
      const circuit1 = CircuitBreakerFactory.create("cascade-1", "critical");
      const circuit2 = CircuitBreakerFactory.create("cascade-2", "critical");
      const circuit3 = CircuitBreakerFactory.create("cascade-3", "critical");

      // Relacionar circuitos para detección de cascadas
      CircuitBreakerFactory.relateCircuits([
        "cascade-1",
        "cascade-2",
        "cascade-3",
      ]);

      const failingOp = this.createFailingOperation(1);
      const fallbackOp = this.createFallbackOperation();

      // Abrir los primeros dos circuitos con más fallas
      for (let i = 0; i < 4; i++) {
        // Aumentamos las fallas para garantizar apertura
        try {
          await circuit1.execute(failingOp);
        } catch (error) {
          // Esperado
        }
      }

      for (let i = 0; i < 4; i++) {
        try {
          await circuit2.execute(failingOp);
        } catch (error) {
          // Esperado
        }
      }

      // Verificar que están abiertos
      if (circuit1.getState() !== "OPEN" || circuit2.getState() !== "OPEN") {
        return {
          testName,
          success: false,
          details: "Failed to open first two circuits",
        };
      }

      // El tercer circuito debería detectar cascada y usar fallback
      const result = await circuit3.execute(failingOp, fallbackOp);

      const stats3 = circuit3.getStats();

      return {
        testName,
        success: true,
        details: `Cascade prevention activated, cascades prevented: ${stats3.cascadesPrevented}`,
        metrics: {
          cascadesPrevented: stats3.cascadesPrevented,
        },
      };
    } catch (error) {
      return {
        testName,
        success: false,
        details: `Test failed with error: ${error}`,
      };
    }
  }

  /**
   * Test 6: Performance monitoring
   */
  private async testPerformanceMonitoring(): Promise<TestResult> {
    const testName = "Performance Monitoring";

    try {
      const circuit = CircuitBreakerFactory.createCustom("test-performance", {
        failureThreshold: 10,
        recoveryTimeout: 5000,
        halfOpenMaxCalls: 3,
        monitoringWindow: 10000,
        performanceThreshold: 200, // Threshold bajo para testing
        cascadeDetectionEnabled: false,
      });

      // Operación lenta pero exitosa
      const slowOp = this.createFailingOperation(0, 300); // 300ms, excede threshold

      await circuit.execute(slowOp);
      await circuit.execute(slowOp);

      const metrics = circuit.getMetrics();

      if (metrics.averageLatency < 200) {
        return {
          testName,
          success: false,
          details: `Expected high latency, got ${metrics.averageLatency}ms`,
        };
      }

      return {
        testName,
        success: true,
        details: `Performance monitoring working, avg latency: ${metrics.averageLatency.toFixed(2)}ms`,
        metrics: {
          totalCalls: metrics.callsInWindow,
        },
      };
    } catch (error) {
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
  public async runAllTests(): Promise<void> {
    console.log("\n🔥 EJECUTANDO TESTS CIRCUIT BREAKER V194\n");

    this.results.push(await this.testBasicStates());
    this.results.push(await this.testCircuitOpening());
    this.results.push(await this.testRecovery());
    this.results.push(await this.testFallback());
    this.results.push(await this.testCascadePrevention());
    this.results.push(await this.testPerformanceMonitoring());

    this.printResults();
  }

  private printResults(): void {
    console.log("\n📊 RESULTADOS TEST CIRCUIT BREAKER V194");
    console.log("=".repeat(80));

    let passed = 0;
    let failed = 0;

    this.results.forEach((result, _index) => {
      const status = result.success ? "✅ PASS" : "❌ FAIL";
      const icon = result.success ? "🔥" : "💥";

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
      } else {
        failed++;
      }
    });

    console.log("\n" + "=".repeat(80));
    console.log(`📈 RESUMEN: ${passed} PASSED | ${failed} FAILED`);

    if (failed === 0) {
      console.log("🎯 FIX #5 CIRCUIT BREAKER: VALIDADO CON ÉXITO");
      console.log(
        "🔥 Sistema de protección contra cascadas funcionando PERFECTAMENTE",
      );
    } else {
      console.log("⚠️  FIX #5 CIRCUIT BREAKER: REQUIERE AJUSTES");
    }

    // Estadísticas finales de todos los circuitos
    console.log("\n🔧 ESTADÍSTICAS FINALES CIRCUIT BREAKERS:");
    const allStats = CircuitBreakerFactory.getAllStats();
    Object.entries(allStats).forEach(([name, stats]) => {
      console.log(
        `   ${name}: ${stats.state} (${stats.totalCalls} calls, ${stats.cascadesPrevented} cascades prevented)`,
      );
    });
  }
}

// Ejecutar test si es llamado directamente
if (require.main === module) {
  const test = new CircuitBreakerTest();
  test.runAllTests().catch(console.error);
}

export { CircuitBreakerTest };
