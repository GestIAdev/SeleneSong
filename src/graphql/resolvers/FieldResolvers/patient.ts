// ============================================================================
// 👥 PATIENT FIELD RESOLVERS V3 - CRITICAL @veritas Protection
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const PatientV3 = {
  // Basic field resolvers for non-veritas fields
  id: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: id called for patient ${parent.id}`);
    return parent.id;
  },

  firstName: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(`🔐 FIELD RESOLVER: firstName called for patient ${parent.id}`);
    return parent.firstName;
  },

  lastName: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: lastName called for patient ${parent.id}`);
    return parent.lastName;
  },

  email: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: email called for patient ${parent.id}`);
    return parent.email;
  },

  phone: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: phone called for patient ${parent.id}`);
    return parent.phone;
  },

  dateOfBirth: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: dateOfBirth called for patient ${parent.id}`,
    );
    return parent.dateOfBirth;
  },

  gender: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: gender called for patient ${parent.id}`);
    return parent.gender;
  },

  address: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: address called for patient ${parent.id}`);
    return parent.address;
  },

  emergencyContact: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: emergencyContact called for patient ${parent.id}`,
    );
    return parent.emergencyContact;
  },

  insurance: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(`🔐 FIELD RESOLVER: insurance called for patient ${parent.id}`);
    return parent.insurance;
  },

  allergies: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(`🔐 FIELD RESOLVER: allergies called for patient ${parent.id}`);
    return parent.allergies || [];
  },

  medications: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: medications called for patient ${parent.id}`,
    );
    return parent.medications || [];
  },

  preferredLanguage: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: preferredLanguage called for patient ${parent.id}`,
    );
    return parent.preferredLanguage;
  },

  isActive: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: isActive called for patient ${parent.id}`);
    return parent.isActive;
  },

  lastVisit: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(`🔐 FIELD RESOLVER: lastVisit called for patient ${parent.id}`);
    return parent.lastVisit;
  },

  nextAppointment: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: nextAppointment called for patient ${parent.id}`,
    );
    return parent.nextAppointment;
  },

  createdAt: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(`🔐 FIELD RESOLVER: createdAt called for patient ${parent.id}`);
    return parent.createdAt;
  },

  updatedAt: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(`🔐 FIELD RESOLVER: updatedAt called for patient ${parent.id}`);
    return parent.updatedAt;
  },

  // CRITICAL @veritas protected fields - individual field resolvers
  policyNumber: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: policyNumber called for patient ${parent.id} - CRITICAL VERIFICATION`,
    );
    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.insurance?.policyNumber,
        "patient",
        parent.id,
      );
      if (verification.verified) {
        return parent.insurance?.policyNumber;
      } else {
        console.error(
          `❌ CRITICAL VERIFICATION FAILED: policyNumber for patient ${parent.id}`,
        );
        throw new Error(
          "CRITICAL_VERIFICATION_FAILED: policyNumber integrity compromised",
        );
      }
    } catch (error) {
      console.error(
        `❌ FIELD RESOLVER: policyNumber verification error:`,
        error,
      );
      throw new Error(
        "CRITICAL_VERIFICATION_ERROR: policyNumber verification failed",
      );
    }
  },

  medicalHistory: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: medicalHistory called for patient ${parent.id} - CRITICAL VERIFICATION`,
    );
    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.medicalHistory,
        "patient",
        parent.id,
      );
      if (verification.verified) {
        return parent.medicalHistory;
      } else {
        console.error(
          `❌ CRITICAL VERIFICATION FAILED: medicalHistory for patient ${parent.id}`,
        );
        throw new Error(
          "CRITICAL_VERIFICATION_FAILED: medicalHistory integrity compromised",
        );
      }
    } catch (error) {
      console.error(
        `❌ FIELD RESOLVER: medicalHistory verification error:`,
        error,
      );
      throw new Error(
        "CRITICAL_VERIFICATION_ERROR: medicalHistory verification failed",
      );
    }
  },

  // CRITICAL @veritas consolidated verification
  _veritas: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: _veritas called for patient ${parent.id}`);

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
          "patient",
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

    // Verify all CRITICAL patient fields concurrently for CPU safety
    const [policyNumberVeritas, medicalHistoryVeritas] = await Promise.all([
      verifyCriticalField(parent.insurance?.policyNumber, "policyNumber"),
      verifyCriticalField(parent.medicalHistory, "medicalHistory"),
    ]);

    return {
      policyNumber: policyNumberVeritas,
      medicalHistory: medicalHistoryVeritas,
    };
  },
};


