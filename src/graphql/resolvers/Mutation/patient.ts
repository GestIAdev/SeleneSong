// ============================================================================
// 👥 PATIENT MUTATIONS V3 - VERITAS ENHANCED
// ============================================================================

import { GraphQLContext } from "../../types.js";

export const patientMutations = {
  // Create Patient V3 - Veritas Enhanced
  createPatientV3: async (_: any, { input }: any, _context: GraphQLContext) => {
    console.log("🔥🔥🔥 [PATIENT-V3] createPatientV3 CALLED");
    console.log("🔥🔥🔥 [PATIENT-V3] Input:", JSON.stringify(input, null, 2));
    console.log("🔥🔥🔥 [PATIENT-V3] Context database exists?", !!_context?.database);
    
    try {
      // 🛡️ VALIDATION: Email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (input.email && !emailRegex.test(input.email)) {
        throw new Error("Invalid email format");
      }

      // 🛡️ VALIDATION: Email uniqueness (using search filter as workaround)
      const existingPatients = await _context.database.getPatients({ search: input.email });
      // Check if any patient has EXACT email match (search uses ILIKE so we need exact check)
      const exactMatch = existingPatients.find(p => p.email === input.email);
      if (exactMatch) {
        throw new Error("Email already exists");
      }

      console.log("🔥🔥🔥 [PATIENT-V3] Calling _context.database.createPatient...");
      const patient = await _context.database.createPatient(input);
      console.log("🔥🔥🔥 [PATIENT-V3] Database returned:", patient ? JSON.stringify(patient, null, 2) : "NULL/UNDEFINED");
      
      if (!patient) {
        console.error("💥💥💥 [PATIENT-V3] DATABASE RETURNED NULL!");
        throw new Error("Database createPatient returned null");
      }
      
      console.log("✅ [PATIENT-V3] Success - returning patient with id:", patient.id);
      return patient;
    } catch (error) {
      console.error("💥💥💥 [PATIENT-V3] ERROR:", error);
      console.error("💥💥💥 [PATIENT-V3] Error stack:", (error as Error).stack);
      throw new Error(`Failed to create patientV3: ${(error as Error).message}`);
    }
  },

  // Update Patient V3 - Veritas Enhanced
  updatePatientV3: async (
    _: any,
    { id, input }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(
        `✏️ UPDATE PATIENT V3 mutation called with id: ${id}, input:`,
        input,
      );

      // 🛡️ VALIDATION: Email format (if email is being updated)
      if (input.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
          throw new Error("Invalid email format");
        }

        // 🛡️ VALIDATION: Email uniqueness (using search filter as workaround)
        const existingPatients = await _context.database.getPatients({ search: input.email });
        // Check if any OTHER patient has EXACT email match (exclude current patient)
        const exactMatch = existingPatients.find(p => p.email === input.email && p.id !== id);
        if (exactMatch) {
          throw new Error("Email already exists");
        }
      }

      const patient = await _context.database.updatePatient(id, input);
      console.log("✅ PatientV3 updated:", patient.id);
      return patient;
    } catch (error) {
      console.error("Update patientV3 error:", error as Error);
      throw new Error(`Failed to update patientV3: ${(error as Error).message}`);
    }
  },

  // Delete Patient V3 - Veritas Enhanced
  deletePatientV3: async (_: any, { id }: any, _context: GraphQLContext) => {
    try {
      console.log(`🗑️ DELETE PATIENT V3 mutation called with id: ${id}`);
      await _context.database.deletePatient(id);
      console.log("✅ PatientV3 deleted:", id);
      return { success: true, message: "Patient deleted successfully" };
    } catch (error) {
      console.error("Delete patientV3 error:", error as Error);
      throw new Error("Failed to delete patientV3");
    }
  },
};


