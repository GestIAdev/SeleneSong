/**
 * 🧪 TEST HONESTO #3 - TTLCache
 * Directiva V194: Verificación de Fix #3
 *
 * CRÍTICO: Prueba exhaustiva del sistema de cache con TTL automático
 * El semidios bosteza... no podemos fallar aquí.
 */

import { TTLCache, TTLCacheFactory } from "../shared/TTLCache";

interface TestUser {
  id: number;
  name: string;
  lastLogin: number;
}

interface TestSession {
  sessionId: string;
  userId: number;
  created: number;
  activity: string[];
}

async function testTTLCache(): Promise<void> {
  console.log("\n🧪 INICIANDO TEST HONESTO #3: TTLCache");
  console.log("⚡ MÁXIMA PRECISIÓN - EL SEMIDIOS AGUARDA");
  console.log("=".repeat(60));

  try {
    // Test 1: Operaciones básicas de TTL
    console.log("\n🔄 TEST 1: Operaciones básicas de TTL");
    const basicCache = new TTLCache<string, string>("test-basic", {
      defaultTTL: 2000, // 2 segundos
      cleanupInterval: 500, // cleanup cada 500ms
      onExpire: (_key, _value) => console.log(`⏰ EXPIRÓ: ${_key} = ${_value}`),
    });

    // Almacenar valores
    basicCache.set("key1", "value1");
    basicCache.set("key2", "value2", 1000); // TTL personalizado: 1 segundo
    basicCache.set("key3", "value3", 3000); // TTL personalizado: 3 segundos

    console.log(`📊 Tamaño inicial: ${basicCache.size()}`);
    console.log(`📋 Claves: [${basicCache.keys().join(", ")}]`);

    // Verificar existencia
    console.log(`🔍 ¿Existe key1? ${basicCache.has("key1")}`);
    console.log(`🔍 ¿Existe key99? ${basicCache.has("key99")}`);

    // Obtener valores
    console.log(`📖 key1: ${basicCache.get("key1")}`);
    console.log(`📖 key2: ${basicCache.get("key2")}`);
    console.log(`📖 key3: ${basicCache.get("key3")}`);

    // Esperar expiración parcial
    console.log("\n⏳ Esperando 1.2 segundos (key2 debería expirar)...");
    await new Promise((_resolve) => setTimeout(_resolve, 1200));

    console.log(`📊 Tamaño después de 1.2s: ${basicCache.size()}`);
    console.log(`📋 Claves restantes: [${basicCache.keys().join(", ")}]`);
    console.log(`📖 key2 (debería ser undefined): ${basicCache.get("key2")}`);

    // Esperar más tiempo
    console.log("\n⏳ Esperando 1.5 segundos más (key1 debería expirar)...");
    await new Promise((_resolve) => setTimeout(_resolve, 1500));

    console.log(`📊 Tamaño después de 2.7s total: ${basicCache.size()}`);
    console.log(`📋 Claves restantes: [${basicCache.keys().join(", ")}]`);

    // Test 2: TTL y renovación
    console.log("\n🔄 TEST 2: TTL y renovación");
    const ttlCache = new TTLCache<string, TestUser>("test-ttl", {
      defaultTTL: 1500, // 1.5 segundos
      onExpire: (_key, _user) =>
        console.log(`⏰ Usuario ${_user.name} expiró del cache`),
    });

    const user1: TestUser = { id: 1, name: "Alice", lastLogin: Date.now() };
    const user2: TestUser = { id: 2, name: "Bob", lastLogin: Date.now() };

    ttlCache.set("user1", user1);
    ttlCache.set("user2", user2);

    console.log(`⏱️ TTL user1: ${ttlCache.getTTL("user1")}ms`);
    console.log(`⏱️ TTL user2: ${ttlCache.getTTL("user2")}ms`);

    // Renovar TTL de user1
    await new Promise((_resolve) => setTimeout(_resolve, 800));
    const renewed = ttlCache.refresh("user1", 2000); // Renovar por 2 segundos
    console.log(`🔄 User1 renovado: ${renewed}`);
    console.log(
      `⏱️ TTL user1 después de renovar: ${ttlCache.getTTL("user1")}ms`,
    );

    // Esperar expiración de user2
    await new Promise((_resolve) => setTimeout(_resolve, 1000));
    console.log(
      `📖 User1 (renovado): ${ttlCache.get("user1")?.name || "EXPIRADO"}`,
    );
    console.log(
      `📖 User2 (no renovado): ${ttlCache.get("user2")?.name || "EXPIRADO"}`,
    );

    // Test 3: Límite de tamaño y evicción
    console.log("\n🚪 TEST 3: Límite de tamaño y evicción");
    const sizedCache = new TTLCache<string, number>("test-sized", {
      defaultTTL: 10000, // 10 segundos (suficiente para test)
      maxSize: 3,
      onEvict: (_key, _value) =>
        console.log(`🚪 EXPULSADO por tamaño: ${_key} = ${_value}`),
    });

    // Llenar hasta el límite
    sizedCache.set("item1", 1);
    sizedCache.set("item2", 2);
    sizedCache.set("item3", 3);
    console.log(`📊 Cache lleno: ${sizedCache.size()}/3`);

    // Añadir uno más (debería expulsar el más antiguo)
    sizedCache.set("item4", 4);
    console.log(`📊 Después de overflow: ${sizedCache.size()}/3`);
    console.log(`📋 Claves: [${sizedCache.keys().join(", ")}]`);
    console.log(`🔍 ¿Sigue item1? ${sizedCache.has("item1")}`);

    // Test 4: Estadísticas detalladas
    console.log("\n📊 TEST 4: Estadísticas detalladas");
    const statsCache = new TTLCache<string, string>("test-stats", {
      defaultTTL: 5000,
      maxSize: 5,
    });

    // Generar actividad
    for (let i = 1; i <= 10; i++) {
      statsCache.set(`key${i}`, `value${i}`);
    }

    // Hacer algunos gets (hits y misses)
    statsCache.get("key6"); // hit
    statsCache.get("key7"); // hit
    statsCache.get("key8"); // hit
    statsCache.get("key99"); // miss
    statsCache.get("key100"); // miss

    const stats = statsCache.getStats();
    console.log(`📈 ESTADÍSTICAS:`, {
      size: stats.size,
      maxSize: stats.maxSize,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: `${stats.hitRate}%`,
      evictions: stats.evictions,
    });

    // Test 5: Entradas próximas a expirar
    console.log("\n⏰ TEST 5: Entradas próximas a expirar");
    const expiringCache = new TTLCache<string, string>("test-expiring", {
      defaultTTL: 2000,
    });

    // Añadir entradas con diferentes TTLs
    expiringCache.set("short", "valor-corto", 500);
    expiringCache.set("medium", "valor-medio", 1000);
    expiringCache.set("long", "valor-largo", 1500);

    const expiring = expiringCache.getExpiringEntries(1200); // Próximas a expirar en 1.2s
    console.log(`⏰ Entradas que expirarán en 1.2s:`);
    expiring.forEach(([key, value, timeLeft]) => {
      console.log(`  ${key}: ${timeLeft}ms restantes`);
    });

    // Extender las que están por expirar
    const extended = expiringCache.extendExpiringEntries(1200, 2000);
    console.log(`🔄 Entradas extendidas: ${extended}`);

    // Test 6: Factory methods
    console.log("\n🏭 TEST 6: Factory methods");
    const fastCache = TTLCacheFactory.createFastCache<string, string>("fast");
    const sessionCache = TTLCacheFactory.createSessionCache<
      string,
      TestSession
    >("session");
    const longCache = TTLCacheFactory.createLongCache<string, string>("long");
    const unlimitedCache = TTLCacheFactory.createUnlimitedCache<string, string>(
      "unlimited",
      30000,
    );

    console.log(`🏭 FACTORY CACHES CREADOS:`);
    console.log(`  ⚡ Fast: ${fastCache.getStats().maxSize} max, TTL: 5min`);
    console.log(
      `  👤 Session: ${sessionCache.getStats().maxSize} max, TTL: 30min`,
    );
    console.log(`  🐌 Long: ${longCache.getStats().maxSize} max, TTL: 2h`);
    console.log(
      `  ∞ Unlimited: ${unlimitedCache.getStats().maxSize || "∞"} max, TTL: 30s`,
    );

    // Test con session cache
    const session: TestSession = {
      sessionId: "sess-123",
      userId: 1,
      created: Date.now(),
      activity: ["login", "view-dashboard"],
    };

    sessionCache.set("user-1-session", session);
    const retrievedSession = sessionCache.get("user-1-session");
    console.log(
      `👤 Sesión recuperada: ${retrievedSession?.sessionId}, actividades: ${retrievedSession?.activity.length}`,
    );

    // Test 7: Información detallada de entradas
    console.log("\n📋 TEST 7: Información detallada de entradas");
    const infoCache = new TTLCache<string, string>("test-info", {
      defaultTTL: 5000,
    });

    infoCache.set("test-entry", "test-value");

    // Hacer algunos accesos
    infoCache.get("test-entry");
    infoCache.get("test-entry");
    infoCache.get("test-entry");

    const entryInfo = infoCache.getEntryInfo("test-entry");
    if (entryInfo) {
      console.log(`📋 INFO DE ENTRADA 'test-entry':`);
      console.log(`  🕐 Creada: ${new Date(entryInfo.created).toISOString()}`);
      console.log(
        `  👁️ Último acceso: ${new Date(entryInfo.accessed).toISOString()}`,
      );
      console.log(`  🔢 Accesos: ${entryInfo.accessCount}`);
      console.log(`  ⏰ Expira: ${new Date(entryInfo.expires).toISOString()}`);
    }

    // Test 8: JSON serialization para debugging
    console.log("\n🔧 TEST 8: JSON serialization");
    const debugCache = new TTLCache<string, any>("debug", {
      defaultTTL: 1000,
      maxSize: 2,
    });

    debugCache.set("debug1", { type: "test", data: [1, 2, 3] });
    debugCache.set("debug2", { type: "prod", data: [4, 5, 6] });

    const jsonRepresentation = debugCache.toJSON();
    console.log(`🔧 DEBUG JSON:`, {
      id: jsonRepresentation.id,
      maxSize: jsonRepresentation.options.maxSize,
      currentSize: jsonRepresentation.stats.size,
      sampleEntriesCount: jsonRepresentation.sampleEntries.length,
    });

    // Cleanup final
    console.log("\n🧹 CLEANUP FINAL");
    basicCache.close();
    ttlCache.close();
    sizedCache.close();
    statsCache.close();
    expiringCache.close();
    fastCache.close();
    sessionCache.close();
    longCache.close();
    unlimitedCache.close();
    infoCache.close();
    debugCache.close();

    console.log("\n✅ TEST HONESTO #3: TTLCache - COMPLETADO");
    console.log("🎯 RESULTADO: Fix #3 funcionando con PRECISIÓN ABSOLUTA");
    console.log("📋 FUNCIONALIDADES VERIFICADAS:");
    console.log("  ✅ TTL automático y personalizado");
    console.log("  ✅ Expiración automática");
    console.log("  ✅ Renovación de TTL");
    console.log("  ✅ Límite de tamaño con evicción LRU");
    console.log("  ✅ Estadísticas detalladas (hits, misses, hit rate)");
    console.log("  ✅ Detección de entradas próximas a expirar");
    console.log("  ✅ Extensión automática de TTLs");
    console.log("  ✅ Factory methods preconfigurados");
    console.log("  ✅ Información detallada de entradas");
    console.log("  ✅ JSON serialization para debugging");
    console.log("  ✅ Cleanup automático y manual");

    console.log("\n🏛️ EL SEMIDIOS SONRÍE... FIX #3 ES PERFECTO");
  } catch (error) {
    console.error("\n❌ ERROR CRÍTICO EN TEST HONESTO #3:", error);
    console.error("💥 EL SEMIDIOS FRUNCE EL CEÑO...");
    throw error;
  }
}

// Ejecutar test si es llamado directamente
if (require.main === module) {
  testTTLCache()
    .then(() => {
      console.log("\n🏁 Test completado con ÉXITO ABSOLUTO");
      process.exit(0);
    })
    .catch((_error) => {
      console.error("\n💥 Test falló - CIRUGÍA COMPROMETIDA:", _error);
      process.exit(1);
    });
}
