/**
 * 🛒 MARKETPLACE MUTATION RESOLVERS V3
 * Mission: Provide marketplace mutations with @veritas verification
 * 
 * ARCHITECTURE:
 * - Purchase Order mutations delegated to Inventory Core (with Four-Gate Pattern)
 * - Cart mutations implement Four-Gate Pattern locally
 * - Supplier mutations delegated to Inventory Core
 */

import type { GraphQLContext } from '../../types.js';
import {
  createPurchaseOrderV3 as createPO_Inventory,
  updatePurchaseOrderV3 as updatePO_Inventory,
  createSupplierV3 as createSupplier_Inventory,
  updateSupplierV3 as updateSupplier_Inventory,
  deleteSupplierV3 as deleteSupplier_Inventory,
} from './inventory.js';

// ============================================================================
// PURCHASE ORDER MUTATIONS - DELEGATED TO INVENTORY CORE
// ============================================================================

export const createPurchaseOrderV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log('🛒 MARKETPLACE_API: Delegando createPurchaseOrderV3 a InventoryCore...');
  return createPO_Inventory(_, args, context);
};

export const updatePurchaseOrderV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log('🛒 MARKETPLACE_API: Delegando updatePurchaseOrderV3 a InventoryCore...');
  
  // Delegar a inventory (que ya tiene Four-Gate Pattern)
  const order = await updatePO_Inventory(_, args, context);

  // 🔥 DIRECTIVA 3.3: GENERACIÓN DE FACTURA DE GASTO AL COMPLETAR ORDEN DE COMPRA
  if (args.input.status === 'COMPLETED' && order.status === 'COMPLETED') {
    console.log(`🔥 ORDEN RECIBIDA: Generando entrada de gasto para PO-${order.id}...`);

    try {
      // Crear entrada de gasto usando el método existente de billing
      await context.database.billing.createBillingDataV3({
        patientId: null, // Indica que es un gasto de la clínica, no de paciente
        description: `Orden de Compra ${order.order_number || order.id} - Gasto de Inventario`,
        amount: order.total_amount || order.totalAmount || 0,
        billingDate: new Date().toISOString(),
        category: 'INVENTORY_PURCHASE',
        purchaseOrderId: order.id,
        paymentStatus: 'PENDING',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING'
      });

      console.log(`✅ Entrada de gasto creada para la orden ${order.id}.`);

      // Publicar evento de gasto creado
      context.pubsub?.publish('EXPENSE_CREATED_V3', {
        expenseCreatedV3: {
          id: `expense-${Date.now()}`,
          description: `Orden de Compra ${order.order_number || order.id}`,
          amount: order.total_amount || order.totalAmount || 0,
          category: 'INVENTORY_PURCHASE',
          purchaseOrderId: order.id,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error(`Error al crear entrada de gasto:`, error);
      // No detener la actualización de la orden de compra, solo loggear el error
    }
  }

  return order;
};

export const deletePurchaseOrderV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  console.log('🛒 MARKETPLACE_API: Delegando deletePurchaseOrderV3 a InventoryCore...');
  
  // Usar soft delete desde inventory si existe, si no, implementar aquí
  await context.database.marketplace.deletePurchaseOrderV3(args.id);
  
  console.log(`✅ deletePurchaseOrderV3 mutation deleted order ID: ${args.id}`);
  return true;
};

// ============================================================================
// CART MUTATIONS - WITH FOUR-GATE PATTERN
// ============================================================================

export const addToCartV3 = async (
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
    const verification = await verificationEngine.verifyBatch('CartItemV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation(
        'CartItemV3',
        'N/A (CREATE)',
        verification.criticalFields[0] || 'batch',
        input,
        verification.errors.join(', '),
        verification.overallSeverity || 'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      verificationFailed = true;
      throw new Error(`Error de validación del carrito: ${verification.errors.join(', ')}`);
    }

    // PUERTA 2: LÓGICA DE NEGOCIO
    // Verificar que el material existe y hay stock
    if (input.materialId) {
      const material = await database.inventory.getInventoryV3ById(input.materialId);
      if (!material) {
        throw new Error(`Material no encontrado: ${input.materialId}`);
      }
      if (material.quantity < input.quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${material.quantity}, Solicitado: ${input.quantity}`);
      }
    }

    // PUERTA 3: TRANSACCIÓN DB
    const cartItem = await database.marketplace.addToCartV3(input);

    // PUERTA 4: AUDITORÍA
    const duration = Date.now() - startTime;
    await auditLogger.logCreate(
      'CartItemV3',
      cartItem.id,
      cartItem,
      user?.id,
      user?.email,
      ip
    );

    if (context.pubsub) {
      context.pubsub.publish('CART_ITEM_ADDED', { itemAdded: cartItem });
    }

    console.log(`✅ addToCartV3 mutation added item to cart for user: ${input.userId} (${duration}ms)`);
    return cartItem;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation(
        'CartItemV3',
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
    console.error('❌ addToCartV3 mutation error:', error as Error);
    throw error;
  }
};

export const updateCartItemV3 = async (
  _: unknown,
  args: { id: string; quantity: number },
  context: GraphQLContext
): Promise<any> => {
  const { id, quantity } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // PUERTA 1: VERIFICACIÓN
    const oldItem = await database.marketplace.getCartItemById(id);
    if (!oldItem) {
      throw new Error(`Item del carrito no encontrado: ${id}`);
    }

    const input = { quantity };
    const verification = await verificationEngine.verifyBatch('CartItemV3', input);
    if (!verification.valid) {
      await auditLogger.logIntegrityViolation(
        'CartItemV3',
        id,
        verification.criticalFields[0] || 'batch',
        input,
        verification.errors.join(', '),
        verification.overallSeverity || 'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }

    // PUERTA 2: LÓGICA DE NEGOCIO
    // Verificar stock disponible
    if (oldItem.materialId) {
      const material = await database.inventory.getInventoryV3ById(oldItem.materialId);
      if (material && material.quantity < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${material.quantity}, Solicitado: ${quantity}`);
      }
    }

    // PUERTA 3: TRANSACCIÓN DB
    const updatedItem = await database.marketplace.updateCartItemV3(id, quantity);

    // PUERTA 4: AUDITORÍA
    const duration = Date.now() - startTime;
    await auditLogger.logUpdate(
      'CartItemV3',
      id,
      oldItem,
      updatedItem,
      user?.id,
      user?.email,
      ip
    );

    if (context.pubsub) {
      context.pubsub.publish('CART_ITEM_UPDATED', { itemUpdated: updatedItem });
    }

    console.log(`✅ updateCartItemV3 mutation updated cart item: ${id} (${duration}ms)`);
    return updatedItem;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation(
        'CartItemV3',
        id,
        'unknown',
        { quantity },
        (error as Error).message,
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
    }
    console.error('❌ updateCartItemV3 mutation error:', error as Error);
    throw error;
  }
};

export const removeFromCartV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { id } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    // PUERTA 1: VERIFICACIÓN
    const oldItem = await database.marketplace.getCartItemById(id);
    if (!oldItem) {
      throw new Error(`Item del carrito no encontrado: ${id}`);
    }

    // PUERTA 2: LÓGICA DE NEGOCIO (N/A para borrado simple)

    // PUERTA 3: TRANSACCIÓN DB
    // Usar soft-delete
    await database.marketplace.removeFromCartV3(id);

    // PUERTA 4: AUDITORÍA
    const duration = Date.now() - startTime;
    await auditLogger.logSoftDelete(
      'CartItemV3',
      id,
      'Item removed from cart by user',
      oldItem,
      user?.id,
      user?.email,
      ip
    );

    if (context.pubsub) {
      context.pubsub.publish('CART_ITEM_REMOVED', { itemRemoved: { id } });
    }

    console.log(`✅ removeFromCartV3 mutation removed cart item: ${id} (${duration}ms)`);
    return true;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation(
        'CartItemV3',
        id,
        'unknown',
        {},
        (error as Error).message,
        'ERROR',
        user?.id,
        user?.email,
        ip
      );
    }
    console.error('❌ removeFromCartV3 mutation error:', error as Error);
    throw error;
  }
};

export const clearCartV3 = async (
  _: unknown,
  args: { userId: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { userId } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    // PUERTA 1: VERIFICACIÓN (Opcional: verificar que el userId pertenece al usuario autenticado)
    if (user?.id && user.id !== userId) {
      throw new Error('No tienes permisos para limpiar el carrito de otro usuario');
    }

    // PUERTA 2: LÓGICA DE NEGOCIO
    // Obtener todos los items del carrito antes de borrarlos
    const cartItems = await database.marketplace.getCartItemsV3({ limit: 1000 });

    // PUERTA 3: TRANSACCIÓN DB
    await database.marketplace.clearCartV3();

    // PUERTA 4: AUDITORÍA
    const duration = Date.now() - startTime;
    await auditLogger.logBatch(
      'CartItemV3',
      'CLEAR_CART',
      `Carrito vaciado. ${cartItems.length} items removidos`,
      cartItems,
      user?.id,
      user?.email,
      ip
    );

    if (context.pubsub) {
      context.pubsub.publish('CART_CLEARED', { userId, itemsCleared: cartItems.length });
    }

    console.log(`✅ clearCartV3 mutation cleared cart for user: ${userId} (${duration}ms)`);
    return true;
  } catch (error) {
    if (auditLogger) {
      await auditLogger.logIntegrityViolation(
        'CartItemV3',
        userId,
        'unknown',
        { userId },
        (error as Error).message,
        'ERROR',
        user?.id,
        user?.email,
        ip
      );
    }
    console.error('❌ clearCartV3 mutation error:', error as Error);
    throw error;
  }
};

// ============================================================================
// SUPPLIER MUTATIONS - DELEGATED TO INVENTORY CORE
// ============================================================================

export const createSupplierV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log('🛒 MARKETPLACE_API: Delegando createSupplierV3 a InventoryCore...');
  return createSupplier_Inventory(_, args, context);
};

export const updateSupplierV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log('🛒 MARKETPLACE_API: Delegando updateSupplierV3 a InventoryCore...');
  return updateSupplier_Inventory(_, args, context);
};

export const deleteSupplierV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  console.log('🛒 MARKETPLACE_API: Delegando deleteSupplierV3 a InventoryCore...');
  return deleteSupplier_Inventory(_, args, context);
};

// Export consolidated marketplace mutations object
export const marketplaceMutations = {
  createPurchaseOrderV3,
  updatePurchaseOrderV3,
  deletePurchaseOrderV3,
  addToCartV3,
  updateCartItemV3,
  removeFromCartV3,
  clearCartV3,
  createSupplierV3,
  updateSupplierV3,
  deleteSupplierV3,
};