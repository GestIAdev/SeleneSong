/**
 * 🛒 MARKETPLACE MUTATION RESOLVERS V3
 * Mission: Provide marketplace mutations with @veritas verification
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// MUTATION RESOLVERS
// ============================================================================

export const createPurchaseOrderV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const order = await context.database.createPurchaseOrderV3(args.input);

    console.log(`✅ createPurchaseOrderV3 mutation created order: ${order.orderNumber}`);
    return order;
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
    const order = await context.database.updatePurchaseOrderV3(args.id, args.input);

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
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Vence en 30 días
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

    console.log(`✅ updatePurchaseOrderV3 mutation updated order: ${order.orderNumber}`);
    return order;
  } catch (error) {
    console.error("❌ updatePurchaseOrderV3 mutation error:", error as Error);
    throw error;
  }
};

export const deletePurchaseOrderV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.deletePurchaseOrderV3(args.id);

    console.log(`✅ deletePurchaseOrderV3 mutation deleted order ID: ${args.id}`);
    return true;
  } catch (error) {
    console.error("❌ deletePurchaseOrderV3 mutation error:", error as Error);
    throw error;
  }
};

export const addToCartV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const cartItem = await context.database.addToCartV3(args.input);

    console.log(`✅ addToCartV3 mutation added item to cart for user: ${args.input.userId}`);
    return cartItem;
  } catch (error) {
    console.error("❌ addToCartV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateCartItemV3 = async (
  _: unknown,
  args: { id: string; quantity: number },
  context: GraphQLContext
): Promise<any> => {
  try {
    const cartItem = await context.database.updateCartItemV3(args.id, args.quantity);

    console.log(`✅ updateCartItemV3 mutation updated cart item: ${args.id}`);
    return cartItem;
  } catch (error) {
    console.error("❌ updateCartItemV3 mutation error:", error as Error);
    throw error;
  }
};

export const removeFromCartV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.removeFromCartV3(args.id);

    console.log(`✅ removeFromCartV3 mutation removed cart item: ${args.id}`);
    return true;
  } catch (error) {
    console.error("❌ removeFromCartV3 mutation error:", error as Error);
    throw error;
  }
};

export const clearCartV3 = async (
  _: unknown,
  args: { userId: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.clearCartV3();

    console.log(`✅ clearCartV3 mutation cleared cart for user: ${args.userId}`);
    return true;
  } catch (error) {
    console.error("❌ clearCartV3 mutation error:", error as Error);
    throw error;
  }
};

export const createSupplierV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const supplier = await context.database.createSupplierV3(args.input);

    console.log(`✅ createSupplierV3 mutation created supplier: ${supplier.name}`);
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

    console.log(`✅ updateSupplierV3 mutation updated supplier: ${supplier.name}`);
    return supplier;
  } catch (error) {
    console.error("❌ updateSupplierV3 mutation error:", error as Error);
    throw error;
  }
};