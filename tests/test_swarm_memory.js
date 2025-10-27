import Redis from "ioredis";
import { SeleneNuclearSwarm } from "../swarm/coordinator/SeleneNuclearSwarm.js";
async function testSwarmInitialization() {
    console.log("🧪 Probando inicialización de SeleneNuclearSwarm con orquestador de memoria...");
    const redis = new Redis();
    const swarm = new SeleneNuclearSwarm({
        id: "test",
        personality: {
            name: "Test",
            archetype: "Warrior",
            creativity: 0.8,
            resilience: 0.9,
            harmony: 0.7,
        },
        birth: new Date(),
        capabilities: {
            maxConnections: 100,
            processingPower: 0.8,
            memoryCapacity: 0.9,
            networkBandwidth: 0.7,
            specializations: ["consensus", "intelligence"],
        },
    }, {
        consensusThreshold: 0.51,
        maxNodeTimeout: 30000,
        discoveryFrequency: 5000,
    });
    console.log("✅ SeleneNuclearSwarm inicializado correctamente");
    console.log("🧠 Estado del orquestador:", swarm.memoryOrchestrator ? "INTEGRADO" : "FALLANDO");
    // Probar métodos del orquestador
    if (swarm.memoryOrchestrator) {
        const stats = swarm.memoryOrchestrator.getMemorySystemStats();
        console.log("📊 Estadísticas de memoria:", {
            bufferPools: Object.keys(stats.bufferPools).length,
            weakRefs: stats.weakRefs.totalRefs,
            cacheSize: stats.cache.size,
        });
    }
    await redis.quit();
    console.log("🎉 Test completado exitosamente");
}
testSwarmInitialization().catch(console.error);
//# sourceMappingURL=test_swarm_memory.js.map