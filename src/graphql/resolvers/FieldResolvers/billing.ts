import type { GraphQLContext } from '../../types.js';

// ============================================================================
// BILLING FIELD RESOLVERS V3
// ============================================================================

export const BillingDataV3 = {
  id: async (parent: any) => parent.id,
  patientId: async (parent: any) => parent.patient_id,
  amount: async (parent: any) => parent.amount,
  billingDate: async (parent: any) => parent.billing_date,
  status: async (parent: any) => parent.status,
  description: async (parent: any) => parent.description,
  paymentMethod: async (parent: any) => parent.payment_method,
  createdAt: async (parent: any) => parent.created_at,
  updatedAt: async (parent: any) => parent.updated_at,
  _veritas: async (parent: any, _: any, context: GraphQLContext) => {
    const verify = async (value: any, fieldName: string) => {
      if (!value)
        return {
          verified: false,
          confidence: 0,
          level: "CRITICAL",
          certificate: null,
          error: "Field is null/undefined",
          verifiedAt: new Date().toISOString(),
          algorithm: "CRITICAL_VERIFICATION_V3",
        };

      const result = await context.veritas.verifyDataIntegrity(
        typeof value === "string" ? value : JSON.stringify(value),
        "billing",
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

    const [patientId, amount] = await Promise.all([
      verify(parent.patient_id, "patientId"),
      verify(parent.amount, "amount"),
    ]);

    return { patientId, amount };
  },
};