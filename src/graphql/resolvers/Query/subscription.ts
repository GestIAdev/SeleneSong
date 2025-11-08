/**
 * 🎬 SUBSCRIPTION QUERY RESOLVERS V3
 * Netflix-Dental subscription system queries
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const subscriptionPlansV3 = async (
  _: unknown,
  args: { activeOnly?: boolean },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { activeOnly = true } = args;

    const plans = await context.database.getSubscriptionPlansV3({
      activeOnly
    });

    console.log(`✅ subscriptionPlansV3 query returned ${plans.length} plans`);
    return plans;
  } catch (error) {
    console.error("❌ subscriptionPlansV3 query error:", error as Error);
    throw error;
  }
};

export const subscriptionPlanV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const plan = await context.database.getSubscriptionPlanV3ById(args.id);

    if (!plan) {
      throw new Error(`Subscription plan not found: ${args.id}`);
    }

    console.log(`✅ subscriptionPlanV3 query returned plan: ${plan.name}`);
    return plan;
  } catch (error) {
    console.error("❌ subscriptionPlanV3 query error:", error as Error);
    throw error;
  }
};

export const subscriptionsV3 = async (
  _: unknown,
  args: {
    patientId?: string;
    status?: string;
    planId?: string;
    limit?: number;
    offset?: number;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { patientId, status, planId, limit = 50, offset = 0 } = args;

    const subscriptions = await context.database.getSubscriptionsV3({
      patientId,
      status,
      planId,
      limit,
      offset
    });

    console.log(`✅ subscriptionsV3 query returned ${subscriptions.length} subscriptions`);
    return subscriptions;
  } catch (error) {
    console.error("❌ subscriptionsV3 query error:", error as Error);
    throw error;
  }
};

export const subscriptionV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const subscription = await context.database.getSubscriptionV3ById(args.id);

    if (!subscription) {
      throw new Error(`Subscription not found: ${args.id}`);
    }

    console.log(`✅ subscriptionV3 query returned subscription for patient: ${subscription.patient_id}`);
    return subscription;
  } catch (error) {
    console.error("❌ subscriptionV3 query error:", error as Error);
    throw error;
  }
};

export const billingCyclesV3 = async (
  _: unknown,
  args: {
    subscriptionId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { subscriptionId, status, dateFrom, dateTo, limit = 50, offset = 0 } = args;

    const cycles = await context.database.getBillingCyclesV3({
      subscriptionId,
      status,
      dateFrom,
      dateTo,
      limit,
      offset
    });

    console.log(`✅ billingCyclesV3 query returned ${cycles.length} billing cycles`);
    return cycles;
  } catch (error) {
    console.error("❌ billingCyclesV3 query error:", error as Error);
    throw error;
  }
};

export const usageTrackingV3 = async (
  _: unknown,
  args: {
    subscriptionId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { subscriptionId, dateFrom, dateTo, limit = 50, offset = 0 } = args;

    const usage = await context.database.getUsageTrackingV3({
      subscriptionId,
      dateFrom,
      dateTo,
      limit,
      offset
    });

    console.log(`✅ usageTrackingV3 query returned ${usage.length} usage records`);
    return usage;
  } catch (error) {
    console.error("❌ usageTrackingV3 query error:", error as Error);
    throw error;
  }
};