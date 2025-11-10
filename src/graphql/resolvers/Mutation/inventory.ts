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
  try {
    const inventory = await context.database.adjustInventoryStockV3(args.id, args.adjustment, args.reason);

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
        // Usar el método existente createPurchaseOrderV3
        const reorderQuantity = inventory.minimum_stock * 2; // Pedir el doble del stock mínimo
        const po = await context.database.createPurchaseOrderV3({
          supplierId: inventory.supplier_id,
          items: [{
            materialId: inventory.id,
            quantity: reorderQuantity,
            unitPrice: inventory.unit_cost || 0
          }],
          notes: `Auto-reorder triggered by low stock alert for ${inventory.name}`
        });

        console.log(`✅ Orden de compra automática (PO-${po.id}) creada para ${inventory.name}.`);

        // Publicar evento de orden de compra creada
        context.pubsub?.publish('PURCHASE_ORDER_V3_CREATED', {
          purchaseOrderV3Created: po
        });

      } catch (error) {
        console.error(`Error al crear orden de compra automática:`, error);
        // No detener el ajuste de inventario, solo loggear el error
      }
    }

    console.log(`✅ adjustInventoryStockV3 mutation adjusted stock for: ${inventory.name}`);
    return inventory;
  } catch (error) {
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
  try {
    const material = await context.database.createMaterialV3(args.input);

    console.log(`✅ createMaterialV3 mutation created: ${material.name}`);
    return material;
  } catch (error) {
    console.error("❌ createMaterialV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateMaterialV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const material = await context.database.updateMaterialV3(args.id, args.input);

    console.log(`✅ updateMaterialV3 mutation updated: ${material.name}`);
    return material;
  } catch (error) {
    console.error("❌ updateMaterialV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteMaterialV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.deleteMaterialV3(args.id);

    console.log(`✅ deleteMaterialV3 mutation deleted ID: ${args.id}`);
    return true;
  } catch (error) {
    console.error("❌ deleteMaterialV3 mutation error:", error as Error);
    throw error;
  }
};

export const reorderMaterialV3 = async (
  _: unknown,
  args: { materialId: string; quantity: number; supplierId?: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const reorder = await context.database.reorderMaterialV3(args.materialId, args.quantity, args.supplierId);

    console.log(`✅ reorderMaterialV3 mutation created reorder for material: ${args.materialId}`);
    return reorder;
  } catch (error) {
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
  try {
    await context.database.acknowledgeInventoryAlertV3(args.alertId);

    console.log(`✅ acknowledgeInventoryAlertV3 mutation acknowledged alert: ${args.alertId}`);
    return true;
  } catch (error) {
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
  try {
    const equipment = await context.database.createEquipmentV3(args.input);

    console.log(`✅ createEquipmentV3 mutation created: ${equipment.name}`);
    return equipment;
  } catch (error) {
    console.error("❌ createEquipmentV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateEquipmentV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const equipment = await context.database.updateEquipmentV3(args.id, args.input);

    console.log(`✅ updateEquipmentV3 mutation updated: ${equipment.name}`);
    return equipment;
  } catch (error) {
    console.error("❌ updateEquipmentV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteEquipmentV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.deleteEquipmentV3(args.id);

    console.log(`✅ deleteEquipmentV3 mutation deleted ID: ${args.id}`);
    return true;
  } catch (error) {
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
  try {
    const maintenance = await context.database.createMaintenanceV3(args.input);

    console.log(`✅ createMaintenanceV3 mutation created maintenance for equipment: ${args.input.equipmentId}`);
    return maintenance;
  } catch (error) {
    console.error("❌ createMaintenanceV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateMaintenanceV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const maintenance = await context.database.updateMaintenanceV3(args.id, args.input);

    console.log(`✅ updateMaintenanceV3 mutation updated maintenance ID: ${maintenance.id}`);
    return maintenance;
  } catch (error) {
    console.error("❌ updateMaintenanceV3 mutation error:", error as Error);
    throw error;
  }
};

export const completeMaintenanceV3 = async (
  _: unknown,
  args: { id: string; completionNotes?: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const maintenance = await context.database.completeMaintenanceV3(args.id, args.completionNotes);

    console.log(`✅ completeMaintenanceV3 mutation completed maintenance ID: ${maintenance.id}`);
    return maintenance;
  } catch (error) {
    console.error("❌ completeMaintenanceV3 mutation error:", error as Error);
    throw error;
  }
};

export const scheduleMaintenanceV3 = async (
  _: unknown,
  args: { equipmentId: string; scheduledDate: string; maintenanceType: string; description?: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const maintenance = await context.database.scheduleMaintenanceV3(args.equipmentId, args.scheduledDate, args.maintenanceType, args.description);

    console.log(`✅ scheduleMaintenanceV3 mutation scheduled maintenance for equipment: ${args.equipmentId}`);
    return maintenance;
  } catch (error) {
    console.error("❌ scheduleMaintenanceV3 mutation error:", error as Error);
    throw error;
  }
};

export const cancelMaintenanceV3 = async (
  _: unknown,
  args: { id: string; reason?: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.cancelMaintenanceV3(args.id, args.reason);

    console.log(`✅ cancelMaintenanceV3 mutation cancelled maintenance ID: ${args.id}`);
    return true;
  } catch (error) {
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
  try {
    const supplier = await context.database.createSupplierV3(args.input);

    console.log(`✅ createSupplierV3 mutation created: ${supplier.name}`);
    return supplier;
  } catch (error) {
    console.error("❌ createSupplierV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateSupplierV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const supplier = await context.database.updateSupplierV3(args.id, args.input);

    console.log(`✅ updateSupplierV3 mutation updated: ${supplier.name}`);
    return supplier;
  } catch (error) {
    console.error("❌ updateSupplierV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteSupplierV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.deleteSupplierV3(args.id);

    console.log(`✅ deleteSupplierV3 mutation deleted ID: ${args.id}`);
    return true;
  } catch (error) {
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
  try {
    const purchaseOrder = await context.database.createPurchaseOrderV3(args.input);

    console.log(`✅ createPurchaseOrderV3 mutation created order: ${purchaseOrder.order_number}`);
    return purchaseOrder;
  } catch (error) {
    console.error("❌ createPurchaseOrderV3 mutation error:", error as Error);
    throw error;
  }
};

export const updatePurchaseOrderV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const purchaseOrder = await context.database.updatePurchaseOrderV3(args.id, args.input);

    console.log(`✅ updatePurchaseOrderV3 mutation updated order: ${purchaseOrder.order_number}`);
    return purchaseOrder;
  } catch (error) {
    console.error("❌ updatePurchaseOrderV3 mutation error:", error as Error);
    throw error;
  }
};

export const cancelPurchaseOrderV3 = async (
  _: unknown,
  args: { id: string; reason?: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const purchaseOrder = await context.database.cancelPurchaseOrderV3(args.id, args.reason);

    console.log(`✅ cancelPurchaseOrderV3 mutation cancelled order: ${purchaseOrder.order_number}`);
    return purchaseOrder;
  } catch (error) {
    console.error("❌ cancelPurchaseOrderV3 mutation error:", error as Error);
    throw error;
  }
};

export const receivePurchaseOrderV3 = async (
  _: unknown,
  args: { id: string; receivedBy: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const purchaseOrder = await context.database.receivePurchaseOrderV3(args.id, args.receivedBy);

    console.log(`✅ receivePurchaseOrderV3 mutation received order: ${purchaseOrder.order_number}`);
    return purchaseOrder;
  } catch (error) {
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
  try {
    const item = await context.database.addPurchaseOrderItemV3(args.purchaseOrderId, args.input);

    console.log(`✅ addPurchaseOrderItemV3 mutation added item to order: ${args.purchaseOrderId}`);
    return item;
  } catch (error) {
    console.error("❌ addPurchaseOrderItemV3 mutation error:", error as Error);
    throw error;
  }
};

export const updatePurchaseOrderItemV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const item = await context.database.updatePurchaseOrderItemV3(args.id, args.input);

    console.log(`✅ updatePurchaseOrderItemV3 mutation updated item ID: ${args.id}`);
    return item;
  } catch (error) {
    console.error("❌ updatePurchaseOrderItemV3 mutation error:", error as Error);
    throw error;
  }
};

export const removePurchaseOrderItemV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.removePurchaseOrderItemV3(args.id);

    console.log(`✅ removePurchaseOrderItemV3 mutation removed item ID: ${args.id}`);
    return true;
  } catch (error) {
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