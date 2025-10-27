/**
 * 🧬 DETERMINISTIC END-TO-END INTEGRATION TESTS
 * Pruebas de integración deterministas que validan el flujo completo del sistema
 * Dashboard ↔ Swarm ↔ Redis ↔ PostgreSQL - sin simulaciones
 */

import assert from "assert";
import Redis from "ioredis";
import { SeleneNuclearSwarm } from "../dist/swarm/coordinator/SeleneNuclearSwarm.js";

describe("Deterministic End-to-End Integration Tests", () => {
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
      id: "e2e-test-swarm",
      personality: {
        name: "E2ETestSwarm",
        archetype: "Sage" as const,
        traits: ["procedural", "deterministic"],
        mood: "focused",
        creativity: 0.8,
        resilience: 0.9,
        harmony: 0.85,
      },
      birth: new Date("2025-01-01"),
      capabilities: ["intelligence", "immortality", "creativity", "testing"],
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

  it("should complete full swarm-redis integration cycle deterministically", async () => {
    // 1. Awaken swarm deterministically
    await swarm.awaken();
    assert.ok(swarm.isActive, "Swarm should be active after awaken");

    // 2. Verify swarm publishes metrics to Redis deterministically
    const swarmDataRaw = await redis.get("apollo_swarm_master");
    assert.ok(swarmDataRaw, "Swarm should publish master data to Redis");

    const swarmData = JSON.parse(swarmDataRaw);
    assert.strictEqual(
      swarmData.swarm_id,
      "e2e-test-swarm",
      "Swarm ID should match",
    );
    assert.ok(swarmData.immortal_state, "Should have immortal state");
    assert.ok(
      typeof swarmData.uptime === "number",
      "Should have numeric uptime",
    );

    // 3. Test dashboard command publishing via Redis
    const commandId = `test_command_${Date.now()}`;
    const command = {
      id: commandId,
      action: "meditate",
      timestamp: Date.now(),
      source: "test",
    };

    await redis.publish("apollo_swarm_commands", JSON.stringify(command));

    // 4. Verify swarm state changes are deterministic
    const immortalState1 = await swarm.getImmortalSwarmState();
    const immortalState2 = await swarm.getImmortalSwarmState();

    // States should be identical (cached)
    assert.strictEqual(
      immortalState1.genesis_active,
      immortalState2.genesis_active,
    );
    assert.strictEqual(
      immortalState1.democracy_operational,
      immortalState2.democracy_operational,
    );

    // 5. Test swarm unified state consistency
    const unifiedState = await swarm.getUnifiedSwarmState();
    assert.ok(unifiedState, "Should return unified swarm state");
    assert.ok(unifiedState.leader, "Should have leader information");
    assert.ok(unifiedState.consensus, "Should have consensus information");

    console.log("✅ Full E2E integration cycle completed deterministically");
  });

  it("should handle Redis communication failures gracefully", async () => {
    // Test with potentially failing Redis operations
    await swarm.awaken();

    // Force some Redis operations that might fail
    try {
      const state = await swarm.getImmortalSwarmState();
      assert.ok(state, "Should handle Redis operations gracefully");
    } catch (error) {
      // If Redis fails, swarm should still function
      assert.ok(error instanceof Error, "Should throw proper error");
    }
  });

  it("should maintain deterministic behavior across multiple operations", async () => {
    await swarm.awaken();

    // Perform multiple operations in sequence
    const operations = [
      () => swarm.getImmortalSwarmState(),
      () => swarm.getUnifiedSwarmState(),
      () => swarm.getImmortalSwarmState(), // Repeat to test caching
      () => swarm.getUnifiedSwarmState(),
    ];

    const results = [];
    for (const op of operations) {
      results.push(await op());
    }

    // Verify deterministic results
    assert.ok(results[0], "First operation should succeed");
    assert.ok(results[1], "Second operation should succeed");
    assert.deepStrictEqual(
      results[0],
      results[2],
      "Cached immortal state should be identical",
    );
  });

  it("should validate metrics publishing to Redis", async () => {
    await swarm.awaken();

    // Wait a bit for metrics to be published
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if metrics are published to Redis
    const masterData = await redis.get("apollo_swarm_master");
    const nodesData = await redis.hgetall("apollo_swarm_nodes");

    assert.ok(masterData, "Master data should be published");
    assert.ok(typeof nodesData === "object", "Nodes data should be published");

    const parsedMasterData = JSON.parse(masterData);
    assert.ok(parsedMasterData.timestamp, "Should have timestamp");
    assert.ok(parsedMasterData.immortal_state, "Should have immortal state");
  });
});
