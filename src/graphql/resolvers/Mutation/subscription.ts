/**
 * 🎬 SUBSCRIPTION MUTATION RESOLVERS V3
 * Netflix-Dental subscription management mutations
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// MUTATION RESOLVERS
// ============================================================================

export const createSubscriptionV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const subscription = await context.database.createSubscriptionV3(args.input);

    console.log(`✅ createSubscriptionV3 mutation created subscription: ${subscription.id}`);
    return subscription;
  } catch (error) {
    console.error("❌ createSubscriptionV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateSubscriptionV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const subscription = await context.database.updateSubscriptionV3(args.id, args.input);

    console.log(`✅ updateSubscriptionV3 mutation updated subscription: ${args.id}`);
    return subscription;
  } catch (error) {
    console.error("❌ updateSubscriptionV3 mutation error:", error as Error);
    throw error;
  }
};

export const cancelSubscriptionV3 = async (
  _: unknown,
  args: { id: string; reason?: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.cancelSubscriptionV3(args.id, args.reason);

    console.log(`✅ cancelSubscriptionV3 mutation cancelled subscription: ${args.id}`);
    return true;
  } catch (error) {
    console.error("❌ cancelSubscriptionV3 mutation error:", error as Error);
    throw error;
  }
};

export const renewSubscriptionV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const subscription = await context.database.renewSubscriptionV3(args.id);

    console.log(`✅ renewSubscriptionV3 mutation renewed subscription: ${args.id}`);
    return subscription;
  } catch (error) {
    console.error("❌ renewSubscriptionV3 mutation error:", error as Error);
    throw error;
  }
};

export const createSubscriptionPlanV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const plan = await context.database.createSubscriptionPlanV3(args.input);

    console.log(`✅ createSubscriptionPlanV3 mutation created plan: ${plan.name}`);
    return plan;
  } catch (error) {
    console.error("❌ createSubscriptionPlanV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateSubscriptionPlanV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const plan = await context.database.updateSubscriptionPlanV3(args.id, args.input);

    console.log(`✅ updateSubscriptionPlanV3 mutation updated plan: ${args.id}`);
    return plan;
  } catch (error) {
    console.error("❌ updateSubscriptionPlanV3 mutation error:", error as Error);
    throw error;
  }
};

export const processBillingCycleV3 = async (
  _: unknown,
  args: { subscriptionId: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const billingCycle = await context.database.processBillingCycleV3(args.subscriptionId);

    console.log(`✅ processBillingCycleV3 mutation processed billing for subscription: ${args.subscriptionId}`);
    return billingCycle;
  } catch (error) {
    console.error("❌ processBillingCycleV3 mutation error:", error as Error);
    throw error;
  }
};

export const trackServiceUsageV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const usage = await context.database.trackServiceUsageV3(args.input);

    console.log(`✅ trackServiceUsageV3 mutation tracked usage for subscription: ${args.input.subscriptionId}`);
    return usage;
  } catch (error) {
    console.error("❌ trackServiceUsageV3 mutation error:", error as Error);
    throw error;
  }
};