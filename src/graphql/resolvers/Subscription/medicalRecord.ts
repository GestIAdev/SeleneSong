// ============================================================================
// 🩺 MEDICAL RECORD SUBSCRIPTIONS V3 - VERITAS ENHANCED
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const medicalRecordSubscriptions = {
  // Medical Record V3 Created Subscription
  medicalRecordV3Created: {
    subscribe: (_: any, __: any, { pubsub, auth }: GraphQLContext) => {
      console.log("🩺 MEDICAL RECORD V3 CREATED subscription initiated");

      // Check permissions - only authenticated users can subscribe
      if (!auth?.isAuthenticated) {
        throw new Error(
          "Authentication required for medical record subscriptions",
        );
      }

      return pubsub
        ? pubsub.asyncIterator(["MEDICAL_RECORD_V3_CREATED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { medicalRecordV3Created: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("🩺 Resolving medicalRecordV3Created:", payload);
      return payload.medicalRecordV3Created;
    },
  },

  // Medical Record V3 Updated Subscription
  medicalRecordV3Updated: {
    subscribe: (_: any, __: any, { pubsub, auth }: GraphQLContext) => {
      console.log("🩺 MEDICAL RECORD V3 UPDATED subscription initiated");

      // Check permissions - only authenticated users can subscribe
      if (!auth?.isAuthenticated) {
        throw new Error(
          "Authentication required for medical record subscriptions",
        );
      }

      return pubsub
        ? pubsub.asyncIterator(["MEDICAL_RECORD_V3_UPDATED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { medicalRecordV3Updated: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("🩺 Resolving medicalRecordV3Updated:", payload);
      return payload.medicalRecordV3Updated;
    },
  },
};


