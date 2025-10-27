// ============================================================================
// 📄 DOCUMENT SUBSCRIPTIONS - CRITICAL @veritas Protection (Biblioteca Prohibida)
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const documentSubscriptions = {
  // Documents V3 Subscriptions - CRITICAL @veritas Protection
  documentV3Created: {
    subscribe: (_: any, __: any, { pubsub, auth }: GraphQLContext) => {
      console.log("🔔 Subscribed to documentV3Created");

      // Check permissions - only authenticated users can subscribe
      if (!auth?.isAuthenticated) {
        throw new Error("Authentication required for document subscriptions");
      }

      return pubsub
        ? pubsub.asyncIterator(["DOCUMENT_V3_CREATED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { documentV3Created: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("📄 Resolving documentV3Created:", payload);
      return payload.documentV3Created;
    },
  },

  documentV3Updated: {
    subscribe: (_: any, __: any, { pubsub, auth }: GraphQLContext) => {
      console.log("🔔 Subscribed to documentV3Updated");

      // Check permissions - only authenticated users can subscribe
      if (!auth?.isAuthenticated) {
        throw new Error("Authentication required for document subscriptions");
      }

      return pubsub
        ? pubsub.asyncIterator(["DOCUMENT_V3_UPDATED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { documentV3Updated: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("📄 Resolving documentV3Updated:", payload);
      return payload.documentV3Updated;
    },
  },

  // 🔥 PHASE D: New subscription for document uploads
  documentUploaded: {
    subscribe: (_: any, __: any, { pubsub, auth }: GraphQLContext) => {
      console.log("📤 Subscribed to documentUploaded");

      // Check permissions - only authenticated users can subscribe
      if (!auth?.isAuthenticated) {
        throw new Error(
          "Authentication required for document upload subscriptions",
        );
      }

      return pubsub
        ? pubsub.asyncIterator(["DOCUMENT_UPLOADED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { documentUploaded: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("📤 Resolving documentUploaded:", payload);
      return payload.documentUploaded;
    },
  },
};


