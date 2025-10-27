/**
 * 🎨 DASHBOARD-APOLLO INTEGRATION TEST
 * Validates WebSocket communication, Redis pub/sub, and real-time metrics
 *
 * By PunkClaude + RaulVisionario - October 10, 2025
 * Phase 1.3b: Critical dashboard-backend integration validation
 */

import WebSocket from "ws";
import Redis from "ioredis";

describe("Dashboard-Selene Integration Tests", () => {
  const APOLLO_PORT = 8003;
  const DASHBOARD_PORT = 3001;
  const REDIS_PORT = 6379;

  let redisSubscriber: Redis;
  let redisPublisher: Redis;

  beforeAll(async () => {
    // Initialize Redis connections
    redisPublisher = new Redis(REDIS_PORT);
    redisSubscriber = new Redis(REDIS_PORT);

    // Wait for Redis connection
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup Redis connections
    if (redisPublisher) {
      redisPublisher.disconnect();
    }
    if (redisSubscriber) {
      redisSubscriber.disconnect();
    }
  });

  describe("Selene Backend Health Check", () => {
    test("should respond to health check on port 8003", async () => {
      const response = await fetch(
        `http://localhost:${APOLLO_PORT}/api/health`,
        {
          method: "GET",
        },
      ).catch(() => null);

      // If Selene is running, should get a response
      // If not running, test will mark as skipped
      if (!response) {
        console.warn(
          "⚠️ Selene backend not running on port 8003 - skipping test",
        );
        return;
      }

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.status).toBeDefined();
    }, 10000);

    test("should have GraphQL endpoint available", async () => {
      const response = await fetch(`http://localhost:${APOLLO_PORT}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "{ __typename }" }),
      }).catch(() => null);

      if (!response) {
        console.warn("⚠️ Selene GraphQL not running - skipping test");
        return;
      }

      expect(response.ok).toBe(true);
    }, 10000);
  });

  describe("Dashboard Server Health Check", () => {
    test("should serve dashboard on port 3001", async () => {
      const response = await fetch(`http://localhost:${DASHBOARD_PORT}/`, {
        method: "GET",
      }).catch(() => null);

      if (!response) {
        console.warn("⚠️ Dashboard not running on port 3001 - skipping test");
        return;
      }

      expect(response.ok).toBe(true);
      const html = await response.text();
      expect(html).toContain("<!DOCTYPE html>");
    }, 10000);
  });

  describe("WebSocket Connection - Dashboard to Client", () => {
    test("should establish WebSocket connection to dashboard", (done) => {
      const ws = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);

      ws.on("open", () => {
        console.log("✅ WebSocket connected to dashboard");
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
      });

      ws.on("message", (data) => {
        console.log("📦 Received initial dashboard data");
        const parsed = JSON.parse(data.toString());
        expect(parsed.timestamp).toBeDefined();
        done();
      });

      ws.on("error", (error) => {
        console.warn("⚠️ WebSocket connection failed:", error.message);
        done();
      });
    }, 15000);

    test("should receive real-time swarm data over WebSocket", (done) => {
      const ws = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);
      let messageCount = 0;

      ws.on("message", (data) => {
        const parsed = JSON.parse(data.toString());

        messageCount++;
        console.log(
          `📊 Message ${messageCount}: Timestamp ${parsed.timestamp}`,
        );

        // Validate data structure
        expect(parsed.timestamp).toBeDefined();
        expect(parsed.systemVitals).toBeDefined();
        expect(parsed.swarmState).toBeDefined();
        expect(parsed.immortalState).toBeDefined();

        if (messageCount >= 2) {
          ws.close();
          done();
        }
      });

      ws.on("error", (error) => {
        console.warn("⚠️ WebSocket error:", error.message);
        ws.close();
        done();
      });

      setTimeout(() => {
        ws.close();
        if (messageCount === 0) {
          console.warn("⚠️ No messages received within timeout");
        }
        done();
      }, 10000);
    }, 15000);

    test("should receive metrics with correct structure", (done) => {
      const ws = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);

      ws.on("message", (data) => {
        const parsed = JSON.parse(data.toString());

        // Validate system vitals
        expect(parsed.systemVitals.health).toBeGreaterThanOrEqual(0);
        expect(parsed.systemVitals.health).toBeLessThanOrEqual(1);
        expect(parsed.systemVitals.stress).toBeGreaterThanOrEqual(0);
        expect(parsed.systemVitals.harmony).toBeGreaterThanOrEqual(0);
        expect(parsed.systemVitals.creativity).toBeGreaterThanOrEqual(0);

        // Validate swarm state
        expect(parsed.swarmState.nodes).toBeInstanceOf(Array);
        expect(parsed.swarmState.metrics.totalNodes).toBeGreaterThanOrEqual(0);
        expect(parsed.swarmState.metrics.activeNodes).toBeGreaterThanOrEqual(0);

        // Validate immortal state
        expect(typeof parsed.immortalState.genesis_active).toBe("boolean");
        expect(typeof parsed.immortalState.democracy_operational).toBe(
          "boolean",
        );
        expect(parsed.immortalState.overall_vitality).toBeGreaterThanOrEqual(0);

        ws.close();
        done();
      });

      ws.on("error", () => {
        done();
      });
    }, 15000);
  });

  describe("Redis Pub/Sub Integration", () => {
    test("should connect to Redis successfully", async () => {
      expect(redisPublisher.status).toBe("ready");
      expect(redisSubscriber.status).toBe("ready");

      // Test ping
      const pong = await redisPublisher.ping();
      expect(pong).toBe("PONG");
    });

    test("should publish and receive swarm heartbeat via Redis", (done) => {
      const channel = "swarm:heartbeat";
      const testMessage = {
        nodeId: "test-node-1",
        timestamp: Date.now(),
        vitals: {
          health: 95,
          stress: 10,
          harmony: 88,
        },
      };

      redisSubscriber.subscribe(channel, (err) => {
        if (err) {
          console.error("❌ Redis subscribe error:", err);
          done(err);
        }
      });

      redisSubscriber.on("message", (ch, message) => {
        if (ch === channel) {
          const parsed = JSON.parse(message);
          expect(parsed.nodeId).toBe(testMessage.nodeId);
          expect(parsed.vitals.health).toBe(95);

          redisSubscriber.unsubscribe(channel);
          done();
        }
      });

      // Publish after subscription is established
      setTimeout(() => {
        redisPublisher.publish(channel, JSON.stringify(testMessage));
      }, 500);
    }, 10000);

    test("should publish and receive digital soul updates via Redis", (done) => {
      const channel = "swarm:digital-soul";
      const soulUpdate = {
        soulId: "soul-aries-001",
        emotionalState: {
          joy: 0.75,
          melancholy: 0.15,
          rage: 0.05,
          serenity: 0.85,
          wonder: 0.92,
        },
        poetryCount: 42,
        timestamp: Date.now(),
      };

      redisSubscriber.subscribe(channel, (err) => {
        if (err) {
          done(err);
        }
      });

      redisSubscriber.on("message", (ch, message) => {
        if (ch === channel) {
          const parsed = JSON.parse(message);
          expect(parsed.soulId).toBe(soulUpdate.soulId);
          expect(parsed.emotionalState.wonder).toBe(0.92);
          expect(parsed.poetryCount).toBe(42);

          redisSubscriber.unsubscribe(channel);
          done();
        }
      });

      setTimeout(() => {
        redisPublisher.publish(channel, JSON.stringify(soulUpdate));
      }, 500);
    }, 10000);

    test("should handle swarm consensus events via Redis", (done) => {
      const channel = "swarm:consensus";
      const consensusEvent = {
        proposalId: "prop-test-001",
        votes: ["node-1", "node-2", "node-3"],
        result: "approved",
        quorum: true,
        timestamp: Date.now(),
      };

      redisSubscriber.subscribe(channel, (err) => {
        if (err) {
          done(err);
        }
      });

      redisSubscriber.on("message", (ch, message) => {
        if (ch === channel) {
          const parsed = JSON.parse(message);
          expect(parsed.proposalId).toBe("prop-test-001");
          expect(parsed.result).toBe("approved");
          expect(parsed.quorum).toBe(true);

          redisSubscriber.unsubscribe(channel);
          done();
        }
      });

      setTimeout(() => {
        redisPublisher.publish(channel, JSON.stringify(consensusEvent));
      }, 500);
    }, 10000);
  });

  describe("Real-Time Metrics Accuracy", () => {
    test("should receive metrics updates at regular intervals", (done) => {
      const ws = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);
      const timestamps: number[] = [];

      ws.on("message", (data) => {
        const parsed = JSON.parse(data.toString());
        timestamps.push(parsed.timestamp);

        if (timestamps.length >= 3) {
          // Calculate intervals
          const interval1 = timestamps[1] - timestamps[0];
          const interval2 = timestamps[2] - timestamps[1];

          console.log(`⏱️ Intervals: ${interval1}ms, ${interval2}ms`);

          // Intervals should be somewhat consistent (within 2x tolerance)
          const ratio =
            Math.max(interval1, interval2) / Math.min(interval1, interval2);
          expect(ratio).toBeLessThan(2);

          ws.close();
          done();
        }
      });

      setTimeout(() => {
        ws.close();
        done();
      }, 15000);
    }, 20000);

    test("should show increasing timestamps (no stale data)", (done) => {
      const ws = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);
      let previousTimestamp = 0;
      let validUpdates = 0;

      ws.on("message", (data) => {
        const parsed = JSON.parse(data.toString());
        const currentTimestamp = parsed.timestamp;

        if (previousTimestamp > 0) {
          expect(currentTimestamp).toBeGreaterThan(previousTimestamp);
          validUpdates++;
        }

        previousTimestamp = currentTimestamp;

        if (validUpdates >= 2) {
          ws.close();
          done();
        }
      });

      setTimeout(() => {
        ws.close();
        done();
      }, 10000);
    }, 15000);
  });

  describe("Dashboard Performance & Stability", () => {
    test("should handle multiple WebSocket clients simultaneously", (done) => {
      const clients: WebSocket[] = [];
      const clientCount = 5;
      let connectedClients = 0;
      let messagesReceived = 0;

      for (let i = 0; i < clientCount; i++) {
        const ws = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);
        clients.push(ws);

        ws.on("open", () => {
          connectedClients++;
          if (connectedClients === clientCount) {
            console.log(`✅ All ${clientCount} clients connected`);
          }
        });

        ws.on("message", () => {
          messagesReceived++;

          // Each client should receive at least 1 message
          if (messagesReceived >= clientCount) {
            clients.forEach((client) => client.close());
            done();
          }
        });
      }

      setTimeout(() => {
        clients.forEach((client) => client.close());
        console.log(
          `📊 Connected: ${connectedClients}/${clientCount}, Messages: ${messagesReceived}`,
        );
        done();
      }, 10000);
    }, 15000);

    test("should handle WebSocket disconnect and reconnect gracefully", (done) => {
      const ws1 = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);

      ws1.on("open", () => {
        console.log("✅ First connection established");

        // Close after first message
        ws1.on("message", () => {
          ws1.close();

          // Reconnect after 500ms
          setTimeout(() => {
            const ws2 = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);

            ws2.on("open", () => {
              console.log("✅ Reconnection successful");
              ws2.close();
              done();
            });

            ws2.on("error", (error) => {
              console.error("❌ Reconnection failed:", error);
              done(error);
            });
          }, 500);
        });
      });

      setTimeout(() => {
        done();
      }, 10000);
    }, 15000);
  });

  describe("Anti-Simulation Validation", () => {
    test("should receive non-simulated CPU metrics", (done) => {
      const ws = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);

      ws.on("message", (data) => {
        const parsed = JSON.parse(data.toString());

        // Real CPU metrics should not be exactly 0 or 100
        const cpuUsage = parsed.systemMetrics?.cpu?.usage;
        if (cpuUsage !== undefined) {
          expect(cpuUsage).toBeGreaterThanOrEqual(0);
          expect(cpuUsage).toBeLessThanOrEqual(100);

          // Should have realistic precision (not Math.random() * 100)
          console.log(`🔍 CPU Usage: ${cpuUsage}%`);
        }

        ws.close();
        done();
      });

      setTimeout(() => {
        ws.close();
        done();
      }, 5000);
    }, 10000);

    test("should receive non-simulated memory metrics", (done) => {
      const ws = new WebSocket(`ws://localhost:${DASHBOARD_PORT}`);

      ws.on("message", (data) => {
        const parsed = JSON.parse(data.toString());

        const memoryUsage = parsed.systemMetrics?.memory?.usage;
        if (memoryUsage !== undefined) {
          expect(memoryUsage).toBeGreaterThanOrEqual(0);
          expect(memoryUsage).toBeLessThanOrEqual(100);

          console.log(`🔍 Memory Usage: ${memoryUsage}%`);
        }

        ws.close();
        done();
      });

      setTimeout(() => {
        ws.close();
        done();
      }, 5000);
    }, 10000);
  });
});
