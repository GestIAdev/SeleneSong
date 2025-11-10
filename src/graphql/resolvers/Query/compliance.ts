/**
 * 📋 COMPLIANCE QUERY RESOLVERS V3
 * Mission: Provide compliance queries with @veritas verification
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const compliancesV3 = async (
  _: unknown,
  args: { patientId?: string; limit?: number; offset?: number },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { patientId, limit = 50, offset = 0 } = args;

    // Use specialized ComplianceDatabase class
    const compliances = await context.database.compliance.getCompliancesV3({
      patientId,
      limit,
      offset
    });

    console.log(`✅ compliancesV3 query returned ${compliances.length} compliance records`);
    return compliances;
  } catch (error) {
    console.error("❌ compliancesV3 query error:", error as Error);
    throw error;
  }
};

export const complianceV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    // Use specialized ComplianceDatabase class
    const compliance = await context.database.compliance.getComplianceV3ById(args.id);

    if (!compliance) {
      throw new Error(`Compliance record not found: ${args.id}`);
    }

    console.log(`✅ complianceV3 query returned record: ${compliance.regulationId}`);
    return compliance;
  } catch (error) {
    console.error("❌ complianceV3 query error:", error as Error);
    throw error;
  }
};

// Export consolidated compliance queries object
export const complianceQueries = {
  compliancesV3,
  complianceV3,
};