import type { GraphQLContext } from '../../types.js';

export const marketplaceSubscriptionResolvers = {
  Subscription: {
    PO_STATUS_UPDATED_V3: {
      subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
        return context.pubsub?.asyncIterator(['PO_STATUS_UPDATED_V3']);
      },
    },
  },
};