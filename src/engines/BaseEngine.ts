/**
 * 🎯 BASE ENGINE INTERFACE - SELENE MULTIMODAL ARCHITECTURE
 * 
 * Interfaz base para todos los engines de Selene:
 * - MusicEngine (MIDI + Poetry generation)
 * - NPCEngine (Dialogue + Personality generation)
 * - TradingEngine (Signal + Strategy generation)
 * - ChemistryEngine (Formula + Reaction generation)
 * 
 * Esta interfaz define el contrato que TODOS los engines deben cumplir:
 * - Lifecycle management (init, shutdown, status)
 * - Core generation (determinista/balanced/punk)
 * - Mode integration (entropyFactor, riskThreshold, punkProbability)
 * - Monetization hooks (rate limits, usage tracking)
 * - Evolution integration (metrics, feedback loop)
 * 
 * @author PunkClaude + RadWulf
 * @date 2025-10-23 (PHASE 7 PREP)
 * @version 1.0.0
 */

import { ModeConfig } from '../evolutionary/modes/mode-manager.js';

// ════════════════════════════════════════════════════════════════════════════
// TIER SYSTEM (MONETIZATION)
// ════════════════════════════════════════════════════════════════════════════

/**
 * User subscription tiers
 */
export type UserTier = 'free' | 'indie' | 'pro' | 'enterprise';

/**
 * Rate limits per tier
 */
export interface RateLimits {
  /** Maximum requests per month */
  requestsPerMonth: number;
  
  /** Maximum duration per request (seconds) */
  maxDurationSeconds: number;
  
  /** Maximum concurrent requests */
  maxConcurrentRequests?: number;
  
  /** Burst allowance (requests per minute) */
  burstLimit?: number;
}

/**
 * Usage metrics for analytics and billing
 */
export interface UsageMetrics {
  /** User ID */
  userId: string;
  
  /** Engine name (music, npc, trading, chemistry) */
  engineName: string;
  
  /** Total requests this period */
  requestCount: number;
  
  /** Total duration processed (seconds) */
  totalDurationSeconds: number;
  
  /** Total data generated (bytes) */
  totalDataBytes: number;
  
  /** Last request timestamp */
  lastRequestTimestamp: number;
  
  /** Current subscription tier */
  currentTier: UserTier;
  
  /** Period start timestamp */
  periodStart: number;
  
  /** Period end timestamp */
  periodEnd: number;
}

// ════════════════════════════════════════════════════════════════════════════
// ENGINE STATUS & HEALTH
// ════════════════════════════════════════════════════════════════════════════

/**
 * Engine operational status
 */
export type EngineStatusType = 
  | 'initializing'  // Starting up
  | 'ready'         // Ready to process
  | 'busy'          // Processing request
  | 'degraded'      // Working but with issues
  | 'error'         // Error state
  | 'shutdown';     // Shutting down

/**
 * Engine status details
 */
export interface EngineStatus {
  /** Current status */
  status: EngineStatusType;
  
  /** Health score (0-100) */
  health: number;
  
  /** Active requests count */
  activeRequests: number;
  
  /** Total requests processed */
  totalRequests: number;
  
  /** Average latency (ms) */
  averageLatency: number;
  
  /** Error count in current session */
  errorCount: number;
  
  /** Uptime (ms) */
  uptime: number;
  
  /** Last activity timestamp */
  lastActivity: number;
  
  /** Memory usage (MB) */
  memoryUsageMB: number;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// ════════════════════════════════════════════════════════════════════════════
// INPUT / OUTPUT CONTRACTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generic engine input
 * Each engine extends this with specific fields
 */
export interface EngineInput {
  /** Unique request ID for tracking */
  requestId: string;
  
  /** User ID (for rate limiting & analytics) */
  userId: string;
  
  /** User tier (for feature gating) */
  userTier: UserTier;
  
  /** Timestamp of request */
  timestamp: number;
  
  /** Engine-specific parameters */
  parameters: Record<string, any>;
  
  /** Optional context from previous operations */
  context?: Record<string, any>;
}

/**
 * Generic engine output
 * Each engine extends this with specific data
 */
export interface EngineOutput {
  /** Output type identifier */
  type: string;
  
  /** Request ID (same as input) */
  requestId: string;
  
  /** Engine-generated data */
  data: Record<string, any>;
  
  /** Metadata about generation */
  metadata: EngineOutputMetadata;
  
  /** Timestamp of completion */
  timestamp: number;
}

/**
 * Metadata attached to every engine output
 */
export interface EngineOutputMetadata {
  /** Mode used for generation */
  mode: ModeConfig;
  
  /** Quality score (0-1) */
  quality: number;
  
  /** Generation time (ms) */
  generationTimeMs: number;
  
  /** Entropy applied (0-1) */
  entropyApplied: number;
  
  /** Risk level (0-1) */
  riskLevel: number;
  
  /** Determinism score (0-1, 1 = fully deterministic) */
  determinismScore: number;
  
  /** Data size (bytes) */
  dataSizeBytes: number;
  
  /** Additional engine-specific metadata */
  engineMetadata?: Record<string, any>;
}

// ════════════════════════════════════════════════════════════════════════════
// METRICS & FEEDBACK
// ════════════════════════════════════════════════════════════════════════════

/**
 * Engine performance metrics
 * Reported to Synergy Engine for evolution
 */
export interface EngineMetrics {
  /** Engine name */
  engineName: string;
  
  /** Operation ID */
  operationId: string;
  
  /** User ID */
  userId: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Latency (ms) */
  latencyMs: number;
  
  /** CPU usage (0-100) */
  cpuUsage: number;
  
  /** Memory delta (MB) */
  memoryDeltaMB: number;
  
  /** Success flag */
  success: boolean;
  
  /** Error message if failed */
  errorMessage?: string;
  
  /** Output quality (0-1) */
  outputQuality: number;
  
  /** Mode used */
  mode: ModeConfig;
  
  /** Additional metrics */
  customMetrics?: Record<string, number>;
}

/**
 * User feedback on engine output
 * Used for learning and adaptation
 */
export interface EngineFeedback {
  /** Engine name */
  engineName: string;
  
  /** Operation ID (same as requestId) */
  operationId: string;
  
  /** User ID */
  userId: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Star rating (1-5) */
  rating: 1 | 2 | 3 | 4 | 5;
  
  /** Feedback tags */
  tags: string[];
  
  /** Freeform text feedback (optional) */
  freeformText?: string;
  
  /** What user liked */
  liked?: string[];
  
  /** What user disliked */
  disliked?: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// BASE ENGINE INTERFACE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Base Engine Interface
 * 
 * All Selene engines (Music, NPC, Trading, Chemistry) MUST implement this interface.
 * 
 * ## Lifecycle Methods
 * - `initialize()`: Setup engine (load libraries, connect to Redis, etc.)
 * - `shutdown()`: Graceful cleanup
 * - `getStatus()`: Current operational status
 * 
 * ## Core Generation
 * - `generate(input, mode)`: Main generation method (MIDI, dialogue, signals, formulas)
 * 
 * ## Mode Integration
 * - `applyMode(mode, baseOutput)`: Apply mode transformations to base output
 * - `calculateEntropy(input, mode)`: Calculate entropy for given input and mode
 * 
 * ## Monetization
 * - `getRateLimits(tier)`: Get rate limits for user tier
 * - `getUsageMetrics()`: Get current usage metrics
 * 
 * ## Evolution
 * - `reportMetrics(metrics)`: Report performance metrics to Synergy Engine
 * - `receiveFeedback(feedback)`: Process user feedback for learning
 * 
 * @example
 * ```typescript
 * class MusicEngine implements BaseEngine {
 *   async initialize(): Promise<void> {
 *     await this.connectToRedis();
 *     await this.loadPoetryLibrary();
 *   }
 *   
 *   async generate(input: EngineInput, mode: ModeConfig): Promise<EngineOutput> {
 *     const midi = await this.composeWithMode(input, mode);
 *     return {
 *       type: 'music',
 *       requestId: input.requestId,
 *       data: { midi },
 *       metadata: this.buildMetadata(mode),
 *       timestamp: Date.now()
 *     };
 *   }
 *   
 *   // ... implement all other methods
 * }
 * ```
 */
export interface BaseEngine {
  // ════════════════════════════════════════════════════════════════════════════
  // LIFECYCLE MANAGEMENT
  // ════════════════════════════════════════════════════════════════════════════
  
  /**
   * Initialize engine
   * 
   * Called once on startup.
   * Should:
   * - Connect to Redis
   * - Load content libraries
   * - Subscribe to mode changes
   * - Initialize internal state
   * 
   * @throws Error if initialization fails
   */
  initialize(): Promise<void>;
  
  /**
   * Graceful shutdown
   * 
   * Called on system shutdown.
   * Should:
   * - Finish active requests
   * - Disconnect from Redis
   * - Save state if needed
   * - Clean up resources
   */
  shutdown(): Promise<void>;
  
  /**
   * Get current engine status
   * 
   * @returns Current operational status
   */
  getStatus(): EngineStatus;
  
  // ════════════════════════════════════════════════════════════════════════════
  // CORE GENERATION
  // ════════════════════════════════════════════════════════════════════════════
  
  /**
   * Generate output based on input and mode
   * 
   * This is the MAIN method of every engine.
   * 
   * Behavior MUST vary by mode:
   * - DETERMINISTIC (entropyFactor=0): Same input → ALWAYS same output
   * - BALANCED (entropyFactor=50): Controlled variation via Synergy metrics
   * - PUNK (entropyFactor=100): Creative chaos, Fibonacci-anchored
   * 
   * @param input - Engine input with parameters
   * @param mode - Mode configuration
   * @returns Generated output
   * 
   * @throws Error if generation fails
   */
  generate(input: EngineInput, mode: ModeConfig): Promise<EngineOutput>;
  
  // ════════════════════════════════════════════════════════════════════════════
  // MODE INTEGRATION
  // ════════════════════════════════════════════════════════════════════════════
  
  /**
   * Apply mode transformations to base output
   * 
   * Engines can implement this to separate:
   * 1. Base generation (deterministic)
   * 2. Mode transformation (add entropy/variation)
   * 
   * @param mode - Mode configuration
   * @param baseOutput - Deterministic base output
   * @returns Mode-transformed output
   */
  applyMode(mode: ModeConfig, baseOutput: any): any;
  
  /**
   * Calculate entropy for given input and mode
   * 
   * Used to determine how much variation to apply.
   * 
   * @param input - Engine input
   * @param mode - Mode configuration
   * @returns Entropy value (0-1)
   */
  calculateEntropy(input: any, mode: ModeConfig): number;
  
  // ════════════════════════════════════════════════════════════════════════════
  // MONETIZATION HOOKS
  // ════════════════════════════════════════════════════════════════════════════
  
  /**
   * Get rate limits for user tier
   * 
   * Defines:
   * - FREE: Limited requests, short duration
   * - INDIE: More requests, longer duration
   * - PRO: Unlimited requests, max duration
   * - ENTERPRISE: No limits
   * 
   * @param tier - User subscription tier
   * @returns Rate limits for tier
   */
  getRateLimits(tier: UserTier): RateLimits;
  
  /**
   * Get current usage metrics
   * 
   * Used for:
   * - Analytics dashboard
   * - Billing calculations
   * - Quota enforcement
   * 
   * @returns Current usage metrics
   */
  getUsageMetrics(): UsageMetrics;
  
  // ════════════════════════════════════════════════════════════════════════════
  // EVOLUTION INTEGRATION
  // ════════════════════════════════════════════════════════════════════════════
  
  /**
   * Report performance metrics to Synergy Engine
   * 
   * Called after every generation.
   * Metrics used for:
   * - SystemVitals tracking
   * - Synergy Engine evolution
   * - Dashboard visualization
   * 
   * @param metrics - Performance metrics
   */
  reportMetrics(metrics: EngineMetrics): Promise<void>;
  
  /**
   * Process user feedback for learning
   * 
   * Called when user rates output.
   * Should:
   * - Store feedback in Redis
   * - Adjust internal weights
   * - Report to Synergy Engine
   * 
   * Example weight adjustments:
   * - Tag "repetitive" → increase variety weight
   * - Tag "boring" → increase creativity weight
   * - Tag "too-fast" → decrease tempo multiplier
   * 
   * @param feedback - User feedback
   */
  receiveFeedback(feedback: EngineFeedback): Promise<void>;
}

// ════════════════════════════════════════════════════════════════════════════
// ABSTRACT BASE CLASS (OPTIONAL HELPER)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Abstract base class implementing common functionality
 * 
 * Engines can extend this instead of implementing BaseEngine directly.
 * Provides default implementations for:
 * - Status tracking
 * - Usage metrics collection
 * - Basic error handling
 * 
 * @example
 * ```typescript
 * class MusicEngine extends AbstractBaseEngine {
 *   // Only implement engine-specific methods
 *   async generate(input: EngineInput, mode: ModeConfig): Promise<EngineOutput> {
 *     // ... music generation logic
 *   }
 * }
 * ```
 */
export abstract class AbstractBaseEngine implements BaseEngine {
  protected engineName: string;
  protected status: EngineStatus;
  protected startTime: number;
  protected requestCount: number = 0;
  protected errorCount: number = 0;
  protected totalLatency: number = 0;
  
  constructor(engineName: string) {
    this.engineName = engineName;
    this.startTime = Date.now();
    this.status = {
      status: 'initializing',
      health: 100,
      activeRequests: 0,
      totalRequests: 0,
      averageLatency: 0,
      errorCount: 0,
      uptime: 0,
      lastActivity: Date.now(),
      memoryUsageMB: 0
    };
  }
  
  // Default implementations
  
  async initialize(): Promise<void> {
    this.status.status = 'ready';
  }
  
  async shutdown(): Promise<void> {
    this.status.status = 'shutdown';
  }
  
  getStatus(): EngineStatus {
    return {
      ...this.status,
      uptime: Date.now() - this.startTime,
      averageLatency: this.requestCount > 0 ? this.totalLatency / this.requestCount : 0,
      memoryUsageMB: process.memoryUsage().heapUsed / 1024 / 1024
    };
  }
  
  /**
   * Track request start
   */
  protected trackRequestStart(): void {
    this.status.activeRequests++;
    this.status.lastActivity = Date.now();
  }
  
  /**
   * Track request end
   */
  protected trackRequestEnd(latencyMs: number, success: boolean): void {
    this.status.activeRequests--;
    this.status.totalRequests++;
    this.requestCount++;
    this.totalLatency += latencyMs;
    
    if (!success) {
      this.status.errorCount++;
      this.errorCount++;
    }
    
    // Update health based on error rate
    const errorRate = this.errorCount / Math.max(1, this.requestCount);
    this.status.health = Math.max(0, 100 - (errorRate * 100));
    
    // Update status based on health
    if (this.status.health > 80) {
      this.status.status = 'ready';
    } else if (this.status.health > 50) {
      this.status.status = 'degraded';
    } else {
      this.status.status = 'error';
    }
  }
  
  // Abstract methods - MUST be implemented by engines
  
  abstract generate(input: EngineInput, mode: ModeConfig): Promise<EngineOutput>;
  abstract applyMode(mode: ModeConfig, baseOutput: any): any;
  abstract calculateEntropy(input: any, mode: ModeConfig): number;
  abstract getRateLimits(tier: UserTier): RateLimits;
  abstract getUsageMetrics(): UsageMetrics;
  abstract reportMetrics(metrics: EngineMetrics): Promise<void>;
  abstract receiveFeedback(feedback: EngineFeedback): Promise<void>;
}

