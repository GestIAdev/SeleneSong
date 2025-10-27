/**
 * 🧬 DETERMINISTIC UNIT TESTS FOR HARMONIC CONSENSUS ENGINE
 * Pruebas unitarias deterministas para validar el comportamiento del HarmonicConsensusEngine
 * Sin mocks, sin simulaciones - solo lógica real y determinista
 */
import assert from "assert";
import { HarmonicConsensusEngine } from "../dist/swarm/coordinator/HarmonicConsensusEngine.js";
import { SystemVitals } from "../dist/swarm/core/SystemVitals.js";
import { RealVeritasInterface } from "../dist/swarm/veritas/VeritasInterface.js";
describe("HarmonicConsensusEngine Deterministic Tests", () => {
    let engine;
    let vitals;
    let veritas;
    beforeEach(() => {
        vitals = SystemVitals.getInstance();
        veritas = new RealVeritasInterface();
        engine = new HarmonicConsensusEngine("test-coordinator", vitals, veritas);
    });
    it("should deterministically select leader with same input", async () => {
        // Setup deterministic nodes
        const nodes = ["node-1", "node-2", "node-3"];
        engine.updateKnownNodes(nodes);
        // Run consensus multiple times with same state
        const result1 = await engine.determineLeader();
        const result2 = await engine.determineLeader();
        // Results should be identical (deterministic)
        assert.strictEqual(result1.leader_node_id, result2.leader_node_id);
        assert.strictEqual(result1.consensus_achieved, result2.consensus_achieved);
        assert.strictEqual(result1.dominant_note, result2.dominant_note);
    });
    it("should achieve consensus with valid nodes", async () => {
        const nodes = ["node-alpha", "node-beta", "node-gamma"];
        engine.updateKnownNodes(nodes);
        const result = await engine.determineLeader();
        assert.ok(result.consensus_achieved, "Consensus should be achieved");
        assert.ok(nodes.includes(result.leader_node_id), "Leader should be from known nodes");
        assert.ok(result.dominant_note, "Should have a dominant note");
    });
    it("should handle single node scenario deterministically", async () => {
        const nodes = ["single-node"];
        engine.updateKnownNodes(nodes);
        const result = await engine.determineLeader();
        assert.ok(result.consensus_achieved, "Consensus should be achieved with single node");
        assert.strictEqual(result.leader_node_id, "single-node", "Single node should be leader");
    });
    it("should reject consensus with no nodes", async () => {
        engine.updateKnownNodes([]);
        const result = await engine.determineLeader();
        assert.ok(!result.consensus_achieved, "Consensus should not be achieved without nodes");
        assert.strictEqual(result.leader_node_id, "no-leader", "Should return no-leader");
    });
    it("should maintain deterministic behavior across multiple runs", async () => {
        const nodes = ["node-a", "node-b", "node-c", "node-d"];
        engine.updateKnownNodes(nodes);
        const results = [];
        for (let i = 0; i < 5; i++) {
            results.push(await engine.determineLeader());
        }
        // All results should be identical
        for (let i = 1; i < results.length; i++) {
            assert.strictEqual(results[0].leader_node_id, results[i].leader_node_id);
            assert.strictEqual(results[0].dominant_note, results[i].dominant_note);
        }
    });
    it("should integrate with RealVeritasInterface for verification", async () => {
        const nodes = ["verified-node-1", "verified-node-2"];
        engine.updateKnownNodes(nodes);
        const result = await engine.determineLeader();
        assert.ok(result.consensus_achieved, "Should achieve consensus with verified nodes");
        // Veritas integration is tested implicitly through consensus achievement
    });
});
//# sourceMappingURL=harmonic-consensus-deterministic.test.js.map