import { GraphQLContext } from "../graphql/types.js";

/**
 * ⚠️ DEPRECATED FIELD RESOLVER
 *
 * La Fuente Única de Verdad (SSoT) para field resolvers está en:
 * /graphql/resolvers/FieldResolvers/billingData.ts (o equivalente)
 *
 * Este archivo SOLO mantiene las QUERIES/MUTATIONS/SUBSCRIPTIONS de negocio.
 * Los field resolvers (BillingDataV3, etc.) se importan desde SSoT.
 *
 * PHASE 2 PURGA: Eliminada definición duplicada de BillingDataV3
 */

// NOTE: BillingDataV3 field resolver MOVED to /graphql/resolvers/FieldResolvers/

export const BillingDataQuery = {
  billingDataV3: async (_: any, { patientId, limit = 50, offset = 0 }: any) => {
    const list = [
      {
        id: "bill-001",
        patientId: patientId || "patient-001",
        amount: 150.0,
        billingDate: "2024-01-15T09:00:00Z",
        status: "PAID",
        description: "Dental cleaning",
        paymentMethod: "Credit Card",
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T09:00:00Z",
      },
      {
        id: "bill-002",
        patientId: patientId || "patient-002",
        amount: 300.0,
        billingDate: "2024-01-20T10:00:00Z",
        status: "PENDING",
        description: "Root canal treatment",
        paymentMethod: "Insurance",
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
    ];
    const filtered = patientId
      ? list.filter((_b: any) => _b.patientId === patientId)
      : list;
    return filtered.slice(offset, offset + limit);
  },
  billingDatumV3: async (_: any, { id }: any) => {
    const list = [
      {
        id: "bill-001",
        patientId: "patient-001",
        amount: 150.0,
        billingDate: "2024-01-15T09:00:00Z",
        status: "PAID",
        description: "Dental cleaning",
        paymentMethod: "Credit Card",
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T09:00:00Z",
      },
      {
        id: "bill-002",
        patientId: "patient-002",
        amount: 300.0,
        billingDate: "2024-01-20T10:00:00Z",
        status: "PENDING",
        description: "Root canal treatment",
        paymentMethod: "Insurance",
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
    ];
    return list.find((_b: any) => _b.id === id) || null;
  },
};

export const BillingDataMutation = {
  createBillingDataV3: async (_: any, { input }: any, _ctx: GraphQLContext) => {
    const bill = {
      id: `bill-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return bill;
  },
  updateBillingDataV3: async (
    _: any,
    { id, input }: any,
    _ctx: GraphQLContext,
  ) => {
    const bill = { id, ...input, updatedAt: new Date().toISOString() };
    return bill;
  },
  deleteBillingDataV3: async (_: any, { id }: any) => ({ id, deleted: true }),
};


