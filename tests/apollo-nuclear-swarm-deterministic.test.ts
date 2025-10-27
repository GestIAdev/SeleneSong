/**
 * 🧬 DETERMINISTIC UNIT TESTS FOR SELENE SONG CORE SWARM
 * Pruebas unitarias deterministas para validar el comportamiento del SeleneNuclearSwarm
 * Sin mocks, sin simulaciones - solo lógica real y determinista
 */

import assert from "assert";
import Redis from "ioredis";
import { SeleneNuclearSwarm } from "../dist/swarm/coordinator/SeleneNuclearSwarm.js";

describe("SeleneNuclearSwarm Deterministic Tests", () => {
  let redis: Redis;
  let swarm: SeleneNuclearSwarm;

  beforeEach(async () => {
    // Setup Redis for testing
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    const swarmId = {
      id: "test-swarm-deterministic",
      personality: {
        name: "TestSwarm",
        traits: ["procedural", "deterministic"],
        mood: "focused",
      },
      birth: new Date("2025-01-01"),
      capabilities: ["intelligence", "immortality", "creativity"],
    };

    swarm = new SeleneNuclearSwarm(swarmId, redis);
  });

  afterEach(async () => {
    try {
      await swarm.sleep();
      redis.disconnect();
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  it("should initialize deterministically", async () => {
    await swarm.awaken();

    // Check that swarm is in expected initial state
    const state1 = await swarm.getUnifiedSwarmState();
    await swarm.sleep();
    await swarm.awaken();
    const state2 = await swarm.getUnifiedSwarmState();

    // State should be similar (deterministic initialization)
    assert.ok(state1.timestamp, "Should have timestamp");
    assert.ok(state2.timestamp, "Should have timestamp");
    assert.strictEqual(
      state1.leader?.currentLeader.id,
      state2.leader?.currentLeader.id,
      "Leader should be deterministic",
    );
  });

  it("should provide deterministic immortal state", async () => {
    await swarm.awaken();

    const immortal1 = await swarm.getImmortalSwarmState();
    const immortal2 = await swarm.getImmortalSwarmState();

    // Immortal state should be identical for same conditions
    assert.strictEqual(immortal1.genesis_active, immortal2.genesis_active);
    assert.strictEqual(
      immortal1.democracy_operational,
      immortal2.democracy_operational,
    );
    assert.strictEqual(
      immortal1.creativity_flowing,
      immortal2.creativity_flowing,
    );
  });

  it("should handle sleep/awaken cycle deterministically", async () => {
    // Initial state check
    assert.ok(!swarm.isActive, "Should start inactive");

    // Awaken
    await swarm.awaken();
    assert.ok(swarm.isActive, "Should be active after awaken");

    // Sleep
    await swarm.sleep();
    assert.ok(!swarm.isActive, "Should be inactive after sleep");
  });

  it("should maintain deterministic node count", async () => {
    await swarm.awaken();

    const count1 = swarm.nodeCount;
    const count2 = swarm.nodeCount;

    // Node count should be deterministic (cached)
    assert.strictEqual(count1, count2, "Node count should be deterministic");
    assert.ok(typeof count1 === "number", "Node count should be a number");
  });

  it("should provide consistent uptime after awaken", async () => {
    await swarm.awaken();

    const uptime1 = swarm.uptime;
    await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
    const uptime2 = swarm.uptime;

    // Uptime should increase deterministically
    assert.ok(uptime2 >= uptime1, "Uptime should increase");
    assert.ok(typeof uptime1 === "number", "Uptime should be a number");
  });
});
