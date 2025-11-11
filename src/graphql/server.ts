/**
 * 🔥 SELENE SONG CORE GRAPHQL SERVER
 * By PunkClaude & RaulVisionario - September 23, 2025
 *
 * MISSION: Integrate GraphQL Server with lazy loading
 * TARGET: Connect frontend Selene Client with Nuclear backend
 * OPTIMIZATION: Reduce initial module loading from 1139 to minimal set
 */

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@as-integrations/express4";
import express from "express";
import * as v8 from "v8";
import * as fs from "fs";
import * as path from "path";
import { createDocumentUploadRouter } from "../routes/documentRoutes.js";

import { GraphQLContext } from "./types.js";
import { SeleneDatabase } from "../core/Database.ts";
import { AuditDatabase } from "../database/AuditDatabase.js";
import { SeleneCache } from "../Cache.js";
import { SeleneMonitoring } from "../Monitoring.js";
import { SeleneReactor } from "../Reactor/Reactor.js";
import { SeleneContainment } from "../Containment/Containment.js";
import { SeleneFusion } from "../Fusion/Fusion.js";
import { SeleneVeritas } from "../Veritas/Veritas.js";
import { SeleneConscious } from "../Conscious/Conscious.js";
import { SeleneHeal } from "../Heal/Heal.js";
import { SelenePredict } from "../Predict/Predict.js";
import { SeleneOffline } from "../Offline/Offline.js";
import { redisManager } from "../RedisConnectionManager.js";


/**
 * 🚀 SELENE SONG CORE GRAPHQL INTEGRATION
 * Complete GraphQL server with Nuclear modules integration
 */
export class SeleneNuclearGraphQL {
  private server!: ApolloServer<GraphQLContext>;
  private isRunning: boolean = false;
  private redisClient: any; // Direct Redis client for GraphQL context
  private auditDatabase!: AuditDatabase; // 📚 The Historian for audit queries

  constructor(
    private database: SeleneDatabase,
    private cache: SeleneCache,
    private monitoring: SeleneMonitoring,
    private reactor: SeleneReactor,
    private containment: SeleneContainment,
    private fusion: SeleneFusion,
    private veritas: SeleneVeritas,
    private consciousness: SeleneConscious,
    private heal: SeleneHeal,
    private predict: SelenePredict,
    private offline: SeleneOffline,
  ) {
    console.log("🔥 Initializing Selene Song Core GraphQL Server...");

    // 📚 Initialize The Historian (AuditDatabase)
    this.auditDatabase = new AuditDatabase(this.database.getPool());
    console.log("📚 The Historian (AuditDatabase) initialized");

    // 🔥 CRITICAL FIX: Get direct Redis client for GraphQL context
    this.redisClient = redisManager.getIORedisClient("graphql-context");
    if (!this.redisClient) {
      console.warn("⚠️ Failed to get Redis client for GraphQL context - resolvers may not have Redis access");
    } else {
      console.log("✅ Redis client obtained for GraphQL context");
    }

    console.log(
      "✅ Selene Song Core GraphQL initialized (no Express app created)",
    );
  }

  /**
   * 🚀 Initialize GraphQL Server with Lazy Loading
   */
  public async initialize(): Promise<void> {
    console.log("🔧 Setting up GraphQL server with lazy loading...");

    try {
      console.log("� Loading GraphQL schema and resolvers lazily...");

      // Lazy load typeDefs and resolvers
      const [{ default: typeDefs }, { resolvers }] = await Promise.all([
        import("./schema.js"),
        import("./resolvers.js"),
      ]);

      console.log("🔍 TypeDefs loaded?", !!typeDefs);
      console.log("🔍 Resolvers loaded?", !!resolvers);
      console.log("🔍 Resolvers keys:", Object.keys(resolvers));
      console.log("🔍 Patient resolver available?", !!resolvers.Patient);

      // Create Selene Server with lazy-loaded components
      console.log("🔧 Creating Selene Server instance...");
      this.server = new ApolloServer<GraphQLContext>({
        typeDefs,
        resolvers,
        introspection: true, // ✅ FORCE ENABLE - even in "production" mode
        includeStacktraceInErrorResponses: true, // ✅ Always include for debugging
        plugins: [
          ApolloServerPluginLandingPageLocalDefault({ includeCookies: true }), // ✅ Enable Apollo Studio in all modes
        ],
      });
      console.log("✅ Selene Server instance created");

      console.log("🔧 Starting Selene Server...");
      await this.server.start();
      console.log(
        "✅ Selene GraphQL Server initialized and started with lazy loading",
      );
      console.log("🔍 Server instance after start:", !!this.server);
    } catch (error) {
      console.error("💥 Error initializing GraphQL server:", error as Error);
      console.error(
        "💥 Error details:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * 🔌 Setup Express middleware on main server app
   */
  public setupMiddleware(mainApp: express.Application): void {
    // Global request counter per worker
    let workerRequestCount = 0;

    // 🔥 MISSION V408: Enhanced request logging middleware from ORACLE_CHALLENGE_2
    mainApp.use((req, _res, _next) => {
      workerRequestCount++;
      const timestamp = new Date().toISOString();
      const processId = process.pid;

      console.log(
        `[${timestamp}] [PID-${processId}] [Count:${workerRequestCount}] ${req.method} ${req.path}`,
      );

      _next();
    });

    // 🔥 DIAGNOSTIC ENDPOINT - TEMPORAL PARA ANÁLISIS DE HEAP
    mainApp.get("/diagnostic/heap", (_req, res) => {
      console.log("🔬 Ejecutando diagnóstico completo de heap...");

      try {
        // Ejecutar el código de diagnóstico aquí
        const heapStats = process.memoryUsage();

        let diagnostic =
          "🔬 ========== DIAGNÓSTICO TOTAL Y ABSOLUTO ==========\n";
        diagnostic +=
          "📊 Análisis exhaustivo de causas de alto uso de heap (73-95%)\n";
        diagnostic +=
          "🎯 Objetivo: Identificar TODOS los componentes problemáticos\n";
        diagnostic +=
          "================================================================================\n\n";

        // 1. ANÁLISIS DE MEMORIA BASE
        diagnostic += "📊 1. ANÁLISIS DE MEMORIA BASE\n";
        diagnostic += "-".repeat(50) + "\n";
        diagnostic += `Heap Total: ${(heapStats.heapTotal / 1024 / 1024).toFixed(2)} MB\n`;
        diagnostic += `Heap Usado: ${(heapStats.heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
        diagnostic += `Heap Uso: ${((heapStats.heapUsed / heapStats.heapTotal) * 100).toFixed(2)}%\n`;
        diagnostic += `Heap Límite: ${(heapStats.heapTotal / 1024 / 1024).toFixed(2)} MB\n`;
        diagnostic += `RSS: ${(heapStats.rss / 1024 / 1024).toFixed(2)} MB\n`;
        diagnostic += `Externa: ${(heapStats.external / 1024 / 1024).toFixed(2)} MB\n\n`;

        // 2. ANÁLISIS DE ESPACIOS DE HEAP
        diagnostic += "🏗️ 2. ANÁLISIS DE ESPACIOS DE HEAP\n";
        diagnostic += "-".repeat(50) + "\n";

        try {
          const heapSpaces = v8.getHeapSpaceStatistics();
          heapSpaces.forEach((space: any) => {
            const used = space.used_size / 1024 / 1024;
            const total = space.total_size / 1024 / 1024;
            const percent =
              total > 0 ? ((used / total) * 100).toFixed(1) : "NaN";
            diagnostic += `${space.space_name}: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB (${percent}%)\n`;

            if (parseFloat(percent) > 80) {
              diagnostic += `  🚨 CRÍTICO: ${space.space_name} > 80%\n`;
            }
          });
        } catch (e) {
          diagnostic += "Error obteniendo estadísticas de heap spaces\n";
        }

        diagnostic += "\n";

        // 3. ANÁLISIS DE OBJETOS GLOBALES
        diagnostic += "🌐 3. ANÁLISIS DE OBJETOS GLOBALES\n";
        diagnostic += "-".repeat(50) + "\n";

        const globalKeys = Object.keys(global);
        const suspiciousGlobals = globalKeys.filter(
          (key) =>
            key.toLowerCase().includes("apollo") ||
            key.toLowerCase().includes("veritas") ||
            key.toLowerCase().includes("digitalsoul") ||
            key.toLowerCase().includes("poetry") ||
            key.toLowerCase().includes("swarm") ||
            key.toLowerCase().includes("consensus") ||
            key.toLowerCase().includes("consciousness") ||
            key.toLowerCase().includes("phoenix") ||
            key.toLowerCase().includes("harmony") ||
            key.toLowerCase().includes("cache") ||
            key.toLowerCase().includes("timeline") ||
            key.toLowerCase().includes("memory"),
        );

        diagnostic += `Total objetos globales: ${globalKeys.length}\n`;
        diagnostic += `Objetos sospechosos: ${suspiciousGlobals.length}\n\n`;

        suspiciousGlobals.forEach((key) => {
          try {
            const obj = (global as any)[key];
            if (obj) {
              const size = estimateObjectSize(obj);
              diagnostic += `  ${key}: ${Array.isArray(obj) ? "Array" : obj.constructor?.name || "Object"} (${size} propiedades)\n`;

              if (Array.isArray(obj) && obj.length > 100) {
                diagnostic += `    🚨 ARRAY GRANDE: ${obj.length} elementos\n`;
              }
              if (obj instanceof Map && obj.size > 50) {
                diagnostic += `    🚨 MAP GRANDE: ${obj.size} entradas\n`;
              }
              if (obj instanceof Set && obj.size > 50) {
                diagnostic += `    🚨 SET GRANDE: ${obj.size} elementos\n`;
              }
            }
          } catch (e) {
            diagnostic += `  ${key}: [Error al analizar]\n`;
          }
        });

        diagnostic += "\n";

        // 4. ANÁLISIS DE TIMERS E INTERVALOS
        diagnostic += "⏰ 4. ANÁLISIS DE TIMERS E INTERVALOS\n";
        diagnostic += "-".repeat(50) + "\n";

        const timerRefs = globalKeys.filter(
          (key) =>
            key.toLowerCase().includes("interval") ||
            key.toLowerCase().includes("timeout") ||
            key.toLowerCase().includes("timer"),
        );

        diagnostic += `Referencias a timers en global: ${timerRefs.length}\n`;
        timerRefs.forEach((_key) => {
          diagnostic += `  ${_key}\n`;
        });

        diagnostic += "\n";

        // 5. ANÁLISIS DE EVENT LISTENERS
        diagnostic += "📡 5. ANÁLISIS DE EVENT LISTENERS\n";
        diagnostic += "-".repeat(50) + "\n";

        try {
          const eventEmitterCount = (process as any)._getActiveHandles
            ? (process as any)._getActiveHandles().length
            : "N/A";
          const requestCount = (process as any)._getActiveRequests
            ? (process as any)._getActiveRequests().length
            : "N/A";

          diagnostic += `Active handles (EventEmitters): ${eventEmitterCount}\n`;
          diagnostic += `Active requests: ${requestCount}\n`;
        } catch (e) {
          diagnostic += "No se pudo obtener información de handles activos\n";
        }

        diagnostic += "\n";

        // 6. ANÁLISIS DE MÓDULOS CARGADOS
        diagnostic += "📦 6. ANÁLISIS DE MÓDULOS CARGADOS\n";
        diagnostic += "-".repeat(50) + "\n";

        const modules = Object.keys(require.cache);
        diagnostic += `Total módulos cargados: ${modules.length}\n`;

        const heavyModules = modules.filter(
          (mod) =>
            mod.toLowerCase().includes("apollo") ||
            mod.toLowerCase().includes("graphql") ||
            mod.toLowerCase().includes("veritas") ||
            mod.toLowerCase().includes("digitalsoul") ||
            mod.toLowerCase().includes("poetry") ||
            mod.toLowerCase().includes("swarm"),
        );

        diagnostic += `Módulos relacionados con Selene: ${heavyModules.length}\n`;

        // Mostrar estadísticas detalladas de módulos
        const moduleStats = heavyModules.reduce(
          (acc, _mod) => {
            const ext = _mod.split(".").pop() || "no-ext";
            acc[ext] = (acc[ext] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        diagnostic += `Estadísticas por extensión:\n`;
        Object.entries(moduleStats).forEach(([ext, count]) => {
          diagnostic += `  .${ext}: ${count} módulos\n`;
        });

        diagnostic += `\nPrimeros 20 módulos sospechosos:\n`;
        heavyModules.slice(0, 20).forEach((_mod) => {
          diagnostic += `  ${path.basename(_mod)}\n`;
        });

        if (heavyModules.length > 20) {
          diagnostic += `  ... y ${heavyModules.length - 20} más\n`;
        }

        // Análisis específico de módulos grandes
        diagnostic += `\n🔍 ANÁLISIS DE MÓDULOS GRANDES:\n`;
        const largeModules = modules.filter((_mod) => {
          try {
            const stats = fs.statSync(_mod);
            return stats.size > 1024 * 1024; // > 1MB
          } catch (e) {
            return false;
          }
        });

        diagnostic += `Módulos > 1MB: ${largeModules.length}\n`;
        largeModules.slice(0, 5).forEach((mod) => {
          try {
            const stats = fs.statSync(mod);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            diagnostic += `  ${path.basename(mod)}: ${sizeMB} MB\n`;
          } catch (e) {
            diagnostic += `  ${path.basename(mod)}: [Error al medir]\n`;
          }
        });

        diagnostic += "\n";

        // 7. CONCLUSIONES Y RECOMENDACIONES
        diagnostic += "🎯 7. CONCLUSIONES Y RECOMENDACIONES\n";
        diagnostic += "-".repeat(50) + "\n";

        const heapUsagePercent =
          (heapStats.heapUsed / heapStats.heapTotal) * 100;

        if (heapUsagePercent > 90) {
          diagnostic += "🚨 CRÍTICO: Heap > 90% - Requiere acción inmediata\n";
        } else if (heapUsagePercent > 80) {
          diagnostic += "⚠️ ALTO: Heap > 80% - Monitorear de cerca\n";
        } else if (heapUsagePercent > 70) {
          diagnostic += "📊 ELEVADO: Heap > 70% - No óptimo pero manejable\n";
        } else {
          diagnostic += "✅ NORMAL: Heap < 70% - Rango aceptable\n";
        }

        diagnostic += "\n🔧 ACCIONES RECOMENDADAS:\n";
        diagnostic +=
          "1. Revisar objetos globales grandes identificados arriba\n";
        diagnostic += "2. Auditar timers e intervalos activos\n";
        diagnostic +=
          "3. Verificar cachés no limitadas (Veritas, DigitalSoul, etc.)\n";
        diagnostic +=
          "4. Revisar middlewares de GraphQL que puedan acumular datos\n";
        diagnostic += "5. Considerar heap snapshot para análisis detallado\n";
        diagnostic += "6. Evaluar deshabilitar componentes no críticos\n";

        diagnostic += "\n📋 PRÓXIMOS PASOS:\n";
        diagnostic += "• Ejecutar heap snapshot: global.createHeapSnapshot()\n";
        diagnostic += "• Analizar con Chrome DevTools\n";
        diagnostic += "• Revisar código de componentes identificados\n";
        diagnostic += "• Considerar reinicio limpio del proceso\n";

        // 🔥 GENERAR HEAP SNAPSHOT AUTOMÁTICAMENTE
        diagnostic += "\n🔥 GENERANDO HEAP SNAPSHOT...\n";
        try {
          const globalAny = global as any;
          if (globalAny.v8 && globalAny.v8.writeHeapSnapshot) {
            const snapshotPath = globalAny.v8.writeHeapSnapshot();
            diagnostic += `✅ Heap snapshot generado: ${snapshotPath}\n`;
            diagnostic +=
              "📂 Abrir con Chrome DevTools > Memory > Load profile\n";
          } else {
            diagnostic +=
              "❌ Heap snapshot no disponible (requiere --expose-gc)\n";
          }
        } catch (e) {
          diagnostic += `❌ Error generando heap snapshot: ${e instanceof Error ? e.message : String(e)}\n`;
        }

        diagnostic += "\n🏁 ========== FIN DEL DIAGNÓSTICO ==========\n";

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.send(diagnostic);

        // Terminar el proceso después de enviar el diagnóstico
        setTimeout(() => {
          console.log("🏁 Diagnóstico completado, terminando proceso...");
          process.exit(0);
        }, 1000);
      } catch (error) {
        console.error("Error en diagnóstico:", error as Error);
        res
          .status(500)
          .send(
            `Error en diagnóstico: ${error instanceof Error ? error.message : String(error)}`,
          );
      }
    });

    // Continuar con el middleware normal...

    console.log("🔌 🔌 🔌 SETUP MIDDLEWARE CALLED - GRAPHQL SERVER");
    console.log("� GraphQL Server initialized?", !!this.server);
    console.log("� Main App provided?", !!mainApp);
    console.log("� Main App type:", typeof mainApp);
    console.log("🔌 Selene Server instance:", this.server);
    console.log("🔌 Selene Server type:", typeof this.server);

    try {
      // Health check endpoint (must be before GraphQL endpoint to avoid being captured)
      console.log("🏥 Setting up /graphql/health endpoint...");
      mainApp.get("/graphql/health", (_req: any, _res: any) => {
        console.log(
          "🏥 GraphQL Health endpoint called at",
          new Date().toISOString(),
        );
        _res.json({
          status: "nuclear",
          service: "Selene Song Core GraphQL",
          version: "3.0.0",
          timestamp: new Date().toISOString(),
          graphql: {
            endpoint: "/graphql",
            playground: process.env.NODE_ENV !== "production",
          },
        });
      });
      console.log("✅ /graphql/health endpoint configured");

      // 📤 REST Document Upload/Download endpoints (before GraphQL)
      console.log("📤 Configuring REST document endpoints /api/documents...");
      const documentRouter = createDocumentUploadRouter(this.database);
      mainApp.use("/api/documents", documentRouter);
      console.log("✅ /api/documents endpoints configured");

      // GraphQL endpoint
      console.log("🔧 Configuring GraphQL endpoint /graphql...");
      console.log("🔍 Selene Server instance:", !!this.server);
      console.log("🔍 Selene Server type:", typeof this.server);

      mainApp.use(
        "/graphql",
        expressMiddleware(this.server, {
          context: async ({
            req,
            res,
          }: {
            req: any;
            res: any;
          }): Promise<GraphQLContext> => {
            console.log("🔄 GraphQL context created for request");
            // Full context with all nuclear components + DIRECT REDIS ACCESS + THE HISTORIAN
            return {
              database: this.database,
              cache: this.cache,
              redis: this.redisClient, // 🔥 CRITICAL: Direct Redis client for resolvers
              monitoring: this.monitoring,
              reactor: this.reactor,
              containment: this.containment,
              fusion: this.fusion,
              veritas: this.veritas, // ✅ Veritas component now available
              consciousness: this.consciousness,
              heal: this.heal,
              predict: this.predict,
              offline: this.offline,
              auditDatabase: this.auditDatabase, // 📚 The Historian for audit queries
            };
          },
        }),
      );

      console.log("✅ GraphQL middleware configured successfully");
      console.log("🌐 GraphQL endpoint should be available at /graphql");
    } catch (error) {
      console.error("💥 Error setting up GraphQL middleware:", error as Error);
      console.error(
        "💥 Error details:",
        error instanceof Error ? error.message : String(error),
      );
      console.error(
        "💥 Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      throw error;
    }
  }

  /**
   * 🌐 Start GraphQL Server (Modified for integration)
   */
  public async start(_port?: number): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Selene Song Core GraphQL is already running");
      return;
    }

    console.log(`🔥 Preparing GraphQL server for integration...`);

    try {
      console.log("📋 Step 1: Initialize GraphQL server...");
      await this.initialize();
      console.log("✅ GraphQL server initialized");

      // Don't setup middleware here - let main server handle it
      console.log("📋 Step 2: Middleware setup deferred to main server...");

      // Don't start HTTP server - let main server handle it
      console.log("🚀 GraphQL server prepared for integration!");
      this.isRunning = true;
    } catch (error) {
      console.error("💥 Failed to prepare Selene Song Core GraphQL:", error as Error);
      throw error;
    }
  }

  /**
   * 🛑 Stop GraphQL Server
   */
  public async stop(): Promise<void> {
    console.log("🛑 Stopping Selene Song Core GraphQL...");

    try {
      if (this.server) {
        await this.server.stop();
      }

      this.isRunning = false;
      console.log("✅ Selene Song Core GraphQL stopped");
    } catch (error) {
      console.error("💥 Error stopping GraphQL server:", error as Error);
    }
  }

  /**
   * 📊 Get server status
   */
  public getStatus(): any {
    return {
      running: this.isRunning,
      service: "Selene Song Core GraphQL",
      version: "3.0.0",
      endpoint: "/graphql",
      playground: process.env.NODE_ENV !== "production",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🎯 Get HTTP server (for integration)
   */
  public getHttpServer(): any {
    return null; // No longer managing our own HTTP server
  }
}

/**
 * Función auxiliar para estimar tamaño de objetos
 */
function estimateObjectSize(obj: any, depth = 0, maxDepth = 3): number {
  if (depth > maxDepth || !obj || typeof obj !== "object") return 1;
  let size = 0;
  try {
    for (const [_key, value] of Object.entries(obj)) {
      size++;
      if (typeof value === "object" && value !== null) {
        size += estimateObjectSize(value, depth + 1, maxDepth);
      }
    }
  } catch (e) {
    // Intentionally empty - error handling for object size estimation
  }
  return size;
}

export default SeleneNuclearGraphQL;


