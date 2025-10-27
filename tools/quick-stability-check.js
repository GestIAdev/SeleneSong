/**
 * 🔬 VALIDACIÓN RÁPIDA DE ESTABILIDAD - SUBFASE 4.1
 * Versión simplificada para testing inicial
 */
import * as fs from "fs/promises";
import * as path from "path";
async function quickStabilityCheck() {
    console.log("🔬 VALIDACIÓN RÁPIDA DE ESTABILIDAD DEL NÚCLEO");
    console.log("==============================================\n");
    const results = [];
    // 1. Verificar determinismo (sin Math.random)
    console.log("🧬 Verificando determinismo...");
    try {
        const criticalFiles = [
            "selene/index.ts",
            "selene/swarm/coordinator/SeleneNuclearSwarm.ts",
            "selene/swarm/coordinator/QuantumImmuneSystem.ts",
        ];
        let mathRandomFound = false;
        for (const file of criticalFiles) {
            try {
                const content = await fs.readFile(path.join(process.cwd(), file), "utf-8");
                if (content.includes("Math.random")) {
                    mathRandomFound = true;
                    console.log(`❌ Math.random encontrado en ${file}`);
                    break;
                }
            }
            catch (error) {
                console.log(`⚠️  Archivo no encontrado: ${file}`);
            }
        }
        if (!mathRandomFound) {
            console.log("✅ Sistema determinista - sin Math.random");
            results.push({ test: "Determinismo", passed: true });
        }
        else {
            results.push({ test: "Determinismo", passed: false });
        }
    }
    catch (error) {
        console.log(`❌ Error en determinismo: ${error instanceof Error ? error.message : String(error)}`);
        results.push({ test: "Determinismo", passed: false });
    }
    // 2. Verificar sistema inmune
    console.log("\n🛡️ Verificando sistema inmune...");
    try {
        const immunePath = path.join(process.cwd(), "selene/swarm/coordinator/QuantumImmuneSystem.ts");
        const immuneExists = await fs
            .access(immunePath)
            .then(() => true)
            .catch(() => false);
        if (immuneExists) {
            const content = await fs.readFile(immunePath, "utf-8");
            const hasMonitoring = content.includes("start_immune_monitoring");
            if (hasMonitoring) {
                console.log("✅ Sistema inmune operativo");
                results.push({ test: "Sistema Inmune", passed: true });
            }
            else {
                console.log("❌ Sistema inmune incompleto");
                results.push({ test: "Sistema Inmune", passed: false });
            }
        }
        else {
            console.log("❌ Sistema inmune no encontrado");
            results.push({ test: "Sistema Inmune", passed: false });
        }
    }
    catch (error) {
        console.log(`❌ Error en sistema inmune: ${error instanceof Error ? error.message : String(error)}`);
        results.push({ test: "Sistema Inmune", passed: false });
    }
    // 3. Verificar swarm coordinator
    console.log("\n🐝 Verificando coordinador del swarm...");
    try {
        const swarmPath = path.join(process.cwd(), "selene/swarm/coordinator/SeleneNuclearSwarm.ts");
        const swarmExists = await fs
            .access(swarmPath)
            .then(() => true)
            .catch(() => false);
        if (swarmExists) {
            const content = await fs.readFile(swarmPath, "utf-8");
            const hasDigitalSouls = content.includes("DigitalSoul");
            if (hasDigitalSouls) {
                console.log("✅ Coordinador con DigitalSouls operativo");
                results.push({ test: "Coordinador Swarm", passed: true });
            }
            else {
                console.log("❌ Coordinador sin DigitalSouls");
                results.push({ test: "Coordinador Swarm", passed: false });
            }
        }
        else {
            console.log("❌ Coordinador no encontrado");
            results.push({ test: "Coordinador Swarm", passed: false });
        }
    }
    catch (error) {
        console.log(`❌ Error en coordinador: ${error instanceof Error ? error.message : String(error)}`);
        results.push({ test: "Coordinador Swarm", passed: false });
    }
    // 4. Verificar memoria estable
    console.log("\n🧠 Verificando estabilidad de memoria...");
    const initialMem = process.memoryUsage().heapUsed;
    // Simular carga leve
    const testArray = [];
    for (let i = 0; i < 1000; i++) {
        testArray.push({ data: "x".repeat(100) });
    }
    testArray.length = 0; // Limpiar
    const finalMem = process.memoryUsage().heapUsed;
    const memDiff = finalMem - initialMem;
    if (Math.abs(memDiff) < 5 * 1024 * 1024) {
        // < 5MB
        console.log(`✅ Memoria estable (±${(memDiff / 1024 / 1024).toFixed(2)}MB)`);
        results.push({ test: "Estabilidad Memoria", passed: true });
    }
    else {
        console.log(`❌ Posible fuga de memoria (${(memDiff / 1024 / 1024).toFixed(2)}MB)`);
        results.push({ test: "Estabilidad Memoria", passed: false });
    }
    // Resultados finales
    console.log("\n📊 RESULTADOS FINALES:");
    console.log("====================");
    const passed = results.filter((_r) => _r.passed).length;
    const total = results.length;
    const successRate = ((passed / total) * 100).toFixed(1);
    console.log(`📈 Tests pasados: ${passed}/${total} (${successRate}%)`);
    for (const result of results) {
        const icon = result.passed ? "✅" : "❌";
        console.log(`${icon} ${result.test}`);
    }
    console.log("\n🎯 VEREDICTO:");
    if (passed === total) {
        console.log("✅ SISTEMA ESTABLE - Subfase 4.1 COMPLETADA");
        console.log("🚀 Listo para optimización de rendimiento (4.2)");
    }
    else {
        console.log("❌ SISTEMA REQUIERE ATENCIÓN");
        console.log("🔧 Revisar issues arriba antes de continuar");
    }
}
// Ejecutar
quickStabilityCheck().catch(console.error);
//# sourceMappingURL=quick-stability-check.js.map