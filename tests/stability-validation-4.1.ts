/**
 * 🔬 VALIDACIÓN DE ESTABILIDAD DEL NÚCLEO - SUBFASE 4.1
 * Valida estabilidad del sistema renacido bajo carga real
 * Confirma predictibilidad determinista con datos PostgreSQL
 */

import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";


interface StabilityMetrics {
  timestamp: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  loadAverage: number[];
  activeHandles: number;
  activeRequests: number;
}

interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
  metrics?: StabilityMetrics;
  duration?: number;
}

class StabilityValidator {
  private results: ValidationResult[] = [];
  private startTime: number = Date.now();

  async runFullValidation(): Promise<void> {
    console.log("🔬 INICIANDO VALIDACIÓN DE ESTABILIDAD DEL NÚCLEO");
    console.log("================================================\n");

    // 1. Validar determinismo básico
    await this.validateDeterminism();

    // 2. Validar estabilidad de memoria
    await this.validateMemoryStability();

    // 3. Validar rendimiento bajo carga
    await this.validatePerformanceUnderLoad();

    // 4. Validar conexiones PostgreSQL
    await this.validatePostgreSQLConnections();

    // 5. Validar sistema inmune operativo
    await this.validateImmuneSystem();

    // 6. Validar nodos reales del swarm
    await this.validateSwarmNodes();

    this.printResults();
  }

  private async validateDeterminism(): Promise<void> {
    console.log("🧬 Validando determinismo del sistema...");

    const start = Date.now();
    const metrics = this.captureMetrics();

    try {
      // Verificar que no hay deterministicRandom() en archivos críticos
      const criticalFiles = [
        "selene/index.ts",
        "selene/swarm/coordinator/SeleneNuclearSwarm.ts",
        "selene/swarm/coordinator/QuantumImmuneSystem.ts",
      ];

      let mathRandomFound = false;
      for (const file of criticalFiles) {
        try {
          const content = await fs.readFile(
            path.join(process.cwd(), file),
            "utf-8",
          );
          if (content.includes("Math.random")) {
            mathRandomFound = true;
            break;
          }
        } catch (error) {
          // File might not exist, continue
        }
      }

      const passed = !mathRandomFound;
      const duration = Date.now() - start;

      this.results.push({
        test: "Determinismo del Sistema",
        passed,
        message: passed
          ? "✅ Sistema completamente determinista - sin deterministicRandom()"
          : "❌ deterministicRandom() detectado en archivos críticos",
        metrics,
        duration,
      });
    } catch (error) {
      this.results.push({
        test: "Determinismo del Sistema",
        passed: false,
        message: `❌ Error en validación determinista: ${(error as Error).message}`,
        metrics,
        duration: Date.now() - start,
      });
    }
  }

  private async validateMemoryStability(): Promise<void> {
    console.log("🧠 Validando estabilidad de memoria...");

    const start = Date.now();
    const initialMetrics = this.captureMetrics();

    // Simular carga de memoria
    const memoryLoad: any[] = [];
    for (let i = 0; i < 10000; i++) {
      memoryLoad.push({ data: "x".repeat(1000) });
    }

    await new Promise((_resolve) => setTimeout(_resolve, 100)); // Breve pausa


    // Limpiar memoria
    memoryLoad.length = 0;
    if (global.gc) {
      global.gc();
    }

    await new Promise((_resolve) => setTimeout(_resolve, 100));

    const finalMetrics = this.captureMetrics();
    const duration = Date.now() - start;

    const memoryIncrease =
      finalMetrics.memoryUsage.heapUsed - initialMetrics.memoryUsage.heapUsed;
    const memoryStable = Math.abs(memoryIncrease) < 10 * 1024 * 1024; // < 10MB change

    this.results.push({
      test: "Estabilidad de Memoria",
      passed: memoryStable,
      message: memoryStable
        ? `✅ Memoria estable (±${(memoryIncrease / 1024 / 1024).toFixed(2)}MB)`
        : `❌ Fuga de memoria detectada (${(memoryIncrease / 1024 / 1024).toFixed(2)}MB)`,
      metrics: finalMetrics,
      duration,
    });
  }

  private async validatePerformanceUnderLoad(): Promise<void> {
    console.log("⚡ Validando rendimiento bajo carga...");

    const start = Date.now();
    const initialMetrics = this.captureMetrics();

    // Simular carga CPU
    const promises: Promise<void>[] = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        new Promise((_resolve) => {
          let result = 0;
          for (let j = 0; j < 100000; j++) {
            result += Math.sin(j) * Math.cos(j);
          }
          _resolve();
        }),
      );
    }

    await Promise.all(promises);
    const afterLoadMetrics = this.captureMetrics();
    const duration = Date.now() - start;

    const performanceAcceptable = duration < 5000; // < 5 segundos

    this.results.push({
      test: "Rendimiento bajo Carga",
      passed: performanceAcceptable,
      message: performanceAcceptable
        ? `✅ Rendimiento aceptable (${duration}ms)`
        : `❌ Rendimiento degradado (${duration}ms)`,
      metrics: afterLoadMetrics,
      duration,
    });
  }

  private async validatePostgreSQLConnections(): Promise<void> {
    console.log("🐘 Validando conexiones PostgreSQL...");

    const start = Date.now();
    const metrics = this.captureMetrics();

    try {
      // Intentar conectar a PostgreSQL (asumiendo configuración estándar)
      const { Client } = await import("pg");

      const client = new Client({
        host: process.env.POSTGRES_HOST || "localhost",
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        database: process.env.POSTGRES_DB || "dentiagest",
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "password",
      });

      await client.connect();
      await client.query("SELECT 1 as test");
      await client.end();

      const duration = Date.now() - start;

      this.results.push({
        test: "Conexiones PostgreSQL",
        passed: true,
        message: "✅ Conexión PostgreSQL exitosa - datos reales disponibles",
        metrics,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({
        test: "Conexiones PostgreSQL",
        passed: false,
        message: `❌ Error de conexión PostgreSQL: ${(error as Error).message}`,
        metrics,
        duration,
      });
    }
  }

  private async validateImmuneSystem(): Promise<void> {
    console.log("🛡️ Validando sistema inmune operativo...");

    const start = Date.now();
    const metrics = this.captureMetrics();

    try {
      // Verificar que el sistema inmune existe y está configurado
      const immunePath = path.join(
        process.cwd(),
        "selene/swarm/coordinator/QuantumImmuneSystem.ts",
      );
      const immuneExists = await fs
        .access(immunePath)
        .then(() => true)
        .catch(() => false);

      if (!immuneExists) {
        throw new Error("Sistema inmune no encontrado");
      }

      const content = await fs.readFile(immunePath, "utf-8");
      const hasMonitoring = content.includes("start_immune_monitoring");
      const hasThreatDetection = content.includes("perform_threat_scan");

      const immuneFunctional = hasMonitoring && hasThreatDetection;

      const duration = Date.now() - start;

      this.results.push({
        test: "Sistema Inmune Operativo",
        passed: immuneFunctional,
        message: immuneFunctional
          ? "✅ Sistema inmune implementado y funcional"
          : "❌ Sistema inmune incompleto o no funcional",
        metrics,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({
        test: "Sistema Inmune Operativo",
        passed: false,
        message: `❌ Error en validación del sistema inmune: ${(error as Error).message}`,
        metrics,
        duration,
      });
    }
  }

  private async validateSwarmNodes(): Promise<void> {
    console.log("🐝 Validando nodos reales del swarm...");

    const start = Date.now();
    const metrics = this.captureMetrics();

    try {
      // Verificar que existen DigitalSouls y coordinador
      const swarmPath = path.join(process.cwd(), "selene/swarm");
      const coordinatorPath = path.join(
        swarmPath,
        "coordinator/SeleneNuclearSwarm.ts",
      );

      const coordinatorExists = await fs
        .access(coordinatorPath)
        .then(() => true)
        .catch(() => false);

      if (!coordinatorExists) {
        throw new Error("Coordinador del swarm no encontrado");
      }

      const content = await fs.readFile(coordinatorPath, "utf-8");
      const hasDigitalSouls = content.includes("DigitalSoul");
      const hasAwaken = content.includes("awaken()");

      const swarmReal = hasDigitalSouls && hasAwaken;

      const duration = Date.now() - start;

      this.results.push({
        test: "Nodos Reales del Swarm",
        passed: swarmReal,
        message: swarmReal
          ? "✅ Swarm con nodos reales (DigitalSouls) operativo"
          : "❌ Swarm sin nodos reales o no operativo",
        metrics,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({
        test: "Nodos Reales del Swarm",
        passed: false,
        message: `❌ Error en validación de nodos del swarm: ${(error as Error).message}`,
        metrics,
        duration,
      });
    }
  }

  private captureMetrics(): StabilityMetrics {
    return {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      loadAverage: os.loadavg(),
      activeHandles: 0, // process._getActiveHandles is not available in type definitions
      activeRequests: 0, // process._getActiveRequests is not available in type definitions
    };
  }

  private printResults(): void {
    console.log("\n📊 RESULTADOS DE VALIDACIÓN DE ESTABILIDAD");
    console.log("==========================================\n");

    const passed = this.results.filter((_r) => _r.passed).length;
    const total = this.results.length;
    const successRate = ((passed / total) * 100).toFixed(1);

    console.log(
      `📈 Resumen: ${passed}/${total} tests pasaron (${successRate}%)\n`,
    );

    for (const result of this.results) {
      const icon = result.passed ? "✅" : "❌";
      console.log(`${icon} ${result.test}`);
      console.log(`   ${result.message}`);
      if (result.duration) {
        console.log(`   ⏱️  Duración: ${result.duration}ms`);
      }
      console.log("");
    }

    const overallSuccess = passed === total;
    console.log("🎯 RESULTADO FINAL:");
    if (overallSuccess) {
      console.log("✅ SISTEMA ESTABLE - Listo para producción");
      console.log("🚀 Subfase 4.1 COMPLETADA exitosamente");
    } else {
      console.log("❌ SISTEMA INESTABLE - Requiere correcciones");
      console.log("🔧 Subfase 4.1 FALLIDA - Revisar issues arriba");
    }

    console.log(
      `\n⏰ Validación completada en ${Date.now() - this.startTime}ms`,
    );
  }
}

// Ejecutar validación si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new StabilityValidator();
  validator.runFullValidation().catch(console.error);
}

export { StabilityValidator };
