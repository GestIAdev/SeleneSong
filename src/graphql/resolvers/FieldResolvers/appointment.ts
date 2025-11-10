import { GraphQLContext } from "../../types.js";

// ============================================================================
// 🎯 APPOINTMENT V3 FIELD RESOLVERS - SIMPLIFIED
// ============================================================================

export const AppointmentV3 = {
  appointmentDate: async (parent: any) => parent.appointmentDate,
  appointmentTime: async (parent: any) => parent.appointmentTime,
  status: async (parent: any) => parent.status,
  treatmentDetails: async (parent: any) => parent.treatmentDetails,
  patientId: async (parent: any) => parent.patientId,
  dentistId: async (parent: any) => parent.dentistId,
  clinicId: async (parent: any) => parent.clinicId,
  createdAt: async (parent: any) => parent.createdAt,
  updatedAt: async (parent: any) => parent.updatedAt,
};


