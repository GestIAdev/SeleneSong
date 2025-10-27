import { GraphQLContext } from "../../types.js";


// ============================================================================
// 🎯 APPOINTMENT V3 SUBSCRIPTION RESOLVERS - VERITAS ENHANCED
// ============================================================================

export const appointmentSubscriptions = {
  appointmentV3Created: {
    subscribe: (_: any, __: any, { pubsub }: GraphQLContext) => {
      console.log("📅 Subscribing to appointmentV3Created");
      return pubsub
        ? pubsub.asyncIterator(["APPOINTMENT_V3_CREATED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { appointmentV3Created: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("📅 Resolving appointmentV3Created:", payload);
      return payload.appointmentV3Created;
    },
  },

  appointmentV3Updated: {
    subscribe: (_: any, __: any, { pubsub }: GraphQLContext) => {
      console.log("📅 Subscribing to appointmentV3Updated");
      return pubsub
        ? pubsub.asyncIterator(["APPOINTMENT_V3_UPDATED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { appointmentV3Updated: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("📅 Resolving appointmentV3Updated:", payload);
      return payload.appointmentV3Updated;
    },
  },

  // 🔥 PHASE D: New subscription for appointment status changes
  appointmentStatusChanged: {
    subscribe: (_: any, __: any, { pubsub, auth }: GraphQLContext) => {
      console.log("📅 Subscribing to appointmentStatusChanged");

      // Check permissions - only authenticated users can subscribe
      if (!auth?.isAuthenticated) {
        throw new Error(
          "Authentication required for appointment status changes",
        );
      }

      return pubsub
        ? pubsub.asyncIterator(["APPOINTMENT_STATUS_CHANGED"])
        : {
            [Symbol.asyncIterator]: async function* () {
              // Fallback when pubsub not available
              yield { appointmentStatusChanged: null };
            },
          };
    },
    resolve: (payload: any) => {
      console.log("📅 Resolving appointmentStatusChanged:", payload);
      return payload.appointmentStatusChanged;
    },
  },
};


