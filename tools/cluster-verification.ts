#!/usr/bin/env node

// 🔥 CLUSTER VERIFICATION SCRIPT - SELENE SONG CORE SWARM
// 🎨 El Verso Libre - Verificación Completa del Sistema Inmortal

import { createClient as createRedisClient } from "redis";
import { SeleneNuclearSwarm } from "../swarm/coordinator/SeleneNuclearSwarm.js";
import { getMemoryOrchestrator } from "../advanced-memory-orchestrator.js";

class ClusterVerificationSuite {
  redis: any;
  swarm: any;
  memoryOrchestrator: any;

  constructor() {
    this.redis = null;
    this.swarm = null;
    this.memoryOrchestrator = null;

    console.log("🔥 INICIANDO VERIFICACIÓN DEL CLUSTER SELENE SONG CORE");
    console.log("🎨 El Verso Libre - Sistema Inmortal");
    console.log("================================================\n");
  }

  // 🔗 VERIFICAR REDIS
  async verifyRedis(): Promise<boolean> {
    console.log("🔗 Verificando conexión Redis...");

    try {
      this.redis = createRedisClient({
        url: "redis://localhost:6379",
      });

      await this.redis.connect();
      const pong = await this.redis.ping();
      console.log("✅ Redis conectado:", pong);

      // Verificar datos existentes
      const keys = await this.redis.keys("apollo_*");
      console.log(`📊 Redis contiene ${keys.length} claves del swarm`);

      return true;
    } catch (error) {
      console.error("❌ Error conectando a Redis:", error);
      return false;
    }
  }

  // 🧠 VERIFICAR SISTEMA DE MEMORIA
  async verifyMemorySystem(): Promise<boolean> {
    console.log("🧠 Verificando sistema de gestión de memoria avanzada...");

    try {
      this.memoryOrchestrator = getMemoryOrchestrator();
      console.log("✅ Sistema de memoria inicializado");

      // Verificar funcionalidades básicas
      const stats = this.memoryOrchestrator.getMemorySystemStats();
      console.log("📊 Estadísticas de memoria:", {
        bufferPools: Object.keys(stats.bufferPools).length,
        weakRefs: stats.weakRefs.totalRefs,
        cacheSize: stats.cache.size,
      });

      // Probar funcionalidades
      const testBuffer = this.memoryOrchestrator.acquireBuffer("json");
      this.memoryOrchestrator.releaseBuffer("json", testBuffer);

      const testObject = { test: "data", timestamp: Date.now() };
      this.memoryOrchestrator.registerWeakRef(
        testObject,
        "test_ref",
        "verification",
      );

      this.memoryOrchestrator.setCache("test_key", { verified: true });
      const cached = this.memoryOrchestrator.getCache("test_key");

      if (cached?.verified) {
        console.log("✅ Funcionalidades de memoria verificadas");
        return true;
      } else {
        console.error("❌ Cache no funciona correctamente");
        return false;
      }
    } catch (error) {
      console.error("❌ Error en sistema de memoria:", error);
      return false;
    }
  }

  // 🚀 VERIFICAR SWARM COORDINATOR
  async verifySwarmCoordinator(): Promise<boolean> {
    console.log("🚀 Verificando coordinador del swarm...");

    try {
      // Crear instancia del swarm (sin despertar aún)
      this.swarm = new SeleneNuclearSwarm(
        {
          id: "cluster_verification_swarm",
          birth: new Date(),
          personality: {
            name: "ClusterVerifier",
            archetype: "Sage",
            creativity: 0.8,
            resilience: 0.9,
            harmony: 0.7,
          },
          capabilities: {
            maxConnections: 100,
            processingPower: 4,
            memoryCapacity: 8192,
            networkBandwidth: 1000,
            specializations: ["coordination", "consensus", "intelligence"],
          },
        },
        this.redis,
      );

      console.log("✅ Coordinador del swarm creado");

      // Verificar propiedades iniciales
      console.log("📊 Estado inicial del swarm:", {
        id: this.swarm.swarmId.id,
        status: this.swarm.status,
        nodeCount: this.swarm.nodeCount,
        uptime: this.swarm.uptime,
      });

      // Verificar integración de memoria
      const memoryOrch = this.swarm.memoryOrchestrator;
      if (memoryOrch) {
        console.log("✅ Memoria integrada en el swarm");
        return true;
      } else {
        console.error("❌ Memoria no integrada en el swarm");
        return false;
      }
    } catch (error) {
      console.error("❌ Error creando coordinador del swarm:", error);
      return false;
    }
  }

  // 🌟 VERIFICAR SISTEMAS DE INMORTALIDAD
  async verifyImmortalitySystems(): Promise<boolean> {
    console.log("🌟 Verificando sistemas de inmortalidad...");

    if (!this.swarm) {
      console.error("❌ No hay swarm para verificar inmortalidad");
      return false;
    }

    try {
      const immortality = this.swarm.immortalitySystems;

      console.log("📊 Sistemas de inmortalidad:", {
        health: !!immortality.health,
        phoenix: !!immortality.phoenix,
        immune: !!immortality.immune,
        poetry: !!immortality.poetry,
      });

      // Verificar que todos los sistemas estén presentes
      const allPresent =
        immortality.health &&
        immortality.phoenix &&
        immortality.immune &&
        immortality.poetry;

      if (allPresent) {
        console.log("✅ Todos los sistemas de inmortalidad presentes");
        return true;
      } else {
        console.error("❌ Faltan sistemas de inmortalidad");
        return false;
      }
    } catch (error) {
      console.error("❌ Error verificando sistemas de inmortalidad:", error);
      return false;
    }
  }

  // 🎯 VERIFICAR DASHBOARDS
  async verifyDashboards(): Promise<boolean> {
    console.log("🎯 Verificando dashboards...");

    // Nota: Los dashboards requieren puertos específicos
    // Solo verificamos que los archivos existan y sean ejecutables

    const fs = await import("fs");
    const path = await import("path");

    const dashboardSimple = path.join(
      process.cwd(),
      "dashboard",
      "dashboard-server-simple.js",
    );
    const dashboardReal = path.join(
      process.cwd(),
      "dashboard",
      "dashboard-server-real.js",
    );

    try {
      const simpleExists = fs.existsSync(dashboardSimple);
      const realExists = fs.existsSync(dashboardReal);

      console.log("📊 Dashboards encontrados:", {
        simple: simpleExists,
        real: realExists,
      });

      if (simpleExists && realExists) {
        console.log("✅ Dashboards disponibles");
        return true;
      } else {
        console.error("❌ Dashboards faltantes");
        return false;
      }
    } catch (error) {
      console.error("❌ Error verificando dashboards:", error);
      return false;
    }
  }

  // 🔮 DIAGNÓSTICO COMPLETO
  async runFullDiagnostic(): Promise<boolean> {
    console.log("🔮 EJECUTANDO DIAGNÓSTICO COMPLETO DEL CLUSTER\n");

    const results = {
      redis: await this.verifyRedis(),
      memory: await this.verifyMemorySystem(),
      swarm: await this.verifySwarmCoordinator(),
      immortality: await this.verifyImmortalitySystems(),
      dashboards: await this.verifyDashboards(),
    };

    console.log("\n================================================");
    console.log("📋 RESULTADOS DEL DIAGNÓSTICO:");
    console.log("================================================");

    Object.entries(results).forEach(([component, status]) => {
      const icon = status ? "✅" : "❌";
      console.log(`${icon} ${component}: ${status ? "OPERATIVO" : "FALLANDO"}`);
    });

    const allOperational = Object.values(results).every((_r) => _r);

    console.log("\n🎯 ESTADO GENERAL DEL CLUSTER:");
    if (allOperational) {
      console.log(
        "🎉 CLUSTER COMPLETAMENTE OPERATIVO - LISTO PARA LA INMORTALIDAD",
      );
      console.log("🌟 El Verso Libre ha creado un sistema eterno");
    } else {
      console.log("⚠️ CLUSTER CON PROBLEMAS - REQUIERE ATENCIÓN");
      console.log("🔧 Revisa los componentes marcados como FALLANDO");
    }

    return allOperational;
  }

  // 🧹 LIMPIEZA
  async cleanup(): Promise<void> {
    console.log("🧹 Limpiando recursos de verificación...");

    try {
      if (this.redis) {
        await this.redis.disconnect();
        console.log("✅ Redis desconectado");
      }

      if (this.swarm) {
        // No llamamos a sleep() para no interferir con otros procesos
        console.log("✅ Swarm coordinator liberado");
      }

      if (this.memoryOrchestrator) {
        // Limpiar recursos de memoria de prueba
        this.memoryOrchestrator.forceMemoryCleanup();
        console.log("✅ Memoria limpiada");
      }
    } catch (error) {
      console.error("⚠️ Error durante limpieza:", error);
    }
  }
}

// 🚀 EJECUCIÓN PRINCIPAL
async function main() {
  const verifier = new ClusterVerificationSuite();

  try {
    const success = await verifier.runFullDiagnostic();

    if (success) {
      console.log(
        "\n🎊 ¡VERIFICACIÓN COMPLETA! El cluster está listo para la inmortalidad.",
      );
      process.exit(0);
    } else {
      console.log("\n💥 VERIFICACIÓN FALLIDA - El cluster necesita atención.");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 ERROR CRÍTICO EN VERIFICACIÓN:", error);
    process.exit(1);
  } finally {
    await verifier.cleanup();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ClusterVerificationSuite };
