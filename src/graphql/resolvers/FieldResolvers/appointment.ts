import { GraphQLContext } from "../../types.js";


// ============================================================================
// 🎯 APPOINTMENT V3 FIELD RESOLVERS - HIGH LEVEL VERITAS PROTECTION
// ============================================================================

export const AppointmentV3 = {
  appointmentDate: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: appointmentDate called for appointment ${parent.id}`,
    );
    return parent.appointmentDate;
  },

  appointmentDate_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: appointmentDate_veritas called for appointment ${parent.id}`,
    );

    if (!parent.appointmentDate) {
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
        parent.appointmentDate,
        "appointment",
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
        `❌ FIELD RESOLVER: appointmentDate_veritas verification failed:`,
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

  appointmentTime: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: appointmentTime called for appointment ${parent.id}`,
    );
    return parent.appointmentTime;
  },

  appointmentTime_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: appointmentTime_veritas called for appointment ${parent.id}`,
    );

    if (!parent.appointmentTime) {
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
        parent.appointmentTime,
        "appointment",
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
        `❌ FIELD RESOLVER: appointmentTime_veritas verification failed:`,
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
    console.log(
      `🔐 FIELD RESOLVER: status called for appointment ${parent.id}`,
    );
    return parent.status;
  },

  status_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: status_veritas called for appointment ${parent.id}`,
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
        "appointment",
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

  treatmentDetails: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: treatmentDetails called for appointment ${parent.id}`,
    );
    return parent.treatmentDetails;
  },

  treatmentDetails_veritas: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: treatmentDetails_veritas called for appointment ${parent.id}`,
    );

    if (!parent.treatmentDetails) {
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
        parent.treatmentDetails,
        "appointment",
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
        `❌ FIELD RESOLVER: treatmentDetails_veritas verification failed:`,
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
};


