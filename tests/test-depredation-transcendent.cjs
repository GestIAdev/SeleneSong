const { SeleneConsciousness } = require('../dist/consciousness/SeleneConsciousness');

/**
 * 🧠 TEST: VERIFICACIÓN DE INICIALIZACIÓN DE ENGINES DE DEPREDACIÓN EN ESTADO TRANSCENDENT
 * Este test verifica que los engines de caza se inicialicen correctamente cuando Selene está en estado TRANSCENDENT
 */

async function testDepredationEnginesInTranscendent() {
  console.log('🧠 [TEST] Iniciando test de engines de depredación en estado TRANSCENDENT...');

  try {
    // Crear instancia de consciencia
    const consciousness = new SeleneConsciousness();

    // Inicializar consciencia (awaken)
    await consciousness.awaken();

    // Forzar estado TRANSCENDENT
    await consciousness.forceTranscendentState();

    // Verificar que el estado sea TRANSCENDENT
    if (consciousness.status !== 'transcendent') {
      throw new Error(`Estado esperado: transcendent, estado actual: ${consciousness.status}`);
    }

    console.log('✅ Estado TRANSCENDENT confirmado');

    // Verificar que los engines de depredación estén inicializados
    const huntActive = !!consciousness.huntOrchestrator;
    const stalkActive = !!consciousness.stalkingEngine;
    const strikeActive = !!consciousness.strikeMomentEngine;
    const preyActive = !!consciousness.preyRecognitionEngine;

    console.log(`🐆 Estado de engines de depredación:`);
    console.log(`🐆 Hunt: ${huntActive}`);
    console.log(`🐆 Stalk: ${stalkActive}`);
    console.log(`🐆 Strike: ${strikeActive}`);
    console.log(`🐆 Prey: ${preyActive}`);

    // Verificar que todos los engines estén activos
    if (!huntActive || !stalkActive || !strikeActive || !preyActive) {
      throw new Error('❌ No todos los engines de depredación están inicializados en estado TRANSCENDENT');
    }

    console.log('✅ Todos los engines de depredación inicializados correctamente en estado TRANSCENDENT');

    // Verificar que los engines de meta-consciencia también estén activos
    const metaActive = !!consciousness.metaOrchestrator;
    const selfActive = !!consciousness.selfAnalysisEngine;
    const patternActive = !!consciousness.patternEmergenceEngine;
    const dreamActive = !!consciousness.dreamForgeEngine;
    const ethicalActive = !!consciousness.ethicalCoreEngine;
    const autoActive = !!consciousness.autoOptimizationEngine;

    console.log(`🧠 Estado de engines de meta-consciencia:`);
    console.log(`🧠 Meta: ${metaActive}`);
    console.log(`🧠 Self: ${selfActive}`);
    console.log(`🧠 Pattern: ${patternActive}`);
    console.log(`🧠 Dream: ${dreamActive}`);
    console.log(`🧠 Ethical: ${ethicalActive}`);
    console.log(`🧠 Auto: ${autoActive}`);

    if (!metaActive || !selfActive || !patternActive || !dreamActive || !ethicalActive || !autoActive) {
      throw new Error('❌ No todos los engines de meta-consciencia están inicializados en estado TRANSCENDENT');
    }

    console.log('✅ Todos los engines de meta-consciencia inicializados correctamente');

    // Shutdown para cleanup
    await consciousness.shutdown();

    console.log('🎯 [TEST] Test completado exitosamente - Engines de depredación funcionan en TRANSCENDENT');
    return true;

  } catch (error) {
    console.error('❌ [TEST] Error en test de engines de depredación:', error);
    return false;
  }
}

// Ejecutar test
testDepredationEnginesInTranscendent().then(success => {
  process.exit(success ? 0 : 1);
});