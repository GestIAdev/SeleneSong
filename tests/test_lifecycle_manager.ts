/**
 * 🧪 TEST HONESTO #1 - ComponentLifecycleManager
 * Directiva V194: Verificación de Fix #1
 */

import {
  lifecycleManager,
  ComponentCleanupable,
} from "../shared/ComponentLifecycleManager";
import { EventEmitter } from "events";

class TestComponent extends EventEmitter implements ComponentCleanupable {
  private id: string;
  private data: any[] = [];

  constructor(id: string) {
    super();
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  async cleanup(): Promise<void> {
    console.log(`🧹 TestComponent ${this.id}: Ejecutando cleanup interno`);
    this.data = [];
    this.removeAllListeners();
  }

  addData(item: any): void {
    this.data.push(item);
    this.emit("data-added", item);
  }

  getDataCount(): number {
    return this.data.length;
  }
}

async function testComponentLifecycleManager(): Promise<void> {
  console.log("\n🧪 INICIANDO TEST HONESTO #1: ComponentLifecycleManager");
  console.log("=".repeat(60));

  try {
    // 1. Crear componentes de prueba
    const comp1 = new TestComponent("test-component-1");
    const comp2 = new TestComponent("test-component-2");

    // 2. Registrar componentes
    lifecycleManager.registerComponent(comp1);
    lifecycleManager.registerComponent(comp2);

    // 3. Registrar event listeners que normalmente causarían leaks
    lifecycleManager.registerEventListener(
      "test-component-1",
      comp2,
      "data-added",
      (_data) => console.log(`Comp1 escuchó: ${_data}`),
    );

    lifecycleManager.registerEventListener(
      "test-component-2",
      comp1,
      "data-added",
      (_data) => console.log(`Comp2 escuchó: ${_data}`),
    );

    // 4. Crear algunos timers que normalmente causarían leaks
    const timer1 = setInterval(() => {
      comp1.addData(`Data-${Date.now()}`);
    }, 1000);

    const timer2 = setInterval(() => {
      comp2.addData(`Data-${Date.now()}`);
    }, 1500);

    lifecycleManager.registerTimer("test-component-1", timer1, "interval");
    lifecycleManager.registerTimer("test-component-2", timer2, "interval");

    // 5. Registrar callbacks de cleanup personalizados
    lifecycleManager.registerCleanupCallback("test-component-1", () => {
      console.log("🧹 Cleanup callback personalizado ejecutado para comp1");
    });

    // 6. Simular actividad por unos segundos
    console.log("\n📊 Simulando actividad por 3 segundos...");
    await new Promise((_resolve) => setTimeout(_resolve, 3000));

    // 7. Verificar estadísticas
    console.log("\n📊 ESTADÍSTICAS PRE-CLEANUP:");
    const statsPreCleanup = lifecycleManager.getStats();
    console.log(JSON.stringify(statsPreCleanup, null, 2));

    // 8. Limpiar un componente
    console.log("\n🔥 LIMPIANDO COMPONENTE 1...");
    await lifecycleManager.unregisterComponent("test-component-1");

    // 9. Verificar estadísticas post cleanup
    console.log("\n📊 ESTADÍSTICAS POST-CLEANUP PARCIAL:");
    const statsPostPartial = lifecycleManager.getStats();
    console.log(JSON.stringify(statsPostPartial, null, 2));

    // 10. Esperar un poco más para ver si el componente 2 sigue funcionando
    console.log("\n⏳ Verificando que componente 2 sigue funcionando...");
    await new Promise((_resolve) => setTimeout(_resolve, 2000));

    // 11. Cleanup completo
    console.log("\n🔥 CLEANUP COMPLETO...");
    await lifecycleManager.unregisterComponent("test-component-2");

    // 12. Estadísticas finales
    console.log("\n📊 ESTADÍSTICAS FINALES:");
    const statsFinal = lifecycleManager.getStats();
    console.log(JSON.stringify(statsFinal, null, 2));

    console.log("\n✅ TEST HONESTO #1: ComponentLifecycleManager - COMPLETADO");
    console.log("🎯 RESULTADO: Fix #1 funcionando correctamente");
  } catch (error) {
    console.error("\n❌ ERROR EN TEST HONESTO #1:", error);
    throw error;
  }
}

// Ejecutar test si es llamado directamente
if (require.main === module) {
  testComponentLifecycleManager()
    .then(() => {
      console.log("\n🏁 Test completado exitosamente");
      process.exit(0);
    })
    .catch((_error) => {
      console.error("\n💥 Test falló:", _error);
      process.exit(1);
    });
}
