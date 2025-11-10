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
};