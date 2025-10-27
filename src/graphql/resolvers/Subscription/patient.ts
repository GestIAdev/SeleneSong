// ============================================================================
// 👥 PATIENT SUBSCRIPTIONS V3 - VERITAS ENHANCED
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const patientSubscriptions = {
  // Patient V3 Created Subscription
  patientV3Created: {
    subscribe: (_: any, __: any, { pubsub, auth }: GraphQLContext) => {
      console.log("📡 PATIENT V3 CREATED subscription initiated");

      // Check permissions - only authenticated users can subscribe
      if (!auth?.isAuthenticated) {
        throw new Error("Authentication required for patient subscriptions");
      }

      return pubsub
        ? pubsub.asyncIterator(["PATIENT_CREATED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { patientV3Created: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("📡 Resolving patientV3Created:", payload);
      return payload.patientV3Created;
    },
  },

  // Patient V3 Updated Subscription
  patientV3Updated: {
    subscribe: (_: any, __: any, { pubsub, auth }: GraphQLContext) => {
      console.log("📡 PATIENT V3 UPDATED subscription initiated");

      // Check permissions - only authenticated users can subscribe
      if (!auth?.isAuthenticated) {
        throw new Error("Authentication required for patient subscriptions");
      }

      return pubsub
        ? pubsub.asyncIterator(["PATIENT_UPDATED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { patientV3Updated: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("📡 Resolving patientV3Updated:", payload);
      return payload.patientV3Updated;
    },
  },
};


