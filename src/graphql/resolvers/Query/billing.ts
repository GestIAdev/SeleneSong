/**
 * 💰 BILLING QUERY RESOLVERS V3
 * Mission: Provide billing data queries with @veritas verification
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const billingDataV3 = async (
  _: unknown,
  args: { patientId?: string; limit?: number; offset?: number },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { patientId, limit = 50, offset = 0 } = args;

    // Use specialized BillingDatabase class
    const billingData = await context.database.billing.getBillingDataV3({
      patientId,
      limit,
      offset
    });

    console.log(`✅ billingDataV3 query returned ${billingData.length} billing records`);
    return billingData;
  } catch (error) {
    console.error("❌ billingDataV3 query error:", error as Error);
    throw error;
  }
};

export const billingDatumV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    // Use specialized BillingDatabase class
    const billingData = await context.database.billing.getBillingDatumV3ById(args.id);

    if (!billingData) {
      throw new Error(`Billing data not found: ${args.id}`);
    }

    console.log(`✅ billingDatumV3 query returned billing data: ${billingData.id}`);
    return billingData;
  } catch (error) {
    console.error("❌ billingDatumV3 query error:", error as Error);
    throw error;
  }
};