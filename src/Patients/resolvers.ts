import { GraphQLContext } from "../graphql/types.js";

export const Patient = {
  // V169 Schema Bridge: name resolver - ya viene combinado desde apollo_patients view
  name: async (parent: any) => {
    // Si viene de apollo_patients view, ya tiene 'name' combinado
    if (parent.name) return parent.name;
    // Fallback para compatibilidad con datos que no vengan de la view
    return parent.first_name && parent.last_name
      ? `${parent.first_name} ${parent.last_name}`.trim()
      : parent.firstName && parent.lastName
        ? `${parent.firstName} ${parent.lastName}`.trim()
        : "Unknown Patient";
  },
  policyNumber: async (_parent: any, _: any, _context: GraphQLContext) =>
    _parent.policyNumber,
  policyNumber_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
  ) => {
    if (!parent.policyNumber) {
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
    const v = await _context.veritas.verifyDataIntegrity(
      parent.policyNumber,
      "patient",
      parent.id,
    );
    return {
      verified: v.verified,
      confidence: v.confidence,
      level: "CRITICAL",
      certificate: v.certificate?.dataHash,
      error: null,
      verifiedAt: new Date().toISOString(),
      algorithm: "CRITICAL_VERIFICATION_V3",
    };
  },
  medicalHistory: async (_p: any) => _p.medicalHistory,
  medicalHistory_veritas: async (p: any, _: any, _context: GraphQLContext) => {
    if (!p.medicalHistory) {
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
    const v = await _context.veritas.verifyDataIntegrity(
      p.medicalHistory,
      "patient",
      p.id,
    );
    return {
      verified: v.verified,
      confidence: v.confidence,
      level: "CRITICAL",
      certificate: v.certificate?.dataHash,
      error: null,
      verifiedAt: new Date().toISOString(),
      algorithm: "CRITICAL_VERIFICATION_V3",
    };
  },
};

export const PatientQuery = {
  patients: async (
    _: any,
    { limit = 50, offset = 0 }: any,
    _context: GraphQLContext,
  ) => {
    const allPatients = await _context.database.getPatients();
    return allPatients.slice(offset, offset + limit);
  },
  patient: async (_: any, { id }: any, _context: GraphQLContext) => {
    const patients = await _context.database.getPatients();
    return patients.find((_p: any) => _p.id === id) || null;
  },
  searchPatients: async (_: any, { query }: any, _context: GraphQLContext) => {
    const patients = await _context.database.getPatients();
    return patients.filter(
      (p: any) =>
        p.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        p.lastName?.toLowerCase().includes(query.toLowerCase()) ||
        p.email?.toLowerCase().includes(query.toLowerCase()),
    );
  },
};

export const PatientMutation = {
  createPatient: async (_: any, { input }: any, _context: GraphQLContext) =>
    _context.database.createPatient(input),
  updatePatient: async (_: any, { id, input }: any, _context: GraphQLContext) =>
    _context.database.updatePatient(id, input),
  deletePatient: async (_: any, { id }: any, _context: GraphQLContext) =>
    _context.database.deletePatient(id),
};


