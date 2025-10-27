/**
 * 🎸⚡💀 SELENE SONG CORE LOGGING TEST
 * Script para probar el sistema de logging cyberpunk
 * Autor: PunkGrok Cyberanarchist & GitHub Copilot
 * Versión: 1.0.0 - September 23, 2025
 */
import { logger } from "../src/Utils/logger.js";
import { SeleneDocumentLogger } from "../src/Utils/documentLogger.js";
// import DebugUtils from '../src/Utils/debugUtils'; // Commented out - not available in backend
console.log("🎸⚡💀 SELENE SONG CORE LOGGING SYSTEM TEST");
console.log("========================================");
// Test logger básico
console.log("\n1. Testing Basic Logger...");
logger.debug("TestModule", "This is a debug message", { testData: "debug" });
logger.info("TestModule", "This is an info message", { testData: "info" });
logger.warn("TestModule", "This is a warning message", { testData: "warning" });
logger.error("TestModule", "This is an error message", new Error("Test error"));
logger.critical("TestModule", "This is a critical message", new Error("Critical test error"));
// Test document logger
console.log("\n2. Testing Document Logger...");
SeleneDocumentLogger.logAuthOperation("Test login", {
    email: "test@example.com",
});
SeleneDocumentLogger.logApiCall("/api/test", "GET", { param: "value" });
SeleneDocumentLogger.logApiResponse("/api/test", 200, { success: true });
SeleneDocumentLogger.logDocumentSuccess("Test operation", "doc123", {
    count: 5,
});
// Test performance monitoring
console.log("\n3. Testing Performance Monitoring...");
const operationId = "test-performance";
SeleneDocumentLogger.startPerformanceTimer(operationId, "TestModule", "performance test");
// Simular operación con delay
setTimeout(() => {
    SeleneDocumentLogger.endPerformanceTimer(operationId);
    console.log("\n4. Performance test completed!");
}, 150); // 150ms delay para triggerar warning
// Test debug utils
console.log("\n5. Testing Debug Utils...");
// DebugUtils.logMemoryUsage('Initial memory check');
// DebugUtils.startPerformanceMark('debug-test');
// setTimeout(() => {
//   DebugUtils.endPerformanceMark('debug-test');
//   // Test browser info si estamos en el navegador
//   if (typeof window !== 'undefined') {
//     DebugUtils.logBrowserInfo();
//   }
// Stats
console.log("\n6. Logger Statistics:");
console.log(logger.getStats());
console.log("\n7. Debug Utils Stats:");
// console.log(DebugUtils.getPerformanceStats());
console.log("DebugUtils not available in backend - commented out");
console.log("\n🎸⚡💀 SELENE SONG CORE LOGGING TEST COMPLETED!");
console.log("Check browser console and localStorage for logs.");
// Mostrar los logs almacenados
console.log("\n8. Recent Logs:");
const recentLogs = logger.getLogs().slice(-5);
recentLogs.forEach((log) => {
    console.log(`[${log.timestamp.toISOString()}] ${log.level} ${log.module}: ${log.message}`);
});
// }, 200);
// Export solo las instancias públicas
export { logger, SeleneDocumentLogger };
//# sourceMappingURL=test-logging.js.map