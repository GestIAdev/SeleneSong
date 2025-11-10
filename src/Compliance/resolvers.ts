import { GraphQLContext } from "../graphql/types.js";

export const ComplianceV3 = {
  id: async (_p: any) => _p.id,
  patientId: async (_p: any) => _p.patientId,
  description: async (_p: any) => _p.description,
  lastChecked: async (_p: any) => _p.lastChecked,
  nextCheck: async (_p: any) => _p.nextCheck,
  createdAt: async (_p: any) => _p.createdAt,
  updatedAt: async (_p: any) => _p.updatedAt,
  // _veritas field resolver REMOVED - not in schema
};

export const ComplianceQuery = {
  compliancesV3: async (_: any, { patientId, limit = 50, offset = 0 }: any) => {
    const list = [
      {
        id: "comp-001",
        patientId: patientId || "patient-001",
        regulationId: "HIPAA-001",
        complianceStatus: "COMPLIANT",
        description: "HIPAA compliance check",
        lastChecked: "2024-01-15T09:00:00Z",
        nextCheck: "2025-01-15T09:00:00Z",
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T09:00:00Z",
      },
      {
        id: "comp-002",
        patientId: patientId || "patient-002",
        regulationId: "GDPR-002",
        complianceStatus: "PENDING",
        description: "GDPR data protection",
        lastChecked: "2024-01-20T10:00:00Z",
        nextCheck: "2024-07-20T10:00:00Z",
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
    ];
    const filtered = patientId
      ? list.filter((_c: any) => _c.patientId === patientId)
      : list;
    return filtered.slice(offset, offset + limit);
  },
  complianceV3: async (_: any, { id }: any) => {
    const list = [
      {
        id: "comp-001",
        patientId: "patient-001",
        regulationId: "HIPAA-001",
        complianceStatus: "COMPLIANT",
        description: "HIPAA compliance check",
        lastChecked: "2024-01-15T09:00:00Z",
        nextCheck: "2025-01-15T09:00:00Z",
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T09:00:00Z",
      },
      {
        id: "comp-002",
        patientId: "patient-002",
        regulationId: "GDPR-002",
        complianceStatus: "PENDING",
        description: "GDPR data protection",
        lastChecked: "2024-01-20T10:00:00Z",
        nextCheck: "2024-07-20T10:00:00Z",
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
    ];
    return list.find((_c: any) => _c.id === id) || null;
  },
};

export const ComplianceMutation = {
  createComplianceV3: async (_: any, { input }: any, _ctx: GraphQLContext) => {
    const comp = {
      id: `comp-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return comp;
  },
  updateComplianceV3: async (
    _: any,
    { id, input }: any,
    _ctx: GraphQLContext,
  ) => {
    const comp = { id, ...input, updatedAt: new Date().toISOString() };
    return comp;
  },
  deleteComplianceV3: async (_: any, { id }: any) => ({ id, deleted: true }),
};


