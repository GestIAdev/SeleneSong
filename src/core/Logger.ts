/**
 * 🌙 SELENE LOGGER - THE SILENT MOON
 * ============================================================================
 * File: selene/src/core/Logger.ts
 * Created: November 27, 2025
 * Author: PunkClaude + GeminiPunk
 * Directive: OPERACIÓN SILENCIO #012
 *
 * PHILOSOPHY:
 * The Moon speaks only when necessary.
 * Silence is not absence - it's discipline.
 * Every log that reaches the console has EARNED its place.
 *
 * ARCHITECTURE:
 * - Winston-based structured logging
 * - Custom noise filter (TTLCache, Heartbeat, etc.)
 * - Environment-aware log levels
 * - Node-aware metadata (cluster support)
 * - Lunar-themed formatting because we're Selene, dammit
 *
 * LOG LEVELS:
 * - error: 💀 System failures, unrecoverable states
 * - warn:  ⚠️ Degraded performance, potential issues
 * - info:  🌙 Important state changes, lifecycle events
 * - http:  🌐 HTTP requests (if enabled)
 * - debug: 🔍 Detailed diagnostic information
 * - silly: 🗑️ Noise graveyard (TTLCache spam goes here to die)
 *
 * STATUS: PRODUCTION-READY
 * ============================================================================
 */

import winston from 'winston';

// ============================================================================
// CONFIGURATION
// ============================================================================

const NODE_ID = process.env.NODE_ID || `selene-${process.pid}`;
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');

// Patterns to filter (send to 'silly' level - the graveyard)
const NOISE_PATTERNS = [
  'TTLCache',
  'LazyTTLCache',
  'Publish interval',
  'Heartbeat',
  'heartbeat',
  'HEARTBEAT',
  'expiró',
  'expired',
  'cache hit',
  'cache miss',
  'Cache cleared',
  'ping',
  'PING',
  'pong',
  'PONG',
];

// ============================================================================
// CUSTOM FORMATS
// ============================================================================

/**
 * 🔇 THE SILENCER - Noise Filter Format
 * 
 * Intercepts noisy messages and demotes them to 'silly' level.
 * In production (level: 'info'), silly messages are never printed.
 * In development (level: 'debug'), they're still hidden unless LOG_LEVEL=silly.
 */
const noiseFilter = winston.format((info) => {
  const message = typeof info.message === 'string' ? info.message : JSON.stringify(info.message);
  
  // Check if message matches any noise pattern
  const isNoise = NOISE_PATTERNS.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isNoise) {
    // Demote to silly - effectively silencing in production/debug
    info.level = 'silly';
    info.silenced = true;
  }
  
  return info;
});

/**
 * 🌙 LUNAR FORMAT - Beautiful, compact, informative
 * 
 * Format: [TIMESTAMP] [LEVEL] [NODE] message
 * Example: [14:32:05] [INFO] [selene-node-1] 🚀 Server started on port 8005
 */
const lunarFormat = winston.format.printf(({ level, message, timestamp, nodeId, ...metadata }) => {
  // Extract just the time portion for cleaner logs
  const ts = timestamp as string | undefined;
  const time = ts ? new Date(ts).toLocaleTimeString('en-GB') : new Date().toLocaleTimeString('en-GB');
  
  // Color-coded level
  const levelStr = level.toUpperCase().padEnd(5);
  
  // Node identifier (important for cluster)
  const node = (nodeId as string) || NODE_ID;
  const nodeShort = node.replace('selene-', '').substring(0, 8);
  
  // Metadata handling (only if non-empty)
  let meta = '';
  if (Object.keys(metadata).length > 0 && !metadata.silenced) {
    // Filter out internal winston properties
    const cleanMeta = { ...metadata };
    delete cleanMeta.silenced;
    delete cleanMeta.service;
    if (Object.keys(cleanMeta).length > 0) {
      meta = ` ${JSON.stringify(cleanMeta)}`;
    }
  }
  
  return `[${time}] [${levelStr}] [${nodeShort}] ${message}${meta}`;
});

/**
 * 🔮 JSON FORMAT - For production log aggregation
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// ============================================================================
// LOGGER INSTANCE
// ============================================================================

/**
 * 🌙 THE SELENE LOGGER
 * 
 * Usage:
 *   import { logger } from './core/Logger.js';
 *   
 *   logger.info('Server started', { port: 8005 });
 *   logger.error('Database connection failed', { error: err.message });
 *   logger.debug('Processing request', { requestId: '123' });
 *   logger.warn('Memory usage high', { used: '450MB', limit: '512MB' });
 */
const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { 
    service: 'selene',
    nodeId: NODE_ID,
  },
  transports: [
    // Console transport with lunar format
    new winston.transports.Console({
      format: winston.format.combine(
        noiseFilter(),
        winston.format.timestamp(),
        winston.format.colorize({ all: false, level: true }),
        lunarFormat
      ),
    }),
  ],
});

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

/**
 * 🚀 Log startup events (always visible)
 */
export function logStartup(message: string, meta?: Record<string, unknown>): void {
  logger.info(`🚀 ${message}`, meta);
}

/**
 * ✅ Log success events
 */
export function logSuccess(message: string, meta?: Record<string, unknown>): void {
  logger.info(`✅ ${message}`, meta);
}

/**
 * 💀 Log fatal errors (before crash)
 */
export function logFatal(message: string, error?: Error | unknown): void {
  const errorMeta = error instanceof Error 
    ? { error: error.message, stack: error.stack }
    : { error: String(error) };
  logger.error(`💀 FATAL: ${message}`, errorMeta);
}

/**
 * 🔧 Log debug info (only in development)
 */
export function logDebug(message: string, meta?: Record<string, unknown>): void {
  logger.debug(`🔧 ${message}`, meta);
}

/**
 * 🌐 Log HTTP requests
 */
export function logHttp(method: string, path: string, statusCode: number, durationMs: number): void {
  const emoji = statusCode >= 500 ? '💥' : statusCode >= 400 ? '⚠️' : '🌐';
  logger.http(`${emoji} ${method} ${path} ${statusCode} ${durationMs}ms`);
}

/**
 * 🗑️ Log noise (goes to silly level - effectively silenced)
 * Use this for things that SHOULD be logged but are too noisy.
 */
export function logNoise(message: string, meta?: Record<string, unknown>): void {
  logger.silly(`🗑️ ${message}`, meta);
}

// ============================================================================
// CHILD LOGGERS
// ============================================================================

/**
 * Create a child logger with specific context
 * Useful for modules that want their own identity
 * 
 * Usage:
 *   const swarmLogger = createChildLogger('swarm');
 *   swarmLogger.info('Node joined cluster');
 */
export function createChildLogger(module: string): winston.Logger {
  return logger.child({ module });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { logger };
export default logger;

// ============================================================================
// STARTUP MESSAGE
// ============================================================================

// Only log this once, and only in debug mode
if (LOG_LEVEL === 'debug' || LOG_LEVEL === 'silly') {
  logger.debug(`🌙 Selene Logger initialized`, {
    level: LOG_LEVEL,
    env: NODE_ENV,
    nodeId: NODE_ID,
    noisePatterns: NOISE_PATTERNS.length,
  });
}
