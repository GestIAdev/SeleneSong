// test/setup.ts
// 🧪 SETUP GLOBAL PARA TESTS DE SELENE
// 🎯 "Preparar el terreno para la batalla de la calidad"
// ⚡ Ejecutor: PunkClaude | Arquitecto: Radwulf

import { vi } from 'vitest';

/**
 * Mock de Redis para tests unitarios
 * Evita dependencia real de Redis en tests
 */
vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    exists: vi.fn().mockResolvedValue(0),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(-1),
    keys: vi.fn().mockResolvedValue([]),
    scan: vi.fn().mockResolvedValue({ cursor: '0', keys: [] }),
    hGet: vi.fn().mockResolvedValue(null),
    hSet: vi.fn().mockResolvedValue(1),
    hGetAll: vi.fn().mockResolvedValue({}),
    hDel: vi.fn().mockResolvedValue(1),
    lPush: vi.fn().mockResolvedValue(1),
    rPush: vi.fn().mockResolvedValue(1),
    lPop: vi.fn().mockResolvedValue(null),
    rPop: vi.fn().mockResolvedValue(null),
    lRange: vi.fn().mockResolvedValue([]),
    lLen: vi.fn().mockResolvedValue(0),
    sAdd: vi.fn().mockResolvedValue(1),
    sRem: vi.fn().mockResolvedValue(1),
    sMembers: vi.fn().mockResolvedValue([]),
    sIsMember: vi.fn().mockResolvedValue(false),
    zAdd: vi.fn().mockResolvedValue(1),
    zRem: vi.fn().mockResolvedValue(1),
    zRange: vi.fn().mockResolvedValue([]),
    zRangeByScore: vi.fn().mockResolvedValue([]),
    zScore: vi.fn().mockResolvedValue(null),
    publish: vi.fn().mockResolvedValue(0),
    subscribe: vi.fn().mockResolvedValue(undefined),
    unsubscribe: vi.fn().mockResolvedValue(undefined),
    pSubscribe: vi.fn().mockResolvedValue(undefined),
    pUnsubscribe: vi.fn().mockResolvedValue(undefined),
    duplicate: vi.fn(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      on: vi.fn()
    }))
  }))
}));

/**
 * Mock de SystemVitals para tests
 */
vi.mock('../src/swarm/core/SystemVitals', () => ({
  SystemVitals: {
    getInstance: vi.fn(() => ({
      getVitals: vi.fn(() => ({
        timestamp: Date.now(),
        cpu: { usage: 0.5, cores: 4, loadAvg: [0.5, 0.4, 0.3] },
        memory: { used: 500, total: 1000, percentage: 0.5 },
        network: { latency: 100, bandwidth: 1000 },
        redis: { connected: true, latency: 5 },
        process: { uptime: 1000, pid: 12345 },
        errors: { count: 0, recent: [] }
      }))
    }))
  }
}));

/**
 * Mock de Logger para tests
 */
vi.mock('../src/core/SeleneLogger', () => ({
  SeleneLogger: {
    getInstance: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    }))
  }
}));

/**
 * Variables globales para tests
 */
global.performance = global.performance || {
  now: () => Date.now()
};

/**
 * Cleanup después de cada test
 */
afterEach(() => {
  vi.clearAllMocks();
});

console.log('🧪 Selene Test Setup Loaded - Performance + Tecnología + BELLEZA');
