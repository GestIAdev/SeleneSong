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
  try {
    const inventory = await context.database.createInventoryV3(args.input);

    console.log(`✅ createInventoryV3 mutation created: ${inventory.name}`);
    return inventory;
  } catch (error) {
    console.error("❌ createInventoryV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateInventoryV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const inventory = await context.database.updateInventoryV3(args.id, args.input);

    console.log(`✅ updateInventoryV3 mutation updated: ${inventory.name}`);
    return inventory;
  } catch (error) {
    console.error("❌ updateInventoryV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteInventoryV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.deleteInventoryV3(args.id);

    console.log(`✅ deleteInventoryV3 mutation deleted ID: ${args.id}`);
    return true;
  } catch (error) {
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

export const approvePurchaseOrderV3 = async (
  _: unknown,
  args: { id: string; approverId: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const purchaseOrder = await context.database.approvePurchaseOrderV3(args.id, args.approverId);

    console.log(`✅ approvePurchaseOrderV3 mutation approved order: ${purchaseOrder.order_number}`);
    return purchaseOrder;
  } catch (error) {
    console.error("❌ approvePurchaseOrderV3 mutation error:", error as Error);
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
  args: { id: string; receivedItems: any[] },
  context: GraphQLContext
): Promise<any> => {
  try {
    const purchaseOrder = await context.database.receivePurchaseOrderV3(args.id, args.receivedItems);

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