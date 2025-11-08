import { GraphQLContext } from "../../types.js";


// ============================================================================
// 🩺 TREATMENT V3 - VERITAS ENHANCED FIELD RESOLVERS
// ============================================================================

export const TreatmentV3 = {
  treatmentType: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: treatmentType called for treatment ${parent.id}`,
    );
    return parent.treatmentType;
  },

  treatmentType_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: treatmentType_veritas called for treatment ${parent.id}`,
    );

    if (!parent.treatmentType) {
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Field is null/undefined",
      };
    }

    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.treatmentType,
        "treatment",
        parent.id,
      );
      return {
        verified: verification.verified,
        confidence: verification.confidence,
        level: "HIGH",
        certificate: verification.certificate?.dataHash,
        error: null,
      };
    } catch (error) {
      console.error(
        `❌ FIELD RESOLVER: treatmentType_veritas verification failed:`,
        error,
      );
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Verification failed",
      };
    }
  },

  description: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: description called for treatment ${parent.id}`,
    );
    return parent.description;
  },

  description_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: description_veritas called for treatment ${parent.id}`,
    );

    if (!parent.description) {
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Field is null/undefined",
      };
    }

    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.description,
        "treatment",
        parent.id,
      );
      return {
        verified: verification.verified,
        confidence: verification.confidence,
        level: "HIGH",
        certificate: verification.certificate?.dataHash,
        error: null,
      };
    } catch (error) {
      console.error(
        `❌ FIELD RESOLVER: description_veritas verification failed:`,
        error,
      );
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Verification failed",
      };
    }
  },

  status: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: status called for treatment ${parent.id}`);
    return parent.status;
  },

  status_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: status_veritas called for treatment ${parent.id}`,
    );

    if (!parent.status) {
      return {
        verified: false,
        confidence: 0,
        level: "MEDIUM",
        certificate: null,
        error: "Field is null/undefined",
      };
    }

    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.status,
        "treatment",
        parent.id,
      );
      return {
        verified: verification.verified,
        confidence: verification.confidence,
        level: "MEDIUM",
        certificate: verification.certificate?.dataHash,
        error: null,
      };
    } catch (error) {
      console.error(
        `❌ FIELD RESOLVER: status_veritas verification failed:`,
        error,
      );
      return {
        verified: false,
        confidence: 0,
        level: "MEDIUM",
        certificate: null,
        error: "Verification failed",
      };
    }
  },

  startDate: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: startDate called for treatment ${parent.id}`,
    );
    return parent.startDate;
  },

  startDate_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: startDate_veritas called for treatment ${parent.id}`,
    );

    if (!parent.startDate) {
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Field is null/undefined",
      };
    }

    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.startDate,
        "treatment",
        parent.id,
      );
      return {
        verified: verification.verified,
        confidence: verification.confidence,
        level: "HIGH",
        certificate: verification.certificate?.dataHash,
        error: null,
      };
    } catch (error) {
      console.error(
        `❌ FIELD RESOLVER: startDate_veritas verification failed:`,
        error,
      );
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Verification failed",
      };
    }
  },

  endDate: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: endDate called for treatment ${parent.id}`);
    return parent.endDate;
  },

  endDate_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: endDate_veritas called for treatment ${parent.id}`,
    );

    if (!parent.endDate) {
      return {
        verified: false,
        confidence: 0,
        level: "MEDIUM",
        certificate: null,
        error: "Field is null/undefined",
      };
    }

    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.endDate,
        "treatment",
        parent.id,
      );
      return {
        verified: verification.verified,
        confidence: verification.confidence,
        level: "MEDIUM",
        certificate: verification.certificate?.dataHash,
        error: null,
      };
    } catch (error) {
      console.error(
        `❌ FIELD RESOLVER: endDate_veritas verification failed:`,
        error,
      );
      return {
        verified: false,
        confidence: 0,
        level: "MEDIUM",
        certificate: null,
        error: "Verification failed",
      };
    }
  },

  cost: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: cost called for treatment ${parent.id}`);
    return parent.cost;
  },

  cost_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: cost_veritas called for treatment ${parent.id}`,
    );

    if (parent.cost === null || parent.cost === undefined) {
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Field is null/undefined",
      };
    }

    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.cost,
        "treatment",
        parent.id,
      );
      return {
        verified: verification.verified,
        confidence: verification.confidence,
        level: "HIGH",
        certificate: verification.certificate?.dataHash,
        error: null,
      };
    } catch (error) {
      console.error(
        `❌ FIELD RESOLVER: cost_veritas verification failed:`,
        error,
      );
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Verification failed",
      };
    }
  },

  // ============================================================================
  // NESTED FIELD RESOLVERS - Relations
  // ============================================================================

  patient: async (
    parent: any,
    _: any,
    context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔗 NESTED FIELD RESOLVER: patient called for treatment ${parent.id} (patientId: ${parent.patientId})`,
    );

    try {
      const patient = await context.database.getPatientById(parent.patientId);
      console.log(`✅ Patient resolved: ${patient ? patient.first_name + ' ' + patient.last_name : 'NOT FOUND'}`);
      return patient;
    } catch (error) {
      console.error(
        `❌ NESTED FIELD RESOLVER: patient resolution failed for treatment ${parent.id}:`,
        error,
      );
      return null;
    }
  },

  practitioner: async (
    parent: any,
    _: any,
    context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔗 NESTED FIELD RESOLVER: practitioner called for treatment ${parent.id} (practitionerId: ${parent.practitionerId})`,
    );

    try {
      // TODO: Implement practitioner resolution when user management is available
      // For now, return a mock practitioner object
      const mockPractitioner = {
        id: parent.practitionerId,
        first_name: "Dr.",
        last_name: "Practitioner",
        email: `practitioner${parent.practitionerId}@dentiagest.com`,
        role: "DENTIST"
      };
      
      console.log(`✅ Practitioner resolved (mock): ${mockPractitioner.first_name} ${mockPractitioner.last_name}`);
      return mockPractitioner;
    } catch (error) {
      console.error(
        `❌ NESTED FIELD RESOLVER: practitioner resolution failed for treatment ${parent.id}:`,
        error,
      );
      return null;
    }
  },
};


