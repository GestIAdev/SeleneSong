import { createClient } from 'redis';

async function exportProfileStats() {
  console.log('🎯 DIRECTIVA 12.13: Solicitando exportación de estadísticas de perfiles...');

  const publisher = createClient();
  const subscriber = createClient();

  try {
    await publisher.connect();
    await subscriber.connect();

    console.log('✅ Conectado a Redis');

    // Suscribirse al canal de respuestas de estadísticas
    await subscriber.subscribe('selene:stats:export');

    // Escuchar respuestas
    subscriber.on('message', (channel, message) => {
      try {
        const statsMessage = JSON.parse(message);
        console.log('\n=== ESTADÍSTICAS DE PERFILES RECIBIDAS ===');
        console.log(`📊 Nodo: ${statsMessage.nodeId}`);
        console.log(`⏰ Timestamp: ${new Date(statsMessage.timestamp).toISOString()}`);
        console.log('📈 Estadísticas:');
        console.log(JSON.stringify(statsMessage.stats, null, 2));
        console.log('=====================================\n');
      } catch (error) {
        console.error('❌ Error procesando mensaje de estadísticas:', error);
      }
    });

    // Enviar comando de exportación
    const command = {
      type: 'export_profile_stats',
      timestamp: Date.now(),
      requestId: `export-${Date.now()}`
    };

    await publisher.publish('selene:control:export_stats', JSON.stringify(command));
    console.log('📤 Comando de exportación enviado');

    // Esperar 5 segundos para recibir respuestas
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('✅ Proceso de exportación completado');

  } catch (error) {
    console.error('❌ Error en exportación de estadísticas:', error);
  } finally {
    await publisher.quit();
    await subscriber.quit();
  }
}

exportProfileStats().catch(console.error);