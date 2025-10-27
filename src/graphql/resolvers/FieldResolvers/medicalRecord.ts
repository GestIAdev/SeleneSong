// ============================================================================
// 🩺 MEDICAL RECORDS DOMAIN - FIELD RESOLVERS
// Directiva V185.2 Phase B - Incremental Modular Migration
// CRITICAL @veritas Protection Level
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const MedicalRecordV3 = {
  // Basic field resolvers for non-veritas fields
  id: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: id called for medical record ${parent.id}`);
    return parent.id;
  },

  patientId: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: patientId called for medical record ${parent.id}`,
    );
    return parent.patientId;
  },

  practitionerId: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: practitionerId called for medical record ${parent.id}`,
    );
    return parent.practitionerId;
  },

  recordType: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: recordType called for medical record ${parent.id}`,
    );
    return parent.recordType;
  },

  title: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(
      `🔐 FIELD RESOLVER: title called for medical record ${parent.id}`,
    );
    return parent.title;
  },

  attachments: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: attachments called for medical record ${parent.id}`,
    );
    return parent.attachments || [];
  },

  createdAt: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: createdAt called for medical record ${parent.id}`,
    );
    return parent.createdAt;
  },

  updatedAt: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: updatedAt called for medical record ${parent.id}`,
    );
    return parent.updatedAt;
  },

  diagnosis: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: diagnosis called for medical record ${parent.id}`,
    );
    return parent.diagnosis;
  },

  treatmentPlan: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: treatmentPlan called for medical record ${parent.id}`,
    );
    return parent.treatmentPlan;
  },

  allergies: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: allergies called for medical record ${parent.id}`,
    );
    return parent.allergies;
  },

  medications: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: medications called for medical record ${parent.id}`,
    );
    return parent.medications;
  },

  content: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(
      `🔐 FIELD RESOLVER: content called for medical record ${parent.id}`,
    );
    return parent.content;
  },

  vitalSigns: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: vitalSigns called for medical record ${parent.id}`,
    );
    return parent.vitalSigns;
  },

  // CRITICAL @veritas consolidated verification
  _veritas: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(
      `🔐 FIELD RESOLVER: _veritas called for medical record ${parent.id}`,
    );

    // Helper function to verify a CRITICAL field
    const verifyCriticalField = async (fieldValue: any, _fieldName: string) => {
      if (!fieldValue) {
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

      try {
        const verification = await _context.veritas.verifyDataIntegrity(
          typeof fieldValue === "string"
            ? fieldValue
            : JSON.stringify(fieldValue),
          "medicalRecord",
          parent.id,
        );
        return {
          verified: verification.verified,
          confidence: verification.confidence,
          level: "CRITICAL",
          certificate: verification.certificate?.dataHash,
          error: null,
          verifiedAt: new Date().toISOString(),
          algorithm: "CRITICAL_VERIFICATION_V3",
        };
      } catch (error) {
        console.error(
          `❌ FIELD RESOLVER: ${_fieldName} _veritas verification failed:`,
          error,
        );
        return {
          verified: false,
          confidence: 0,
          level: "CRITICAL",
          certificate: null,
          error: "Verification failed",
          verifiedAt: new Date().toISOString(),
          algorithm: "CRITICAL_VERIFICATION_V3",
        };
      }
    };

    // Verify all CRITICAL fields concurrently for CPU safety
    const [
      diagnosisVeritas,
      treatmentPlanVeritas,
      allergiesVeritas,
      medicationsVeritas,
      contentVeritas,
      vitalSignsVeritas,
    ] = await Promise.all([
      verifyCriticalField(parent.diagnosis, "diagnosis"),
      verifyCriticalField(parent.treatmentPlan, "treatmentPlan"),
      verifyCriticalField(parent.allergies, "allergies"),
      verifyCriticalField(parent.medications, "medications"),
      verifyCriticalField(parent.content, "content"),
      verifyCriticalField(parent.vitalSigns, "vitalSigns"),
    ]);

    return {
      diagnosis: diagnosisVeritas,
      treatmentPlan: treatmentPlanVeritas,
      allergies: allergiesVeritas,
      medications: medicationsVeritas,
      content: contentVeritas,
      vitalSigns: vitalSignsVeritas,
    };
  },
};


