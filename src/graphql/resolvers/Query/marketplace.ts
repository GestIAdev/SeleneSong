/**
 * 🛒 MARKETPLACE QUERY RESOLVERS V3
 * Mission: Provide marketplace queries with @veritas verification
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const marketplaceProductsV3 = async (
  _: unknown,
  args: {
    category?: string;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
    supplierId?: string;
    verifiedOnly?: boolean;
    limit?: number;
    offset?: number;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const {
      category,
      searchTerm,
      minPrice,
      maxPrice,
      supplierId,
      verifiedOnly = false,
      limit = 50,
      offset = 0
    } = args;

    const products = await context.database.getMarketplaceProductsV3({
      supplierId,
      category,
      limit,
      offset
    });

    console.log(`✅ marketplaceProductsV3 query returned ${products.length} products`);
    return products;
  } catch (error) {
    console.error("❌ marketplaceProductsV3 query error:", error as Error);
    throw error;
  }
};

export const marketplaceProductV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const product = await context.database.getMarketplaceProductV3(args.id);

    if (!product) {
      throw new Error(`Marketplace product not found: ${args.id}`);
    }

    console.log(`✅ marketplaceProductV3 query returned product: ${product.name}`);
    return product;
  } catch (error) {
    console.error("❌ marketplaceProductV3 query error:", error as Error);
    throw error;
  }
};

export const suppliersV3 = async (
  _: unknown,
  args: {
    category?: string;
    verifiedOnly?: boolean;
    limit?: number;
    offset?: number;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { category, verifiedOnly = false, limit = 50, offset = 0 } = args;

    const suppliers = await context.database.getSuppliersV3({
      limit,
      offset
    });

    console.log(`✅ suppliersV3 query returned ${suppliers.length} suppliers`);
    return suppliers;
  } catch (error) {
    console.error("❌ suppliersV3 query error:", error as Error);
    throw error;
  }
};

export const supplierV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const supplier = await context.database.getSupplierV3ById(args.id);

    if (!supplier) {
      throw new Error(`Supplier not found: ${args.id}`);
    }

    console.log(`✅ supplierV3 query returned supplier: ${supplier.name}`);
    return supplier;
  } catch (error) {
    console.error("❌ supplierV3 query error:", error as Error);
    throw error;
  }
};

export const purchaseOrdersV3 = async (
  _: unknown,
  args: {
    status?: string;
    supplierId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { status, supplierId, dateFrom, dateTo, limit = 50, offset = 0 } = args;

    const orders = await context.database.getPurchaseOrdersV3({
      status,
      supplierId,
      limit,
      offset
    });

    console.log(`✅ purchaseOrdersV3 query returned ${orders.length} orders`);
    return orders;
  } catch (error) {
    console.error("❌ purchaseOrdersV3 query error:", error as Error);
    throw error;
  }
};

export const purchaseOrderV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const order = await context.database.getPurchaseOrderV3ById(args.id);

    if (!order) {
      throw new Error(`Purchase order not found: ${args.id}`);
    }

    console.log(`✅ purchaseOrderV3 query returned order: ${order.orderNumber}`);
    return order;
  } catch (error) {
    console.error("❌ purchaseOrderV3 query error:", error as Error);
    throw error;
  }
};

export const cartItemsV3 = async (
  _: unknown,
  args: { userId: string },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const cartItems = await context.database.getCartItemsV3({});

    console.log(`✅ cartItemsV3 query returned ${cartItems.length} cart items for user ${args.userId}`);
    return cartItems;
  } catch (error) {
    console.error("❌ cartItemsV3 query error:", error as Error);
    throw error;
  }
};