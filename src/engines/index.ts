/**
 * 🎯 SELENE ENGINES - UNIFIED EXPORT
 * 
 * Exporta todos los componentes de la arquitectura de engines:
 * - BaseEngine interface
 * - AbstractBaseEngine helper class
 * - Todos los tipos asociados (Input, Output, Status, Metrics, Feedback)
 * - Tier system (UserTier, RateLimits, UsageMetrics)
 * 
 * @author PunkClaude + RadWulf
 * @date 2025-10-23 (PHASE 7 PREP)
 */

// ════════════════════════════════════════════════════════════════════════════
// BASE ENGINE INTERFACE & TYPES
// ════════════════════════════════════════════════════════════════════════════

export {
  // Core Interface
  BaseEngine,
  AbstractBaseEngine,
  
  // Tier System
  UserTier,
  RateLimits,
  UsageMetrics,
  
  // Status & Health
  EngineStatusType,
  EngineStatus,
  
  // Input / Output
  EngineInput,
  EngineOutput,
  EngineOutputMetadata,
  
  // Metrics & Feedback
  EngineMetrics,
  EngineFeedback
} from './BaseEngine.js';

// ════════════════════════════════════════════════════════════════════════════
// ENGINE IMPLEMENTATIONS (Future)
// ════════════════════════════════════════════════════════════════════════════

// Commented out - will be uncommented as engines are implemented:

// export { MusicEngine } from './MusicEngine.js';
// export { NPCEngine } from './NPCEngine.js';
// export { TradingEngine } from './TradingEngine.js';
// export { ChemistryEngine } from './ChemistryEngine.js';

// ════════════════════════════════════════════════════════════════════════════
// ENGINE REGISTRY (Future)
// ════════════════════════════════════════════════════════════════════════════

// export { EngineRegistry } from './EngineRegistry.js';

