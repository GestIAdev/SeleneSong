/**
 * 📋 COMPLIANCE FIELD RESOLVERS V3
 * Mission: Provide field resolvers for ComplianceV3 type with @veritas verification
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// FIELD RESOLVERS
// ============================================================================

export const ComplianceV3 = {
  id: async (parent: any) => parent.id,
  patientId: async (parent: any) => parent.patientId,
  regulationId: async (parent: any) => parent.regulationId,
  complianceStatus: async (parent: any) => parent.complianceStatus,
  description: async (parent: any) => parent.description,
  lastChecked: async (parent: any) => parent.lastChecked,
  nextCheck: async (parent: any) => parent.nextCheck,
  createdAt: async (parent: any) => parent.createdAt,
  updatedAt: async (parent: any) => parent.updatedAt,

  _veritas: async (parent: any, _: any, context: GraphQLContext) => {
    const verify = async (value: any, fieldName: string) => {
      if (!value) {
        return {
          verified: false,
          confidence: 0,
          level: "CRITICAL",
          certificate: null,
          error: "Field is null/undefined",
          verifiedAt: new Date().toISOString(),
          algorithm: "CRITICAL_VERIFICATION_V3",
        };
      }

      const result = await context.veritas.verifyDataIntegrity(
        typeof value === "string" ? value : JSON.stringify(value),
        "compliance",
        parent.id,
      );

      return {
        verified: result.verified,
        confidence: result.confidence,
        level: "CRITICAL",
        certificate: result.certificate?.dataHash,
        error: null,
        verifiedAt: new Date().toISOString(),
        algorithm: "CRITICAL_VERIFICATION_V3",
      };
    };

    const [regulationId, complianceStatus] = await Promise.all([
      verify(parent.regulationId, "regulationId"),
      verify(parent.complianceStatus, "complianceStatus"),
    ]);

    return { regulationId, complianceStatus };
  },
};