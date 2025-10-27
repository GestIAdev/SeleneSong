import { GraphQLContext } from "../graphql/types.js";

// V169 Schema Bridge: Resolver para MedicalRecord con date mapping
export const MedicalRecord = {
  // V169 Bridge: date desde visit_date
  date: async (parent: any) => {
    if (parent.date) return parent.date; // Si ya viene de apollo_medical_records view
    if (parent.visit_date) return parent.visit_date;
    if (parent.visitDate) return parent.visitDate;
    return parent.createdAt; // Fallback
  },
};

export const MedicalRecordV3 = {
  id: async (_p: any) => _p.id,
  patientId: async (_p: any) => _p.patientId,
  practitionerId: async (_p: any) => _p.practitionerId,
  recordType: async (_p: any) => _p.recordType,
  title: async (_p: any) => _p.title,
  attachments: async (_p: any) => _p.attachments || [],
  createdAt: async (_p: any) => _p.createdAt,
  updatedAt: async (_p: any) => _p.updatedAt,
  diagnosis: async (_p: any) => _p.diagnosis,
  treatmentPlan: async (_p: any) => _p.treatmentPlan,
  allergies: async (_p: any) => _p.allergies,
  medications: async (_p: any) => _p.medications,
  content: async (_p: any) => _p.content,
  vitalSigns: async (_p: any) => _p.vitalSigns,
  _veritas: async (p: any, _: any, _ctx: GraphQLContext) => {
    const verify = async (val: any, _name: string) => {
      if (!val)
        return {
          verified: false,
          confidence: 0,
          level: "CRITICAL",
          certificate: null,
          error: "Field is null/undefined",
          verifiedAt: new Date().toISOString(),
          algorithm: "CRITICAL_VERIFICATION_V3",
        };
      const v = await _ctx.veritas.verifyDataIntegrity(
        typeof val === "string" ? val : JSON.stringify(val),
        "medicalRecord",
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
    };
    const [
      diagnosis,
      treatmentPlan,
      allergies,
      medications,
      content,
      vitalSigns,
    ] = await Promise.all([
      verify(p.diagnosis, "diagnosis"),
      verify(p.treatmentPlan, "treatmentPlan"),
      verify(p.allergies, "allergies"),
      verify(p.medications, "medications"),
      verify(p.content, "content"),
      verify(p.vitalSigns, "vitalSigns"),
    ]);
    return {
      diagnosis,
      treatmentPlan,
      allergies,
      medications,
      content,
      vitalSigns,
    };
  },
};

export const MedicalRecordQuery = {
  medicalRecordsV3: async (
    _: any,
    { patientId, limit = 50, offset = 0 }: any,
  ) => {
    const list = [
      {
        id: "mr-001",
        patientId: patientId || "patient-001",
        practitionerId: "pr-1",
        recordType: "CONSULTATION",
        title: "Initial Dental Consultation",
        diagnosis: "Diagnosis",
        treatmentPlan: "Plan",
        allergies: ["Penicillin"],
        medications: ["Ibuprofen"],
        content: "...",
        vitalSigns: {},
        attachments: [],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
    ];
    const filtered = patientId
      ? list.filter((_r: any) => _r.patientId === patientId)
      : list;
    return filtered.slice(offset, offset + limit);
  },
  medicalRecordV3: async (_: any, { id }: any) => {
    const list = [{ id: "mr-001", patientId: "patient-001" }];
    return list.find((_r: any) => _r.id === id) || null;
  },
};

export const MedicalRecordMutation = {
  createMedicalRecordV3: async (_: any, { input }: any, { pubsub }: any) => {
    const medicalRecord = {
      id: `mr_${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    pubsub.publish("MEDICAL_RECORD_V3_CREATED", {
      medicalRecordV3Created: medicalRecord,
    });
    return medicalRecord;
  },
  updateMedicalRecordV3: async (
    _: any,
    { id, input }: any,
    { pubsub }: any,
  ) => {
    const medicalRecord = { id, ...input, updatedAt: new Date().toISOString() };
    pubsub.publish("MEDICAL_RECORD_V3_UPDATED", {
      medicalRecordV3Updated: medicalRecord,
    });
    return medicalRecord;
  },
  deleteMedicalRecordV3: async (_: any, { id }: any, { pubsub }: any) => {
    pubsub.publish("MEDICAL_RECORD_V3_DELETED", { medicalRecordV3Deleted: id });
    return id;
  },
};

export const MedicalRecordSubscription = {
  medicalRecordV3Created: {
    subscribe: (_: any, __: any, { pubsub }: any) =>
      pubsub.asyncIterator(["MEDICAL_RECORD_V3_CREATED"]),
  },
  medicalRecordV3Updated: {
    subscribe: (_: any, __: any, { pubsub }: any) =>
      pubsub.asyncIterator(["MEDICAL_RECORD_V3_UPDATED"]),
  },
  medicalRecordV3Deleted: {
    subscribe: (_: any, __: any, { pubsub }: any) =>
      pubsub.asyncIterator(["MEDICAL_RECORD_V3_DELETED"]),
  },
};


