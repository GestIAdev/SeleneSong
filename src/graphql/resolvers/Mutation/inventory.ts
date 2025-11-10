/**
 * 📦 INVENTORY MUTATION RESOLVERS V3 - SUBMODULE 2A
 * Dashboard + Materials Management
 * Mission: Provide inventory and materials mutations with @veritas verification
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// MUTATION RESOLVERS - INVENTORY MANAGEMENT
// ============================================================================

export const createInventoryV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  const { input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // --------------------------------------------------------------------------
    // 🔥 PUERTA 1: VERIFICACIÓN (El Guardián - VerificationEngine)
    // --------------------------------------------------------------------------
    // Verificar el input contra las reglas de 'integrity_checks'
    const verification = await verificationEngine.verifyBatch(
      'InventoryV3',
      input
    );

    if (!verification.valid) {
      // Si la verificación falla, registramos la violación y paramos
      await auditLogger.logIntegrityViolation(
        'InventoryV3',
        'N/A (CREATE)',
        verification.criticalFields[0] || 'batch',
        input,
        verification.errors[0] || verification.errors.join(', '),
        (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }

    // --------------------------------------------------------------------------
    // 🎯 PUERTA 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // Para CREATE de inventario, la Puerta 1 es suficiente
    // La mayoría de validaciones de negocio están en integrity_checks

    // --------------------------------------------------------------------------
    // 💾 PUERTA 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    const newRecord = await database.inventory.createInventoryV3(input);

    // --------------------------------------------------------------------------
    // 📝 PUERTA 4: AUDITORÍA (El Cronista - AuditLogger)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;
    
    await auditLogger.logCreate(
      'InventoryV3',
      newRecord.id,
      newRecord,
      user?.id,
      user?.email,
      ip
    );

    // (Opcional: Publicar evento de WebSocket si tienes PubSub configurado)
    if (context.pubsub) {
      context.pubsub.publish('INVENTORY_CREATED', {
        inventoryCreated: newRecord
      });
    }

    console.log(`✅ createInventoryV3 mutation created: ${newRecord.name} (${duration}ms)`);
    return newRecord;
  } catch (error) {
    // Registrar error como violación de integridad (solo si no fue registrado en GATE 1)
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation(
        'InventoryV3',
        'N/A (CREATE)',
        'unknown',
        input,
        (error as Error).message,
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
    }

    console.error("❌ createInventoryV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateInventoryV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  const { id, input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // --------------------------------------------------------------------------
    // 🔥 PUERTA 1: VERIFICACIÓN (El Guardián - VerificationEngine)
    // --------------------------------------------------------------------------
    // Primero, obtenemos el estado actual para la auditoría
    const oldRecord = await database.inventory.getInventoryV3ById(id);
    if (!oldRecord) {
      throw new Error(`Registro de inventario no encontrado: ${id}`);
    }

    // Verificar el input contra las reglas de 'integrity_checks'
    const verification = await verificationEngine.verifyBatch(
      'InventoryV3',
      input
    );

    if (!verification.valid) {
      // Si la verificación falla, registramos la violación y paramos
      await auditLogger.logIntegrityViolation(
        'InventoryV3',
        id,
        verification.criticalFields[0] || 'batch',
        input,
        verification.errors[0] || verification.errors.join(', '),
        (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }

    // --------------------------------------------------------------------------
    // 🎯 PUERTA 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // Para un update simple de inventario, la Puerta 1 es suficiente.
    // Aquí iría lógica compleja: transiciones de estado, cascadas, etc.
    // Ejemplo: Si el inventario cambia de status, validar transición permitida
    if (input.status && input.status !== oldRecord.status) {
      const stateTransition = await verificationEngine.verifyStateTransition(
        oldRecord.status || 'ACTIVE',
        input.status,
        {
          'ACTIVE': ['INACTIVE', 'ARCHIVED'],
          'INACTIVE': ['ACTIVE', 'ARCHIVED'],
          'ARCHIVED': [] // Terminal state
        }
      );

      if (!stateTransition.valid) {
        throw new Error(stateTransition.error);
      }
    }

    // --------------------------------------------------------------------------
    // 💾 PUERTA 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    const updatedRecord = await database.inventory.updateInventoryV3(id, input);

    // --------------------------------------------------------------------------
    // 📝 PUERTA 4: AUDITORÍA (El Cronista - AuditLogger)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;
    
    await auditLogger.logUpdate(
      'InventoryV3',
      id,
      oldRecord,       // Estado ANTES del cambio
      updatedRecord,   // Estado DESPUÉS del cambio
      user?.id,
      user?.email,
      ip
    );

    // (Opcional: Publicar evento de WebSocket si tienes PubSub configurado)
    if (context.pubsub) {
      context.pubsub.publish('INVENTORY_UPDATED', {
        inventoryUpdated: updatedRecord
      });
    }

    console.log(`✅ updateInventoryV3 mutation updated: ${updatedRecord.name} (${duration}ms)`);
    return updatedRecord;
  } catch (error) {
    // Registrar error como violación de integridad (solo si no fue registrado en GATE 1)
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation(
        'InventoryV3',
        id,
        'unknown',
        input,
        (error as Error).message,
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
    }

    console.error("❌ updateInventoryV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteInventoryV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { id } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    // --------------------------------------------------------------------------
    // 🔥 PUERTA 1: VERIFICACIÓN (El Guardián)
    // --------------------------------------------------------------------------
    // Obtener el registro actual ANTES de eliminarlo (para auditoría)
    const oldRecord = await database.inventory.getInventoryV3ById(id);
    if (!oldRecord) {
      throw new Error(`Registro de inventario no encontrado: ${id}`);
    }

    // --------------------------------------------------------------------------
    // 🎯 PUERTA 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // Validaciones de negocio para DELETE:
    // - No eliminar si hay órdenes de compra pendientes
    // - No eliminar si hay transacciones recientes de stock
    // Por ahora mantenemos simple, se puede expandir

    // --------------------------------------------------------------------------
    // 💾 PUERTA 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    await database.inventory.deleteInventoryV3(id);

    // --------------------------------------------------------------------------
    // 📝 PUERTA 4: AUDITORÍA (El Cronista - AuditLogger)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;
    
    await auditLogger.logDelete(
      'InventoryV3',
      id,
      oldRecord,
      user?.id,
      user?.email,
      ip
    );

    // (Opcional: Publicar evento de WebSocket si tienes PubSub configurado)
    if (context.pubsub) {
      context.pubsub.publish('INVENTORY_DELETED', {
        inventoryDeleted: { id, name: oldRecord.name }
      });
    }

    console.log(`✅ deleteInventoryV3 mutation deleted ID: ${id} (${duration}ms)`);
    return true;
  } catch (error) {
    // Registrar error como violación de integridad
    if (auditLogger) {
      await auditLogger.logIntegrityViolation(
        'InventoryV3',
        id,
        'unknown',
        { id },
        (error as Error).message,
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
    }

    console.error("❌ deleteInventoryV3 mutation error:", error as Error);
    throw error;
  }
};

export const adjustInventoryStockV3 = async (
  _: unknown,
  args: { id: string; adjustment: number; reason: string },
  context: GraphQLContext
): Promise<any> => {
  const { id, adjustment, reason } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // --------------------------------------------------------------------------
    // 🔥 PUERTA 1: VERIFICACIÓN (El Guardián)
    // --------------------------------------------------------------------------
    // Obtener inventario actual
    const oldRecord = await database.inventory.getInventoryV3ById(id);
    if (!oldRecord) {
      throw new Error(`Registro de inventario no encontrado: ${id}`);
    }

    // Verificar el ajuste (validar que adjustment sea numérico y válido)
    const adjustmentInput = { adjustment, reason, id };
    const verification = await verificationEngine.verifyBatch(
      'InventoryAdjustment',
      adjustmentInput
    );

    if (!verification.valid) {
      await auditLogger.logIntegrityViolation(
        'InventoryAdjustment',
        id,
        verification.criticalFields[0] || 'adjustment',
        adjustmentInput,
        verification.errors[0] || verification.errors.join(', '),
        (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }

    // --------------------------------------------------------------------------
    // 🎯 PUERTA 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // Validar que la cantidad no vaya a negativo (si la política lo requiere)
    const projectedStock = oldRecord.current_stock + adjustment;
    if (projectedStock < 0) {
      throw new Error(`Ajuste resultaría en stock negativo. Actual: ${oldRecord.current_stock}, Ajuste: ${adjustment}`);
    }

    // --------------------------------------------------------------------------
    // 💾 PUERTA 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    const inventory = await database.adjustInventoryStockV3(id, adjustment, reason);

    // --------------------------------------------------------------------------
    // 📝 PUERTA 4: AUDITORÍA (El Cronista)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;
    
    await auditLogger.logStateTransition(
      'InventoryV3',
      id,
      {
        field: 'current_stock',
        oldValue: oldRecord.current_stock,
        newValue: inventory.current_stock,
        reason: reason
      },
      user?.id,
      user?.email,
      ip
    );

    // 🔥 DIRECTIVA 3.2: AUTO-PEDIDO CUANDO STOCK BAJO
    // Verificar si el stock está por debajo del mínimo después del ajuste
    if (inventory.current_stock <= inventory.minimum_stock) {
      console.log(`🔥 ALERTA DE STOCK BAJO: ${inventory.name}. Disparando auto-pedido.`);

      // 1. Publicar alerta de WebSocket (para el hook del frontend)
      context.pubsub?.publish('LOW_STOCK_ALERT_V3', {
        lowStockAlertV3: {
          id: inventory.id,
          name: inventory.name,
          currentStock: inventory.current_stock,
          minimumStock: inventory.minimum_stock,
          supplierId: inventory.supplier_id,
          timestamp: new Date().toISOString()
        }
      });

      // 2. Crear automáticamente una orden de compra
      try {
        const reorderQuantity = inventory.minimum_stock * 2;
        const po = await database.createPurchaseOrderV3({
          supplierId: inventory.supplier_id,
          items: [{
            materialId: inventory.id,
            quantity: reorderQuantity,
            unitPrice: inventory.unit_cost || 0
          }],
          notes: `Auto-reorder triggered by low stock alert for ${inventory.name}`
        });

        console.log(`✅ Orden de compra automática (PO-${po.id}) creada para ${inventory.name}.`);

        context.pubsub?.publish('PURCHASE_ORDER_V3_CREATED', {
          purchaseOrderV3Created: po
        });

      } catch (error) {
        console.error(`Error al crear orden de compra automática:`, error);
      }
    }

    console.log(`✅ adjustInventoryStockV3 mutation adjusted stock for: ${inventory.name} (${duration}ms)`);
    return inventory;
  } catch (error) {
    // Registrar error como violación de integridad (solo si no fue registrado en GATE 1)
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation(
        'InventoryAdjustment',
        id,
        'unknown',
        { id, adjustment, reason },
        (error as Error).message,
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
    }

    console.error("❌ adjustInventoryStockV3 mutation error:", error as Error);
    throw error;
  }
};

// ============================================================================
// MUTATION RESOLVERS - MATERIALS MANAGEMENT
// ============================================================================

export const createMaterialV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  const { input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // PUERTA 1: VERIFICACIÓN
    const verification = await verificationEngine.verifyBatch('MaterialV3', input);
    
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation(
        'MaterialV3',
        'N/A (CREATE)',
        verification.criticalFields[0] || 'batch',
        input,
        verification.errors[0] || verification.errors.join(', '),
        (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }

    // PUERTA 3: TRANSACCIÓN DB
    const material = await database.createMaterialV3(input);

    // PUERTA 4: AUDITORÍA
    const duration = Date.now() - startTime;
    await auditLogger.logCreate('MaterialV3', material.id, material, user?.id, user?.email, ip);
    
    if (context.pubsub) {
      context.pubsub.publish('MATERIAL_CREATED', { materialCreated: material });
    }

    console.log(`✅ createMaterialV3 mutation created: ${material.name} (${duration}ms)`);
    return material;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('MaterialV3', 'N/A (CREATE)', 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ createMaterialV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateMaterialV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  const { id, input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // PUERTA 1: VERIFICACIÓN
    const oldRecord = await database.inventory.getMaterialV3ById(id);
    if (!oldRecord) throw new Error(`Material no encontrado: ${id}`);
    
    const verification = await verificationEngine.verifyBatch('MaterialV3', input);
    
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('MaterialV3', id, verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }

    // PUERTA 3: TRANSACCIÓN DB
    const material = await database.updateMaterialV3(id, input);

    // PUERTA 4: AUDITORÍA
    const duration = Date.now() - startTime;
    await auditLogger.logUpdate('MaterialV3', id, oldRecord, material, user?.id, user?.email, ip);
    
    if (context.pubsub) {
      context.pubsub.publish('MATERIAL_UPDATED', { materialUpdated: material });
    }

    console.log(`✅ updateMaterialV3 mutation updated: ${material.name} (${duration}ms)`);
    return material;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('MaterialV3', id, 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ updateMaterialV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteMaterialV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { id } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    // PUERTA 1: VERIFICACIÓN
    const oldRecord = await database.inventory.getMaterialV3ById(id);
    if (!oldRecord) throw new Error(`Material no encontrado: ${id}`);

    // PUERTA 3: TRANSACCIÓN DB
    await database.deleteMaterialV3(id);

    // PUERTA 4: AUDITORÍA
    const duration = Date.now() - startTime;
    await auditLogger.logDelete('MaterialV3', id, oldRecord, user?.id, user?.email, ip);
    
    if (context.pubsub) {
      context.pubsub.publish('MATERIAL_DELETED', { materialDeleted: { id, name: oldRecord.name } });
    }

    console.log(`✅ deleteMaterialV3 mutation deleted ID: ${id} (${duration}ms)`);
    return true;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation('MaterialV3', id, 'unknown', { id }, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ deleteMaterialV3 mutation error:", error as Error);
    throw error;
  }
};

export const reorderMaterialV3 = async (
  _: unknown,
  args: { materialId: string; quantity: number; supplierId?: string },
  context: GraphQLContext
): Promise<any> => {
  const { materialId, quantity, supplierId } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // PUERTA 1: VERIFICACIÓN
    const input = { materialId, quantity, supplierId };
    const verification = await verificationEngine.verifyBatch('MaterialReorder', input);
    
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('MaterialReorder', materialId, verification.criticalFields[0] || 'quantity', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }

    // PUERTA 3: TRANSACCIÓN DB
    const reorder = await database.reorderMaterialV3(materialId, quantity, supplierId);

    // PUERTA 4: AUDITORÍA
    const duration = Date.now() - startTime;
    await auditLogger.logCreate('MaterialReorder', reorder.id, reorder, user?.id, user?.email, ip);
    
    if (context.pubsub) {
      context.pubsub.publish('MATERIAL_REORDERED', { materialReordered: reorder });
    }

    console.log(`✅ reorderMaterialV3 mutation created reorder for material: ${materialId} (${duration}ms)`);
    return reorder;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('MaterialReorder', materialId, 'unknown', args, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ reorderMaterialV3 mutation error:", error as Error);
    throw error;
  }
};

// ============================================================================
// MUTATION RESOLVERS - DASHBOARD OPERATIONS
// ============================================================================

export const acknowledgeInventoryAlertV3 = async (
  _: unknown,
  args: { alertId: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { alertId } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    await database.acknowledgeInventoryAlertV3(alertId);
    const duration = Date.now() - startTime;
    await auditLogger.logFieldAccess('InventoryAlert', alertId, 'acknowledged', user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('INVENTORY_ALERT_ACKNOWLEDGED', { alertId });
    console.log(`✅ acknowledgeInventoryAlertV3 mutation acknowledged alert: ${alertId} (${duration}ms)`);
    return true;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation('InventoryAlert', alertId, 'unknown', { alertId }, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ acknowledgeInventoryAlertV3 mutation error:", error as Error);
    throw error;
  }
};

// ============================================================================
// MUTATION RESOLVERS - EQUIPMENT MANAGEMENT (2B)
// ============================================================================

export const createEquipmentV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  const { input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const verification = await verificationEngine.verifyBatch('EquipmentV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('EquipmentV3', 'N/A (CREATE)', verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const equipment = await database.createEquipmentV3(input);
    const duration = Date.now() - startTime;
    await auditLogger.logCreate('EquipmentV3', equipment.id, equipment, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('EQUIPMENT_CREATED', { equipmentCreated: equipment });
    console.log(`✅ createEquipmentV3 mutation created: ${equipment.name} (${duration}ms)`);
    return equipment;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('EquipmentV3', 'N/A (CREATE)', 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ createEquipmentV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateEquipmentV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  const { id, input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const oldRecord = await database.getEquipmentV3ById(id);
    if (!oldRecord) throw new Error(`Equipo no encontrado: ${id}`);
    const verification = await verificationEngine.verifyBatch('EquipmentV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('EquipmentV3', id, verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const equipment = await database.updateEquipmentV3(id, input);
    const duration = Date.now() - startTime;
    await auditLogger.logUpdate('EquipmentV3', id, oldRecord, equipment, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('EQUIPMENT_UPDATED', { equipmentUpdated: equipment });
    console.log(`✅ updateEquipmentV3 mutation updated: ${equipment.name} (${duration}ms)`);
    return equipment;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('EquipmentV3', id, 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ updateEquipmentV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteEquipmentV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { id } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    const oldRecord = await database.getEquipmentV3ById(id);
    if (!oldRecord) throw new Error(`Equipo no encontrado: ${id}`);
    await database.deleteEquipmentV3(id);
    const duration = Date.now() - startTime;
    await auditLogger.logDelete('EquipmentV3', id, oldRecord, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('EQUIPMENT_DELETED', { equipmentDeleted: { id, name: oldRecord.name } });
    console.log(`✅ deleteEquipmentV3 mutation deleted ID: ${id} (${duration}ms)`);
    return true;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation('EquipmentV3', id, 'unknown', { id }, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ deleteEquipmentV3 mutation error:", error as Error);
    throw error;
  }
};

// ============================================================================
// MUTATION RESOLVERS - MAINTENANCE MANAGEMENT (2B)
// ============================================================================

export const createMaintenanceV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  const { input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const verification = await verificationEngine.verifyBatch('MaintenanceV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('MaintenanceV3', 'N/A (CREATE)', verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const maintenance = await database.createMaintenanceV3(input);
    const duration = Date.now() - startTime;
    await auditLogger.logCreate('MaintenanceV3', maintenance.id, maintenance, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('MAINTENANCE_CREATED', { maintenanceCreated: maintenance });
    console.log(`✅ createMaintenanceV3 mutation created maintenance for equipment: ${input.equipmentId} (${duration}ms)`);
    return maintenance;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('MaintenanceV3', 'N/A (CREATE)', 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ createMaintenanceV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateMaintenanceV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  const { id, input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const oldRecord = await database.getMaintenanceV3ById(id);
    if (!oldRecord) throw new Error(`Mantenimiento no encontrado: ${id}`);
    const verification = await verificationEngine.verifyBatch('MaintenanceV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('MaintenanceV3', id, verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const maintenance = await database.updateMaintenanceV3(id, input);
    const duration = Date.now() - startTime;
    await auditLogger.logUpdate('MaintenanceV3', id, oldRecord, maintenance, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('MAINTENANCE_UPDATED', { maintenanceUpdated: maintenance });
    console.log(`✅ updateMaintenanceV3 mutation updated maintenance ID: ${maintenance.id} (${duration}ms)`);
    return maintenance;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('MaintenanceV3', id, 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ updateMaintenanceV3 mutation error:", error as Error);
    throw error;
  }
};

export const completeMaintenanceV3 = async (
  _: unknown,
  args: { id: string; completionNotes?: string },
  context: GraphQLContext
): Promise<any> => {
  const { id, completionNotes } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    const oldRecord = await database.getMaintenanceV3ById(id);
    if (!oldRecord) throw new Error(`Mantenimiento no encontrado: ${id}`);
    const maintenance = await database.completeMaintenanceV3(id, completionNotes);
    const duration = Date.now() - startTime;
    await auditLogger.logStateTransition('MaintenanceV3', id, { field: 'status', oldValue: oldRecord.status, newValue: 'COMPLETED', reason: 'Manual completion' }, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('MAINTENANCE_COMPLETED', { maintenanceCompleted: maintenance });
    console.log(`✅ completeMaintenanceV3 mutation completed maintenance ID: ${maintenance.id} (${duration}ms)`);
    return maintenance;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation('MaintenanceV3', id, 'unknown', { id, completionNotes }, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ completeMaintenanceV3 mutation error:", error as Error);
    throw error;
  }
};

export const scheduleMaintenanceV3 = async (
  _: unknown,
  args: { equipmentId: string; scheduledDate: string; maintenanceType: string; description?: string },
  context: GraphQLContext
): Promise<any> => {
  const { equipmentId, scheduledDate, maintenanceType, description } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const input = { equipmentId, scheduledDate, maintenanceType, description };
    const verification = await verificationEngine.verifyBatch('MaintenanceSchedule', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('MaintenanceSchedule', equipmentId, verification.criticalFields[0] || 'scheduledDate', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const maintenance = await database.scheduleMaintenanceV3(equipmentId, scheduledDate, maintenanceType, description);
    const duration = Date.now() - startTime;
    await auditLogger.logCreate('MaintenanceV3', maintenance.id, maintenance, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('MAINTENANCE_SCHEDULED', { maintenanceScheduled: maintenance });
    console.log(`✅ scheduleMaintenanceV3 mutation scheduled maintenance for equipment: ${equipmentId} (${duration}ms)`);
    return maintenance;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('MaintenanceSchedule', equipmentId, 'unknown', args, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ scheduleMaintenanceV3 mutation error:", error as Error);
    throw error;
  }
};

export const cancelMaintenanceV3 = async (
  _: unknown,
  args: { id: string; reason?: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { id, reason } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    const oldRecord = await database.getMaintenanceV3ById(id);
    if (!oldRecord) throw new Error(`Mantenimiento no encontrado: ${id}`);
    await database.cancelMaintenanceV3(id, reason);
    const duration = Date.now() - startTime;
    await auditLogger.logStateTransition('MaintenanceV3', id, { field: 'status', oldValue: oldRecord.status, newValue: 'CANCELLED', reason: reason || 'User cancellation' }, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('MAINTENANCE_CANCELLED', { maintenanceCancelled: { id, reason } });
    console.log(`✅ cancelMaintenanceV3 mutation cancelled maintenance ID: ${id} (${duration}ms)`);
    return true;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation('MaintenanceV3', id, 'unknown', { id, reason }, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ cancelMaintenanceV3 mutation error:", error as Error);
    throw error;
  }
};

// ============================================================================
// MUTATION RESOLVERS - SUPPLIERS MANAGEMENT (2C)
// ============================================================================

export const createSupplierV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  const { input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const verification = await verificationEngine.verifyBatch('SupplierV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('SupplierV3', 'N/A (CREATE)', verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const supplier = await database.createSupplierV3(input);
    const duration = Date.now() - startTime;
    await auditLogger.logCreate('SupplierV3', supplier.id, supplier, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('SUPPLIER_CREATED', { supplierCreated: supplier });
    console.log(`✅ createSupplierV3 mutation created: ${supplier.name} (${duration}ms)`);
    return supplier;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('SupplierV3', 'N/A (CREATE)', 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ createSupplierV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateSupplierV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  const { id, input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const oldRecord = await database.getSupplierV3ById(id);
    if (!oldRecord) throw new Error(`Proveedor no encontrado: ${id}`);
    const verification = await verificationEngine.verifyBatch('SupplierV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('SupplierV3', id, verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const supplier = await database.updateSupplierV3(id, input);
    const duration = Date.now() - startTime;
    await auditLogger.logUpdate('SupplierV3', id, oldRecord, supplier, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('SUPPLIER_UPDATED', { supplierUpdated: supplier });
    console.log(`✅ updateSupplierV3 mutation updated: ${supplier.name} (${duration}ms)`);
    return supplier;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('SupplierV3', id, 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ updateSupplierV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteSupplierV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { id } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    const oldRecord = await database.getSupplierV3ById(id);
    if (!oldRecord) throw new Error(`Proveedor no encontrado: ${id}`);
    await database.deleteSupplierV3(id);
    const duration = Date.now() - startTime;
    await auditLogger.logDelete('SupplierV3', id, oldRecord, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('SUPPLIER_DELETED', { supplierDeleted: { id, name: oldRecord.name } });
    console.log(`✅ deleteSupplierV3 mutation deleted ID: ${id} (${duration}ms)`);
    return true;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation('SupplierV3', id, 'unknown', { id }, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ deleteSupplierV3 mutation error:", error as Error);
    throw error;
  }
};

// ============================================================================
// MUTATION RESOLVERS - PURCHASE ORDERS MANAGEMENT (2C)
// ============================================================================

export const createPurchaseOrderV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  const { input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const verification = await verificationEngine.verifyBatch('PurchaseOrderV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('PurchaseOrderV3', 'N/A (CREATE)', verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const purchaseOrder = await database.createPurchaseOrderV3(input);
    const duration = Date.now() - startTime;
    await auditLogger.logCreate('PurchaseOrderV3', purchaseOrder.id, purchaseOrder, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('PURCHASE_ORDER_CREATED', { purchaseOrderCreated: purchaseOrder });
    console.log(`✅ createPurchaseOrderV3 mutation created order: ${purchaseOrder.order_number} (${duration}ms)`);
    return purchaseOrder;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('PurchaseOrderV3', 'N/A (CREATE)', 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ createPurchaseOrderV3 mutation error:", error as Error);
    throw error;
  }
};

export const updatePurchaseOrderV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  const { id, input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const oldRecord = await database.getPurchaseOrderV3ById(id);
    if (!oldRecord) throw new Error(`Orden de compra no encontrada: ${id}`);
    const verification = await verificationEngine.verifyBatch('PurchaseOrderV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('PurchaseOrderV3', id, verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const purchaseOrder = await database.updatePurchaseOrderV3(id, input);
    const duration = Date.now() - startTime;
    await auditLogger.logUpdate('PurchaseOrderV3', id, oldRecord, purchaseOrder, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('PURCHASE_ORDER_UPDATED', { purchaseOrderUpdated: purchaseOrder });
    console.log(`✅ updatePurchaseOrderV3 mutation updated order: ${purchaseOrder.order_number} (${duration}ms)`);
    return purchaseOrder;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('PurchaseOrderV3', id, 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ updatePurchaseOrderV3 mutation error:", error as Error);
    throw error;
  }
};

export const cancelPurchaseOrderV3 = async (
  _: unknown,
  args: { id: string; reason?: string },
  context: GraphQLContext
): Promise<any> => {
  const { id, reason } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    const oldRecord = await database.getPurchaseOrderV3ById(id);
    if (!oldRecord) throw new Error(`Orden de compra no encontrada: ${id}`);
    const purchaseOrder = await database.cancelPurchaseOrderV3(id, reason);
    const duration = Date.now() - startTime;
    await auditLogger.logStateTransition('PurchaseOrderV3', id, { field: 'status', oldValue: oldRecord.status, newValue: 'CANCELLED', reason: reason || 'User cancellation' }, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('PURCHASE_ORDER_CANCELLED', { purchaseOrderCancelled: purchaseOrder });
    console.log(`✅ cancelPurchaseOrderV3 mutation cancelled order: ${purchaseOrder.order_number} (${duration}ms)`);
    return purchaseOrder;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation('PurchaseOrderV3', id, 'unknown', { id, reason }, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ cancelPurchaseOrderV3 mutation error:", error as Error);
    throw error;
  }
};

export const receivePurchaseOrderV3 = async (
  _: unknown,
  args: { id: string; receivedBy: string },
  context: GraphQLContext
): Promise<any> => {
  const { id, receivedBy } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    const oldRecord = await database.getPurchaseOrderV3ById(id);
    if (!oldRecord) throw new Error(`Orden de compra no encontrada: ${id}`);
    const purchaseOrder = await database.receivePurchaseOrderV3(id, receivedBy);
    const duration = Date.now() - startTime;
    await auditLogger.logStateTransition('PurchaseOrderV3', id, { field: 'status', oldValue: oldRecord.status, newValue: 'RECEIVED', reason: `Received by ${receivedBy}` }, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('PURCHASE_ORDER_RECEIVED', { purchaseOrderReceived: purchaseOrder });
    console.log(`✅ receivePurchaseOrderV3 mutation received order: ${purchaseOrder.order_number} (${duration}ms)`);
    return purchaseOrder;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation('PurchaseOrderV3', id, 'unknown', { id, receivedBy }, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ receivePurchaseOrderV3 mutation error:", error as Error);
    throw error;
  }
};

// ============================================================================
// MUTATION RESOLVERS - PURCHASE ORDER ITEMS MANAGEMENT (2C)
// ============================================================================

export const addPurchaseOrderItemV3 = async (
  _: unknown,
  args: { purchaseOrderId: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  const { purchaseOrderId, input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const itemInput = { ...input, purchaseOrderId };
    const verification = await verificationEngine.verifyBatch('PurchaseOrderItemV3', itemInput);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('PurchaseOrderItemV3', 'N/A (CREATE)', verification.criticalFields[0] || 'batch', itemInput, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const item = await database.addPurchaseOrderItemV3(purchaseOrderId, input);
    const duration = Date.now() - startTime;
    await auditLogger.logCreate('PurchaseOrderItemV3', item.id, item, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('PURCHASE_ORDER_ITEM_ADDED', { itemAdded: item });
    console.log(`✅ addPurchaseOrderItemV3 mutation added item to order: ${purchaseOrderId} (${duration}ms)`);
    return item;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('PurchaseOrderItemV3', 'N/A (CREATE)', 'unknown', args, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ addPurchaseOrderItemV3 mutation error:", error as Error);
    throw error;
  }
};

export const updatePurchaseOrderItemV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  const { id, input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    const oldRecord = await database.getPurchaseOrderItemV3ById(id);
    if (!oldRecord) throw new Error(`Item de orden de compra no encontrado: ${id}`);
    const verification = await verificationEngine.verifyBatch('PurchaseOrderItemV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation('PurchaseOrderItemV3', id, verification.criticalFields[0] || 'batch', input, verification.errors[0] || verification.errors.join(', '), (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL', user?.id, user?.email, ip);
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    const item = await database.updatePurchaseOrderItemV3(id, input);
    const duration = Date.now() - startTime;
    await auditLogger.logUpdate('PurchaseOrderItemV3', id, oldRecord, item, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('PURCHASE_ORDER_ITEM_UPDATED', { itemUpdated: item });
    console.log(`✅ updatePurchaseOrderItemV3 mutation updated item ID: ${id} (${duration}ms)`);
    return item;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation('PurchaseOrderItemV3', id, 'unknown', input, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ updatePurchaseOrderItemV3 mutation error:", error as Error);
    throw error;
  }
};

export const removePurchaseOrderItemV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { id } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    const oldRecord = await database.getPurchaseOrderItemV3ById(id);
    if (!oldRecord) throw new Error(`Item de orden de compra no encontrado: ${id}`);
    await database.removePurchaseOrderItemV3(id);
    const duration = Date.now() - startTime;
    await auditLogger.logDelete('PurchaseOrderItemV3', id, oldRecord, user?.id, user?.email, ip);
    if (context.pubsub) context.pubsub.publish('PURCHASE_ORDER_ITEM_REMOVED', { itemRemoved: { id } });
    console.log(`✅ removePurchaseOrderItemV3 mutation removed item ID: ${id} (${duration}ms)`);
    return true;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation('PurchaseOrderItemV3', id, 'unknown', { id }, (error as Error).message, 'CRITICAL', user?.id, user?.email, ip);
    }
    console.error("❌ removePurchaseOrderItemV3 mutation error:", error as Error);
    throw error;
  }
};

// Export consolidated inventory mutations object
export const inventoryMutations = {
  createInventoryV3,
  updateInventoryV3,
  deleteInventoryV3,
  adjustInventoryStockV3,
  createMaterialV3,
  updateMaterialV3,
  deleteMaterialV3,
  reorderMaterialV3,
  acknowledgeInventoryAlertV3,
  createEquipmentV3,
  updateEquipmentV3,
  deleteEquipmentV3,
  scheduleMaintenanceV3,
  completeMaintenanceV3,
  cancelMaintenanceV3,
  createSupplierV3,
  updateSupplierV3,
  deleteSupplierV3,
  createPurchaseOrderV3,
  updatePurchaseOrderV3,
  addPurchaseOrderItemV3,
  updatePurchaseOrderItemV3,
  removePurchaseOrderItemV3,
};