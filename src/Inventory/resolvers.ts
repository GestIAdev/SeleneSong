import { GraphQLContext } from "../graphql/types.js";

/**
 * ⚠️ DEPRECATED FIELD RESOLVER
 *
 * La Fuente Única de Verdad (SSoT) para field resolvers está en:
 * /graphql/resolvers/FieldResolvers/inventory.ts
 *
 * Este archivo SOLO mantiene las QUERIES/MUTATIONS/SUBSCRIPTIONS de negocio.
 * Los field resolvers (InventoryV3, MaterialV3, etc.) se importan desde SSoT.
 */

// NOTE: InventoryV3 field resolver MOVED to /graphql/resolvers/FieldResolvers/inventory.ts
// This prevents duplicate type definitions that cause GraphQL schema validation errors

export const InventoryQuery = {
  inventoriesV3: async (_: any, { category, limit = 50, offset = 0 }: any, ctx: GraphQLContext) => {
    try {
      // Use specialized InventoryDatabase class
      const inventories = await ctx.database.inventory.getInventoriesV3({
        category,
        limit,
        offset
      });

      console.log(`✅ inventoriesV3 query returned ${inventories.length} inventory items`);
      return inventories;
    } catch (error) {
      console.error("❌ inventoriesV3 query error:", error as Error);
      throw error;
    }
  },
  inventoryV3: async (_: any, { id }: any, ctx: GraphQLContext) => {
    try {
      // Use specialized InventoryDatabase class
      const inventory = await ctx.database.inventory.getInventoryV3ById(id);

      if (!inventory) {
        throw new Error(`Inventory item not found: ${id}`);
      }

      console.log(`✅ inventoryV3 query returned inventory item: ${inventory.itemName}`);
      return inventory;
    } catch (error) {
      console.error("❌ inventoryV3 query error:", error as Error);
      throw error;
    }
  },
};

export const InventoryMutation = {
  createInventoryV3: async (_: any, { input }: any, ctx: GraphQLContext) => {
    try {
      // Use specialized InventoryDatabase class
      const item = await ctx.database.inventory.createInventoryV3(input);

      // Publish subscription event
      if (ctx.pubsub) {
        ctx.pubsub.publish("INVENTORY_V3_CREATED", { inventoryV3Created: item });
      }

      console.log(`✅ createInventoryV3 mutation created inventory item: ${item.name}`);
      return item;
    } catch (error) {
      console.error("❌ createInventoryV3 mutation error:", error as Error);
      throw error;
    }
  },
  updateInventoryV3: async (
    _: any,
    { id, input }: any,
    ctx: GraphQLContext,
  ) => {
    try {
      // Use specialized InventoryDatabase class
      const item = await ctx.database.inventory.updateInventoryV3(id, input);

      if (!item) {
        throw new Error(`Inventory item not found: ${id}`);
      }

      // ============================================================================
      // BUSINESS LOGIC: AUTO-ORDER SYSTEM
      // Check if stock dropped below minimum and auto-reorder is enabled
      // ============================================================================
      const newStock = input.currentStock !== undefined ? input.currentStock : item.current_stock;
      const minimumStock = item.minimum_stock || 10;

      if (newStock < minimumStock) {
        console.log(`⚠️ Stock below minimum for ${item.name}: ${newStock} < ${minimumStock}`);

        // Check if we should auto-create a purchase order
        // (In real system, you'd check a flag like item.auto_reorder_enabled)
        const autoReorderEnabled = true; // TODO: Get from item settings

        if (autoReorderEnabled) {
          try {
            // Create auto purchase order
            const reorderQuantity = (minimumStock * 2) - newStock; // Restock to double minimum
            const supplierId = item.supplier_id;

            if (supplierId) {
              // Get supplier info
              const supplier = await ctx.database.inventory.getSupplierById(supplierId);

              if (supplier) {
                // Create purchase order using MarketplaceDatabase
                const purchaseOrder = await ctx.database.marketplace.createPurchaseOrderV3({
                  supplierId,
                  items: [
                    {
                      materialId: id,
                      quantity: reorderQuantity,
                      unitPrice: item.unit_cost || 0
                    }
                  ],
                  notes: `AUTO-ORDER: Stock dropped below minimum (${newStock} < ${minimumStock})`
                });

                console.log(`🤖 AUTO-ORDER CREATED: PO ${purchaseOrder.id} for ${reorderQuantity} units of ${item.name}`);

                // Publish low stock alert subscription
                if (ctx.pubsub) {
                  ctx.pubsub.publish('STOCK_LEVEL_CHANGED', {
                    stockLevelChanged: {
                      id: item.id,
                      itemName: item.name,
                      itemCode: item.id,
                      quantity: newStock,
                      category: item.category,
                      unitPrice: item.unit_cost || 0,
                      isActive: true,
                      createdAt: item.created_at,
                      updatedAt: item.updated_at
                    }
                  });
                }
              } else {
                console.warn(`⚠️ Supplier not found: ${supplierId}`);
              }
            } else {
              console.warn(`⚠️ No supplier assigned for ${item.name} - cannot auto-order`);
            }
          } catch (orderError) {
            console.error(`❌ Error creating auto-order:`, orderError);
            // Don't throw - inventory update should succeed even if auto-order fails
          }
        }
      }

      // Publish subscription event
      if (ctx.pubsub) {
        ctx.pubsub.publish("INVENTORY_V3_UPDATED", { inventoryV3Updated: item });
      }

      console.log(`✅ updateInventoryV3 mutation updated inventory item: ${item.name}`);
      return item;
    } catch (error) {
      console.error("❌ updateInventoryV3 mutation error:", error as Error);
      throw error;
    }
  },
  deleteInventoryV3: async (_: any, { id }: any, ctx: GraphQLContext) => {
    try {
      // Check if item exists before deletion
      const existingItem = await ctx.database.inventory.getInventoryV3ById(id);
      if (!existingItem) {
        throw new Error(`Inventory item not found: ${id}`);
      }

      // Use specialized InventoryDatabase class
      await ctx.database.inventory.deleteInventoryV3(id);

      const deletedItem = { id, deleted: true };

      // Publish subscription event
      if (ctx.pubsub) {
        ctx.pubsub.publish("INVENTORY_V3_DELETED", {
          inventoryV3Deleted: deletedItem,
        });
      }

      console.log(`✅ deleteInventoryV3 mutation deleted inventory item: ${id}`);
      return deletedItem;
    } catch (error) {
      console.error("❌ deleteInventoryV3 mutation error:", error as Error);
      throw error;
    }
  },
};

export const InventorySubscription = {
  inventoryV3Created: {
    subscribe: (_: any, __: any, { pubsub }: any) =>
      pubsub
        ? pubsub.asyncIterator(["INVENTORY_V3_CREATED"])
        : { [Symbol.asyncIterator]: async function* () {} },
  },
  inventoryV3Updated: {
    subscribe: (_: any, __: any, { pubsub }: any) =>
      pubsub
        ? pubsub.asyncIterator(["INVENTORY_V3_UPDATED"])
        : { [Symbol.asyncIterator]: async function* () {} },
  },
  inventoryV3Deleted: {
    subscribe: (_: any, __: any, { pubsub }: any) =>
      pubsub
        ? pubsub.asyncIterator(["INVENTORY_V3_DELETED"])
        : { [Symbol.asyncIterator]: async function* () {} },
  },
  stockLevelChanged: {
    subscribe: (_: any, { _itemId, _threshold }: any, { pubsub }: any) => {
      if (!pubsub) return { [Symbol.asyncIterator]: async function* () {} };
      return pubsub.asyncIterator(["STOCK_LEVEL_CHANGED"]);
    },
  },
};


