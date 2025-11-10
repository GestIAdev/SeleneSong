/**
 * 📦 INVENTORY SUBSCRIPTION RESOLVERS V3 - REAL-TIME INVENTORY UPDATES
 * Real-time GraphQL subscriptions for inventory system
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// SUBSCRIPTION RESOLVERS - REAL-TIME INVENTORY UPDATES
// ============================================================================

export const inventoryUpdatedV3 = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('INVENTORY_UPDATED_V3');
  },
};

export const lowStockAlertV3 = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('LOW_STOCK_ALERT_V3');
  },
};

export const purchaseOrderStatusV3 = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('PO_STATUS_UPDATED_V3');
  },
};

// ============================================================================
// EXPORT ALL INVENTORY SUBSCRIPTION RESOLVERS
// ============================================================================

export const inventorySubscriptions = {
  inventoryUpdatedV3,
  lowStockAlertV3,
  purchaseOrderStatusV3,
};