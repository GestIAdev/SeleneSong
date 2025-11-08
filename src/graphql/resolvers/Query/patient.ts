// ============================================================================
// 👥 PATIENT QUERIES V3 - VERITAS ENHANCED
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const patientQueries = {
  // Patients - Standard Query (mapped to V3 implementation)
  patients: async (
    _: any,
    { limit = 50, offset = 0 }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(
        `🔍 PATIENTS query called with limit: ${limit}, offset: ${offset}`,
      );

      // Query real PostgreSQL database - FULL SCHEMA ALIGNED
      const query = `
        SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName", 
          CONCAT(first_name, ' ', last_name) as name,
          email,
          phone_primary as phone,
          date_of_birth as "dateOfBirth",
          address,
          emergency_contact as "emergencyContact",
          insurance_provider as "insuranceProvider",
          policy_number as "policyNumber",
          medical_history as "medicalHistory",
          billing_status as "billingStatus",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM patients 
        WHERE is_active = true AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await _context.database.executeQuery(query, [
        limit,
        offset,
      ]);
      console.log(`🔍 PATIENTS found ${result.rows.length} patients`);

      return result.rows;
    } catch (error) {
      console.error("Patients query error:", error as Error);
      return [];
    }
  },

  // Patient - Single patient query by ID
  patient: async (
    _: any,
    { id }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(`🔍 PATIENT query called with id: ${id}`);

      // Query real PostgreSQL database - FULL SCHEMA ALIGNED
      const query = `
        SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName", 
          CONCAT(first_name, ' ', last_name) as name,
          email,
          phone_primary as phone,
          date_of_birth as "dateOfBirth",
          address,
          emergency_contact as "emergencyContact",
          insurance_provider as "insuranceProvider",
          policy_number as "policyNumber",
          medical_history as "medicalHistory",
          billing_status as "billingStatus",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM patients 
        WHERE id = $1 AND is_active = true AND deleted_at IS NULL
      `;

      const result = await _context.database.executeQuery(query, [id]);
      
      if (result.rows.length === 0) {
        console.log(`🔍 PATIENT not found with id: ${id}`);
        return null;
      }

      console.log(`🔍 PATIENT found:`, result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Patient query error:", error as Error);
      return null;
    }
  },

  // Patients V3 - Veritas Enhanced
  patientsV3: async (
    _: any,
    { limit = 50, offset = 0 }: any,
    context: GraphQLContext,
  ) => {
    try {
      console.log(
        `🔍 PATIENTS V3 query called with limit: ${limit}, offset: ${offset}`,
      );
      console.log(`🔍 Context veritas available: ${!!context.veritas}`);

      // Use specialized PatientsDatabase class
      return await context.database.patients.getPatients({ limit, offset });
    } catch (error) {
      console.error("PatientsV3 query error:", error as Error);
      return [];
    }
  },

  patientV3: async (
    _: any,
    { id }: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    try {
      console.log(`🔍 PATIENT V3 query called with id: ${id}`);
      console.log(`🔍 Context veritas available: ${!!_context.veritas}`);

      // Use specialized PatientsDatabase class
      return await _context.database.patients.getPatientById(id);
    } catch (error) {
      console.error("PatientV3 query error:", error as Error);
      return null;
    }
  },
};


