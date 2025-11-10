import type { GraphQLContext } from '../../types.js';

// ============================================================================
// BILLING MUTATION RESOLVERS V3
// ============================================================================

export const createBillingDataV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const billingData = await context.database.createBillingDataV3(args.input);

    console.log(`✅ createBillingDataV3 mutation created: ${billingData.id}`);
    return billingData;
  } catch (error) {
    console.error("❌ createBillingDataV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateBillingDataV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const billingData = await context.database.updateBillingDataV3(args.id, args.input);

    console.log(`✅ updateBillingDataV3 mutation updated: ${billingData.id}`);
    return billingData;
  } catch (error) {
    console.error("❌ updateBillingDataV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteBillingDataV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.deleteBillingDataV3(args.id);

    console.log(`✅ deleteBillingDataV3 mutation deleted ID: ${args.id}`);
    return true;
  } catch (error) {
    console.error("❌ deleteBillingDataV3 mutation error:", error as Error);
    throw error;
  }
};

// Export consolidated billing mutations object
export const billingMutations = {
  createBillingDataV3,
  updateBillingDataV3,
  deleteBillingDataV3,
};