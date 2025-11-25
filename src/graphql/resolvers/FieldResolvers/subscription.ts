/**
 * 🎬 SUBSCRIPTION FIELD RESOLVERS V3
 * Netflix-Dental nested field resolution with @veritas verification
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// SUBSCRIPTION V3 FIELD RESOLVERS
// ============================================================================

export const SubscriptionV3 = {
  patient: async (parent: any, _: unknown, context: GraphQLContext): Promise<any> => {
    try {
      const patient = await context.database.getPatientById(parent.patient_id);
      return patient;
    } catch (error) {
      console.error("❌ SubscriptionV3.patient resolver error:", error as Error);
      return null;
    }
  },

  plan: async (parent: any, _: unknown, context: GraphQLContext): Promise<any> => {
    console.log("🔍🔍🔍 FIELD RESOLVER: SubscriptionV3.plan CALLED");
    console.log("🔍 parent.plan_id =", parent.plan_id);
    console.log("🔍 parent keys =", Object.keys(parent));
    try {
      const rawPlan = await context.database.getSubscriptionPlanV3ById(parent.plan_id);
      console.log("🔍 Raw plan fetched:", rawPlan ? rawPlan.name : "NULL");
      
      if (!rawPlan) return null;
      
      // 🎯 INFER TIER from code/name (DB doesn't have tier column yet)
      const inferTier = (plan: any): string => {
        const code = (plan.code || '').toUpperCase();
        const name = (plan.name || '').toUpperCase();
        
        if (code.includes('ENTERPRISE') || name.includes('ENTERPRISE')) return 'ENTERPRISE';
        if (code.includes('PREMIUM') || name.includes('PREMIUM')) return 'PREMIUM';
        if (code.includes('STANDARD') || name.includes('STANDARD')) return 'STANDARD';
        return 'BASIC';
      };
      
      // 🎯 NORMALIZE: snake_case DB → camelCase GraphQL
      const plan = {
        id: rawPlan.id,
        name: rawPlan.name,
        description: rawPlan.description,
        tier: inferTier(rawPlan),  // ← INFERRED until DB migration
        price: rawPlan.price,
        currency: rawPlan.currency,
        billingCycle: rawPlan.billing_cycle,  // ← SNAKE_CASE TO CAMELCASE
        maxServicesPerMonth: rawPlan.max_services_per_month,
        maxServicesPerYear: rawPlan.max_services_per_year,
        popular: rawPlan.popular || false,
        recommended: rawPlan.recommended || false,
        active: rawPlan.active || rawPlan.is_active,  // Handle both column names
        createdAt: rawPlan.created_at?.toISOString?.() || rawPlan.created_at,
        updatedAt: rawPlan.updated_at?.toISOString?.() || rawPlan.updated_at,
        // Preserve snake_case for nested resolvers
        plan_id: rawPlan.id,
        features: rawPlan.features
      };
      
      console.log("🔍 Normalized plan:", plan);
      return plan;
    } catch (error) {
      console.error("❌ SubscriptionV3.plan resolver error:", error as Error);
      return null;
    }
  },

  billingCycles: async (parent: any, _: unknown, context: GraphQLContext): Promise<any[]> => {
    try {
      const cycles = await context.database.getBillingCyclesV3({
        subscriptionId: parent.id,
        limit: 50,
        offset: 0
      });
      return cycles;
    } catch (error) {
      console.error("❌ SubscriptionV3.billingCycles resolver error:", error as Error);
      return [];
    }
  }
};

// ============================================================================
// BILLING CYCLE V3 FIELD RESOLVERS
// ============================================================================

export const BillingCycleV3 = {
  subscription: async (parent: any, _: unknown, context: GraphQLContext): Promise<any> => {
    try {
      const subscription = await context.database.getSubscriptionV3ById(parent.subscription_id);
      return subscription;
    } catch (error) {
      console.error("❌ BillingCycleV3.subscription resolver error:", error as Error);
      return null;
    }
  },

  _veritas: (parent: any): any => {
    // Generate @veritas checksum for billing cycle data
    const checksum = require('crypto').createHash('sha256')
      .update(JSON.stringify({
        id: parent.id,
        subscriptionId: parent.subscription_id,
        amount: parent.amount,
        status: parent.status,
        cycleStartDate: parent.cycle_start_date
      }))
      .digest('hex');

    return {
      level: 'CRITICAL',
      checksum,
      lastVerified: new Date().toISOString(),
      algorithm: 'SHA-256'
    };
  }
};

// ============================================================================
// SUBSCRIPTION PLAN V3 FIELD RESOLVERS
// ============================================================================

export const SubscriptionPlanV3 = {
  features: async (parent: any, _: unknown, context: GraphQLContext): Promise<any[]> => {
    try {
      const features = await context.database.getSubscriptionPlanFeaturesV3(parent.id);
      return features;
    } catch (error) {
      console.error("❌ SubscriptionPlanV3.features resolver error:", error as Error);
      return [];
    }
  },

  _veritas: (parent: any): any => {
    // Generate @veritas checksum for plan data
    const checksum = require('crypto').createHash('sha256')
      .update(JSON.stringify({
        id: parent.id,
        name: parent.name,
        tier: parent.tier,
        price: parent.price,
        maxServicesPerMonth: parent.max_services_per_month
      }))
      .digest('hex');

    return {
      level: 'MEDIUM',
      checksum,
      lastVerified: new Date().toISOString(),
      algorithm: 'SHA-256'
    };
  }
};

// ============================================================================
// USAGE TRACKING V3 FIELD RESOLVERS
// ============================================================================

export const UsageTrackingV3 = {
  _veritas: (parent: any): any => {
    // Generate @veritas checksum for usage data
    const checksum = require('crypto').createHash('sha256')
      .update(JSON.stringify({
        id: parent.id,
        subscriptionId: parent.subscription_id,
        serviceType: parent.service_type,
        cost: parent.cost,
        usageDate: parent.usage_date
      }))
      .digest('hex');

    return {
      level: 'MEDIUM',
      checksum,
      lastVerified: new Date().toISOString(),
      algorithm: 'SHA-256'
    };
  }
};

// ============================================================================
// SUBSCRIPTION FEATURE V3 FIELD RESOLVERS
// ============================================================================

export const SubscriptionFeatureV3 = {
  _veritas: (parent: any): any => {
    // Generate @veritas checksum for feature data
    const checksum = require('crypto').createHash('sha256')
      .update(JSON.stringify({
        id: parent.id,
        planId: parent.plan_id,
        name: parent.name,
        included: parent.included,
        limit: parent.limit
      }))
      .digest('hex');

    return {
      level: 'LOW',
      checksum,
      lastVerified: new Date().toISOString(),
      algorithm: 'SHA-256'
    };
  }
};