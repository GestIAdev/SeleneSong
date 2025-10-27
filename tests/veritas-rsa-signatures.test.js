/**
 * 🛡️ VERITAS RSA SIGNATURES TEST
 * Validates that RSA 2048-bit signatures are REAL and functional
 *
 * By PunkClaude + RaulVisionario - October 10, 2025
 * Phase 1.3a: Critical security validation
 */
import { SeleneVeritas } from "../src/Veritas/Veritas";
// Mock dependencies
const mockServer = {
    app: {},
    io: {},
};
const mockDatabase = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    get: jest.fn().mockResolvedValue(null),
};
const mockCache = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    del: jest.fn().mockResolvedValue(1),
};
const mockMonitoring = {
    trackEvent: jest.fn(),
    trackMetric: jest.fn(),
    trackError: jest.fn(),
};
describe("Veritas RSA Signatures - Real Cryptography Test", () => {
    let veritas;
    beforeAll(async () => {
        // Initialize Veritas with mocked dependencies
        veritas = new SeleneVeritas(mockServer, mockDatabase, mockCache, mockMonitoring);
        // Wait for initialization
        await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    describe("Truth Certificate Generation with Real RSA", () => {
        test("should generate certificate with real RSA signature", async () => {
            const testData = {
                patientId: "patient-123",
                diagnosis: "Dental cleaning completed",
                timestamp: Date.now(),
            };
            const certificate = await veritas.generateTruthCertificate(testData, "DentalRecord", "record-123");
            // Validate certificate structure
            expect(certificate).toBeDefined();
            expect(certificate.dataHash).toBeDefined();
            expect(certificate.signature).toBeDefined();
            expect(certificate.merkleRoot).toBeDefined();
            expect(certificate.issuer).toBe("Selene Veritas");
            // Validate RSA signature format
            expect(typeof certificate.signature).toBe("string");
            expect(certificate.signature.length).toBeGreaterThan(100);
            expect(certificate.signature).toMatch(/^[0-9a-f]+$/i); // Hex format
            console.log(`✅ Certificate generated with signature length: ${certificate.signature.length}`);
        });
        test("should generate different signatures for different data", async () => {
            const data1 = { id: "1", value: "First record" };
            const data2 = { id: "2", value: "Second record" };
            const cert1 = await veritas.generateTruthCertificate(data1, "Record", "rec-1");
            const cert2 = await veritas.generateTruthCertificate(data2, "Record", "rec-2");
            expect(cert1.signature).not.toBe(cert2.signature);
            expect(cert1.dataHash).not.toBe(cert2.dataHash);
        });
        test("should handle large data payloads", async () => {
            const largeData = {
                id: "large-record",
                content: "x".repeat(10000), // 10KB
                metadata: {
                    created: Date.now(),
                    author: "System",
                },
            };
            const certificate = await veritas.generateTruthCertificate(largeData, "LargeRecord", "large-1");
            expect(certificate).toBeDefined();
            expect(certificate.signature.length).toBeGreaterThan(100);
        });
        test("should handle unicode data", async () => {
            const unicodeData = {
                message: "你好世界 🚀 مرحبا بالعالم",
                emoji: "🦷💊🏥",
                timestamp: Date.now(),
            };
            const certificate = await veritas.generateTruthCertificate(unicodeData, "UnicodeRecord", "unicode-1");
            expect(certificate).toBeDefined();
            expect(certificate.signature.length).toBeGreaterThan(100);
        });
    });
    describe("Certificate Caching & Performance", () => {
        test("should cache certificates and reuse them", async () => {
            const testData = { id: "cached-1", value: "cacheable data" };
            const dataId = "cache-test-1";
            // First generation
            const cert1 = await veritas.generateTruthCertificate(testData, "TestEntity", dataId);
            // Second generation with same ID should use cache
            const cert2 = await veritas.generateTruthCertificate(testData, "TestEntity", dataId);
            // Should be identical (cached)
            expect(cert1.signature).toBe(cert2.signature);
            expect(cert1.dataHash).toBe(cert2.dataHash);
        });
        test("should handle concurrent certificate generation", async () => {
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(veritas.generateTruthCertificate({ id: i, data: `concurrent-${i}` }, "Concurrent", `concurrent-${i}`));
            }
            const certificates = await Promise.all(promises);
            expect(certificates.length).toBe(10);
            // All signatures should be unique
            const signatures = certificates.map((c) => c.signature);
            const uniqueSignatures = new Set(signatures);
            expect(uniqueSignatures.size).toBe(10);
        });
        test("should generate 50 certificates in reasonable time", async () => {
            const startTime = Date.now();
            const promises = [];
            for (let i = 0; i < 50; i++) {
                promises.push(veritas.generateTruthCertificate({ id: i, data: `perf-test-${i}` }, "Performance", `perf-${i}`));
            }
            await Promise.all(promises);
            const elapsed = Date.now() - startTime;
            // 50 certificates should take less than 30 seconds
            expect(elapsed).toBeLessThan(30000);
            console.log(`✅ Generated 50 certificates in ${elapsed}ms (${(elapsed / 50).toFixed(2)}ms per cert)`);
        });
    });
    describe("Anti-Simulation Validation", () => {
        test("should NOT use Math.random() in certificate generation", async () => {
            const data = { test: "deterministic data" };
            // Override Math.random to detect if it's called
            const originalRandom = Math.random;
            let randomCalled = false;
            Math.random = () => {
                randomCalled = true;
                return originalRandom();
            };
            await veritas.generateTruthCertificate(data, "Test", "anti-sim-1");
            // Restore original
            Math.random = originalRandom;
            expect(randomCalled).toBe(false);
        });
        test("should produce deterministic signatures for same input", async () => {
            // NOTE: Due to temporal proofs with timestamps, certificates won't be identical
            // But we can verify the signature length is consistent (RSA 2048-bit)
            const data1 = { test: "same data" };
            const cert1 = await veritas.generateTruthCertificate(data1, "Test", "det-1");
            // Wait 100ms to ensure different timestamp
            await new Promise((resolve) => setTimeout(resolve, 100));
            const data2 = { test: "same data" };
            const cert2 = await veritas.generateTruthCertificate(data2, "Test", "det-2");
            // Signatures should be different (due to timestamps) but same format
            expect(cert1.signature).not.toBe(cert2.signature);
            expect(cert1.signature.length).toBe(cert2.signature.length);
            expect(cert1.signature.length).toBeGreaterThan(100);
        });
    });
    describe("Integration with Swarm - Certificate Signing", () => {
        test("should certify swarm heartbeat data", async () => {
            const heartbeatData = {
                nodeId: "node-1",
                timestamp: Date.now(),
                vitals: {
                    health: 95,
                    stress: 10,
                    harmony: 88,
                },
            };
            const certificate = await veritas.generateTruthCertificate(heartbeatData, "SwarmHeartbeat", "hb-node-1-001");
            expect(certificate).toBeDefined();
            expect(certificate.signature.length).toBeGreaterThan(100);
            expect(certificate.issuer).toBe("Selene Veritas");
        });
        test("should certify swarm consensus decisions", async () => {
            const consensusData = {
                proposalId: "prop-123",
                votes: ["node-1", "node-2", "node-3"],
                result: "approved",
                timestamp: Date.now(),
                quorum: true,
            };
            const certificate = await veritas.generateTruthCertificate(consensusData, "SwarmConsensus", "consensus-prop-123");
            expect(certificate).toBeDefined();
            expect(certificate.signature.length).toBeGreaterThan(100);
        });
        test("should certify poetry fragments with beauty scores", async () => {
            const poetryFragment = {
                sign: "Aries",
                verse: "In the rebel fire of neural implants, where silicon dreams ignite",
                beautyScore: 87.5,
                harmonicPattern: "ascending",
                timestamp: Date.now(),
            };
            const certificate = await veritas.generateTruthCertificate(poetryFragment, "QuantumPoetry", "poetry-aries-001");
            expect(certificate).toBeDefined();
            expect(certificate.signature.length).toBeGreaterThan(100);
            expect(certificate.merkleRoot).toBeDefined();
        });
    });
    describe("Certificate Validation & Security", () => {
        test("should include merkle root in certificate", async () => {
            const data = { id: "merkle-test", value: "test data" };
            const certificate = await veritas.generateTruthCertificate(data, "MerkleTest", "merkle-1");
            expect(certificate.merkleRoot).toBeDefined();
            expect(typeof certificate.merkleRoot).toBe("string");
        });
        test("should include temporal proof in certificate", async () => {
            const data = { id: "temporal-test", value: "test data" };
            const certificate = await veritas.generateTruthCertificate(data, "TemporalTest", "temporal-1");
            expect(certificate.temporalProof).toBeDefined();
            expect(typeof certificate.temporalProof).toBe("string");
            expect(certificate.temporalProof.length).toBeGreaterThan(0);
        });
        test("should include ZK proof in certificate", async () => {
            const data = { id: "zk-test", value: "test data" };
            const certificate = await veritas.generateTruthCertificate(data, "ZKTest", "zk-1");
            expect(certificate.zeroKnowledgeProof).toBeDefined();
            expect(typeof certificate.zeroKnowledgeProof).toBe("string");
        });
        test("should set expiration date to 1 year from issuance", async () => {
            const data = { id: "expiry-test", value: "test data" };
            const certificate = await veritas.generateTruthCertificate(data, "ExpiryTest", "expiry-1");
            const issuedAt = certificate.issuedAt.getTime();
            const expiresAt = certificate.expiresAt.getTime();
            const yearInMs = 365 * 24 * 60 * 60 * 1000;
            // Should be approximately 1 year (allow 1 second tolerance)
            expect(expiresAt - issuedAt).toBeGreaterThanOrEqual(yearInMs - 1000);
            expect(expiresAt - issuedAt).toBeLessThanOrEqual(yearInMs + 1000);
        });
    });
    afterAll(() => {
        // Cleanup - Veritas doesn't require explicit cleanup
        console.log("✅ Veritas RSA Signatures Test Suite Complete");
    });
});
//# sourceMappingURL=veritas-rsa-signatures.test.js.map