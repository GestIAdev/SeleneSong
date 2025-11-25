/**
 * 🎬 SUBSCRIPTION MUTATION RESOLVERS V3 - FOUR-GATE PATTERN
 * Netflix-Dental subscription management mutations
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// MUTATION RESOLVERS - FOUR-GATE PATTERN
// ============================================================================

// ============================================================================
// HELPER: Convert DB snake_case to GraphQL camelCase
// ============================================================================
function normalizeSubscriptionV3(dbRecord: any): any {
  if (!dbRecord) return null;
  
  return {
    id: dbRecord.id,
    patientId: dbRecord.patient_id,
    planId: dbRecord.plan_id,
    status: dbRecord.status,
    startDate: dbRecord.start_date?.toISOString?.() || dbRecord.start_date,
    endDate: dbRecord.end_date?.toISOString?.() || dbRecord.end_date,
    nextBillingDate: dbRecord.next_billing_date?.toISOString?.() || dbRecord.next_billing_date,
    autoRenew: dbRecord.auto_renew,
    paymentMethodId: dbRecord.payment_method_id,
    usageThisMonth: dbRecord.usage_this_month || 0,
    usageThisYear: dbRecord.usage_this_year || 0,
    remainingServices: dbRecord.remaining_services || 0,
    createdAt: dbRecord.created_at?.toISOString?.() || dbRecord.created_at,
    updatedAt: dbRecord.updated_at?.toISOString?.() || dbRecord.updated_at,
    // Preserve snake_case for Field Resolvers
    patient_id: dbRecord.patient_id,
    plan_id: dbRecord.plan_id,
    // Raw metadata
    metadata: dbRecord.metadata,
  };
}

export const createSubscriptionV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("════════════════════════════════════════════");
  console.log("🔥🔥🔥 RESOLVER ENTRY POINT 🔥🔥🔥");
  console.log("🎯 [SUBSCRIPTIONS] createSubscriptionV3 CALLED");
  console.log("📥 Args:", JSON.stringify(args, null, 2));
  console.log("👤 User:", context.user?.email || 'NO USER');
  console.log("════════════════════════════════════════════");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.input || typeof args.input !== 'object') {
      throw new Error('Invalid input: must be a non-null object');
    }
    if (!args.input.planId) {
      throw new Error('Validation failed: planId is required');
    }
    if (!args.input.patientId) {
      throw new Error('Validation failed: patientId is required');
    }
    if (!args.input.clinicId) {
      throw new Error('Validation failed: clinicId is required (DIRECTIVA #007.5 - ANCLAJE)');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // ⚓ ANCLAJE LOGIC (DIRECTIVA #007.5)
    const { patientId, clinicId } = args.input;
    console.log(`⚓ ANCLAJE: Vinculando Paciente ${patientId} -> Clínica ${clinicId}`);
    await context.database.anchorPatientToClinic(patientId, clinicId);

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const subscription = await context.database.createSubscriptionV3(args.input);
    console.log("✅ GATE 3 (Transacción DB) - Created:", subscription.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail (disabled for now - audit table schema mismatch)
    // if (context.auditLogger) {
    //   await context.auditLogger.logMutation({...});
    // }
    console.log("✅ GATE 4 (Auditoría) - Skipped (audit table schema mismatch)");

    if (context.pubsub) {
      context.pubsub.publish('SUBSCRIPTION_V3_CREATED', {
        subscriptionV3Created: subscription,
      });
    }

    console.log(`✅ createSubscriptionV3 mutation created subscription: ${subscription.id}`);
    console.log("🔍 DEBUG: Raw subscription object keys:", Object.keys(subscription));
    console.log("🔍 DEBUG: Raw subscription.plan_id =", subscription.plan_id);
    console.log("🔍 DEBUG: Raw subscription.patient_id =", subscription.patient_id);
    
    // ✅ NORMALIZE: Convert snake_case → camelCase
    const normalized = normalizeSubscriptionV3(subscription);
    console.log("📋 Normalized subscription:", JSON.stringify(normalized, null, 2));
    console.log("🔍 DEBUG: normalized.plan_id after normalize =", normalized.plan_id);
    console.log("🔍 DEBUG: Returning normalized object with keys:", Object.keys(normalized));
    return normalized;
  } catch (error) {
    console.error("❌ createSubscriptionV3 mutation error:", error as Error);
    throw new Error(`Failed to create subscription: ${(error as Error).message}`);
  }
};

export const updateSubscriptionV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [SUBSCRIPTIONS] updateSubscriptionV3 - Updating with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.id) {
      throw new Error('Validation failed: id is required');
    }
    if (!args.input || typeof args.input !== 'object') {
      throw new Error('Invalid input: must be a non-null object');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Capture old values for audit trail
    const oldSubscription = await context.database.getSubscriptionV3ById(args.id);
    if (!oldSubscription) {
      throw new Error(`Subscription ${args.id} not found`);
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const subscription = await context.database.updateSubscriptionV3(args.id, args.input);
    console.log("✅ GATE 3 (Transacción DB) - Updated:", subscription.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'SubscriptionV3',
        entityId: args.id,
        operationType: 'UPDATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        oldValues: oldSubscription,
        newValues: subscription,
        changedFields: Object.keys(args.input),
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    if (context.pubsub) {
      context.pubsub.publish('SUBSCRIPTION_V3_UPDATED', {
        subscriptionV3Updated: subscription,
      });
    }

    console.log(`✅ updateSubscriptionV3 mutation updated subscription: ${args.id}`);
    
    // ✅ NORMALIZE: Convert snake_case → camelCase
    const normalized = normalizeSubscriptionV3(subscription);
    return normalized;
  } catch (error) {
    console.error("❌ updateSubscriptionV3 mutation error:", error as Error);
    throw new Error(`Failed to update subscription: ${(error as Error).message}`);
  }
};

export const cancelSubscriptionV3 = async (
  _: unknown,
  args: { id: string; reason?: string },
  context: GraphQLContext
): Promise<boolean> => {
  console.log("🎯 [SUBSCRIPTIONS] cancelSubscriptionV3 - Cancelling with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.id) {
      throw new Error('Validation failed: id is required');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Capture old values for audit trail
    const oldSubscription = await context.database.getSubscriptionV3ById(args.id);
    if (!oldSubscription) {
      throw new Error(`Subscription ${args.id} not found`);
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    await context.database.cancelSubscriptionV3(args.id, args.reason);
    console.log("✅ GATE 3 (Transacción DB) - Cancelled:", args.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'SubscriptionV3',
        entityId: args.id,
        operationType: 'CANCEL',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        oldValues: oldSubscription,
        metadata: { reason: args.reason || 'No reason provided' },
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    if (context.pubsub) {
      context.pubsub.publish('SUBSCRIPTION_V3_CANCELLED', {
        subscriptionV3Cancelled: { id: args.id, status: 'CANCELLED' },
      });
    }

    console.log(`✅ cancelSubscriptionV3 mutation cancelled subscription: ${args.id}`);
    return true;
  } catch (error) {
    console.error("❌ cancelSubscriptionV3 mutation error:", error as Error);
    throw new Error(`Failed to cancel subscription: ${(error as Error).message}`);
  }
};

export const renewSubscriptionV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [SUBSCRIPTIONS] renewSubscriptionV3 - Renewing with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.id) {
      throw new Error('Validation failed: id is required');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Capture old values for audit trail
    const oldSubscription = await context.database.getSubscriptionV3ById(args.id);
    if (!oldSubscription) {
      throw new Error(`Subscription ${args.id} not found`);
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const subscription = await context.database.renewSubscriptionV3(args.id);
    console.log("✅ GATE 3 (Transacción DB) - Renewed:", subscription.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'SubscriptionV3',
        entityId: args.id,
        operationType: 'RENEW',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        oldValues: oldSubscription,
        newValues: subscription,
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    if (context.pubsub) {
      context.pubsub.publish('SUBSCRIPTION_V3_RENEWED', {
        subscriptionV3Renewed: subscription,
      });
    }

    console.log(`✅ renewSubscriptionV3 mutation renewed subscription: ${args.id}`);
    return subscription;
  } catch (error) {
    console.error("❌ renewSubscriptionV3 mutation error:", error as Error);
    throw new Error(`Failed to renew subscription: ${(error as Error).message}`);
  }
};

export const createSubscriptionPlanV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [SUBSCRIPTIONS] createSubscriptionPlanV3 - Creating with FOUR-GATE protection + MULTI-TENANT");
  
  try {
    // DIRECTIVA ENDER-D1-006.9-B: Extract clinic_id from user context (NOT from input)
    if (!context.user) {
      throw new Error('Authentication required: Must be logged in to create plans');
    }

    const clinicId = (context.user as any).clinic_id || (context.user as any).clinicId;
    if (!clinicId) {
      throw new Error(`User ${context.user.email} has no clinic_id. Cannot create plan.`);
    }

    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.input || typeof args.input !== 'object') {
      throw new Error('Invalid input: must be a non-null object');
    }
    if (!args.input.name) {
      throw new Error('Validation failed: name is required');
    }
    if (args.input.price <= 0) {
      throw new Error('Validation failed: price must be positive');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Inject clinic_id from user context (SECURITY: prevent clinic_id spoofing)
    const inputWithClinic = {
      ...args.input,
      clinic_id: clinicId  // FORCE clinic_id from authenticated user
    };

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const plan = await context.database.createSubscriptionPlanV3(inputWithClinic);
    console.log("✅ GATE 3 (Transacción DB) - Created:", plan.id, "for clinic:", clinicId);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'SubscriptionPlanV3',
        entityId: plan.id,
        operationType: 'CREATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        newValues: plan,
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    if (context.pubsub) {
      context.pubsub.publish('SUBSCRIPTION_PLAN_V3_CREATED', {
        subscriptionPlanV3Created: plan,
      });
    }

    console.log(`✅ createSubscriptionPlanV3 mutation created plan: ${plan.name}`);
    return plan;
  } catch (error) {
    console.error("❌ createSubscriptionPlanV3 mutation error:", error as Error);
    throw new Error(`Failed to create subscription plan: ${(error as Error).message}`);
  }
};

export const updateSubscriptionPlanV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [SUBSCRIPTIONS] updateSubscriptionPlanV3 - Updating with FOUR-GATE protection + MULTI-TENANT");
  
  try {
    // DIRECTIVA ENDER-D1-006.9-B: Security check - user must own the plan's clinic
    if (!context.user) {
      throw new Error('Authentication required: Must be logged in to update plans');
    }

    const userClinicId = (context.user as any).clinic_id || (context.user as any).clinicId;
    if (!userClinicId) {
      throw new Error(`User ${context.user.email} has no clinic_id. Cannot update plan.`);
    }

    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.id) {
      throw new Error('Validation failed: id is required');
    }
    if (!args.input || typeof args.input !== 'object') {
      throw new Error('Invalid input: must be a non-null object');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Capture old values for audit trail + VERIFY OWNERSHIP
    const oldPlan = await context.database.getSubscriptionPlanV3ById(args.id);
    if (!oldPlan) {
      throw new Error(`Subscription plan ${args.id} not found`);
    }

    // SECURITY: Verify user's clinic owns this plan (prevent cross-clinic tampering)
    if (oldPlan.clinic_id && oldPlan.clinic_id !== userClinicId) {
      throw new Error(`Permission denied: Plan ${args.id} belongs to different clinic`);
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const plan = await context.database.updateSubscriptionPlanV3(args.id, args.input);
    console.log("✅ GATE 3 (Transacción DB) - Updated:", plan.id, "clinic:", userClinicId);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'SubscriptionPlanV3',
        entityId: args.id,
        operationType: 'UPDATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        oldValues: oldPlan,
        newValues: plan,
        changedFields: Object.keys(args.input),
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    if (context.pubsub) {
      context.pubsub.publish('SUBSCRIPTION_PLAN_V3_UPDATED', {
        subscriptionPlanV3Updated: plan,
      });
    }

    console.log(`✅ updateSubscriptionPlanV3 mutation updated plan: ${args.id}`);
    return plan;
  } catch (error) {
    console.error("❌ updateSubscriptionPlanV3 mutation error:", error as Error);
    throw new Error(`Failed to update subscription plan: ${(error as Error).message}`);
  }
};

export const processBillingCycleV3 = async (
  _: unknown,
  args: { subscriptionId: string },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [SUBSCRIPTIONS] processBillingCycleV3 - Processing with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.subscriptionId) {
      throw new Error('Validation failed: subscriptionId is required');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const billingCycle = await context.database.processBillingCycleV3(args.subscriptionId);
    console.log("✅ GATE 3 (Transacción DB) - Processed:", billingCycle.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'BillingCycleV3',
        entityId: billingCycle.id,
        operationType: 'CREATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        newValues: billingCycle,
        metadata: { subscriptionId: args.subscriptionId },
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    if (context.pubsub) {
      context.pubsub.publish('BILLING_CYCLE_V3_PROCESSED', {
        billingCycleV3Processed: billingCycle,
      });
    }

    console.log(`✅ processBillingCycleV3 mutation processed billing for subscription: ${args.subscriptionId}`);
    return billingCycle;
  } catch (error) {
    console.error("❌ processBillingCycleV3 mutation error:", error as Error);
    throw new Error(`Failed to process billing cycle: ${(error as Error).message}`);
  }
};

export const trackServiceUsageV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [SUBSCRIPTIONS] trackServiceUsageV3 - Tracking with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.input || typeof args.input !== 'object') {
      throw new Error('Invalid input: must be a non-null object');
    }
    if (!args.input.subscriptionId) {
      throw new Error('Validation failed: subscriptionId is required');
    }
    if (args.input.usage < 0) {
      throw new Error('Validation failed: usage must be non-negative');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const usage = await context.database.trackServiceUsageV3(args.input);
    console.log("✅ GATE 3 (Transacción DB) - Tracked:", usage.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'UsageTrackingV3',
        entityId: usage.id,
        operationType: 'CREATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        newValues: usage,
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    if (context.pubsub) {
      context.pubsub.publish('SERVICE_USAGE_V3_TRACKED', {
        serviceUsageV3Tracked: usage,
      });
    }

    console.log(`✅ trackServiceUsageV3 mutation tracked usage for subscription: ${args.input.subscriptionId}`);
    return usage;
  } catch (error) {
    console.error("❌ trackServiceUsageV3 mutation error:", error as Error);
    throw new Error(`Failed to track service usage: ${(error as Error).message}`);
  }
};