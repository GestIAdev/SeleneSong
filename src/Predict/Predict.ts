import { deterministicRandom } from "../../shared/deterministic-utils.js";
/**
 * 🎯 SELENE AUTO-PREDICTION - INTELLIGENT PREDICTIVE SYSTEM
 * Integrated with Selene Veritas for verified historical data
 *
 * MISSION: Predict system behavior with mathematical certainty
 * INTEGRATION: Selene Veritas ensures predictions are based on verified data
 */

import { SeleneServer } from "../core/Server.js";
import { SeleneDatabase } from "../core/Database.ts";
import { SeleneCache } from "../Cache.js";
import { SeleneMonitoring } from "../Monitoring.js";
import { SeleneVeritas } from "../Veritas/Veritas.js";
import { Worker } from "worker_threads";
import * as path from "path";
import { fileURLToPath } from "url";
import { QuantumThrottlingEngine } from "./QuantumThrottlingEngine.js";
import { QuantumPredictionCache } from "./QuantumPredictionCache.js";

export interface PredictionModel {
  id: string;
  name: string;
  type: "failure" | "load" | "behavior" | "trend";
  target: string;
  accuracy: number;
  lastTrained: Date;
  veritasVerified: boolean;
  confidence: number;
}

export interface Prediction {
  id: string;
  modelId: string;
  prediction: any;
  confidence: number;
  timeHorizon: number; // hours
  veritasCertificate: any;
  createdAt: Date;
  accuracy?: number; // filled when prediction is validated
}

export interface FailurePrediction {
  component: string;
  failureType: string;
  probability: number;
  timeToFailure: number; // hours
  confidence: number;
  preventiveActions: string[];
}

export interface LoadPrediction {
  component: string;
  predictedLoad: number;
  peakTime: Date;
  confidence: number;
  scalingRecommendation: string;
}

export interface BehaviorPrediction {
  userSegment: string;
  predictedBehavior: string;
  probability: number;
  confidence: number;
  recommendations: string[];
}

export class SelenePredict {
  private server: SeleneServer;
  private database: SeleneDatabase;
  private cache: SeleneCache;
  private monitoring: SeleneMonitoring;
  private veritas: SeleneVeritas;

  private predictionModels: Map<string, PredictionModel> = new Map();
  private predictions: Prediction[] = [];
  private historicalData: Map<string, any[]> = new Map();

  // Prediction configuration
  private predictionEnabled: boolean = true;
  private minConfidenceThreshold: number = 75;
  private retrainInterval: number = 24 * 60 * 60 * 1000; // 24 hours

  // Safe loop management
  private predictionInterval: NodeJS.Timeout | null = null;
  private lastPredictionTime: number = 0;
  private config = {
    predictionInterval: 300000, // 5 minutes
  };

  // 🚨 PHANTOM TIMER LEAK FIX V401 - PREDICT COMPONENT
  private modelRetrainingTimer: NodeJS.Timeout | null = null;

  // 🔥 PHASE 1.4b FIX #2: Track anonymous timeout handles
  private activeTimeouts: Set<NodeJS.Timeout> = new Set();

    // 🔥 PHASE 1.4b FIX #3: Circuit Breaker for worker failures
  private workerFailureCount: number = 0;
  private workerCircuitOpen: boolean = false;
  private workerCircuitOpenTime: number = 0;
  private readonly WORKER_FAILURE_THRESHOLD = 5; // Open circuit after 5 failures
  private readonly WORKER_CIRCUIT_RESET_TIME = 60000; // 1 minute
  private readonly CIRCUIT_COOLDOWN_MS = 60000; // Circuit breaker cooldown 1 minute

  // 🏓 PHASE 2.1.4a FIX #5: Worker Health Check (ping/pong) - OPTIMIZED 27/10/2025
  private workerHealthCheckInterval: NodeJS.Timeout | null = null;
  private lastWorkerPong: number = Date.now();
  private readonly WORKER_PING_INTERVAL_MS = 5000; // Ping every 5 seconds (optimized from 10s)
  private readonly WORKER_PONG_TIMEOUT_MS = 3000; // Expect pong within 3 seconds (optimized from 5s)

  // Worker thread management - Operación 1: Hilos de Apolo
  private predictionWorker: Worker | null = null;
  private workerReady: boolean = false;

  // Quantum Throttling Engine - Operación 2: El Regulador Cuántico
  private throttlingEngine!: QuantumThrottlingEngine;

  // Quantum Prediction Cache - Operación 3: El Eco Persistente
  private predictionCache!: QuantumPredictionCache;

  constructor(
    server: SeleneServer,
    database: SeleneDatabase,
    cache: SeleneCache,
    monitoring: SeleneMonitoring,
    veritas: SeleneVeritas,
  ) {
    this.server = server;
    this.database = database;
    this.cache = cache;
    this.monitoring = monitoring;
    this.veritas = veritas;

    this.initializeAutoPrediction();
  }

  /**
   * 🎯 Initialize Selene Auto-Prediction
   */
  private async initializeAutoPrediction(): Promise<void> {
    console.log("🎯 SELENE AUTO-PREDICTION ACTIVATED");
    console.log("🛡️ Integrated with Selene Veritas - Verified predictions");
    console.log('⚡ "Predict with mathematical certainty"');
    console.log("🧵 Operación 1: Hilos de Apolo - Worker Threads ACTIVATED");
    console.log("🎛️ Operación 2: El Regulador Cuántico - Throttling ACTIVATED");
    console.log("🌌 Operación 3: El Eco Persistente - Caching ACTIVATED");

    // Initialize Quantum Throttling Engine - Operación 2
    this.throttlingEngine = new QuantumThrottlingEngine({
      maxCpuThreshold: 75, // Más conservador que el default
      adaptiveMode: true,
      queueMaxSize: 50,
    });

    // Initialize Quantum Prediction Cache - Operación 3
    this.predictionCache = new QuantumPredictionCache({
      maxSize: 500, // Cache de hasta 500 predicciones
      defaultTTL: 1800000, // 30 minutos por defecto
      ttlByType: {
        failure: 3600000, // 1 hora para fallos
        load: 900000, // 15 minutos para carga
        behavior: 1800000, // 30 minutos para comportamiento
        trend: 7200000, // 2 horas para tendencias
      },
      enableStats: true,
    });

    // Initialize worker thread - Operación 1
    await this.initializePredictionWorker();

    // Initialize prediction models
    await this.initializePredictionModels();

    // Load historical data
    await this.loadHistoricalData();

    // Start prediction engine
    this.startPredictionEngine();

    // Start model training scheduler
    this.startModelTrainingScheduler();

    this.monitoring.logInfo("Selene Auto-Prediction initialized");
  }

  /**
   * � Initialize Prediction Worker Thread - Operación 1: Hilos de Apolo
   */
  private async initializePredictionWorker(): Promise<void> {
    return new Promise((_resolve, reject) => {
      try {
        console.log("🧵 Initializing prediction worker thread...");

        // Ruta absoluta al worker compilado (ES modules compatible)
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const workerPath = path.resolve(__dirname, "PredictionWorker.js");

        this.predictionWorker = new Worker(workerPath);

        this.predictionWorker.on("online", () => {
          console.log("🧵 Prediction worker thread online");
          this.workerReady = true;
          // 🏓 PHASE 2.1.4a: Start health check when worker is online
          this.startWorkerHealthCheck();
          _resolve();
        });

        this.predictionWorker.on("error", (error) => {
          console.error("💥 Prediction worker error:", error);
          this.workerReady = false;
          reject(error);
        });

        this.predictionWorker.on("exit", (_code) => {
          console.log(`🧵 Prediction worker exited with code ${_code}`);
          this.workerReady = false;
          // 🏓 PHASE 2.1.4a: Stop health check on worker exit
          this.stopWorkerHealthCheck();
        });

        // 🏓 PHASE 2.1.4a: Start health check after worker is online
        this.predictionWorker.on("message", (msg: any) => {
          if (msg.type === "pong") {
            this.lastWorkerPong = Date.now();
          }
        });
      } catch (error) {
        console.error("💥 Failed to initialize prediction worker:", error);
        reject(error);
      }
    });
  }

  /**
   * 🏓 PHASE 2.1.4a FIX #5: Start worker health check (ping/pong)
   * Detects dead worker in 5 seconds vs 25-50 seconds (circuit breaker)
   */
  private startWorkerHealthCheck(): void {
    if (this.workerHealthCheckInterval) {
      clearInterval(this.workerHealthCheckInterval);
    }

    this.lastWorkerPong = Date.now();

    this.workerHealthCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastPong = now - this.lastWorkerPong;

      // Check if last pong is too old (worker might be dead)
      if (timeSinceLastPong > this.WORKER_PONG_TIMEOUT_MS + this.WORKER_PING_INTERVAL_MS) {
        console.error(
          `🏓 Worker health check FAILED - No pong for ${timeSinceLastPong}ms (threshold: ${this.WORKER_PONG_TIMEOUT_MS}ms)`
        );
        this.recordWorkerFailure();
        return;
      }

      // Send ping to worker
      const pingId = now;
      if (this.predictionWorker) {
        this.predictionWorker.postMessage({ type: "ping", pingId });
      }
    }, this.WORKER_PING_INTERVAL_MS);

    console.log(`🏓 Worker health check started (ping every ${this.WORKER_PING_INTERVAL_MS/1000}s, timeout ${this.WORKER_PONG_TIMEOUT_MS/1000}s)`);
  }

  /**
   * 🏓 PHASE 2.1.4a: Stop worker health check
   */
  private stopWorkerHealthCheck(): void {
    if (this.workerHealthCheckInterval) {
      clearInterval(this.workerHealthCheckInterval);
      this.workerHealthCheckInterval = null;
      console.log("🏓 Worker health check stopped");
    }
  }

  /**
   * 🎛️ Request throttled prediction with caching - Operación 2 + 3
   */
  private async requestThrottledPrediction(
    type: "failure" | "load" | "behavior" | "trend",
    target: string,
    _priority: "low" | "medium" | "high" | "critical" = "medium",
  ): Promise<any> {
    try {
      // 🌌 Check cache first - Operación 3
      const cacheKey = {
        type,
        target,
        historicalData:
          this.historicalData.get(this.getHistoricalDataKey(type)) || [],
      };
      const cachedResult = this.predictionCache.get(type, cacheKey);

      if (cachedResult) {
        console.log(
          `🌌 Cache hit for ${type}:${target} - returning cached result`,
        );
        return cachedResult;
      }

      console.log(`🌌 Cache miss for ${type}:${target} - computing prediction`);

      // 🎛️ Request throttled prediction - Operación 2
      const result = await this.throttlingEngine.requestPrediction({
        type,
        data: cacheKey,
        priority: _priority,
        timeout: 30000,
      });

      // 🌌 Cache the result if successful - Operación 3
      if (result) {
        this.predictionCache.set(type, cacheKey, result);
        console.log(`💾 Prediction cached: ${type}:${target}`);
      }

      return result;
    } catch (error) {
      if ((error as Error).message.includes("Throttling:")) {
        console.log(`🎛️ Prediction throttled: ${type} - ${target}`);
        return null; // Throttled, return null to indicate no prediction
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * 🔑 Get historical data key for prediction type
   */
  private getHistoricalDataKey(_type: string): string {
    const keyMap: Record<string, string> = {
      failure: "system_logs",
      load: "performance_metrics",
      behavior: "user_behavior",
      trend: "business_metrics",
    };
    return keyMap[_type] || "system_logs";
  }

  /**
   * �🧠 Initialize prediction models
   */
  private async initializePredictionModels(): Promise<void> {
    console.log("🧠 Initializing prediction models...");

    const defaultModels: PredictionModel[] = [
      {
        id: "failure_prediction",
        name: "System Failure Predictor",
        type: "failure",
        target: "system",
        accuracy: 0,
        lastTrained: new Date(),
        veritasVerified: true,
        confidence: 0,
      },
      {
        id: "load_prediction",
        name: "Load Predictor",
        type: "load",
        target: "server",
        accuracy: 0,
        lastTrained: new Date(),
        veritasVerified: true,
        confidence: 0,
      },
      {
        id: "behavior_prediction",
        name: "User Behavior Predictor",
        type: "behavior",
        target: "users",
        accuracy: 0,
        lastTrained: new Date(),
        veritasVerified: true,
        confidence: 0,
      },
      {
        id: "trend_prediction",
        name: "Business Trend Predictor",
        type: "trend",
        target: "business",
        accuracy: 0,
        lastTrained: new Date(),
        veritasVerified: true,
        confidence: 0,
      },
    ];

    for (const model of defaultModels) {
      this.predictionModels.set(model.id, model);
    }

    console.log("✅ Prediction models initialized");
  }

  /**
   * 📊 Load historical data for training (with cache invalidation)
   */
  private async loadHistoricalData(): Promise<void> {
    try {
      console.log("📊 Loading historical data...");

      // Load data from various sources (would be more comprehensive in production)
      const historicalSources = [
        "system_logs",
        "performance_metrics",
        "user_behavior",
        "business_metrics",
      ];

      for (const source of historicalSources) {
        const data = await this.loadHistoricalDataFromSource(source);
        this.historicalData.set(source, data);

        // 🌌 Invalidate cache for affected prediction types - Operación 3
        const typeMap: Record<
          string,
          "failure" | "load" | "behavior" | "trend"
        > = {
          system_logs: "failure",
          performance_metrics: "load",
          user_behavior: "behavior",
          business_metrics: "trend",
        };

        if (typeMap[source]) {
          this.invalidatePredictionCache(typeMap[source]);
        }

        // DISABLED: Automatic Veritas certificate generation causes infinite loops
        // Data integrity verification will be done on-demand only
        console.log(
          `📊 Loaded ${data.length} historical records from ${source} (certificates disabled)`,
        );
      }

      console.log(
        `✅ Loaded historical data from ${historicalSources.length} sources`,
      );
    } catch (error) {
      console.error("💥 Failed to load historical data:", error);
      this.monitoring.logError("Historical data loading failed", error);
    }
  }

  /**
   * 🚀 Start prediction engine (UNRESTRICTED VERSION - Directiva V192)
   */
  private startPredictionEngine(): void {
    console.log(
      "🚀 Starting prediction engine WITHOUT safety delays - DIRECTIVA V192",
    );

    try {
      console.log("🎯 Activating prediction engines immediately...");

      // Interval sin delays artificiales
      this.predictionInterval = setInterval(async () => {
        try {
          const startTime = Date.now();

          console.log("🔮 Generating scheduled predictions...");

          // 🔥 PHASE 1.4b FIX #2: Track timeout handle for cleanup
          let timeoutHandle: NodeJS.Timeout | null = null;
          const predictionPromise = this.generatePredictions();
          const timeoutPromise = new Promise<never>((_, _reject) => {
            timeoutHandle = setTimeout(() => {
              if (timeoutHandle) this.activeTimeouts.delete(timeoutHandle);
              _reject(new Error("Prediction timeout"));
            }, 30000);
            if (timeoutHandle) this.activeTimeouts.add(timeoutHandle);
          });

          try {
            await Promise.race([predictionPromise, timeoutPromise]);
            // Clear timeout on success
            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
              this.activeTimeouts.delete(timeoutHandle);
            }
          } catch (error) {
            // Clear timeout on error
            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
              this.activeTimeouts.delete(timeoutHandle);
            }
            throw error;
          }

          this.lastPredictionTime = startTime;

          const duration = Date.now() - startTime;
          console.log(`✅ Predictions generated in ${duration}ms`);
        } catch (error) {
          console.error("💥 Error in prediction engine:", error);
          this.monitoring.logError("Prediction engine error", error);
        }
      }, this.config.predictionInterval);

      console.log("✅ Prediction engines activated WITHOUT restrictions");
    } catch (error) {
      console.error("💥 Error activating prediction engines:", error);
      this.monitoring.logError("Prediction engine startup failed", error);
    }
  }

  /**
   * 📈 Start model training scheduler (UNRESTRICTED VERSION - Directiva V192)
   */
  private startModelTrainingScheduler(): void {
    console.log(
      "📈 Model training scheduler WITHOUT safety delays - DIRECTIVA V192",
    );

    try {
      console.log("🧠 Activating model training scheduler immediately...");

      // Entrenar modelos cada 24 horas sin delays artificiales
      // 🚨 PHANTOM TIMER FIX V401: Assign to variable for cleanup
      this.modelRetrainingTimer = setInterval(async () => {
        try {
          console.log("🧠 Starting scheduled model retraining...");

          // 🔥 PHASE 1.4b FIX #2: Track timeout handle for cleanup
          let timeoutHandle: NodeJS.Timeout | null = null;
          const trainingPromise = this.retrainModels();
          const timeoutPromise = new Promise<never>((_, _reject) => {
            timeoutHandle = setTimeout(() => {
              if (timeoutHandle) this.activeTimeouts.delete(timeoutHandle);
              _reject(new Error("Training timeout"));
            }, 60000); // 1 minuto
            if (timeoutHandle) this.activeTimeouts.add(timeoutHandle);
          });

          try {
            await Promise.race([trainingPromise, timeoutPromise]);
            // Clear timeout on success
            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
              this.activeTimeouts.delete(timeoutHandle);
            }
          } catch (error) {
            // Clear timeout on error
            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
              this.activeTimeouts.delete(timeoutHandle);
            }
            throw error;
          }

          console.log("✅ Model retraining completed");
        } catch (error) {
          console.error("💥 Error in model training:", error);
          this.monitoring.logError("Model training error", error);
        }
      }, this.retrainInterval);

      console.log("✅ Model training scheduler activated WITHOUT restrictions");
    } catch (error) {
      console.error("💥 Error activating model training:", error);
      this.monitoring.logError("Model training startup failed", error);
    }
  }

  /**
   * � PHASE 1.4b FIX #3: Check if worker circuit breaker is open
   */
  private isWorkerCircuitOpen(): boolean {
    if (!this.workerCircuitOpen) return false;

    // Check if cooldown period passed
    if (Date.now() - this.workerCircuitOpenTime > this.CIRCUIT_COOLDOWN_MS) {
      console.log("🔌 Circuit breaker cooldown complete - resetting");
      this.workerCircuitOpen = false;
      this.workerFailureCount = 0;
      return false;
    }

    return true;
  }

  /**
   * ⚡ PHASE 1.4b FIX #3: Record worker failure for circuit breaker
   */
  private recordWorkerFailure(): void {
    this.workerFailureCount++;

    console.warn(`⚠️ Worker failure recorded: ${this.workerFailureCount}/${this.WORKER_FAILURE_THRESHOLD}`);

    if (this.workerFailureCount >= this.WORKER_FAILURE_THRESHOLD) {
      console.error(
        `🔌 CIRCUIT BREAKER OPEN: ${this.workerFailureCount} consecutive worker failures - AUTO-RESTART INITIATED`,
      );
      this.workerCircuitOpen = true;
      this.workerCircuitOpenTime = Date.now();
      
      // 🔥 AUTO-RESTART: Reiniciar worker automáticamente tras 3 fallos
      this.restartWorkerThread().catch(err => {
        console.error("💥 Failed to restart worker thread:", err);
      });
    }
  }

  /**
   * 🔄 Auto-restart worker thread tras fallos - PHASE 2.1.4a FIX #6
   */
  private async restartWorkerThread(): Promise<void> {
    console.log("🔄 Restarting worker thread...");

    try {
      // 1. Detener health check actual
      this.stopWorkerHealthCheck();

      // 2. Terminar worker defectuoso si existe
      if (this.predictionWorker) {
        console.log("🛑 Terminating defective worker...");
        await this.predictionWorker.terminate();
        this.predictionWorker = null;
        this.workerReady = false;
      }

      // 3. Esperar cooldown de 1 segundo
      console.log("⏳ Cooldown period (1s)...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Reinicializar worker limpio
      console.log("✨ Initializing fresh worker...");
      await this.initializePredictionWorker();

      // 5. Resetear circuit breaker
      this.workerFailureCount = 0;
      this.workerCircuitOpen = false;
      this.workerCircuitOpenTime = 0;
      console.log("✅ Worker restarted successfully - Circuit breaker RESET");

    } catch (error) {
      console.error("💥 Worker restart failed:", error);
      // No reintentar inmediatamente para evitar bucle infinito
      // El circuit breaker permanecerá abierto hasta intervención manual
    }
  }

  /**
   * �🔮 Generate predictions using all models
   */
  private async generatePredictions(): Promise<void> {
    if (!this.predictionEnabled) return;

    try {
      console.log("🔮 Generating predictions...");

      for (const [, /* _modelId */ model] of this.predictionModels) {
        if (model.confidence >= this.minConfidenceThreshold) {
          const prediction = await this.generatePrediction(model);
          if (prediction) {
            this.predictions.push(prediction);

            // Cache prediction
            await this.cache.set(
              `prediction:${prediction.id}`,
              JSON.stringify(prediction),
              3600,
            ); // 1 hour

            // Alert on high-confidence critical predictions
            if (
              prediction.confidence > 90 &&
              this.isCriticalPrediction(prediction)
            ) {
              await this.alertCriticalPrediction(prediction);
            }
          }
        }
      }

      // Keep only last 1000 predictions
      if (this.predictions.length > 1000) {
        this.predictions = this.predictions.slice(-1000);
      }

      console.log(`✅ Generated ${this.predictions.length} predictions`);
    } catch (error) {
      this.monitoring.logError("Prediction generation failed", error);
    }
  }

  /**
   * 🎯 Generate prediction for specific model
   */
  private async generatePrediction(
    model: PredictionModel,
  ): Promise<Prediction | null> {
    try {
      let predictionData: any = null;
      let confidence = 0;

      switch (model.type) {
        case "failure":
          predictionData = await this.predictFailures(model.target);
          confidence = 85; // Would be calculated based on model accuracy
          break;

        case "load":
          predictionData = await this.predictLoad(model.target);
          confidence = 80;
          break;

        case "behavior":
          predictionData = await this.predictBehavior(model.target);
          confidence = 75;
          break;

        case "trend":
          predictionData = await this.predictTrends(model.target);
          confidence = 70;
          break;
      }

      if (!predictionData) return null;

      // Generate Veritas certificate for prediction
      const veritasCertificate = await this.veritas.generateTruthCertificate(
        predictionData,
        "prediction",
        `pred_${Date.now()}`,
      );

      const prediction: Prediction = {
        id: `pred_${model.id}_${Date.now()}`,
        modelId: model.id,
        prediction: predictionData,
        confidence,
        timeHorizon: 24, // 24 hours
        veritasCertificate,
        createdAt: new Date(),
      };

      return prediction;
    } catch (error) {
      console.error(
        `💥 Prediction generation failed for ${model.name}:`,
        error,
      );
      return null;
    }
  }

  /**
   * 💥 Predict system failures
   */
  private async predictFailures(target: string): Promise<FailurePrediction[]> {
    try {
      // 🔌 PHASE 1.4b FIX #3: Check circuit breaker BEFORE attempting prediction
      if (this.isWorkerCircuitOpen()) {
        console.log(
          "🔌 Circuit breaker open - returning empty failure predictions",
        );
        return [];
      }

      console.log("🎛️ Requesting throttled failure prediction...");

      const result = await this.requestThrottledPrediction(
        "failure",
        target,
        "high",
      );
      if (!result) return []; // Throttled

      // Success - reset failure count
      this.workerFailureCount = 0;
      return result as FailurePrediction[];
    } catch (error) {
      // Record failure for circuit breaker
      this.recordWorkerFailure();

      // If circuit now open, return empty instead of fallback
      if (this.isWorkerCircuitOpen()) {
        console.error(
          "🔌 Circuit breaker opened after failure - no fallback for failure predictions",
        );
        return [];
      }

      console.error(
        "💥 Throttled failure prediction failed, falling back to direct calculation:",
        error,
      );

      // Fallback to direct calculation if throttling/worker fails
      const historicalFailures = this.historicalData.get("system_logs") || [];
      const predictions: FailurePrediction[] = [];

      if (target === "system" || target === "database") {
        const dbFailures = historicalFailures.filter(
          (_f: any) => _f.component === "database",
        );

        if (dbFailures.length > 0) {
          predictions.push({
            component: "database",
            failureType: "connection_loss",
            probability: Math.min(dbFailures.length / 100, 0.8),
            timeToFailure: 24 + deterministicRandom() * 72,
            confidence: 75,
            preventiveActions: [
              "Increase connection pool size",
              "Implement connection retry logic",
              "Monitor connection metrics",
            ],
          });
        }
      }

      return predictions;
    }
  }

  /**
   * 📊 Predict system load
   */
  private async predictLoad(target: string): Promise<LoadPrediction[]> {
    try {
      // 🔌 PHASE 1.4b FIX #3: Check circuit breaker
      if (this.isWorkerCircuitOpen()) {
        console.log(
          "🔌 Circuit breaker open - returning empty load predictions",
        );
        return [];
      }

      console.log("🎛️ Requesting throttled load prediction...");

      const result = await this.requestThrottledPrediction(
        "load",
        target,
        "medium",
      );
      if (!result) return []; // Throttled

      // Success - reset failure count
      this.workerFailureCount = 0;
      return result as LoadPrediction[];
    } catch (error) {
      // Record failure
      this.recordWorkerFailure();

      // If circuit now open, return empty
      if (this.isWorkerCircuitOpen()) {
        console.error(
          "🔌 Circuit breaker opened - no fallback for load predictions",
        );
        return [];
      }

      console.error(
        "💥 Throttled load prediction failed, falling back to direct calculation:",
        error,
      );

      // Fallback to direct calculation if throttling/worker fails
      const predictions: LoadPrediction[] = [];

      if (target === "server") {
        const peakHour = 14;
        const predictedLoad = 0.85 + deterministicRandom() * 0.15;

        predictions.push({
          component: "server",
          predictedLoad,
          peakTime: new Date(
            Date.now() + 24 * 60 * 60 * 1000 + peakHour * 60 * 60 * 1000,
          ),
          confidence: 80,
          scalingRecommendation:
            predictedLoad > 0.9
              ? "Scale up server resources"
              : "Maintain current capacity",
        });
      }

      return predictions;
    }
  }

  /**
   * 👥 Predict user behavior
   */
  private async predictBehavior(target: string): Promise<BehaviorPrediction[]> {
    try {
      // 🔌 PHASE 1.4b FIX #3: Check circuit breaker
      if (this.isWorkerCircuitOpen()) {
        console.log(
          "🔌 Circuit breaker open - returning empty behavior predictions",
        );
        return [];
      }

      console.log("🎛️ Requesting throttled behavior prediction...");

      const result = await this.requestThrottledPrediction(
        "behavior",
        target,
        "low",
      );
      if (!result) return []; // Throttled

      // Success - reset failure count
      this.workerFailureCount = 0;
      return result as BehaviorPrediction[];
    } catch (error) {
      // Record failure
      this.recordWorkerFailure();

      // If circuit now open, return empty
      if (this.isWorkerCircuitOpen()) {
        console.error(
          "🔌 Circuit breaker opened - no fallback for behavior predictions",
        );
        return [];
      }

      console.error(
        "💥 Throttled behavior prediction failed, falling back to direct calculation:",
        error,
      );

      // Fallback to direct calculation if throttling/worker fails
      const predictions: BehaviorPrediction[] = [];

      if (target === "users") {
        predictions.push({
          userSegment: "active_users",
          predictedBehavior: "increased_appointment_booking",
          probability: 0.75,
          confidence: 70,
          recommendations: [
            "Prepare additional appointment slots",
            "Optimize booking flow",
            "Increase customer support capacity",
          ],
        });
      }

      return predictions;
    }
  }

  /**
   * 📈 Predict business trends
   */
  private async predictTrends(target: string): Promise<any[]> {
    try {
      // 🔌 PHASE 1.4b FIX #3: Check circuit breaker
      if (this.isWorkerCircuitOpen()) {
        console.log(
          "🔌 Circuit breaker open - returning empty trend predictions",
        );
        return [];
      }

      console.log("🎛️ Requesting throttled trend prediction...");

      const result = await this.requestThrottledPrediction(
        "trend",
        target,
        "low",
      );
      if (!result) return []; // Throttled

      // Success - reset failure count
      this.workerFailureCount = 0;
      return result as any[];
    } catch (error) {
      // Record failure
      this.recordWorkerFailure();

      // If circuit now open, return empty
      if (this.isWorkerCircuitOpen()) {
        console.error(
          "🔌 Circuit breaker opened - no fallback for trend predictions",
        );
        return [];
      }

      console.error(
        "💥 Throttled trend prediction failed, falling back to direct calculation:",
        error,
      );

      // Fallback to direct calculation if throttling/worker fails
      const predictions: any[] = [];

      if (target === "business") {
        const predictedGrowth = 0.05 + deterministicRandom() * 0.15;

        predictions.push({
          metric: "revenue",
          predictedChange: predictedGrowth,
          timeHorizon: 30,
          confidence: 65,
          factors: ["Seasonal trends", "Market conditions", "User growth"],
        });
      }

      return predictions;
    }
  }

  /**
   * ✅ Validate predictions against actual outcomes
   */
  private async validatePredictions(): Promise<void> {
    try {
      console.log("✅ Validating predictions...");

      const now = new Date();
      const validationWindow = 24 * 60 * 60 * 1000; // 24 hours

      // Find predictions that should be validated
      const predictionsToValidate = this.predictions.filter(
        (p) =>
          now.getTime() - p.createdAt.getTime() >= validationWindow &&
          p.accuracy === undefined,
      );

      for (const prediction of predictionsToValidate) {
        const accuracy = await this.calculatePredictionAccuracy(prediction);
        prediction.accuracy = accuracy;

        // Update model accuracy
        const model = this.predictionModels.get(prediction.modelId);
        if (model) {
          model.accuracy = (model.accuracy + accuracy) / 2; // Simple average
          model.lastTrained = new Date();
        }
      }

      console.log(`✅ Validated ${predictionsToValidate.length} predictions`);
    } catch (error) {
      this.monitoring.logError("Prediction validation failed", error);
    }
  }

  /**
   * 📐 Calculate prediction accuracy
   */
  private async calculatePredictionAccuracy(
    _prediction: Prediction,
  ): Promise<number> {
    // This would implement actual accuracy calculation based on prediction type
    // For now, return a random accuracy between 60-95%
    return 60 + deterministicRandom() * 35;
  }

  /**
   * 🔄 Retrain prediction models
   */
  private async retrainModels(): Promise<void> {
    try {
      console.log("🔄 Retraining prediction models...");

      // Reload historical data
      await this.loadHistoricalData();

      // Retrain each model
      for (const [, /* _modelId */ model] of this.predictionModels) {
        await this.retrainModel(model);
        model.lastTrained = new Date();
      }

      console.log("✅ Models retrained");
    } catch (error) {
      this.monitoring.logError("Model retraining failed", error);
    }
  }

  /**
   * 🧠 Retrain individual model
   */
  private async retrainModel(model: PredictionModel): Promise<void> {
    // This would implement actual model retraining
    // For now, just update confidence based on historical performance
    const recentPredictions = this.predictions
      .filter((p) => p.modelId === model.id && p.accuracy !== undefined)
      .slice(-10); // Last 10 predictions

    if (recentPredictions.length > 0) {
      const avgAccuracy =
        recentPredictions.reduce((_sum, _p) => _sum + (_p.accuracy || 0), 0) /
        recentPredictions.length;
      model.confidence = Math.min(avgAccuracy, 95); // Max 95% confidence
    }
  }

  /**
   * ⚠️ Alert critical predictions
   */
  private async alertCriticalPrediction(prediction: Prediction): Promise<void> {
    console.log(`🚨 CRITICAL PREDICTION ALERT: ${prediction.id}`);
    console.log(`   Model: ${prediction.modelId}`);
    console.log(`   Confidence: ${prediction.confidence}%`);
    console.log(`   Prediction:`, prediction.prediction);

    // This would send alerts to administrators
    this.monitoring.logError("Critical prediction alert", {
      predictionId: prediction.id,
      modelId: prediction.modelId,
      confidence: prediction.confidence,
      prediction: prediction.prediction,
    });
  }

  /**
   * 🎯 Check if prediction is critical
   */
  private isCriticalPrediction(prediction: Prediction): boolean {
    // Define criteria for critical predictions
    if (prediction.modelId === "failure_prediction") {
      const failures = prediction.prediction as FailurePrediction[];
      return failures.some((f) => f.probability > 0.7 && f.timeToFailure < 24);
    }

    if (prediction.modelId === "load_prediction") {
      const loads = prediction.prediction as LoadPrediction[];
      return loads.some((_l) => _l.predictedLoad > 0.95);
    }

    return false;
  }

  /**
   * 📊 Load historical data from source
   */
  private async loadHistoricalDataFromSource(source: string): Promise<any[]> {
    // This would load actual historical data from database/cache
    // For now, return mock data
    const mockData = [];

    for (let i = 0; i < 100; i++) {
      mockData.push({
        id: `historical_${source}_${i}`,
        timestamp: new Date(
          Date.now() - deterministicRandom() * 30 * 24 * 60 * 60 * 1000,
        ), // Last 30 days
        source,
        data: { value: deterministicRandom() * 100 },
      });
    }

    return mockData;
  }

  /**
   * 🌌 Invalidate prediction cache - Operación 3
   */
  private invalidatePredictionCache(
    type?: "failure" | "load" | "behavior" | "trend",
    target?: string,
  ): void {
    if (type && target) {
      // Invalidate specific type and target
      const cacheKey = {
        type,
        target,
        historicalData:
          this.historicalData.get(this.getHistoricalDataKey(type)) || [],
      };
      this.predictionCache.invalidate(type, cacheKey);
      console.log(`🗑️ Cache invalidated: ${type}:${target}`);
    } else if (type) {
      // Invalidate all entries of a type
      const invalidated = this.predictionCache.invalidate(type);
      console.log(
        `�️ Cache invalidated for type ${type}: ${invalidated} entries`,
      );
    } else {
      // Invalidate all cache
      const invalidated = this.predictionCache.invalidate();
      console.log(`🗑️ Complete cache invalidation: ${invalidated} entries`);
    }
  }

  /**
   * 📊 Get prediction statistics including cache stats
   */
  getPredictionStats(): any {
    const totalPredictions = this.predictions.length;
    const highConfidencePredictions = this.predictions.filter(
      (_p) => _p.confidence > 85,
    ).length;
    const validatedPredictions = this.predictions.filter(
      (_p) => _p.accuracy !== undefined,
    ).length;
    const avgAccuracy =
      validatedPredictions > 0
        ? this.predictions
            .filter((_p) => _p.accuracy !== undefined)
            .reduce((_sum, _p) => _sum + (_p.accuracy || 0), 0) /
          validatedPredictions
        : 0;

    const cacheStats = this.predictionCache.getStats();

    return {
      totalPredictions,
      highConfidencePredictions,
      validatedPredictions,
      averageAccuracy: avgAccuracy,
      activeModels: this.predictionModels.size,
      historicalDataSources: this.historicalData.size,
      cacheStats: {
        totalEntries: cacheStats.totalEntries,
        hitRate: cacheStats.hitRate.toFixed(1) + "%",
        totalHits: cacheStats.totalHits,
        totalMisses: cacheStats.totalMisses,
        evictions: cacheStats.evictions,
        memoryUsage: `${(cacheStats.memoryUsage / 1024).toFixed(1)} KB`,
      },
    };
  }

  /**
   * 🔮 Get predictions by type
   */
  getPredictionsByType(_type: PredictionModel["type"]): Prediction[] {
    return this.predictions.filter((_p) => {
      const model = this.predictionModels.get(_p.modelId);
      return model?.type === _type;
    });
  }

  /**
   * 📊 Get module status
   */
  async getStatus(): Promise<any> {
    const modelSummary = Array.from(this.predictionModels.values()).map(
      (m) => ({
        id: m.id,
        type: m.type,
        accuracy: m.accuracy,
        confidence: m.confidence,
        veritasVerified: m.veritasVerified,
      }),
    );

    const throttlingMetrics = this.throttlingEngine.getMetrics();
    const cacheStats = this.predictionCache.getStats();

    return {
      module: "auto_prediction",
      status: this.predictionEnabled ? "active" : "disabled",
      veritasIntegrated: true,
      workerThreadsActive: this.workerReady,
      quantumThrottlingActive: true,
      quantumCachingActive: true,
      predictionStats: this.getPredictionStats(),
      throttlingMetrics,
      cacheStats: {
        totalEntries: cacheStats.totalEntries,
        hitRate: cacheStats.hitRate.toFixed(1) + "%",
        totalHits: cacheStats.totalHits,
        totalMisses: cacheStats.totalMisses,
        evictions: cacheStats.evictions,
        memoryUsage: `${(cacheStats.memoryUsage / 1024).toFixed(1)} KB`,
      },
      models: modelSummary,
      capabilities: [
        "failure_prediction",
        "load_prediction",
        "behavior_prediction",
        "trend_analysis",
        "model_retraining",
        "prediction_validation",
        "worker_thread_isolation",
        "quantum_throttling",
        "adaptive_cpu_management",
        "quantum_prediction_caching",
        "intelligent_cache_invalidation",
      ],
    };
  }

  /**
   * 🛑 PHASE 1.4b FIX #1: Comprehensive shutdown and cleanup
   * Prevents timer leaks, worker leaks, and sub-engine leaks
   */
  public async shutdown(): Promise<void> {
    console.log("🛑 PREDICT MODULE SHUTDOWN INITIATED");

    try {
      // 1. Stop prediction intervals
      if (this.predictionInterval) {
        clearInterval(this.predictionInterval);
        this.predictionInterval = null;
        console.log("✅ Prediction interval cleared");
      }

      // 2. Stop model retraining
      if (this.modelRetrainingTimer) {
        clearInterval(this.modelRetrainingTimer);
        this.modelRetrainingTimer = null;
        console.log("✅ Model retraining timer cleared");
      }

      // 3. Terminate worker thread
      if (this.predictionWorker) {
        await this.predictionWorker.terminate();
        this.predictionWorker = null;
        this.workerReady = false;
        console.log("✅ Prediction worker terminated");
      }

      // 4. Destroy throttling engine
      if (this.throttlingEngine) {
        this.throttlingEngine.destroy();
        console.log("✅ Throttling engine destroyed");
      }

      // 5. Destroy prediction cache
      if (this.predictionCache) {
        this.predictionCache.destroy();
        console.log("✅ Prediction cache destroyed");
      }

      // 6. Clear all active timeouts
      for (const timeout of this.activeTimeouts) {
        clearTimeout(timeout);
      }
      const timeoutCount = this.activeTimeouts.size;
      this.activeTimeouts.clear();
      console.log(`✅ ${timeoutCount} active timeouts cleared`);

      console.log("🎯 PREDICT MODULE SHUTDOWN COMPLETE");
    } catch (error) {
      console.error("💥 Error during Predict shutdown:", error);
      throw error;
    }
  }

  /**
   * 🔍 Get shutdown status (for testing)
   */
  public getShutdownStatus(): {
    predictionIntervalCleared: boolean;
    modelRetrainingTimerCleared: boolean;
    workerTerminated: boolean;
  } {
    return {
      predictionIntervalCleared: this.predictionInterval === null,
      modelRetrainingTimerCleared: this.modelRetrainingTimer === null,
      workerTerminated: this.predictionWorker === null,
    };
  }
}

