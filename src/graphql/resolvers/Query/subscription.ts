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

    // DIRECTIVA ENDER-D1-006.9-B: Extract clinic_id from user context
    // SECURITY: User must be authenticated and have clinic_id
    if (!context.user) {
      console.warn('⚠️  No authenticated user. Returning empty plans.');
      return [];
    }

    // Get clinic_id from user context (staff users should have this)
    const clinicId = (context.user as any).clinic_id || (context.user as any).clinicId;

    if (!clinicId) {
      console.warn(`⚠️  User ${context.user.id} (${context.user.role}) has no clinic_id. Returning empty plans.`);
      return [];
    }

    // Query plans filtered by clinic_id (multi-tenant isolation)
    const plans = await context.database.subscriptions.getSubscriptionPlansV3({
      clinicId,
      isActive: activeOnly
    });

    console.log(`✅ subscriptionPlansV3: ${plans.length} plans for clinic ${clinicId} (user: ${context.user.email})`);
    return plans || [];
  } catch (error) {
    console.error("❌ subscriptionPlansV3 query error:", error as Error);
    console.warn("⚠️  Returning empty array due to error");
    return [];
  }
};

export const subscriptionPlanV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    // Use specialized SubscriptionsDatabase class
    const plan = await context.database.subscriptions.getSubscriptionPlanV3ById(args.id);

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

    // Use specialized SubscriptionsDatabase class
    const subscriptions = await context.database.subscriptions.getSubscriptionsV3({
      userId: patientId, // Map patientId to userId for database method
      status,
      limit,
      offset
    });

    console.log(`✅ subscriptionsV3 query returned ${subscriptions.length} subscriptions`);
    return subscriptions || [];
  } catch (error) {
    console.error("❌ subscriptionsV3 query error:", error as Error);
    // Return empty array instead of throwing to avoid breaking non-nullable field
    console.warn("⚠️  Returning empty array due to error (table might not exist)");
    return [];
  }
};

export const subscriptionV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    // Use specialized SubscriptionsDatabase class
    const subscription = await context.database.subscriptions.getSubscriptionV3ById(args.id);

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

    // Use specialized SubscriptionsDatabase class
    const cycles = await context.database.subscriptions.getBillingCyclesV3({
      subscriptionId,
      status,
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

    // Use specialized SubscriptionsDatabase class
    const usage = await context.database.subscriptions.getUsageTrackingV3({
      subscriptionId,
      startDate: dateFrom ? new Date(dateFrom) : undefined,
      endDate: dateTo ? new Date(dateTo) : undefined,
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