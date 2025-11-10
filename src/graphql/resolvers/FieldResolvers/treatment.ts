import { GraphQLContext } from "../../types.js";

// ============================================================================
//  TREATMENT V3 - SIMPLIFIED FIELD RESOLVERS
// ============================================================================

export const TreatmentV3 = {
  treatmentType: async (parent: any) => parent.treatmentType,
  description: async (parent: any) => parent.description,
  status: async (parent: any) => parent.status,
  startDate: async (parent: any) => parent.startDate,
  endDate: async (parent: any) => parent.endDate,
  cost: async (parent: any) => parent.cost,

  // ============================================================================
  // NESTED FIELD RESOLVERS - Relations
  // ============================================================================

  patient: async (parent: any, _: any, context: GraphQLContext) => {
    try {
      const patient = await context.database.getPatientById(parent.patientId);
      return patient;
    } catch (error) {
      console.error(` Patient resolution failed for treatment ${parent.id}:`, error);
      return null;
    }
  },

  practitioner: async (parent: any, _: any, context: GraphQLContext) => {
    try {
      const mockPractitioner = {
        id: parent.practitionerId,
        first_name: "Dr.",
        last_name: "Practitioner",
        email: `practitioner${parent.practitionerId}@dentiagest.com`,
        role: "DENTIST"
      };
      return mockPractitioner;
    } catch (error) {
      console.error(` Practitioner resolution failed for treatment ${parent.id}:`, error);
      return null;
    }
  },
};
